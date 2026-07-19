// Shared quantity math for the party calculator. Loaded by the browser (window.PartyMath)
// AND required by generate.js at build time, so static pages and live tools always agree.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.PartyMath = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const ceil = Math.ceil;
  const r1 = n => Math.round(n * 10) / 10;
  const fmt = n => n.toLocaleString("en-US");

  // Each entry returns { big, unit, sub, rows: [[label, value], ...] } for n guests.
  const ITEMS = {
    pizza(n) {
      const slices = n * 3, pies = ceil(slices / 8);
      return {
        big: pies, unit: "large pizzas", sub: "3 slices per person, 8 slices per large pizza",
        rows: [
          ["Slices needed", fmt(slices)],
          ["Large pizzas (8 slices)", fmt(pies)],
          ["Medium pizzas (6 slices)", fmt(ceil(slices / 6))],
          ["If mostly kids (2 slices each)", fmt(ceil(n * 2 / 8)) + " larges"],
        ],
      };
    },
    burgers(n) {
      const patties = ceil(n * 1.5);
      return {
        big: patties, unit: "burgers", sub: "1.5 quarter-pound burgers per person",
        rows: [
          ["Ground beef (¼ lb patties)", r1(patties * 0.25) + " lbs"],
          ["Bun packages (8-count)", fmt(ceil(patties / 8))],
          ["Cheese slices (¾ of burgers)", fmt(ceil(patties * 0.75))],
        ],
      };
    },
    "hot-dogs"(n) {
      const dogs = ceil(n * 1.5);
      return {
        big: dogs, unit: "hot dogs", sub: "1.5 hot dogs per person",
        rows: [
          ["Hot dog packages (10-count)", fmt(ceil(dogs / 10))],
          ["Bun packages (8-count)", fmt(ceil(dogs / 8))],
        ],
      };
    },
    wings(n) {
      const app = n * 6, main = n * 10;
      return {
        big: fmt(app), unit: "wings (as an appetizer)", sub: "6 per person alongside other food — 10 per person if wings are the main",
        rows: [
          ["As an appetizer (6 each)", fmt(app) + " wings ≈ " + fmt(ceil(app / 9)) + " lbs"],
          ["As the main dish (10 each)", fmt(main) + " wings ≈ " + fmt(ceil(main / 9)) + " lbs"],
          ["Dipping sauce (16 oz bottles)", fmt(ceil(n * 2 / 16))],
        ],
      };
    },
    "pulled-pork"(n) {
      const cooked = r1(n / 3), raw = r1(n / 3 * 2);
      return {
        big: cooked, unit: "lbs of cooked pulled pork", sub: "⅓ lb cooked per person — pork loses about half its weight cooking",
        rows: [
          ["Raw pork shoulder/butt to buy", raw + " lbs"],
          ["Sandwich buns (8-count packs)", fmt(ceil(n * 1.25 / 8))],
          ["BBQ sauce", fmt(ceil(n / 12)) + " × 18 oz bottles"],
        ],
      };
    },
    brisket(n) {
      const cooked = r1(n * 0.5), raw = r1(n);
      return {
        big: cooked, unit: "lbs of cooked brisket", sub: "½ lb cooked per person — brisket loses about half its weight trimming and cooking",
        rows: [
          ["Raw packer brisket to buy", raw + " lbs"],
          ["Typical whole packers (12–14 lb)", fmt(ceil(raw / 13))],
        ],
      };
    },
    tacos(n) {
      const tacos = ceil(n * 2.5);
      return {
        big: tacos, unit: "tacos", sub: "2–3 tacos per person",
        rows: [
          ["Raw ground beef (≈8 tacos/lb)", fmt(ceil(tacos / 8)) + " lbs"],
          ["Taco shells (12-count boxes)", fmt(ceil(tacos / 12))],
          ["Shredded cheese", r1(n * 1 / 16) + " lbs"],
        ],
      };
    },
    sandwiches(n) {
      return {
        big: ceil(n * 1.5), unit: "sandwiches", sub: "1.5 sandwiches per person for a lunch spread",
        rows: [
          ["6-foot party subs instead", fmt(ceil(n / 20)) + " (each feeds 20–25)"],
          ["Deli meat (3 oz per sandwich)", r1(ceil(n * 1.5) * 3 / 16) + " lbs"],
          ["Sliced cheese (1 slice each)", fmt(ceil(n * 1.5)) + " slices"],
        ],
      };
    },
    "fried-chicken"(n) {
      const pieces = n * 3;
      return {
        big: fmt(pieces), unit: "pieces of fried chicken", sub: "3 pieces per person (2 for lighter appetites)",
        rows: [
          ["8-piece buckets/boxes", fmt(ceil(pieces / 8))],
          ["If mixed with other mains (2 each)", fmt(n * 2) + " pieces"],
        ],
      };
    },
    pasta(n) {
      const lbs = r1(n * 4 / 16);
      return {
        big: lbs, unit: "lbs of dry pasta", sub: "4 oz dry per person as a main course (2 oz as a side)",
        rows: [
          ["1 lb boxes", fmt(ceil(n * 4 / 16))],
          ["Pasta sauce (24 oz jars serve ~5)", fmt(ceil(n / 5)) + " jars"],
          ["As a side dish (2 oz each)", r1(n * 2 / 16) + " lbs"],
        ],
      };
    },
    salad(n) {
      return {
        big: r1(n * 2.5 / 16), unit: "lbs of salad greens", sub: "about 2.5 oz of greens per person as a side salad",
        rows: [
          ["5 oz clamshells/bags", fmt(ceil(n * 2.5 / 5))],
          ["Dressing (16 oz bottles)", fmt(ceil(n * 2 / 16))],
        ],
      };
    },
    appetizers(n) {
      return {
        big: fmt(n * 6), unit: "appetizer pieces (before a meal)", sub: "6 pieces per person before dinner — 12+ if appetizers are the meal",
        rows: [
          ["Appetizers-only party (12 each)", fmt(n * 12) + " pieces"],
          ["Different appetizer types to offer", n <= 15 ? "3" : n <= 50 ? "4–5" : "6–8"],
        ],
      };
    },
    cake(n) {
      const sheet = n <= 24 ? "quarter sheet (serves ~24)" : n <= 48 ? "half sheet (serves ~48)" : n <= 96 ? "full sheet (serves ~96)" : fmt(ceil(n / 96)) + " full sheets";
      return {
        big: fmt(n), unit: "party-size cake slices", sub: "one 2×2 in party slice per person",
        rows: [
          ["Sheet cake size to order", sheet],
          ["9-inch round cakes (serve ~12)", fmt(ceil(n / 12))],
        ],
      };
    },
    cupcakes(n) {
      return {
        big: ceil(n * 1.5), unit: "cupcakes", sub: "1.5 cupcakes per person",
        rows: [
          ["Standard batches (24)", fmt(ceil(n * 1.5 / 24))],
          ["Exactly one each (minimum)", fmt(n)],
        ],
      };
    },
    ice(n) {
      return {
        big: fmt(n), unit: "lbs of ice", sub: "1 lb per person — double it outdoors in warm weather or when chilling drinks in coolers",
        rows: [
          ["10 lb bags", fmt(ceil(n / 10))],
          ["Hot day / drinks on ice (2 lb each)", fmt(n * 2) + " lbs = " + fmt(ceil(n * 2 / 10)) + " bags"],
        ],
      };
    },
    soda(n) {
      const cans = n * 2;
      return {
        big: fmt(cans), unit: "cans of soda", sub: "2 cans per person over a 2–3 hour party",
        rows: [
          ["12-packs", fmt(ceil(cans / 12))],
          ["2-liter bottles instead (≈6 servings)", fmt(ceil(cans / 6))],
          ["Cups (if using 2-liters)", fmt(ceil(n * 1.2))],
        ],
      };
    },
    beer(n) {
      const bottles = n * 4;
      return {
        big: fmt(bottles), unit: "beers (if all guests drink beer)", sub: "2 drinks the first hour, 1 each hour after — a 3-hour party ≈ 4 per drinker",
        rows: [
          ["24-packs / cases", fmt(ceil(bottles / 24))],
          ["Mixed crowd (half drink beer)", fmt(n * 2) + " beers = " + fmt(ceil(n * 2 / 24)) + " cases"],
        ],
      };
    },
    wine(n) {
      const bottles = ceil(n / 2);
      return {
        big: bottles, unit: "bottles of wine (if all guests drink wine)", sub: "a 750 ml bottle pours 5 glasses; plan ~2.5 glasses per drinker",
        rows: [
          ["Cases (12 bottles), rounded up", fmt(ceil(bottles / 12))],
          ["Mixed crowd (half drink wine)", fmt(ceil(n / 4)) + " bottles"],
          ["Typical red/white split", "60% red / 40% white"],
        ],
      };
    },
    coffee(n) {
      const cups = ceil(n * 1.5);
      return {
        big: cups, unit: "cups of coffee", sub: "1.5 8-oz cups per person for a morning or dessert crowd",
        rows: [
          ["Gallons to brew (16 cups each)", r1(cups / 16)],
          ["Ground coffee (≈45 cups/lb)", r1(cups / 45) + " lbs"],
          ["Half & half (1 pint per ~30 cups)", fmt(ceil(cups / 30)) + " pints"],
        ],
      };
    },
    water(n) {
      const bottles = ceil(n * 1.5);
      return {
        big: bottles, unit: "bottles of water", sub: "1.5 bottles per person — more outdoors in summer",
        rows: [
          ["24-packs", fmt(ceil(bottles / 24))],
          ["Hot outdoor event (3 each)", fmt(n * 3) + " bottles = " + fmt(ceil(n * 3 / 24)) + " packs"],
        ],
      };
    },
    "chips-and-dip"(n) {
      return {
        big: ceil(n * 2 / 15), unit: "party-size bags of chips", sub: "2 oz of chips per person; a 15 oz party bag serves 7–8",
        rows: [
          ["Chips total", fmt(n * 2) + " oz"],
          ["Dip (3 tbsp ≈ 1.5 oz each)", fmt(ceil(n * 1.5 / 16)) + " × 16 oz containers"],
          ["Salsa (16 oz jars)", fmt(ceil(n * 1.5 / 16))],
        ],
      };
    },
  };

  return { compute: (slug, n) => (ITEMS[slug] ? ITEMS[slug](Math.max(1, Math.round(n))) : null), slugs: Object.keys(ITEMS) };
});
