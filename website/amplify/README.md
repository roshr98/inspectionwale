Amplify deployment guide (minimal, step-by-step)

This repository contains a React front-end (react-frontend) and server logic. We will deploy the front-end to AWS Amplify Hosting and implement backend endpoints as Amplify Functions (Lambda) + API Gateway + DynamoDB + Cognito.

High level steps (run from your dev machine):

1) Prerequisites
- Install Node.js (LTS)
- Install Amplify CLI: npm install -g @aws-amplify/cli
- Configure AWS credentials: amplify configure

2) Prepare the repo
- Move your static assets into the React public folder so Amplify Hosting serves them. From repo root run or perform manually:
  - move Images/ -> react-frontend/public/Images/
  - move Icons/ -> react-frontend/public/Icons/
- Update any hard-coded paths in the code to point to /Images/... or /Icons/...
- Add and commit changes (we included a .gitignore in the repo already)

3) Initialize Amplify
From the repo or react-frontend folder (recommended in repo root but set sourceDir to react-frontend):

amplify init
# pick the following (example answers):
# ? Enter a name for the project: inspectionwale
# ? Enter a name for the environment: prod
# ? Choose your default editor: (your editor)
# ? Choose the type of app that you're building: javascript
# ? What javascript framework are you using: react
# ? Source Directory Path: react-frontend
# ? Distribution Directory Path: react-frontend/dist
# ? Build Command: npm run build
# ? Start Command: npm run start

4) Add Auth (Cognito)

amplify add auth
# Accept defaults or choose Email sign-up and basic config

5) Add Storage (DynamoDB) for quotes

amplify add storage
# Choose NoSQL (DynamoDB)
# Table name: inspectionwale-quotes (or leave default)
# Partition key: id (String)
# Add fields as needed

6) Add REST API + Functions

amplify add api
# Choose REST
# API name: inspectionwale-api
# Path: /quote
# Create a new Lambda function: quoteHandler
# Choose Node.js runtime
# When asked, allow the function to access the DynamoDB table (the CLI will add necessary permissions)

Repeat for other routes (e.g. /reviews -> reviewsHandler)

7) Configure environment variables for functions
- In Amplify Console > Backend environments > Environment variables (or via amplify function update) set:
  - For quoteHandler: QUOTES_TABLE (table name generated), SES_FROM, SES_TO, AWS_REGION
  - For reviewsHandler: GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID

8) Push backend

amplify push

9) Hosting (Amplify Console)
- From Amplify Console > Hosting > connect your Git repo and choose branch main
- Set build settings to build the React app located in react-frontend (see sample amplify.yml in root if needed)
- Add a rewrite rule to proxy /api/* to your API Gateway endpoint if you want to use relative /api calls. Alternatively, update front-end to use full API URL from env.

10) Frontend configuration
- In react-frontend, set environment variable (in Amplify Console App settings) VITE_API_BASE to the API url or leave as /api when using proxy rewrite.
- Import Amplify's generated aws-exports if you used amplify add auth to wire Cognito into the React app.

Notes on costs and limits
- Use Cognito + Lambda + DynamoDB within free-tier usage to avoid charges.
- SES requires verifying senders and may require removal from sandbox for production sending; test using verified addresses.
- Google Places API may incur charges; monitor usage.

If you want, I can generate the Amplify Function code files (we added templates under amplify/functions) and sample `amplify.yml` for hosting. After you confirm you moved Images/Icons into `react-frontend/public` I will generate React changes to reference the public asset paths and produce the lambda zip-ready code if needed.
