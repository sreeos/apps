# Adding an app

1. Build and test your app in SreeOS (**App Studio**, see the [docs](https://github.com/SreeOS/sreeos/blob/main/docs/apps.md)).
2. Fork this repo and add it **either** as
   - a folder `src/<name>/` with `manifest.json` and its files (preferred: reviewable), or
   - a package `packages/<id>-<version>.sreeapp` (App Studio → **Export**).
3. Run `npm install && npm run check`.
4. Open a pull request. CI validates it; a maintainer reviews it and merges.

## Store page (optional)

- `"screenshots": ["shots/1.png"]` and `"changelog": "What changed"` in `manifest.json` show on the app's
  App Store page. Screenshots can also live outside the app, in `screenshots/<id>/` in this repo, so
  they are not part of the download.
- `featured.json` lists the apps shown in the Store's **Featured** row (maintainers pick these).

## Rules

- `id` is unique and stays the same forever (`yourname.app`). Updates bump `version`.
- Ask only for the permissions you use, and say why in the PR.
- No obfuscated or minified-only code in `src/`; include the source.
- Web apps (`"url"`) must point at the official site of the service.
- No malware, trackers, crypto miners, or apps that impersonate others.

## Updates

Change the files (and `version`) in `src/<name>/`, or add the new `.sreeapp` next to the old one.
SreeOS users get it under **App Store → Updates**.
