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
        // Whole-menu planner: selected food chips + serving mode.
        const cfg = JSON.parse(tool.dataset.config);
        const slugs = Array.prototype.map.call(tool.querySelectorAll(".chip.on"), b => b.dataset.slug);
        const modeEl = tool.querySelector("[name=mode]:checked");
        const balanced = !modeEl || modeEl.value === "balanced";
        if (!slugs.length) {
          rowsEl.innerHTML = '<p class="empty-note">Tap the foods and drinks you’re serving to build the list.</p>';
          return;
        }
        const rows = PartyMath.plan(slugs, g, balanced).map(p => {
          const c = cfg[p.slug];
          const note = p.factor < 1
            ? '<small class="share-note">portion sized for ~' + p.effN + " of " + g + " guests — it shares the menu</small>"
            : "";
          return ['<a href="' + c.href + '">' + c.emoji + " " + c.name + "</a>", p.v.big + " " + p.v.unit + note];
        });
        rowsEl.innerHTML = rowsTable(["Item", "For " + g + " guests"], rows);
      }
    }

    tool.querySelectorAll(".chip").forEach(b =>
      b.addEventListener("click", () => { b.classList.toggle("on"); run(); }));
    tool.querySelectorAll("[name=mode]").forEach(r => r.addEventListener("change", run));
    input.addEventListener("input", run);
    run();
  });
})();
