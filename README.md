# React Stripe Example
This project is a test project used to connect to the stripe api (in test mode). You can view the live demo [here](https://react-stripe-39c60.web.app/).
## Initializing the project
Just clone the repository and download the dependencies for each project ('/server' and '/app') with `npm i` in each seperate folder.
## Running the server
You will need a .env file in the '/server' directory with environmental variables:
```
STRIPE_SECRET: your stripe API secret

WEBAPP_URL: the redirect url for stripe (most likely localhost:3000, if you are running in dev mode)

STRIPE_WEBHOOK_SECRET: your stripe api webhook secret

GOOGLE_APPLICATION_CREDENTIALS: the location of your ./service-account.json for your firebase project
```

Then build the project in dev mode by running `npm run dev`.

## Running the React App
You will need to update the firebase config. Then run with `npm run dev`
