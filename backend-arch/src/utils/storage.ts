import { supabaseAdmin } from '../config/supabase';

export const BUCKET_NAME = 'agenda-documents';

function isNotFound(err: any): boolean {
  const code = err?.status ?? err?.statusCode;
  const codeStr = typeof code === 'number' ? String(code) : code;
  return codeStr === '404' || /not found/i.test(err?.message ?? '');
}

function isAlreadyExists(err: any): boolean {
  const code = err?.status ?? err?.statusCode;
  const codeStr = typeof code === 'number' ? String(code) : code;
  return codeStr === '409' || /already exists|duplicated/i.test(err?.message ?? '');
}

export async function ensureStorageBucket(name: string = BUCKET_NAME, isPublic = true): Promise<void> {
  // Try to get the bucket; if it doesn't exist, create it
  const { data: bucket, error: getErr } = await supabaseAdmin.storage.getBucket(name);
  if (getErr && !isNotFound(getErr)) {
    // If error other than not found
    // eslint-disable-next-line no-console
    console.error('[Storage] getBucket error:', getErr);
    throw getErr;
  }

  if (!bucket || isNotFound(getErr)) {
    const { error: createErr } = await supabaseAdmin.storage.createBucket(name, {
      public: isPublic,
    });
    if (createErr) {
      if (isAlreadyExists(createErr)) {
        // eslint-disable-next-line no-console
        console.log(`ℹ️ Supabase storage bucket already exists: ${name}`);
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[Storage] createBucket error:', createErr);
      throw createErr;
    }
    // eslint-disable-next-line no-console
    console.log(`✅ Created Supabase storage bucket: ${name} (public=${isPublic})`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`ℹ️ Supabase storage bucket exists: ${name}`);
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBuffer(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType?: string
): Promise<void> {
  const options: { upsert: boolean; contentType?: string } = { upsert: false };
  if (contentType) options.contentType = contentType;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, buffer, options);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[Storage] upload error:', error);
    throw error;
  }
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 60 * 5
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) {
    // eslint-disable-next-line no-console
    console.error('[Storage] createSignedUrl error:', error);
    throw error ?? new Error('Failed to create signed URL');
  }
  return data.signedUrl;
}
