const { chromium } = require('playwright');
const out = '/home/user/claudionor-junior/criativos-dedetizacao';

const roach = (size, color='#2b1a10') => `
<svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <g stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none">
    <path d="M88 52 Q60 20 40 14"/><path d="M112 52 Q140 20 160 14"/>
    <path d="M72 90 L40 78 L22 92"/><path d="M128 90 L160 78 L178 92"/>
    <path d="M70 115 L36 118 L20 140"/><path d="M130 115 L164 118 L180 140"/>
    <path d="M74 140 L46 160 L40 186"/><path d="M126 140 L154 160 L160 186"/>
  </g>
  <ellipse cx="100" cy="62" rx="20" ry="14" fill="${color}"/>
  <ellipse cx="100" cy="122" rx="34" ry="56" fill="${color}"/>
  <path d="M100 70 L100 176" stroke="#5a3a22" stroke-width="3"/>
</svg>`;

const banned = (size) => `
<div style="position:relative;width:${size}px;height:${size}px">
  <div style="position:absolute;inset:${size*0.14}px">${roach(size*0.72)}</div>
  <svg style="position:absolute;inset:0" width="${size}" height="${size}" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="#E5383B" stroke-width="7"/>
    <line x1="19" y1="19" x2="81" y2="81" stroke="#E5383B" stroke-width="7"/>
  </svg>
</div>`;

const wpp = `<svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z"/></svg>`;

const cta = (bg, fg) => `<div style="display:inline-flex;align-items:center;gap:18px;background:${bg};color:${fg};font-weight:800;font-size:40px;padding:26px 44px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.25)">${wpp}<span>Orçamento grátis no WhatsApp</span></div>`;

const base = `*{margin:0;box-sizing:border-box}body{font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}`;

function c1(h, story) {
  return `<div style="width:1080px;height:${h}px;background:radial-gradient(circle at 70% 35%,#1d5c45,#0B2E22 70%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;padding:${story?300:90}px 80px ${story?400:90}px">
    <div style="font-size:30px;letter-spacing:6px;font-weight:700;color:#FFD43B">DEDETIZAÇÃO PROFISSIONAL</div>
    <div>
      <div style="font-family:'Inter Display',Inter;font-size:120px;font-weight:900;line-height:1">Viu uma barata?</div>
      <div style="font-size:60px;font-weight:700;color:#FFD43B;margin-top:28px;line-height:1.15">Provavelmente ela<br>não está sozinha.</div>
    </div>
    ${banned(story?460:400)}
    <div>
      <div style="font-size:36px;opacity:.9;margin-bottom:34px">Residências, empresas e condomínios</div>
      ${cta('#25D366','#fff')}
    </div>
  </div>`;
}

function c2(h, story) {
  const pests = ['Baratas','Ratos','Cupins','Formigas','Escorpiões','Pulgas e carrapatos'];
  const items = pests.map(p=>`<div style="display:flex;align-items:center;gap:20px;background:#fff;border-radius:22px;padding:28px 30px;font-size:42px;font-weight:700;color:#0B2E22;box-shadow:0 4px 14px rgba(0,0,0,.06)"><span style="flex:none;width:52px;height:52px;border-radius:50%;background:#1d8a5b;color:#fff;display:grid;place-items:center;font-size:34px">✓</span>${p}</div>`).join('');
  return `<div style="width:1080px;height:${h}px;background:#F4F1EA;display:flex;flex-direction:column;justify-content:space-between;padding:${story?300:90}px 80px ${story?400:90}px">
    <div>
      <div style="display:inline-block;background:#0B2E22;color:#FFD43B;font-weight:800;font-size:30px;letter-spacing:3px;padding:12px 24px;border-radius:12px">CONTROLE DE PRAGAS</div>
      <div style="font-family:'Inter Display',Inter;font-size:104px;font-weight:900;line-height:1.02;color:#0B2E22;margin-top:34px">Sua casa livre<br>de pragas.</div>
      <div style="font-size:40px;color:#3d4a44;margin-top:22px">Um só atendimento para:</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px">${items}</div>
    <div style="text-align:center">${cta('#25D366','#fff')}</div>
  </div>`;
}

function c3(h, story) {
  const pts = [['🛡️','Produtos registrados na ANVISA'],['👷','Técnicos treinados e uniformizados'],['🐶','Orientação para crianças e pets'],['📄','Certificado para empresas e condomínios']];
  const items = pts.map(([i,t])=>`<div style="display:flex;align-items:center;gap:28px;font-size:44px;font-weight:700;color:#0B2E22;padding:26px 0;border-bottom:3px solid rgba(11,46,34,.15)"><span style="font-size:58px">${i}</span>${t}</div>`).join('');
  return `<div style="width:1080px;height:${h}px;background:#FFD43B;display:flex;flex-direction:column;justify-content:space-between;padding:${story?300:90}px 80px ${story?400:90}px">
    <div>
      <div style="font-size:30px;letter-spacing:6px;font-weight:800;color:#0B2E22;opacity:.75">DEDETIZAÇÃO PROFISSIONAL</div>
      <div style="font-family:'Inter Display',Inter;font-size:112px;font-weight:900;line-height:1;color:#0B2E22;margin-top:26px">Dedetização<br>sem susto.</div>
      <div style="font-size:42px;color:#0B2E22;margin-top:24px;font-weight:500">Feita por quem entende, com segurança para sua família.</div>
    </div>
    <div>${items}</div>
    <div style="text-align:center">${cta('#0B2E22','#fff')}</div>
  </div>`;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 1 });
  const fmts = [['feed-4x5',1350,false],['stories-9x16',1920,true]];
  for (const [name, fn] of [['1-gancho-barata',c1],['2-lista-pragas',c2],['3-confianca',c3]])
    for (const [f,h,s] of fmts) {
      await p.setViewportSize({ width:1080, height:h });
      await p.setContent(`<html><head><meta charset="utf-8"><style>${base}</style></head><body>${fn(h,s)}</body></html>`);
      await p.waitForTimeout(200);
      await p.screenshot({ path:`${out}/${name}_${f}.png` });
    }
  await b.close();
})();
