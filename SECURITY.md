# Security policy

## Scope

This repository contains generated Minecraft registries, protocol descriptions, schemas, and maintenance tools. Security concerns include malicious or malformed source data, generator/parser denial of service, path traversal in import tools, unsafe deserialization, and accidental disclosure of credentials or private server data.

## Supported versions

There is no formal long-term security-support matrix for this fork. Security triage is performed against the current master branch and the latest published data release first. Older commits and historical Minecraft versions are compatibility targets, not a promise of separate security maintenance. Data updates for Java 26.2 (protocol 776, data version 4903) and Java 26.3 (protocol 777, data version 5023) must preserve their version-specific mappings.

## Reporting a vulnerability

As verified on 2026-09-19, this fork has no enabled GitHub private vulnerability-reporting endpoint. Do not open a public issue, discussion, pull request, or chat message containing exploit details.

1. Check the repository's GitHub **Security** tab for **Report a vulnerability**. If GitHub offers that private form, use it.
2. If it is not enabled, use a private contact method listed on the [Misty4119 GitHub profile](https://github.com/Misty4119). If the profile exposes no private route, request a private route without including the vulnerability details, then send the report privately.
3. Do not include secrets, access tokens, Minecraft account data, private server addresses, or personal data unless strictly necessary.

A useful report contains the affected commit or data version, edition and Minecraft version, operating environment, minimal reproduction or input, impact, and any safe mitigation. Please allow maintainers to coordinate disclosure before publishing details. No response or remediation time is promised.

For ordinary data errors or reproducibility problems, use the repository's [public issue tracker](https://github.com/Misty4119/minecraft-data/issues) after removing confidential material.
