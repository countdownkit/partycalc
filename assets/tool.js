// Interactive party tools. Depends on party-math.js (window.PartyMath).
(function () {
  function rowsTable(head, rows) {
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      head.map(h => "<th>" + h + "</th>").join("") + "</tr></thead><tbody>" +
      rows.map(r => "<tr>" + r.map(c => "<td>" + c + "</td>").join("") + "</tr>").join("") +
      "</tbody></table></div>";
  }

  document.querySelectorAll(".tool[data-party]").forEach(tool => {
    const kind = tool.dataset.party;
    const input = tool.querySelector("[data-guests]");
    const out = tool.querySelector("[data-out]");
    const rowsEl = tool.querySelector("[data-rows]");

    function run() {
      const g = Math.max(1, Math.round(+input.value || 0));
      if (kind === "item") {
        const v = PartyMath.compute(tool.dataset.slug, g);
        if (!v) return;
        out.innerHTML = v.big + " " + v.unit + "<small>" + v.sub + "</small>";
        rowsEl.innerHTML = rowsTable(["What", "Amount"], v.rows);
      } else {
        const cfg = JSON.parse(tool.dataset.config);
        const rows = Object.keys(cfg).map(slug => {
          const v = PartyMath.compute(slug, g);
          return ['<a href="' + cfg[slug].href + '">' + cfg[slug].emoji + " " + cfg[slug].name + "</a>", v.big + " " + v.unit];
        });
        rowsEl.innerHTML = rowsTable(["Item", "For " + g + " guests"], rows);
      }
    }
    input.addEventListener("input", run);
    run();
  });
})();
