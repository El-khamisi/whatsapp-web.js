# eT3Task-Backend

## Description
A Backend Server ( based on `node.js` and `express` framework) using `mongoDB` as a database provider and `mongoose` as ODM.
The webstie  has the ability to register new users using `JWT token` with different roles.


## Features
* Authenticate and authorize users by `JWT token` and initialize `express-session` for each user.
* Store data in `mongodb` using the `mongoose` ODM.
* Authenticate the token by `Bearer token`
* Upload the media by `Multer` middleware and store them on `Cloudinary`.

## Installing

* Download the dependencies with `npm` package manager
```
$ npm install
```

## Executing program
* * The website works on `http://localhost:process.env.PORT || 8080` OR by `nodemon` which is run in development mode with monitoring of debugging terminal.

>npm run scripts
```
{
    "scripts": {
      "prettier": "prettier --config .prettierrc './**/*.js'  --write",
      "dev": "nodemon index.js 5050",
      "prod": " NODE_ENV=prod node index.js 8080",
      "start": "node index.js"
  },
}
```

## API Documention
[Postman API Documention](https://documenter.getpostman.com/view/17898602/UzXNVHWv)

## Environment Variables 
> src/config/env.js
```
PORT
DBURI_remote
DBURI
TOKENWORD

#environment
NODE_ENV

#WWhatsapp Client
WSESSION_FILE_PATH

```

## Directory Structure

```
.
|_node_modules/
|_src
  |_config        #configurations files
  |_controllers   #controllers files
  |_middlewares   #custom middleware
  |_models        #database repositories files
  |_routes        #API routes files
  |_utils         #general server utilities
|
|_.env
|_.gitignore
|_index.js
|_package.json
|_README.md
|_LICENSE.md
```
