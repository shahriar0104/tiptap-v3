import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    getCurrentUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    setAuthCookies: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getOrganizationUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    googleAuth: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    googleCallback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logoutUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map