// Talo · designspråk "precis liggare med en tyst assistent"
// Ändrar inga data. Läser den renderade appen och lägger till klasser och omslag för stil.
// Körs om automatiskt när app.js ritar om (MutationObserver).

const ROOT_SEL = '#app';
const AMOUNT = /([−-]\s?)?(\d{1,3}(?:[   ]\d{3})*)(,\d{2})(\s?kr)?/g;
const META = /\b(20\d\d-\d\d-\d\d|(?:INV|BILL|DEMO|SE-DEMO|VER|EXP|QUO|CON)-[A-Z0-9-]+)\b/g;
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'SVG', 'BUTTON', 'LABEL']);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapText(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p || SKIP.has(p.tagName) || p.closest('.t-amt,.t-meta,.t-counting,svg,[contenteditable],.sidebar,.app-top')) return NodeFilter.FILTER_REJECT;
      AMOUNT.lastIndex = 0; META.lastIndex = 0;
      return (AMOUNT.test(n.nodeValue) || META.test(n.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    AMOUNT.lastIndex = 0; META.lastIndex = 0;
    const html = n.nodeValue
      .replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
      .replace(AMOUNT, (m, neg, int, dec, kr) => {
        if (!kr && !/kr/.test(n.nodeValue)) return m; // bara belopp i kronor
        return `<span class="t-amt${neg ? ' t-neg' : ''}"><span class="t-int">${neg ? '−' : ''}${int}</span><span class="t-dec">${dec}${kr || ''}</span></span>`;
      })
      .replace(META, '<span class="t-meta">$1</span>');
    if (html === n.nodeValue) continue;
    const span = document.createElement('span');
    span.innerHTML = html;
    n.replaceWith(...span.childNodes);
  }
}

function statusLights(root) {
  for (const pill of root.querySelectorAll('.pill:not([data-light])')) {
    const t = pill.textContent.toLowerCase();
    let v = 'neutral';
    if (/betald|bokförd|klar|godkänd|ansluten(?!.*ej)|avstämd/.test(t) && !/ej /.test(t)) v = 'ok';
    if (/öppen|väntar|behöver|granska|saknas|förfall/.test(t)) v = 'wait';
    if (/ej ansluten|fel|avvisad/.test(t)) v = 'off';
    if (/talo|förslag/.test(t)) v = 'talo';
    pill.dataset.light = v;
  }
}

function fingerprints(root) {
  const cand = root.querySelectorAll('.bank-row, tbody tr, .dashboard-task-group a, .assistant-bank-row');
  for (const el of cand) {
    if (el.dataset.by) continue;
    if (/kontoförslag|förslag|automatiskt|talo/i.test(el.textContent)) el.dataset.by = 'talo';
    else el.dataset.by = 'human';
  }
}

// Talo-boten i hjälppanelen: tänker en stund (siffror i pannan), sedan lyssnar den.
function makeBot(size = 40) {
  const bot = document.createElement('span');
  bot.className = 'talobot';
  bot.dataset.mode = 'idle';
  bot.style.setProperty('--s', size + 'px');
  bot.setAttribute('role', 'img');
  bot.setAttribute('aria-label', 'Talo');
  bot.innerHTML = '<span class="digits"><b>0</b><b>0</b><b>0</b><b>0</b></span><i class="l"></i><i class="r"></i>';
  return bot;
}

function placeBots(root) {
  const h = root.querySelector('.dashboard-support h2');
  if (h && !h.querySelector('.talobot')) {
    const bot = makeBot(40);
    h.prepend(bot);
  }
}

let busy = false;
function apply() {
  const root = document.querySelector(ROOT_SEL);
  if (!root || busy) return;
  busy = true;
  try { wrapText(root); statusLights(root); fingerprints(root); placeBots(root); }
  finally { busy = false; }
}

const obs = new MutationObserver(records => {
  if (busy) return;
  const relevant = records.some(r => !(r.target.closest && r.target.closest('.talobot,.t-counting')));
  if (relevant) requestAnimationFrame(apply);
});
function start() {
  const root = document.querySelector(ROOT_SEL);
  if (!root) return requestAnimationFrame(start);
  apply();
  obs.observe(root, { childList: true, subtree: true });
}
start();
