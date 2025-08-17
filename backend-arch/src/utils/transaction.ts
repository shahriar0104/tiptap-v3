import prisma from '../config/database';
import type { Prisma, PrismaClient } from '@prisma/client';
import {
  OrganizationModel,
  OrganizationModelImpl,
} from '../models/organizationModel';
import { UserModel, UserModelImpl } from '../models/userModel';
import {
  BoardMeetingModel,
  BoardMeetingModelImpl,
} from '../models/boardMeetingModel';
import {
  AgendaGroupModel,
  AgendaGroupModelImpl,
} from '../models/agendaGroupModel';
import {
  AgendaItemModel,
  AgendaItemModelImpl,
} from '../models/agendaItemModel';
import {
  EditorContentModel,
  EditorContentModelImpl,
} from '../models/editorContentModel';
import {
  PresentationModel,
  PresentationModelImpl,
} from '../models/presentationModel';
import { SlideModel, SlideModelImpl } from '../models/slideModel';
import { UploadModel, UploadModelImpl } from '../models/uploadModel';
import {
  AgendaItemDocumentModel,
  AgendaItemDocumentModelImpl,
} from '../models/agendaItemDocumentModel';

export interface Models {
  organizationModel: OrganizationModel;
  userModel: UserModel;
  boardMeetingModel: BoardMeetingModel;
  agendaGroupModel: AgendaGroupModel;
  agendaItemModel: AgendaItemModel;
  editorContentModel: EditorContentModel;
  presentationModel: PresentationModel;
  slideModel: SlideModel;
  uploadModel: UploadModel;
  agendaItemDocumentModel: AgendaItemDocumentModel;
}

export type TxModels = Models;

function createModels(client: Prisma.TransactionClient | PrismaClient): Models {
  return {
    organizationModel: new OrganizationModelImpl(client),
    userModel: new UserModelImpl(client),
    boardMeetingModel: new BoardMeetingModelImpl(client),
    agendaGroupModel: new AgendaGroupModelImpl(client),
    agendaItemModel: new AgendaItemModelImpl(client),
    editorContentModel: new EditorContentModelImpl(client),
    presentationModel: new PresentationModelImpl(client),
    slideModel: new SlideModelImpl(client),
    uploadModel: new UploadModelImpl(client),
    agendaItemDocumentModel: new AgendaItemDocumentModelImpl(client),
  };
}

export async function withTransactionModels<T>(
  fn: (ctx: { tx: Prisma.TransactionClient; models: TxModels }) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
    maxRetries?: number;
    retryDelayMs?: number;
  }
): Promise<T> {
  const { maxRetries = 3, retryDelayMs = 50, ...txOptions } = options ?? {};

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(async tx => {
        const models = createModels(tx);
        return fn({ tx, models });
      }, txOptions);
    } catch (error: unknown) {
      if (attempt < maxRetries && isRetryableTxError(error)) {
        await delay(retryDelayMs * Math.pow(2, attempt));
        continue;
      }
      throw error;
    }
  }

  // Unreachable, loop either returns or throws
  // Added for TypeScript completeness
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw 'Transaction retry loop exited unexpectedly';
}

export async function withModels<T>(
  fn: (ctx: { models: Models }) => Promise<T>
): Promise<T> {
  const models = createModels(prisma);
  return fn({ models });
}

function isRetryableTxError(error: unknown): boolean {
  // Prisma wraps database errors; be tolerant to multiple shapes without using `any`
  type MaybePrismaError =
    | {
        code?: string;
        meta?: { code?: string };
        message?: unknown;
      }
    | null
    | undefined;

  const err = error as MaybePrismaError;
  const code: string | undefined = err?.code ?? err?.meta?.code;
  const message: string = String(err?.message ?? '');

  // Known cases to retry (Postgres):
  // - Serialization failure: SQLSTATE '40001'
  // - Deadlock detected: SQLSTATE '40P01'
  // Prisma generic transaction conflict: 'P2034'
  if (code === '40001' || code === '40P01' || code === 'P2034') return true;

  const msg = message.toLowerCase();
  return (
    msg.includes('could not serialize access due to concurrent update') ||
    msg.includes('deadlock detected') ||
    msg.includes('serialization failure') ||
    msg.includes('transaction conflict')
  );
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
