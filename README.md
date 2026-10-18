# SreeOS Apps

The official App Store catalog for [SreeOS](https://github.com/sreeos/sreeos), an offline, local-first OS that runs
in the browser. The catalog is a static site on GitHub Pages:

**https://sreeos.github.io/apps/**

SreeOS lists it under **App Store → Sources** by default, so every app here can be installed from inside SreeOS.

## Apps

| App | Category | Permissions | What it is |
|---|---|---|---|
| 🎲 Dice (`sreeos.dice`) | Games | none | Roll dice. A tiny example app with settings |
| 🗒️ Notes (`sreeos.notes`) | Productivity | none | Quick notes, saved as you type, in the app's own folder |
| ⏱️ Focus Timer (`sreeos.timer`) | Productivity | `notify` | A Pomodoro timer that notifies you when it's time for a break |
| WhatsApp (`web.whatsapp`) | Web Apps | none | WhatsApp Web in its own app window |

## How it works

```
src/<app>/            apps contributed as plain folders (zipped by CI)
packages/*.sreeapp    apps contributed as packages (exported from App Studio)
site/index.html       the catalog's landing page
scripts/build.mjs     validates every app, hashes it and writes dist/index.json
```

On every push to `main`, CI validates each app, zips the folders in `src/` and writes `dist/index.json` with each
package's SHA-256. SreeOS checks that hash before it installs anything. Then CI deploys `dist/` to Pages. If two
versions of the same app exist, only the highest is listed.

## The manifest

Each app has a `manifest.json` at its root:

```json
{
  "id": "yourname.app",
  "name": "My App",
  "version": "1.0.0",
  "description": "One line about what it does.",
  "author": "Your Name",
  "category": "Productivity",
  "icon": "icon.png",
  "entry": "index.html",
  "permissions": [],
  "width": 480,
  "height": 360
}
```

| Field | Rules |
|---|---|
| `id` | Required. Lowercase letters, digits, `.`, `_` or `-`; 2–64 characters. Never changes once published |
| `name` | Required |
| `version` | Required. Dotted numbers, e.g. `1.0.0`. Bump it for every update |
| `entry` | The HTML file to open. Defaults to `index.html`, which must exist unless `url` is set |
| `url` | For web apps: an `https://` address, opened instead of a local entry |
| `icon` | A file in the app (`png`, `svg`, `jpg`, `webp`, `gif`, `ico`), an `https://` URL, or an emoji |
| `permissions` | Any of `notify`, `clipboard`, `launch`, `fs.home`, `fs.all`. Ask only for what you use |
| `settings` | Optional user settings, shown by SreeOS (see `src/dice` and `src/timer`) |

## Development

```sh
npm install
npm run check   # validate every app
npm run build   # dist/ = the static catalog (index.json + packages/)
npm test
```

## Contributing

Pull requests with new apps are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the steps and the rules. To
build an app, see the [SreeOS app docs](https://github.com/sreeos/sreeos/blob/main/docs/apps.md).
