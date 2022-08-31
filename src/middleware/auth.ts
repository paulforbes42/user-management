import {
    Request, 
    Response, 
    NextFunction
} from 'express';
import UserService from '../services/user/user-service';

/**
 * Middleware to verify a request is from an authenticated user
 * 
 * @param req Express Request
 * @param res Express Response
 * @param next Express Next Function
 */
export default function Auth(req: Request, res: Response, next: NextFunction): void {
    try {
        const token = req.headers.authorization?.split(' ')[1] as string;
        const decodedToken = UserService.decodeToken(token);

        if(!decodedToken.userId) {
            res.sendStatus(403);
            return;
        }

        next();
    } catch(e) {
        res.sendStatus(401);
    }
}