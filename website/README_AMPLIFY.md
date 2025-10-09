Quick Amplify deployment notes

This repository contains a static website in the `website/` folder. The `amplify.yml` in the repository is configured to publish that folder as the build artifact.

Steps to connect and deploy with AWS Amplify (console):

1. Go to AWS Amplify Console -> Host web app -> Get started
2. Choose "Repository" and connect your GitHub account. Authorize and select the `roshr98/inspectionwale` repository.
3. Select the `main` branch.
4. Amplify should detect `amplify.yml` and publish the `website` folder. If you want a different folder, update `amplify.yml`'s `baseDirectory`.
5. Click Save and Deploy. Watch the build logs. After successful build, Amplify will provide a public URL.

If you need a custom domain, add it in the Amplify Console and follow the DNS verification steps.

Notes:
- The project is a static HTML/CSS/JS site; no additional build steps are required.
- If you prefer to serve a subpath (for example `/carserv-template/index.html`), ensure routing and redirects are configured in Amplify's rewrite rules (Amplify Console -> Rewrites and redirects).
