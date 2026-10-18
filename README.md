# SreeOS Apps

The official App Store catalog for [SreeOS](https://github.com/SreeOS/sreeos), published with GitHub Pages at
**https://sreeos.github.io/apps/**. SreeOS lists it in **App Store → Sources** by default.

```
src/<app>/            apps contributed as plain folders (zipped by CI)
packages/*.sreeapp    apps contributed as packages (exported from App Studio)
site/index.html       the catalog's landing page
scripts/build.mjs     validates every app, hashes it and writes dist/index.json
```

```sh
npm install
npm run check   # validate only
npm run build   # dist/ = the static catalog (index.json + packages/)
npm test
```

Every push to `main` rebuilds `index.json` (with SHA-256 hashes SreeOS verifies before installing)
and deploys `dist/` to Pages. If two versions of an app exist, the highest one is listed.

To add an app, see [CONTRIBUTING.md](CONTRIBUTING.md). To build one, see the
[SreeOS app docs](https://github.com/SreeOS/sreeos/blob/main/docs/apps.md).
