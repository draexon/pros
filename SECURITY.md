# Security policy

## Supported versions

Security fixes are applied to the latest code on main. Older snapshots do not receive separate backports. This project is currently pre-1.0.

## Reporting a vulnerability

Do not post exploit details, credentials, or customer data in a public issue. Use GitHub's private vulnerability reporting on this repository if available. Otherwise contact [draexon](https://github.com/draexon) through a private contact method listed on the profile; if none is available, request a private reporting channel without disclosing the vulnerability.

Include the affected version or commit, reproduction steps, impact, and a minimal example with synthetic data. The maintainer will review the report and coordinate a fix and disclosure. Response times depend on maintainer availability.

## Application integrations

Pros supplies UI, not authentication, payment processing, or server-side validation. Applications must validate requests and permissions server-side. Never pass secret keys or raw payment credentials to these components. Use your payment provider's supported authorization and idempotency mechanisms.
