# whatsapp-web - Backend

## Description
A real-time Server ( based on `node.js`, `express` framework, and `socket.io`) using `mongoDB` to store users data.
The application provides the ability to build users' profiles and interact in real-time with `socket.io` to send whatsapp messages, notify when receiving messages, and customize auto-replies.



## Features
* Authenticate and authorize users by `JWT Bearer token` and initialize `express-session` for each user.
* Use `socket.io` to interact with whatsapp.
* Have `async API` documentation for `socket.io` events.
* Store data in `mongodb` using the `mongoose` ODM.
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
"scripts": {
  "prettier": "prettier --config .prettierrc 'src/**/*.js'  --write",
  "dev": "nodemon index.js 5050",
  "prod": " NODE_ENV=prod node index.js 8080",
  "start": "NODE_ENV=prod node index.js 8080",
},
```


## Environment Variables 
> src/config/env.js
```
PORT,
DBURI,
DBURI_remote,
TOKENWORD,              //secret token word

//wWhatsApp Client
WSESSION_FILE_PATH,    //file path to store whatsapp sessions

//SMTP
sendinblue_user,      
sendinblue_key,
to_email,
smtp_host,
smtp_port,

// Cloudinary
cloudinary_name,
cloudinary_api_key,
cloudinary_api_secret,

//Environment
baseUrl,
NODE_ENV,
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
