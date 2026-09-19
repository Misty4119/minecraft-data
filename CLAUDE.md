@AGENTS.md

When working in this repository, load [CONTEXT.md](CONTEXT.md) before making architectural or versioning decisions. Load [SECURITY.md](SECURITY.md) before handling downloaded Minecraft jars, generated data from outside the repository, credentials, or untrusted files.

The canonical maintenance package is tools/js. The root has no package.json. Protocol changes are made in YAML and materialized with npm run build; protocol.json is generated output. Preserve dataPaths.json, common version indexes, schema validation, provenance, and the Java 26.2/26.3 distinction described in AGENTS.md.
