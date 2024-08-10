A messenger like webapp where users can chat with each other in real time.

## Features
- One to one chat
- Group Chat
- User can send images with chat
- User online status
- User message typing status

## Project requirements
Node version **20** or higher is required to run this project. The project might work on a lower version as well.

### How to run frontend
- Go to the frontend directory
- create `.env` file
- Copy everything from the `.env.example` file
- Assign values
- Run `npm i` and then `npm run dev`
- To run this project in production mode, first build the project using `npm run build`, and then use `npm run preview` to run.

There is a `VITE_API_BASE_URL` and `VITE_SOCKET_URL` variables in the `.env` file. The value of those variables will be the base url of the backend. For example, if the backend runs on `http://localhost:4000`, the value of the `VITE_API_BASE_URL` variable will be `http://localhost:4000/api`, and value of `VITE_SOCKET_URL` will be `http://localhost:4000`.

### How to run backend
- Go to the project directory
- create `.env` file
- Copy everything from the `.env.example` file
- Assign values
- Run `npm i` and then `npm run dev`
  
There is an `ALLOWED_ORIGIN` variable in the `.env` file. The value of this variable will be the url of the frontend. For instance, if the frontend runs on `http://localhost:5173`, the value of the variable will be this url. `PORT` is the port for the backend. `JWT_SECRET` will be a large random string to generate `jwt-token` for authentication.


