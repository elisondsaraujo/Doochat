# Security Policy

## Secrets

Never commit:

- `.env`
- API keys
- passwords
- private keys
- OAuth secrets
- database credentials
- SMS credentials
- JWT secrets

Use `.env.example` as the template for local configuration.

## Authentication

Authentication tokens must never be logged.

Passwords must never be stored in plaintext.

Passwords are hashed using bcrypt.

## Authorization

Every protected resource must verify that the authenticated user has permission to access it.

Do not rely on frontend checks for authorization.

## Uploads

Uploaded files must be validated by type and size before being stored.

## Reporting

Security vulnerabilities should be reported privately to the project maintainer instead of being publicly disclosed before a fix is available.
