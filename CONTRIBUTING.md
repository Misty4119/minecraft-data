# Contributing

Read the [PrismarineJS contribution guide](https://github.com/PrismarineJS/prismarine-contribute) and this repository's [Code of Conduct](CODE_OF_CONDUCT.md). Report sensitive issues through the [security policy](SECURITY.md).

## Data and protocol changes

- Follow the [architecture](doc/ARCHITECTURE.md), [Java version procedure](doc/add-data-new-version.md), [Bedrock procedure](doc/bedrock.md), and [protocol guide](doc/protocol.md).
- Check `data/dataPaths.json` and the edition's version index. A data family may intentionally reuse an older directory; preserve that mapping unless its data changes.
- Prefer the existing extractor or generator. Record the upstream source URL/revision, generator revision, extraction date, checksum, and manual corrections in the PR.
- Edit protocol YAML (`proto.yml` and imported type YAML). Regenerate `protocol.json`; it is build output.
- Keep Java 26.2 (protocol 776, data version 4903) and Java 26.3 (protocol 777, data version 5023) distinct. This source tree's support can be newer than published language wrappers.

## Checks

The root is a data corpus, not an npm package. Use the Node version in [CI](.github/workflows/ci.yml) (currently Node.js 24) and run:

```sh
cd tools/js
npm install
npm run build
npx mocha test/audit_pc_26_3.js --exit
npm test
cd ../..
git diff --check
```

`npm test` runs lint first, then the complete schema, data, and protocol synchronization checks. Select other focused audits from `tools/js/test/` for the affected data family. Inspect generated diffs and include commands/results in the PR. Record exact dependency commits when validating downstream protocol libraries or wrappers.

## Release behavior

Maintainers retain the existing release process: a push to `master` whose head commit message starts with `Release X.Y.Z` creates that tag and a non-draft, non-prerelease GitHub release, then dispatches `mcData-release` to `PrismarineJS/node-minecraft-data`. The root does not publish an npm package. The documentation workflow responds to `node-mcData-release` and publishes from `web`. Data helper workflows keep their manual and scheduled triggers. Do not run release or publication workflows as a validation command.
