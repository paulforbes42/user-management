import {UserCreationAttributes} from '../src/models/user';
import {UserUpdateFields} from '../src/services/user/types';
import {UserErrors} from '../src/services/user/user-service';

jest.mock('../src/services/database/database-service', () => {
    return {
        getModel: jest.fn(),
    };
});

jest.mock('../src/services/configuration/configuration-service');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserService', () => {
    let UserService: any;
    let DatabaseService: any;
    let ConfigurationService: any;
    let mockUserModel: any;
    let bcrypt: any;
    let jwt: any;

    beforeEach(() => {
        jest.resetModules();
        bcrypt = require('bcrypt');
        jwt = require('jsonwebtoken');
        DatabaseService = require('../src/services/database/database-service');
        mockUserModel = {
            findOne: jest.fn(),
            build: jest.fn(),
            save: jest.fn(),
            destroy: jest.fn(),
            scope: jest.fn(),
            get: jest.fn(),
            findAll: jest.fn(),
            set: jest.fn(),
        };
        DatabaseService.getModel.mockReturnValueOnce(mockUserModel);
        mockUserModel.build.mockReturnValueOnce(mockUserModel);
        mockUserModel.scope.mockReturnValueOnce(mockUserModel);
        ConfigurationService = require('../src/services/configuration/configuration-service').default;
        UserService = require('../src/services/user/user-service').default;
    });

    test('should verify user registration is enabled in the configuration', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(false);

        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: '', 
                lastName: 'Forbes', 
                email: 'paulforbes42@gmail.com', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.UserRegistrationDisabled);
    });

    test('should create new users', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        UserService = require('../src/services/user/user-service').default;

        const userAttributes: UserCreationAttributes = {
            firstName: 'Paul',
            lastName: 'Forbes',
            email: 'paulforbes42@gmail.com',
            password: 'test',
        };
        const user = await UserService.createUser(userAttributes);

        expect(mockUserModel.findOne).toHaveBeenCalledWith({
            where: {
                email: userAttributes.email,
            }
        });
        expect(mockUserModel.build).toHaveBeenCalled();
        expect(mockUserModel.save).toHaveBeenCalled();
        expect(mockUserModel.findOne).toHaveBeenCalledTimes(2);
    });

    test('should validate first name as a required fields', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: '', 
                lastName: 'Forbes', 
                email: 'paulforbes42@gmail.com', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.ValidationFailure);
    });

    test('should validate last name as a required fields', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: 'Paul', 
                lastName: '', 
                email: 'paulforbes42@gmail.com', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.ValidationFailure);
    });

    test('should validate email as a required fields', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: 'Paul', 
                lastName: 'Forbes', 
                email: '', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.ValidationFailure);
    });

    test('should validate password as a required fields', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: 'Paul', 
                lastName: 'Forbes', 
                email: 'paulforbes42@gmail.com', 
                password: '' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.ValidationFailure);
    });

    test('should validate email addresses', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: 'Paul', 
                lastName: 'Forbes', 
                email: 'paulforbes42@gmailcom', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.InvalidEmail);
    });

    test('should verify the email does not already exist', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        mockUserModel.findOne.mockReturnValueOnce(true);
        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: 'Paul', 
                lastName: 'Forbes', 
                email: 'paulforbes42@gmail.com', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.EmailExists);
    });

    test('should throw an error when unable to encrypt a password', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        const mockBcryptHash = jest.spyOn(bcrypt, 'hash');
        mockBcryptHash.mockImplementation(() => {
            throw new Error();
        });
        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: 'Paul', 
                lastName: 'Forbes', 
                email: 'paulforbes42@gmail.com', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.UnableToEncryptPassword);
    });

    test('should throw an error when unable to save the user record', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce(true); // allowUserRegistration
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        mockUserModel.save.mockImplementation(() => {
            throw new Error();
        });
        let err: Error | undefined;
        try {
            await UserService.createUser({ 
                firstName: 'Paul', 
                lastName: 'Forbes', 
                email: 'paulforbes42@gmail.com', 
                password: 'test' 
            });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.DatabaseError);
    });

    test('should delete users', async () => {
        mockUserModel.findOne.mockReturnValueOnce(mockUserModel);
        let err: Error | undefined;
        try {
            await UserService.deleteUser('abc');
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeFalsy();
        expect(mockUserModel.destroy).toHaveBeenCalled();
    });

    test('should throw an error when deleting invalid users', async () => {
        mockUserModel.findOne.mockReturnValueOnce(undefined);
        let err: Error | undefined;
        try {
            await UserService.deleteUser('abc');
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.InvalidUser);
        expect(mockUserModel.destroy).not.toHaveBeenCalled();
    });
 
    test('should throw an error when unable to delete a user from the database', async () => {
        mockUserModel.findOne.mockReturnValueOnce(mockUserModel);
        mockUserModel.destroy.mockImplementation(() => {
            throw new Error();
        });
        let err: Error | undefined;
        try {
            await UserService.deleteUser('abc');
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.DatabaseError);
        expect(mockUserModel.destroy).toHaveBeenCalled();
    });
    
    test('should authenticate', async () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        mockUserModel.findOne.mockReturnValueOnce(mockUserModel);
        mockUserModel.get.mockReturnValueOnce('abc');
        const mockCompare = jest.spyOn(bcrypt, 'compare');
        mockCompare.mockReturnValueOnce(true);
        const mockSign = jest.spyOn(jwt, 'sign');
        mockSign.mockReturnValueOnce('testToken');
        let err: Error | undefined;
        let token;
        try {
            token = await UserService.authenticate({ email: 'paulforbes42@gmail.com', password: 'test'});
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeFalsy();
        expect(token).toBe('testToken');
    });

    test('should validate email during authentication', async () => {
        let err: Error | undefined;
        let token;
        try {
            token = await UserService.authenticate({ email: '', password: 'test' });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.ValidationFailure);
        expect(token).toBeFalsy();
    });

    test('should validate password during authentication', async () => {
        let err: Error | undefined;
        let token;
        try {
            token = await UserService.authenticate({ email: 'paulforbes42@gmail.com', password: '' });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.ValidationFailure);
        expect(token).toBeFalsy();
    });
 
    test('should throw an error when user is not found', async () => {
        mockUserModel.findOne.mockReturnValueOnce(undefined);
        let err: Error | undefined;
        let token;
        try {
            token = await UserService.authenticate({ email: 'paulforbes42@gmail.com', password: 'test'});
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(token).toBeFalsy();
        expect(err.message).toBe(UserErrors.InvalidUser);
    });
    
    test('should throw an error when the password is invalid', async () => {
        mockUserModel.findOne.mockReturnValueOnce(mockUserModel);
        mockUserModel.get.mockReturnValueOnce('abc');
        const mockCompare = jest.spyOn(bcrypt, 'compare');
        mockCompare.mockReturnValueOnce(false);
        let err: Error | undefined;
        let token;
        try {
            token = await UserService.authenticate({ email: 'paulforbes42@gmail.com', password: 'test'});
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.ValidationFailure);
        expect(token).toBeFalsy();
    });

    test('should decode tokens', () => {
        const mockGetConfigurationValue = jest.spyOn(ConfigurationService, 'getConfigurationValue');
        mockGetConfigurationValue.mockReturnValueOnce('abc'); // jwtSecret

        const mockVerify = jest.spyOn(jwt, 'verify');
        mockVerify.mockReturnValueOnce('test');

        const rv = UserService.decodeToken('test123');
        expect(rv).toBe('test');
        expect(mockVerify).toHaveBeenCalledWith('test123', 'abc');
    });

    test('should list users', async () => {
        mockUserModel.findAll.mockReturnValueOnce([mockUserModel]);

        const users = await UserService.listUsers();

        expect(users.length).toBe(1);
        expect(users[0]).toBe(mockUserModel);
    });

    test('should update user records', async () => {
        mockUserModel.findOne.mockReturnValue(mockUserModel);
        const user = await UserService.updateUser('abc', { firstName: 'Test' });
        expect(user).toBe(mockUserModel);
    });

    test('should throw an error when an invalid user is updated', async () => {
        let err: Error | undefined;
        try {
            await UserService.updateUser('abc', { firstName: 'Test' });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.InvalidUser);
    });

    test('should throw an error when the password cannot be encrypted', async () => {
        mockUserModel.findOne.mockReturnValue(mockUserModel);
        const mockHash = jest.spyOn(bcrypt, 'hash');
        mockHash.mockImplementation(() => {
            throw new Error();
        });
        let err: Error | undefined;
        try {
            await UserService.updateUser('abc', { password: 'Test' });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.UnableToEncryptPassword);
    });

    test('should encrypt an updated password', async () => {
        mockUserModel.findOne.mockReturnValue(mockUserModel);
        const mockHash = jest.spyOn(bcrypt, 'hash');
        mockHash.mockReturnValueOnce('test123')
        let err: Error | undefined;
        try {
            await UserService.updateUser('abc', { password: 'Test' });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeFalsy();
        expect(mockUserModel.set).toHaveBeenCalledWith(UserUpdateFields.Password, 'test123');
    });

    test('should throw an error when the password cannot be written to the database', async () => {
        mockUserModel.findOne.mockReturnValue(mockUserModel);
        mockUserModel.save.mockImplementation(() => {
            throw new Error();
        });
        let err: Error | undefined;
        try {
            await UserService.updateUser('abc', { firstName: 'Test' });
        } catch(e) {
            err = e as Error;
        }
            
        expect(err).toBeTruthy();

        if(!err)
            return;

        expect(err.message).toBe(UserErrors.DatabaseError);
    });
});