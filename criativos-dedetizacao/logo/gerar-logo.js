const { chromium } = require('playwright');
const out = '/home/user/claudionor-junior/criativos-dedetizacao/logo';
const shield = (s) => `
<svg width="${s}" height="${s*1.15}" viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 6 L188 38 V110 C188 165 150 205 100 224 C50 205 12 165 12 110 V38 Z" fill="#111" />
  <path d="M100 22 L174 49 V110 C174 157 142 191 100 208 C58 191 26 157 26 110 V49 Z" fill="#FFC300"/>
  <g transform="translate(100 118) scale(.62) translate(-100 -110)">
    <g stroke="#111" stroke-width="9" stroke-linecap="round" fill="none">
      <path d="M88 52 Q66 26 48 20"/><path d="M112 52 Q134 26 152 20"/>
      <path d="M72 92 L42 80 L26 94"/><path d="M128 92 L158 80 L174 94"/>
      <path d="M70 118 L38 122 L24 144"/><path d="M130 118 L162 122 L176 144"/>
      <path d="M76 144 L50 164 L46 188"/><path d="M124 144 L150 164 L154 188"/>
    </g>
    <ellipse cx="100" cy="64" rx="22" ry="15" fill="#111"/>
    <ellipse cx="100" cy="124" rx="36" ry="56" fill="#111"/>
  </g>
  <line x1="52" y1="70" x2="148" y2="170" stroke="#D62828" stroke-width="16" stroke-linecap="round"/>
</svg>`;
const word = (fs) => `
  <div style="font-family:'Inter Display',Inter;font-weight:900;font-size:${fs}px;line-height:.9;color:#FFC300;letter-spacing:-.02em;text-shadow:${fs*.05}px ${fs*.05}px 0 #111">SENAR</div>
  <div style="display:inline-block;margin-top:${fs*.14}px;background:#111;color:#FFC300;font-family:Inter;font-weight:800;font-size:${fs*.27}px;letter-spacing:.18em;padding:${fs*.06}px ${fs*.16}px ${fs*.06}px ${fs*.18}px;border-radius:${fs*.06}px">DEDETIZAÇÕES</div>`;
const pages = {
  'senar-logo-horizontal.png': [1600, 700, `<div style="width:1600px;height:700px;background:#D62828;display:flex;align-items:center;justify-content:center;gap:70px">${shield(330)}<div>${word(250)}</div></div>`],
  'senar-logo-quadrada.png': [1080, 1080, `<div style="width:1080px;height:1080px;background:#D62828;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;text-align:center">${shield(400)}<div>${word(210)}</div></div>`],
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [f,[w,h,html]] of Object.entries(pages)) {
    await p.setViewportSize({width:w,height:h});
    await p.setContent(`<html><head><meta charset="utf-8"><style>*{margin:0}body{-webkit-font-smoothing:antialiased}</style></head><body>${html}</body></html>`);
    await p.waitForTimeout(200); await p.screenshot({path:`${out}/${f}`});
  }
  await b.close();
})();
