import Auth from '../src/middleware/auth';
import UserService from '../src/services/user/user-service';
import {
    AuthenticationToken,
} from '../src/services/user/types';

jest.mock('../src/services/user/user-service', () => {
    return {
        decodeToken: jest.fn(),
    }
});

describe('Auth Middleware', () => {
    it('should validate JSON Web Tokens', () => {
        const mockToken: AuthenticationToken = {
            userId: 'testId'
        };
        const mockDecodeToken = jest.spyOn(UserService, 'decodeToken');
        mockDecodeToken.mockReturnValueOnce(mockToken);
        const req: any = {
            headers: {
                authorization: 'Bearer Test'
            }
        }
        const res: any = {
            sendStatus: jest.fn()
        };
        const next = jest.fn();

        Auth(req, res, next);

        expect(mockDecodeToken).toHaveBeenCalledTimes(1);
        expect(mockDecodeToken).toHaveBeenCalledWith('Test');

        expect(next).toHaveBeenCalled();
    });

    it('should deny access when the token does not include userId', () => {
        const mockToken: any = {};
        const mockDecodeToken = jest.spyOn(UserService, 'decodeToken');
        mockDecodeToken.mockReturnValueOnce(mockToken);
        const req: any = {
            headers: {
                authorization: 'Bearer Test'
            }
        }
        const res: any = {
            sendStatus: jest.fn()
        };
        const next = jest.fn();

        Auth(req, res, next);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('should restrict access when an invalid token is provided', () => {
        const mockToken: any = {};
        const mockDecodeToken = jest.spyOn(UserService, 'decodeToken');
        mockDecodeToken.mockImplementation(() => {
            throw new Error();
        });
        const req: any = {
            headers: {
                authorization: 'Bearer Test'
            }
        }
        const res: any = {
            sendStatus: jest.fn()
        };
        const next = jest.fn();

        Auth(req, res, next);

        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing authorization headers', () => {
        const req: any = {
            headers: {},
        };
        const res: any = {
            sendStatus: jest.fn()
        };
        const next = jest.fn();

        Auth(req, res, next);

        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});