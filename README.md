# Party Calculator

How much food and drink do you need for a party? Pre-computed answers for every party
staple — pizza, burgers, wings, pulled pork, tacos, cake, ice, soda, beer, wine, coffee, and
more — across guest counts from 10 to 300, plus interactive per-item calculators and a
full-menu planner. Standard catering portions with package counts (buns come in 8s, dogs in
10s — we do that math).

Live at **https://party.elevatedprogress.com/**

## How it works

Zero-dependency Node static-site generator:

- `generate.js` — writes every page into `public/`
- `assets/party-math.js` — ALL portion math, shared by the build and the browser tools
- `data/items.json` — item copy (names, blurbs, tips) + guest-count presets
- `server.js` — local preview server (`http://localhost:5057`)

```
node generate.js   # build ./public
node server.js     # preview
```

Deployment is GitHub Actions → GitHub Pages on every push to `main` (`public/` is build
output and never committed).
