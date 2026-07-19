/*
 * Static long-tail page generator for the party quantity site.
 * Run: node generate.js   ->   writes everything into ./public
 *
 * Page families produced:
 *   /<item>-for-<n>-people/            pre-computed answers ("How many pizzas for 25 people?")
 *   /how-many-<item>-for-a-party/      canonical interactive page per item
 *   /party-food-calculator/            whole-menu planner
 *   /                                  homepage
 *
 * All quantity math lives in assets/party-math.js, shared with the browser tools.
 */
const fs = require("fs");
const path = require("path");
const PartyMath = require("./assets/party-math.js");

// ---- config -------------------------------------------------------------
const DOMAIN = process.env.DOMAIN || "https://party.elevatedprogress.com";
const BASE = process.env.BASE || "";
const SITE = "Party Calculator";
const OUT = path.join(__dirname, "public");
const ASSETS = path.join(__dirname, "assets");
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "items.json"), "utf8"));

const COUNTS = DATA.guestCounts;
const ITEMS = DATA.items;
const qSlug = item => item.q.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const calcHref = item => `/${qSlug(item)}-for-a-party/`;

// ---- html layout --------------------------------------------------------
function layout({ title, desc, urlPath, h1, hero, body, useTool }) {
  const canonical = DOMAIN + BASE + urlPath;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="${BASE}/styles.css">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5580575158570188" crossorigin="anonymous"></script>
</head>
<body>
<header class="site-head"><div class="wrap">
  <a class="brand" href="${BASE}/">🎉 ${SITE}</a>
  <nav class="nav"><a href="${BASE}/party-food-calculator/">Full Menu Planner</a><a href="${BASE}/#items">All Items</a></nav>
</div></header>
<main class="wrap">
  <div class="crumbs"><a href="${BASE}/">Home</a> ›&nbsp;${h1}</div>
  <h1>${h1}</h1>
  ${hero || ""}
  <div class="ad-slot">Advertisement</div>
  ${body}
  <div class="ad-slot">Advertisement</div>
</main>
<footer class="site-foot"><div class="wrap">
  <a href="${BASE}/">Home</a><a href="${BASE}/party-food-calculator/">Full Menu Planner</a><a href="${BASE}/#items">All Items</a>
  <span>· ${SITE} — free food &amp; drink quantity planning for parties. Standard catering portions; adjust for your crowd. Part of <a href="https://elevatedprogress.com/">Elevated Progress</a>.</span>
</div></footer>
${useTool ? `<script src="${BASE}/party-math.js" defer></script>\n<script src="${BASE}/tool.js" defer></script>` : ""}
</body>
</html>`;
}
function answerHero(big, unit, sub) {
  return `<div class="answer">
  <div class="big-num">${big}<span class="unit">${unit}</span></div>
  <div class="sub">${sub}</div>
</div>`;
}
function grid(links) {
  return `<div class="grid">` + links.map(l =>
    `<a href="${BASE}${l.href}">${l.emoji ? `<span class="chip-emoji">${l.emoji}</span>` : ""}${l.label}</a>`).join("") + `</div>`;
}
function table(head, rows) {
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
<tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("\n")}</tbody></table></div>`;
}
const ADJUST = `<p>Adjusting for your crowd: kids eat about two-thirds of adult portions; knock 25% off any single item when several mains share the table; add 25% for teenagers and big appetites. When in doubt, round up on the cheap items (buns, chips, ice) and stay exact on the expensive ones.</p>`;

// ---- write helpers ------------------------------------------------------
const urls = [];
function writePage(urlPath, html) {
  const dir = path.join(OUT, urlPath.replace(/^\/+|\/+$/g, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  urls.push(urlPath);
}

// ---- build --------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
for (const entry of fs.readdirSync(OUT)) {
  if (entry === ".git" || entry === "CNAME") continue;
  fs.rmSync(path.join(OUT, entry), { recursive: true, force: true });
}
for (const f of fs.readdirSync(ASSETS)) fs.copyFileSync(path.join(ASSETS, f), path.join(OUT, f));

const itemGrid = ITEMS.map(it => ({ href: calcHref(it), emoji: it.emoji, label: it.name }));

for (const it of ITEMS) {
  const countLinks = COUNTS.map(n => ({ href: `/${it.slug}-for-${n}-people/`, label: `${n} people` }));

  // canonical interactive page
  {
    const urlPath = calcHref(it);
    const h1 = `${it.q} for a Party?`;
    const title = `${h1} Per-Person Calculator`;
    const v25 = PartyMath.compute(it.slug, 25);
    const desc = `${it.q.toLowerCase().replace(/^how /, "How ")} do you need? Enter your guest count for exact quantities — e.g. 25 guests need ${v25.big} ${v25.unit}. ${v25.sub}.`;
    const body = `<div class="tool" data-party="item" data-slug="${it.slug}">
    <div class="row"><div><label for="g">Number of guests</label><input type="number" id="g" data-guests value="25" min="1"></div></div>
    <div class="tool-out" data-out></div>
    <div data-rows></div>
  </div>
  <div class="prose"><p>${it.blurb}</p><p>${it.tip}</p>${ADJUST}</div>
  <h2>Quick answers</h2>
  ${grid(countLinks)}
  <h2>Plan the rest of the menu</h2>
  ${grid([{ href: "/party-food-calculator/", emoji: "📋", label: "Full Menu Planner" }].concat(itemGrid.filter(l => l.href !== urlPath)))}`;
    writePage(urlPath, layout({ title, desc, urlPath, h1, hero: "", body, useTool: true }));
  }

  // preset guest-count pages
  for (const n of COUNTS) {
    const urlPath = `/${it.slug}-for-${n}-people/`;
    const v = PartyMath.compute(it.slug, n);
    const h1 = `${it.q} for ${n} People?`;
    const title = `${h1} (Exact Party Amounts)`;
    const desc = `For ${n} guests plan ${v.big} ${v.unit} — ${v.sub}. Full breakdown with package counts and crowd adjustments.`;
    const body = `
  ${table(["What", "Amount"], v.rows)}
  <div class="prose"><p>${it.blurb}</p><p>${it.tip}</p>${ADJUST}</div>
  <h2>Different headcount?</h2>
  ${grid(countLinks.filter(l => l.href !== urlPath))}
  ${grid([{ href: calcHref(it), emoji: "🧮", label: `Exact ${it.name} Calculator` }])}
  <h2>${it.name} sorted — what else?</h2>
  ${grid([{ href: "/party-food-calculator/", emoji: "📋", label: "Full Menu Planner" }].concat(
      ITEMS.filter(o => o.slug !== it.slug).map(o => ({ href: `/${o.slug}-for-${n}-people/`, emoji: o.emoji, label: `${o.name} for ${n}` }))))}`;
    writePage(urlPath, layout({ title, desc, urlPath, h1, hero: answerHero(v.big, v.unit, v.sub), body }));
  }
}

// -- full menu planner --
{
  const urlPath = `/party-food-calculator/`;
  const title = `Party Food Calculator — How Much Food & Drink for Your Party`;
  const desc = `Enter your guest count and get quantities for the whole party at once: pizza, burgers, bbq, sides, dessert, ice, soda, beer, wine, and coffee.`;
  const names = {};
  for (const it of ITEMS) names[it.slug] = { name: it.name, emoji: it.emoji, href: calcHref(it) };
  const body = `<div class="tool" data-party="menu" data-config='${JSON.stringify(names)}'>
    <div class="row"><div><label for="g">Number of guests</label><input type="number" id="g" data-guests value="25" min="1"></div></div>
    <div data-rows></div>
  </div>
  <div class="prose"><p>Quantities use standard catering portions and assume each food item shares the table with a couple of others — if one dish is the whole show (only pizza, only bbq), bump that line up by about 25%.</p>${ADJUST}</div>
  <h2 id="items">Item-by-item calculators</h2>
  ${grid(itemGrid)}`;
  writePage(urlPath, layout({ title, desc, urlPath, h1: "Party Food Calculator", hero: "", body, useTool: true }));
}

// -- homepage --
{
  const title = `${SITE} — How Much Food & Drink for a Party?`;
  const desc = `Free party planning calculators: how many pizzas, burgers, wings, or drinks for 10 to 300 guests — with package counts, catering portions, and crowd adjustments.`;
  const body = `<p class="lead">How much food do you actually need? Standard catering portions for every party staple, sized to your guest list — with package counts so the shopping list writes itself.</p>
  ${grid([{ href: "/party-food-calculator/", emoji: "📋", label: "Full Menu Planner" }])}
  <h2 id="items">Plan by item</h2>
  ${grid(itemGrid)}
  <h2>Popular answers</h2>
  ${grid([
    { href: "/pizza-for-20-people/", label: "Pizzas for 20 people" },
    { href: "/pizza-for-30-people/", label: "Pizzas for 30 people" },
    { href: "/burgers-for-25-people/", label: "Burgers for 25 people" },
    { href: "/wings-for-50-people/", label: "Wings for 50 people" },
    { href: "/pulled-pork-for-40-people/", label: "Pulled pork for 40" },
    { href: "/ice-for-50-people/", label: "Ice for 50 people" },
    { href: "/beer-for-30-people/", label: "Beer for 30 people" },
    { href: "/coffee-for-100-people/", label: "Coffee for 100 people" },
  ])}`;
  writePage(`/`, layout({ title, desc, urlPath: `/`, h1: `Party Food &amp; Drink Calculator`, hero: "", body }));
}

// -- sitemap + robots + meta files --
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${DOMAIN}${BASE}${u}</loc></url>`).join("\n")}
</urlset>`;
fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}${BASE}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.writeFileSync(path.join(OUT, "CNAME"), "party.elevatedprogress.com\n");
fs.writeFileSync(path.join(OUT, "ads.txt"), "google.com, pub-5580575158570188, DIRECT, f08c47fec0942fa0\n");

console.log(`Generated ${urls.length} pages into ./public`);
