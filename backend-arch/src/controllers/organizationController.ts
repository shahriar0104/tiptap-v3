import { Request, Response, NextFunction } from 'express';
import type { OrganizationService } from '../services/organizationService';
import { sendSuccess } from '../utils/response';

export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  createOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = req.body;
      const result =
        await this.organizationService.createOrganizationWithAdmin(data);
      sendSuccess(
        res,
        result,
        'Organization and admin user created successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  };

  getOrganizationMeetings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { organizationId } = req.params as { organizationId: string };
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const meetings =
        await this.organizationService.getOrganizationMeetings(organizationId);
      sendSuccess(
        res,
        meetings,
        'Organization meetings retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };
}
