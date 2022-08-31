import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import {
    getOpenAPIJson,
    setOpenAPIJsonPath,
    useController,
} from 'express-typescript-decorators';
import UserController from './controllers/user';

// Set the location of the file that contains top level OpenAPI documentation
setOpenAPIJsonPath('./config/OpenAPI.json');

// Create the Express Application
const app = express();

// Setup CORS to allow Swagger UI to execute the APIs
app.use(cors());

// Parse JSON request body
app.use(bodyParser.json());

// Register the class of routes with express
app.use(useController(UserController));

// Expose the OpenAPI documentation for Swagger UI
app.use('/api-docs', getOpenAPIJson());

// Start the Express Application
const port = process.env['PORT'] || 5000;
app.listen(port, () => console.log(`Express application started on port ${port}`));