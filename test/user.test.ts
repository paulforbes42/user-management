import UserController from '../src/controllers/user';
import UserService, {UserErrors} from '../src/services/user/user-service';

jest.mock('../src/services/user/user-service');
jest.mock('../src/utils/log');

describe('UserController', () => {
    let res: any;
    let req: any;

    beforeEach(() => {
        res = {
            sendStatus: jest.fn(),
            json: jest.fn(),
            status: jest.fn().mockImplementation(() => res),
            send: jest.fn(),
        };
    });

    test('should create users', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        const mockReturnValue = {};
        mockCreateUser.mockReturnValueOnce(mockReturnValue as any);

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(mockCreateUser).toHaveBeenCalledWith({
            email: 'paulforbes42@gmail.com',
            password: 'L1m1t3dAcc355',
            firstName: 'Paul',
            lastName: 'Forbes',
        })
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockReturnValue);
    });

    test('should handle validation errors while creating a user', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        mockCreateUser.mockImplementation(() => {
            throw new Error(UserErrors.ValidationFailure);
        });

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    test('should handle email validation errors while creating a user', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        mockCreateUser.mockImplementation(() => {
            throw new Error(UserErrors.InvalidEmail);
        });

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

    test('should handle disabled user registration errors while creating a user', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        mockCreateUser.mockImplementation(() => {
            throw new Error(UserErrors.UserRegistrationDisabled);
        });

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(403);
    });

    test('should handle existing user errors while creating a user', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        mockCreateUser.mockImplementation(() => {
            throw new Error(UserErrors.EmailExists);
        });

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(409);
    });

    test('should handle password encryption errors while creating a user', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        mockCreateUser.mockImplementation(() => {
            throw new Error(UserErrors.UnableToEncryptPassword);
        });

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(422);
    });

    test('should handle database errors while creating a user', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        mockCreateUser.mockImplementation(() => {
            throw new Error(UserErrors.DatabaseError);
        });

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(503);
    });
    
    test('should handle generic errors while creating a user', async () => {
        const mockCreateUser = jest.spyOn(UserService, 'createUser');
        mockCreateUser.mockImplementation(() => {
            throw new Error();
        });

        const userController = new UserController();
        await userController.createUser('paulforbes42@gmail.com', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);
        
        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(500);
    });

    test('should delete users', async () => {
        const mockDeleteUser = jest.spyOn(UserService, 'deleteUser');

        const userController = new UserController();
        await userController.deleteUser('abc', res);
       
        expect(mockDeleteUser).toHaveBeenCalledWith('abc');
        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    test('should handle invalid user errors while deleting a user', async () => {
        const mockDeleteUser = jest.spyOn(UserService, 'deleteUser');
        mockDeleteUser.mockImplementation(() => {
            throw new Error(UserErrors.InvalidUser);
        });

        const userController = new UserController();
        await userController.deleteUser('abc', res);
        
        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test('should handle database errors while deleting a user', async () => {
        const mockDeleteUser = jest.spyOn(UserService, 'deleteUser');
        mockDeleteUser.mockImplementation(() => {
            throw new Error(UserErrors.DatabaseError);
        });

        const userController = new UserController();
        await userController.deleteUser('abc', res);
        
        expect(res.sendStatus).toHaveBeenCalledWith(503);
    });

    test('should handle generic errors while deleting a user', async () => {
        const mockDeleteUser = jest.spyOn(UserService, 'deleteUser');
        mockDeleteUser.mockImplementation(() => {
            throw new Error();
        });

        const userController = new UserController();
        await userController.deleteUser('abc', res);
        
        expect(res.sendStatus).toHaveBeenCalledWith(500);
    });

    test('should authenticate', async () => {
        const mockAuthenticate = jest.spyOn(UserService, 'authenticate');
        mockAuthenticate.mockReturnValueOnce('abc' as any);

        const userController = new UserController();
        await userController.authenticate('paulforbes42@gmail.com', 'L1m1t5dAcc355', res);

        expect(mockAuthenticate).toHaveBeenCalledWith({
            email: 'paulforbes42@gmail.com',
            password: 'L1m1t5dAcc355',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledWith('abc');
    });

    test('should handle invalid user errors during authentication', async () => {
        const mockAuthenticate = jest.spyOn(UserService, 'authenticate');
        mockAuthenticate.mockImplementation(() => {
            throw new Error(UserErrors.InvalidUser);
        });

        const userController = new UserController();
        await userController.authenticate('paulforbes42@gmail.com', 'L1m1t5dAcc355', res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test('should handle valiadtion errors during authentication', async () => {
        const mockAuthenticate = jest.spyOn(UserService, 'authenticate');
        mockAuthenticate.mockImplementation(() => {
            throw new Error(UserErrors.ValidationFailure);
        });

        const userController = new UserController();
        await userController.authenticate('paulforbes42@gmail.com', 'L1m1t5dAcc355', res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test('should handle generic errors during authentication', async () => {
        const mockAuthenticate = jest.spyOn(UserService, 'authenticate');
        mockAuthenticate.mockImplementation(() => {
            throw new Error();
        });

        const userController = new UserController();
        await userController.authenticate('paulforbes42@gmail.com', 'L1m1t5dAcc355', res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(500);
    });

    test('should list users', async () => {
        const mockListUsers = jest.spyOn(UserService, 'listUsers');
        const mockUsers = [{userId:1}, {userId:2}];
        mockListUsers.mockReturnValueOnce(mockUsers as any);

        const userController = new UserController();
        await userController.listUsers(res);

        expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('should handle generic errors while listing users', async () => {
        const mockListUsers = jest.spyOn(UserService, 'listUsers');
        mockListUsers.mockImplementation(() => {
            throw new Error();
        });

        const userController = new UserController();
        await userController.listUsers(res);

        expect(res.json).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(500);
    });

    test('should update users', async () => {
        const mockUpdateUser = jest.spyOn(UserService, 'updateUser');
        const mockUser = {userId:1};
        mockUpdateUser.mockReturnValueOnce(mockUser as any);

        const userController = new UserController();
        await userController.updateUser('abc', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);

        expect(mockUpdateUser).toHaveBeenCalledWith('abc', {
            password: 'L1m1t3dAcc355',
            firstName: 'Paul',
            lastName: 'Forbes',
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('should handle invalid user errors while updating a user', async () => {
        const mockUpdateUser = jest.spyOn(UserService, 'updateUser');
        mockUpdateUser.mockImplementation(() => {
            throw new Error(UserErrors.InvalidUser);
        });

        const userController = new UserController();
        await userController.updateUser('abc', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test('should handle password encryption errors while updating a user', async () => {
        const mockUpdateUser = jest.spyOn(UserService, 'updateUser');
        mockUpdateUser.mockImplementation(() => {
            throw new Error(UserErrors.UnableToEncryptPassword);
        });

        const userController = new UserController();
        await userController.updateUser('abc', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(422);
    });

    test('should handle database errors while updating a user', async () => {
        const mockUpdateUser = jest.spyOn(UserService, 'updateUser');
        mockUpdateUser.mockImplementation(() => {
            throw new Error(UserErrors.DatabaseError);
        });

        const userController = new UserController();
        await userController.updateUser('abc', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(503);
    });

    test('should handle generic errors while updating a user', async () => {
        const mockUpdateUser = jest.spyOn(UserService, 'updateUser');
        mockUpdateUser.mockImplementation(() => {
            throw new Error();
        });

        const userController = new UserController();
        await userController.updateUser('abc', 'L1m1t3dAcc355', 'Paul', 'Forbes', res);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(500);
    });

});