Local server for handling callback requests and sending notification emails.

Setup

- Node 16+ installed
- Install deps: npm install

Environment variables

- SMTP_HOST: (optional) SMTP host. If omitted, the server creates an ethereal test account and prints a preview URL in the response.
- SMTP_PORT: SMTP port (default 587)
- SMTP_USER / SMTP_PASS: SMTP credentials
- SMTP_SECURE: 'true' if using TLS
- NOTIFY_EMAIL: where to send notifications (default: hello@inpection.com)
- FROM_EMAIL: from address (default: no-reply@inpection.com)

Run

- npm run dev  # for development with nodemon
- npm start    # run once

Notes

- Callbacks are appended to callbacks.json in the server folder.
- For production on AWS Lambda or Amplify Functions, adapt index.js to the provider's handler signature and keep secrets in environment variables.
