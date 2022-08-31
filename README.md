# User Management example for Express TypeScript Decorators

This TypeScript project is a fully functional Express Application to manage adding, updating and listing users in a database managed by Sequelize.  The purpose is to demostrate extensive usage of the [express-typescript-decorators](https://github.com/paulforbes42/express-typescript-decorators) package.  Linking the OpenAPI output from `express-typescript-decorators` in this project with Swagger UI allows you to browse the capabilities and the generated API documentation.

## Project Components

* Complete and operational TypeScript API
* Database Models created with `sequelize-typescript`
* Database Migration(s)
* Logging with `Winston`
* Working `Express` Application
* Token based authentication middleware
* Generated OpenAPI documentation

## Setup Steps

To get this project running locally, ensure you are running a Sequelize supported database and perform the following steps

### Install dependencies

```npm install```

### Database Configuration

* Copy `config/db.json.template` to `config/db.json`
* Populate `config/db.json` with valid database information

### Run the database migration(s)

* Migrate the database `npm run migrate`

### Application Configuration

* Copy `config/application.json.template` to `config/application.json`
* Populate `config/application.json` with any setting you prefer

### Build the project (tsc)

* execute `npm run build`

### Start the Express Application

* Start the API `node dist/index.js`

## API Routes Example

Once you have the API running locally, The best way to understand the capabilities of the API would be to point a running instance of Swagger UI to `http://localhost:5000/api-docs` as the full OpenAPI documentation is hosted by the API in JSON format.  For simplicity, this document also includes an overview of the available routes.

### Create User

POST `/api/user`

example
```
curl -X 'POST' \
  'http://localhost:5000/api/user/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "paulforbes42@gmail.com",
  "password": "L1m1t3dAcc355",
  "firstName": "Paul",
  "lastName": "Forbes"
}'
```

### Authentication

POST `api/user/auth`

example
```
curl -X 'POST' \
  'http://localhost:5000/api/user/' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "paulforbes42@gmail.com",
  "password": "L1m1t3dAcc355",
  "firstName": "Paul",
  "lastName": "Forbes"
}'
```

### List Users

GET `/api/user` *requires auth*

example (requires valid token)
```
curl -X 'GET' \
  'http://localhost:5000/api/user/' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNlOTk0ZC1jYjY2LTRhMGYtODAzYS0yODU4MDk3NmViZTMiLCJpYXQiOjE2NjE5MjU5MTQsImV4cCI6MTY2MjAxMjMxNH0.7WXdPw06gFZu1QoPFj00pF7wrZ6_FokXSVQvU_4lpZ8'
```

### Update User

PUT `/api/user/:userId` *requires auth*

example (requires valid token, requires valid userId)
```
curl -X 'PUT' \
  'http://localhost:5000/api/user/882f3812-d0fd-4679-86d7-1cfd3df4d056' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNlOTk0ZC1jYjY2LTRhMGYtODAzYS0yODU4MDk3NmViZTMiLCJpYXQiOjE2NjE5MjU5MTQsImV4cCI6MTY2MjAxMjMxNH0.7WXdPw06gFZu1QoPFj00pF7wrZ6_FokXSVQvU_4lpZ8' \
  -H 'Content-Type: application/json' \
  -d '{
  "password": "L1m1t3dAcc355",
  "firstName": "Test",
  "lastName": "User"
}'
```

### Delete User

DELETE `/api/user/:userId` *requires auth*

example (requires valid token, requires valid userId)
```
curl -X 'DELETE' \
  'http://localhost:5000/api/user/882f3812-d0fd-4679-86d7-1cfd3df4d056' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZGNlOTk0ZC1jYjY2LTRhMGYtODAzYS0yODU4MDk3NmViZTMiLCJpYXQiOjE2NjE5MjU5MTQsImV4cCI6MTY2MjAxMjMxNH0.7WXdPw06gFZu1QoPFj00pF7wrZ6_FokXSVQvU_4lpZ8'
```

## Run Unit tests

This project also has examples on how to write unit tests against your `express-typescript-decorator` controllers.

* `npm run test`