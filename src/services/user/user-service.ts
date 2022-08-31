import bcrypt from 'bcrypt';
import EmailValidator from 'email-validator';
import jwt from 'jsonwebtoken';
import ConfigurationService from '../configuration/configuration-service';
import DatabaseService from '../database/database-service';
import User, {UserCreationAttributes} from '../../models/user';
import {
    AuthenticationToken,
    UserErrors, 
    UserAuthenticationAttributes,
    UserUpdateAttributes,
    UserUpdateFields,
} from './types';
export {UserErrors} from './types';

const UserModel = DatabaseService.getModel('UserModel');

/**
 * Service to create and manage users
 */
export default class UserService {

    /**
     * Bcrypt rounds while hashing password
     */
    private static saltRounds = 12;

    /**
     * Encrypt a password before storing in the database
     *  
     * @param password Password string to be encrypted
     * @returns Hashed password
     */
    private static async encryptPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Validate and create a new user record
     * 
     * @param userAttributes {@link UserCreationAttributes} User information for new record
     * @throws {@link UserErrors.UserRegistrationDisabled} When user registration is not enabled in the application's configuration file
     * @throws {@link UserErrors.InvalidEmail} Email address fails validation
     * @throws {@link UserErrors.EmailExists} User record already exists with given email address
     * @throws {@link UserErrors.UnableToEncryptPassword} Fails to encrypt password
     * @throws {@link UserErrors.DatabaseError} Unable to write new user record to database
     * @returns {@link UserModel} Created user record
     */
    public static async createUser(userAttributes: UserCreationAttributes): Promise<User> {

        // User registration must be enabled in the application's configuration file
        if(!ConfigurationService.getConfigurationValue('application.json', 'allowUserRegistration'))
            throw new Error(UserErrors.UserRegistrationDisabled);

        // Verify required fields are provided
        if(!userAttributes.firstName || !userAttributes.lastName || !userAttributes.email || !userAttributes.password)
            throw new Error(UserErrors.ValidationFailure);

        // Verify the provided email address is a valid email address
        if(!EmailValidator.validate(userAttributes.email))
            throw new Error(UserErrors.InvalidEmail);

        // Verify a user does not already exist with this email address
        const existingUser = await UserModel.findOne({
            where: {
                email: userAttributes.email
            },
            paranoid: false,
        });

        if(existingUser)
            throw new Error(UserErrors.EmailExists);

        let encryptedPassword;
       
        // Encrypt the provided password
        try {
            encryptedPassword = await this.encryptPassword(userAttributes.password);
        }
        catch(e) {
            throw new Error(UserErrors.UnableToEncryptPassword)
        }

        // Prepare the user record to write to the database
        const user = UserModel.build({
            email: userAttributes.email,
            password: encryptedPassword,
            firstName: userAttributes.firstName,
            lastName: userAttributes.lastName,
            activated: false,
        });

        // Write the user to the database
        try {
            await user.save();
        } 
        catch(e) {
            throw new Error(UserErrors.DatabaseError);
        }

        const createdUser = await UserModel.findOne({
            where: {
                email: userAttributes.email,
            }
        })

        return createdUser as User;
    }

    /**
     * Mark a user record as deleted
     *  
     * @param userId Identifier for record to be deleted
     * @throws {@link UserErrors.InvalidUser} userId is invalid or has already been deleted
     * @throws {@link UserErrors.DatabaseError} Unable to update user record
     */
    public static async deleteUser(userId: string): Promise<void> {
        const user = await UserModel.findOne({
            where: {
                id: userId
            }
        });

        // Verify the user to be deleted exists and is active
        if(!user)
            throw new Error(UserErrors.InvalidUser);

        // Delete the user
        try {
            await user.destroy();
        }
        catch(e) {
            throw new Error(UserErrors.DatabaseError);
        }
    }

    /**
     * Authenticate a user
     * 
     * @param userAttributes Email and password to verify for authentication
     * @throws {@link UserErrors.InvalidUser} No active user record exists for email
     * @throws {@link UserErrors.ValidationFailure} Missing required fields or incorrect password specified
     * @returns JSONWebToken {string}
     */
    public static async authenticate(userAttributes: UserAuthenticationAttributes): Promise<string> {

        if(!userAttributes.email || !userAttributes.password)
            throw new Error(UserErrors.ValidationFailure);

        const user = await UserModel.scope('full').findOne({
            where: {
                email: userAttributes.email,
            },
        });

        if(!user)
            throw new Error(UserErrors.InvalidUser);

        const valid = await bcrypt.compare(userAttributes.password, user.get('password') as string);

        if(!valid)
            throw new Error(UserErrors.ValidationFailure);

        const token = jwt.sign(
            { userId: user.get('id') },
            ConfigurationService.getConfigurationValue('application.json', 'jwtSecret'),
            { expiresIn: '24h' },
        );

        return token;
    }

    /**
     * Decode give JSON Web Token
     * 
     * @param token JSON Web Token as string
     * @returns decoded AuthenticationToken
     */
    public static decodeToken(token: string): AuthenticationToken {
        const jwtSecret = ConfigurationService.getConfigurationValue('application.json', 'jwtSecret');
        return jwt.verify(token, jwtSecret) as AuthenticationToken;
    }

    /**
     * Retrieve a list of users
     *  
     * @returns List of users
     */
    public static async listUsers(): Promise<User[]> {
        const users = await UserModel.findAll();

        return users as User[];
    }

    /**
     * Update attributes of a user in the database
     * 
     * @param userId Identifier for record to be deleted
     * @param userAttributes Attributes to set on the user record
     * @throws {@link UserErrors.InvalidUser} No active user record exists for this userId
     * @throws {@link UserErrors.UnableToEncryptPassword} Fails to encrypt password
     * @throws {@link UserErrors.DatabaseError} Unable to write user record to database
     * @returns User Model
     */
    public static async updateUser(userId: string, userAttributes: UserUpdateAttributes): Promise<User> {
        const user = await UserModel.scope('full').findOne({
            where: {
                id: userId
            }
        });

        // Verify the user to be deleted exists and is active
        if(!user)
            throw new Error(UserErrors.InvalidUser);

        // Encrypt the provided password
        let encryptedPassword = '';
        if(userAttributes[UserUpdateFields.Password]) {
            try {
                encryptedPassword = await this.encryptPassword(userAttributes.password);
            }
            catch(e) {
                throw new Error(UserErrors.UnableToEncryptPassword)
            }
        }

        Object.keys(userAttributes).forEach(attribute => {
            if(attribute === UserUpdateFields.Password)
                user.set(attribute, encryptedPassword);
            else
                user.set(attribute as UserUpdateFields, userAttributes[<UserUpdateFields>attribute]);
        });

        // Update the user
        try {
            await user.save();
        }
        catch(e) {
            throw new Error(UserErrors.DatabaseError);
        }

        const updatedUser = await UserModel.findOne({
            where: {
                id: userId
            }
        });

        return updatedUser as User;
    }
}