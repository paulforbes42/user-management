import {
    Controller,
    HttpDelete,
    HttpGet,
    HttpPost,
    HttpPut,
    HttpResponse,
    UrlParam,
    RequestBody,
    RequestParam,
    Response,
    ExpressResponse,
    Middleware,
} from 'express-typescript-decorators';
import UserService, {UserErrors} from '../services/user/user-service';
import Log from '../utils/log';
import Auth from '../middleware/auth';

@Controller('/api/user', 'User Management', 'Routes to create and manage users')
export default class UserController {

    @RequestBody('application/json', 'User information to create a new user from', true)
    @HttpResponse(201, 'User created successfully', 'application/json', {
        'firstName': 'Paul',
        'lastName': 'Forbes',
        'email': 'paulforbes42@gmail.com',
        'activated': false,
        'createdAt': '2022-08-25T12:00:00.000Z',
        'updatedAt': '2022-08-25T12:00:00.000Z',
        'deletedAt': null
    })
    @HttpResponse(400, 'Email or required fields failed validation')
    @HttpResponse(403, 'User registration is disabled')
    @HttpResponse(409, 'Email already exists in database')
    @HttpResponse(422, 'Failed to encrypt password')
    @HttpResponse(500, 'Unknown error')
    @HttpResponse(503, 'Database failure')
    @HttpPost('/', 'Create a new user')
    async createUser(
        @RequestParam('email', 'Email address of new user', 'paulforbes42@gmail.com', true) email: string,
        @RequestParam('password', 'Password for new user record', 'L1m1t3dAcc355', true) password: string,
        @RequestParam('firstName', 'User\'s first name', 'Paul', true) firstName: string,
        @RequestParam('lastName', 'User\s last name', 'Forbes', true) lastName: string,
        @Response() res: ExpressResponse
    ): Promise<void> {
        try {
            const user = await UserService.createUser({ email, password, firstName, lastName });
            res.status(201).json(user);
        }
        catch(e) {
            const {message} = e as Error;

            Log.error((e as Error).toString());

            if(message === UserErrors.InvalidEmail || message === UserErrors.ValidationFailure)
                res.sendStatus(400);
            else if(message === UserErrors.UserRegistrationDisabled)
                res.sendStatus(403);
            else if(message === UserErrors.EmailExists)
                res.sendStatus(409);
            else if(message === UserErrors.UnableToEncryptPassword)
                res.sendStatus(422);
            else if(message === UserErrors.DatabaseError)
                res.sendStatus(503);
            else
                res.sendStatus(500);
        }
    }

    @Middleware([Auth], [{"bearerAuth": []}])
    @HttpResponse(200, 'User record successfully deleted')
    @HttpResponse(404, 'Invalid userId specified')
    @HttpResponse(500, 'Unknown error')
    @HttpResponse(503, 'Database failure')
    @HttpDelete('/:userId', 'Delete an existing user from the system')
    async deleteUser(
        @UrlParam('userId', 'Identifier for user record to be deleted', '6a65c2b0-5f8d-435e-966f-8d172fa2c860') userId: string,
        @Response() res: ExpressResponse
    ): Promise<void> {
        try {
            await UserService.deleteUser(userId);
            res.sendStatus(200);
        }
        catch(e) {
            const {message} = e as Error;

            Log.error((e as Error).toString());

            if(message === UserErrors.InvalidUser)
                res.sendStatus(404);
            else if(message === UserErrors.DatabaseError)
                res.sendStatus(503);
            else
                res.sendStatus(500);
        }
    }

    @RequestBody('application/json', 'Email and password for authentication', true)
    @HttpResponse(201, 'Successfully authenticated', 'text/html', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNlOTk0ZC1jYjY2LTRhMGYtODAzYS0yODU4MDk3NmViZTMiLCJpYXQiOjE2NjE1MzA4MTgsImV4cCI6MTY2MTYxNzIxOH0.2o8cokKZODjDizmcXCTd8xmJG0RZbaaX_gpWyVB10RI')
    @HttpResponse(404, 'Invalid email or password specified')
    @HttpResponse(500, 'Unknown error')
    @HttpPost('/auth', 'Authenticate and retrieve a token')
    async authenticate(
        @RequestParam('email', 'Email address for user', 'paulforbes42@gmail.com', true) email: string,
        @RequestParam('password', 'Password for user', 'L1m1t3dAcc355', true) password: string,
        @Response() res: ExpressResponse,
    ): Promise<void> {
        try {
            const token = await UserService.authenticate({ email, password });
            res.status(201).send(token);
        }
        catch(e) {
            const {message} = e as Error;
            
            Log.error((e as Error).toString());

            if(message === UserErrors.InvalidUser)
                res.sendStatus(404);
            else if(message === UserErrors.ValidationFailure)
                res.sendStatus(404);
            else
                res.sendStatus(500);
        }
    }

    @Middleware([Auth], [{"bearerAuth": []}])
    @HttpResponse(500, 'Unknown error')
    @HttpResponse(200, 'Successfully retrieved a list of users', 'application/json', [
        {
            'firstName': 'Paul',
            'lastName': 'Forbes',
            'email': 'paulforbes42@gmail.com',
            'activated': false,
            'createdAt': '2022-08-25T12:00:00.000Z',
            'updatedAt': '2022-08-25T12:00:00.000Z',
            'deletedAt': null
        }
    ])
    @HttpGet('/', 'List users')
    async listUsers(
        @Response() res: ExpressResponse
    ): Promise<void> {
        try {
            const users = await UserService.listUsers();
            res.json(users);
        } catch(e) {
            Log.error((e as Error).toString());
            res.sendStatus(500);
        }
    }

    @Middleware([Auth], [{"bearerAuth": []}])
    @RequestBody('application/json', 'Updated user information to store in the database')
    @HttpResponse(200, 'Successfully updated user', 'application/json', {
        'firstName': 'Paul',
        'lastName': 'Forbes',
        'email': 'paulforbes42@gmail.com',
        'activated': false,
        'createdAt': '2022-08-25T12:00:00.000Z',
        'updatedAt': '2022-08-25T12:00:00.000Z',
        'deletedAt': null
    })
    @HttpResponse(404, 'Invalid userId specified')
    @HttpResponse(422, 'Failed to encrypt password')
    @HttpResponse(500, 'Unknown error')
    @HttpResponse(503, 'Database failure')
    @HttpPut('/:userId', 'Update a user in the system')
    async updateUser(
        @UrlParam('userId', 'Identifier for user record to be updated', '6a65c2b0-5f8d-435e-966f-8d172fa2c860') userId: string,
        @RequestParam('password', 'Password for new user record', 'L1m1t3dAcc355', false) password: string,
        @RequestParam('firstName', 'User\'s first name', 'Paul', false) firstName: string,
        @RequestParam('lastName', 'User\s last name', 'Forbes', false) lastName: string,
        @Response() res: ExpressResponse
    ): Promise<void> {
        try {
            const user = await UserService.updateUser(userId, { password, firstName, lastName })
            res.status(200).json(user);
        }
        catch(e) {
            const {message} = e as Error;

            Log.error((e as Error).toString())

            if(message === UserErrors.InvalidUser)
                res.sendStatus(404);
            else if(message === UserErrors.UnableToEncryptPassword)
                res.sendStatus(422);
            else if(message === UserErrors.DatabaseError)
                res.sendStatus(503);
            else
                res.sendStatus(500);
        }
    }
}