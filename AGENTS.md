# Agent instructions for minecraft-data

## Read first

Before changing data, generators, schemas, or version support, read [CONTEXT.md](CONTEXT.md). Read the relevant existing guides before editing their area:

- [README.md](README.md) explains the public data model and supported editions.
- [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md) explains the repository layout and data indirection.
- [doc/add-data-new-version.md](doc/add-data-new-version.md) is the procedure for adding a Java or Bedrock version.
- [doc/protocol.md](doc/protocol.md) is the source guide for protocol schemas.
- [SECURITY.md](SECURITY.md) is required when processing downloaded jars, generated data, credentials, or untrusted input.

Keep this file focused on agent behavior. The files above remain the source of truth for detailed formats.

## Source of truth

- The repository root is a language-independent data corpus. It has no root package manifest; maintenance commands run from tools/js.
- data/dataPaths.json maps an edition and version to the directory that supplies each data family. A version may intentionally reuse a previous directory.
- The version lists in data/pc/common/versions.json and the Bedrock data paths are the supported-version indexes.
- Human-maintained protocol schemas are proto.yml/type YAML under the versioned protocol directories. Generated protocol.json files are build output.
- JSON files must satisfy schemas under schemas/. Prefer the extractor, generator, or audit script that produced a file over hand-editing generated output.
- Provenance for imported or generated data must be recorded in the change description and in any repository provenance file already used by the update.

Never edit generated protocol.json to make a protocol change. Edit the correct YAML source, run the protocol build, and review the generated diff.

## Standard workflow

1. Identify the edition, version, and data family being changed. Check data/dataPaths.json and the nearest historical version.
2. Read the applicable extraction instructions and inspect the upstream source or generator input. Record the source revision, extraction method, and any manual corrections.
3. For a new version, create or reuse the version directory with the version tool, update the edition version index and dataPaths.json, then fill in data from the generator. Do not silently copy a newer or older version when the protocol or registry differs.
4. For protocol changes, edit the YAML source, run npm run build from tools/js, and inspect protocol.json rather than treating it as the editable file.
5. Run the focused audit scripts for changed data families and then the complete tools/js checks.
6. Update documentation and the change description with the edition, Minecraft version, data source, and compatibility impact.

## Commands

From the repository root:

    cd tools/js
    npm install
    npm run lint
    npm test
    npm run build

The version helper is invoked from tools/js as npm run version -- <pc|bedrock> <minecraft-version> <protocol-version>. Check its implementation and the release instructions before using it. Do not invent a protocol number.

Useful focused audits are in tools/js/test/, including audit_blocks.js, audit_items.js, audit_recipes.js, and audit_shapes.js. Use the exact script arguments shown by the script before invoking one.

## Completion checklist

- The correct source file changed, with no unrelated generated churn.
- dataPaths.json and the relevant version index resolve every new or changed family.
- Schemas, protocol YAML, generated files, and audits agree.
- Java 26.2 (protocol 776, data version 4903) and Java 26.3 (protocol 777, data version 5023) retain their distinct data where applicable.
- Provenance identifies the source, generator, date, and checksum when binary or generated inputs were imported.
- Documentation and examples do not claim support that the data corpus or validation does not provide.
- Run git diff --check and review the complete diff before handing off.

## Cross-repository coordination

Changes to protocol data normally flow to node-minecraft-protocol, then to mineflayer and the relevant prismarine modules. Keep version names and protocol numbers consistent with those repositories. If a downstream repository needs a compatibility guard, document the dependency rather than duplicating the data here.


## Reproducing the current fork

The Java 26.2/26.3 data commits are newer than the current published minecraft-data release. The root has no package manifest, and a standalone consumer install does not reproduce this source tree. For cross-repository validation, use the sibling checkout layout documented in downstream CONTEXT.md files and the checked-in vendor snapshot where applicable.
