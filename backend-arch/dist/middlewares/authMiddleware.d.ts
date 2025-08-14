import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/userModel';
export declare class AuthMiddleware {
    private userModel;
    constructor(userModel: UserModel);
    private readonly PUBLIC_ROUTES;
    private isPublicRoute;
    private refreshAccessToken;
    private setAuthCookies;
    authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    requireRole: (requiredRole: string) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    requireOrganization: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=authMiddleware.d.ts.map