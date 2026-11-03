// v1.1.0 - respects XD edit-context rules so edits are not silently reverted.
const sg = require("scenegraph");
const { Group, Artboard } = sg;

// XD only allows editing children reached through plain Groups (no mask) or Artboards.
function isPassThrough(node) {
  if (node instanceof Artboard) return true;
  if (node instanceof Group && !node.mask) return true;
  return false;
}

function typeLabel(node) {
  if (node instanceof Group && node.mask) return "Masked group";
  if (sg.SymbolInstance && node instanceof sg.SymbolInstance) return "Component";
  if (sg.RepeatGrid && node instanceof sg.RepeatGrid) return "Repeat grid";
  if (sg.BooleanGroup && node instanceof sg.BooleanGroup) return "Boolean group";
  if (sg.ScrollableGroup && node instanceof sg.ScrollableGroup) return "Scroll group";
  return node.constructor ? node.constructor.name : "Container";
}

function pathOf(node, stopAt) {
  const parts = [];
  let n = node;
  while (n && n !== stopAt && n !== sg.root) { parts.unshift(n.name || "(unnamed)"); n = n.parent; }
  return parts.join(" > ");
}

function countDescendants(node) {
  let c = 0;
  if (node.children) node.children.forEach(ch => { c += 1 + countDescendants(ch); });
  return c;
}

// Mark only nodes XD considers in scope; collect containers whose children are out of scope.
function markInScope(container, value, stats) {
  if (!container.children) return;
  container.children.forEach(child => {
    if (child.locked) { stats.locked++; }
    else if (child.markedForExport !== value) { child.markedForExport = value; stats.changed++; }
    else { stats.already++; }

    if (child.children && child.children.length) {
      if (isPassThrough(child)) {
        markInScope(child, value, stats);
      } else {
        stats.blocked.push({ node: child, type: typeLabel(child), inner: countDescendants(child) });
      }
    }
  });
}

function wholeDocCounts(node, acc) {
  if (node !== sg.root) { acc.total++; if (node.markedForExport) acc.marked++; }
  if (node.children) node.children.forEach(c => wholeDocCounts(c, acc));
  return acc;
}

function esc(s) { return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

async function show(title, bodyHtml) {
  const dialog = document.createElement("dialog");
  dialog.innerHTML = `
    <form method="dialog" style="width:520px">
      <h1>${esc(title)}</h1><hr>
      ${bodyHtml}
      <footer><button type="submit" uxp-variant="cta">OK</button></footer>
    </form>`;
  document.body.appendChild(dialog);
  try { await dialog.showModal(); } finally { dialog.remove(); }
}

function blockedHtml(blocked, ctx) {
  if (!blocked.length) return "<p><b>No blocked containers in this scope.</b></p>";
  const innerTotal = blocked.reduce((s, b) => s + b.inner, 0);
  const rows = blocked.slice(0, 25).map(b =>
    `<li>${esc(b.type)}: ${esc(pathOf(b.node, ctx))} (${b.inner} inside)</li>`).join("");
  const more = blocked.length > 25 ? `<p>...and ${blocked.length - 25} more.</p>` : "";
  return `
    <p><b>${blocked.length} containers</b> (${innerTotal} layers inside) can't be edited from here because XD blocks plugins from reaching into them:</p>
    <ul style="max-height:220px;overflow:auto">${rows}</ul>${more}
    <p>To finish one: double-click into it until a layer INSIDE it is selected, then run "Mark all layers for export" again.</p>`;
}

async function run(selection, value) {
  const ctx = selection.editContext || sg.root;
  const stats = { changed: 0, already: 0, locked: 0, blocked: [] };
  markInScope(ctx, value, stats);
  const doc = wholeDocCounts(sg.root, { total: 0, marked: 0 });
  const scopeName = ctx === sg.root ? "Whole document" : `Inside "${esc(ctx.name)}"`;
  await show(value ? "Marked for export" : "Unmarked", `
    <p>Scope: <b>${scopeName}</b></p>
    <p>${value ? "Newly marked" : "Unmarked"}: <b>${stats.changed}</b> &nbsp; Already: <b>${stats.already}</b> &nbsp; Locked (skipped): <b>${stats.locked}</b></p>
    <p>Document total: <b>${doc.marked} of ${doc.total}</b> layers marked.</p>
    ${value ? blockedHtml(stats.blocked, ctx) : ""}`);
}

async function markAll(selection) { await run(selection, true); }
async function unmarkAll(selection) { await run(selection, false); }

async function checkStatus() {
  const unmarked = [];
  (function walk(n) {
    if (n !== sg.root && !n.markedForExport) unmarked.push(n);
    if (n.children) n.children.forEach(walk);
  })(sg.root);
  const doc = wholeDocCounts(sg.root, { total: 0, marked: 0 });
  // Group unmarked layers by their nearest blocking container.
  const byParent = new Map();
  unmarked.forEach(n => {
    let p = n.parent;
    while (p && p !== sg.root && isPassThrough(p)) p = p.parent;
    const key = p && p !== sg.root ? p : null;
    byParent.set(key, (byParent.get(key) || 0) + 1);
  });
  const rows = [...byParent.entries()].slice(0, 30).map(([p, c]) =>
    `<li>${p ? esc(typeLabel(p) + ": " + pathOf(p)) : "Top level / plain groups"} - ${c} unmarked</li>`).join("");
  await show("Export status", `
    <p>Document: <b>${doc.marked} of ${doc.total}</b> layers marked.</p>
    ${unmarked.length ? `<p>Unmarked layers by container:</p><ul style="max-height:260px;overflow:auto">${rows}</ul>` : "<p><b>Everything is marked.</b></p>"}`);
}

module.exports = { commands: { markAll, unmarkAll, checkStatus } };
