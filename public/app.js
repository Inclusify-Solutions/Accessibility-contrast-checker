import { normalizeHex, contrastRatio, wcagVerdicts } from './contrast.js';

const $ = (sel) => document.querySelector(sel);
const color1 = $('#color1');
const color2 = $('#color2');
const checkBtn = $('#checkBtn');
const largeText = $('#largeText');
const ratioEl = $('#ratio');
const aaEl = $('#aa');
const aaaEl = $('#aaa');
const statusMsg = $('#statusMsg');
const sw1 = $('#swatch1');
const sw2 = $('#swatch2');
const yearEl = $('#year');

yearEl.textContent = new Date().getFullYear();

// Live preview swatches
function updateSwatches() {
  const h1 = normalizeHex(color1.value);
  const h2 = normalizeHex(color2.value);
  if (h1 && h2) {
    sw1.style.color = h1;
    sw1.style.backgroundColor = h2;
    sw2.style.color = h2;
    sw2.style.backgroundColor = h1;
  }
}
[color1, color2].forEach(el => el.addEventListener('input', updateSwatches));
updateSwatches();

// Validate + compute
function runCheck() {
  const h1 = normalizeHex(color1.value);
  const h2 = normalizeHex(color2.value);

  if (!h1 || !h2) {
    ratioEl.textContent = '—';
    aaEl.textContent = '—';
    aaaEl.textContent = '—';
    statusMsg.textContent = 'Please enter valid HEX values like #1f2937 or #fff.';
    statusMsg.className = 'mt-3 text-sm text-red-700';
    return;
  }

  const ratio = contrastRatio(h1, h2);
  const rounded = Math.round(ratio * 100) / 100;
  ratioEl.textContent = `${rounded}:1`;

  const verdicts = wcagVerdicts(ratio, { largeText: largeText.checked });
  aaEl.textContent = verdicts.AA ? 'Pass' : 'Fail';
  aaaEl.textContent = verdicts.AAA ? 'Pass' : 'Fail';

  const aaClass = verdicts.AA ? 'text-green-700' : 'text-red-700';
  const aaaClass = verdicts.AAA ? 'text-green-700' : 'text-red-700';
  aaEl.className = aaClass;
  aaaEl.className = aaaClass;

  statusMsg.innerHTML = `Thresholds (AA/AAA): <strong>${verdicts.thresholds.AA}</strong> / <strong>${verdicts.thresholds.AAA}</strong>`;
  statusMsg.className = 'mt-3 text-sm text-slate-600';

  updateSwatches();
}

checkBtn.addEventListener('click', runCheck);

// Stripe Checkout
let publishableKey = null;
async function fetchConfig() {
  const res = await fetch('/config');
  const data = await res.json();
  publishableKey = data.publishableKey;
}

async function startCheckout() {
  try {
    const res = await fetch('/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const { url, id, error } = await res.json();
    if (error) throw new Error(error.message);
    if (url) {
      window.location = url;
      return;
    }
    // As a fallback if URL is not provided:
    const stripe = Stripe(publishableKey);
    stripe.redirectToCheckout({ sessionId: id });
  } catch (e) {
    alert('Checkout failed: ' + e.message);
  }
}

const up1 = document.getElementById('upgradeBtn');
const up2 = document.getElementById('upgradeBtn2');
[up1, up2].forEach(btn => btn && btn.addEventListener('click', startCheckout));

fetchConfig();
