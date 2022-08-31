/**
 * Errors returned by the User Service
 * @enum
 */
export enum UserErrors {
    DatabaseError = 'CreateUserDatabaseError',
    EmailExists = 'EmailExists',
    InvalidEmail = 'InvalidEmail',
    InvalidUser = 'InvalidUser',
    UnableToEncryptPassword = 'UnableToEncryptPassword',
    UserRegistrationDisabled = 'UserRegistrationDisabled',
    ValidationFailure = 'ValidationFailure',
};

export type UserAuthenticationAttributes = {
    email: string
    password: string
};

export type AuthenticationToken = {
    userId: string
};

export type UserUpdateAttributes = {
    password: string
    firstName: string
    lastName: string
};

export enum UserUpdateFields {
    Password = 'password',
    FirstName = 'firstName',
    LastName = 'lastName',
};