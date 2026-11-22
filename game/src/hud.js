// hud.js — the top HUD (loot, alarm meter, timer, level name) and every menu screen:
// title, level select, level complete, busted and paused overlays.
import { LEVELS } from './levels.js';

export function drawHUD(ctx, G, W) {
  ctx.fillStyle = '#11142a';
  ctx.fillRect(0, 0, W, 76);
  ctx.strokeStyle = '#39406b';
  ctx.beginPath();
  ctx.moveTo(0, 76);
  ctx.lineTo(W, 76);
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5d7a1';
  ctx.font = 'bold 20px system-ui';
  ctx.fillText(G.parsed.def.name, 18, 32);
  ctx.fillStyle = '#39e07a';
  ctx.font = 'bold 24px system-ui';
  ctx.fillText('$' + G.lootCollected.toLocaleString('en-US'), 18, 62);
  ctx.fillStyle = '#8a93ad';
  ctx.font = '14px system-ui';
  ctx.fillText('of $' + G.parsed.totalLoot.toLocaleString('en-US') + ' in the bank', 130, 62);
  // Timer.
  const t = Math.max(0, Math.floor(G.time));
  ctx.fillStyle = '#dfe6f5';
  ctx.font = 'bold 22px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'), W / 2, 34);
  ctx.fillStyle = '#8a93ad';
  ctx.font = '13px system-ui';
  ctx.fillText(G.vaultCracked ? 'VAULT CRACKED — GET TO THE VAN!' : G.nearVault ? 'Hold E to crack the vault' : 'Crack the vault, then escape', W / 2, 58);
  // Alarm meter.
  const ax = W - 318, aw = 300;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8a93ad';
  ctx.font = 'bold 13px system-ui';
  ctx.fillText(G.alarmFull ? 'ALARM! THEY ARE CHASING YOU' : 'ALARM', ax, 24);
  ctx.fillStyle = '#232842';
  ctx.fillRect(ax, 32, aw, 18);
  const frac = G.alarm / 100;
  ctx.fillStyle = G.alarmFull ? '#ff3b4e' : frac > 0.6 ? '#ff7a3c' : frac > 0.3 ? '#ffc93c' : '#39e07a';
  ctx.fillRect(ax, 32, aw * frac, 18);
  ctx.strokeStyle = '#39406b';
  ctx.strokeRect(ax, 32, aw, 18);
  ctx.fillStyle = '#8a93ad';
  ctx.font = '12px system-ui';
  ctx.fillText(G.spotted ? 'Spotted — stealth bonus lost' : 'Unseen — stealth bonus $1,500', ax, 66);
}

function panel(ctx, W, H) {
  ctx.fillStyle = 'rgba(5,7,16,0.82)';
  ctx.fillRect(0, 0, W, H);
}

function stars(ctx, n, cx, cy, size) {
  ctx.font = `${size}px system-ui`;
  ctx.textAlign = 'center';
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < n ? '#f2c230' : '#39406b';
    ctx.fillText('★', cx + (i - 1) * (size + 14), cy);
  }
}

export function drawTitle(ctx, G, W, H) {
  panel(ctx, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2c230';
  ctx.font = 'bold 64px system-ui';
  ctx.fillText('MIDNIGHT VAULT', W / 2, H / 2 - 130);
  ctx.fillStyle = '#dfe6f5';
  ctx.font = '20px system-ui';
  ctx.fillText('Sneak past the guards. Crack the vault. Vanish into the night.', W / 2, H / 2 - 92);
  ctx.fillStyle = '#8a93ad';
  ctx.font = '16px system-ui';
  ctx.fillText('WASD / arrows — move      SHIFT — sneak      E (hold) — crack vault', W / 2, H / 2 - 40);
  ctx.fillText('P — pause      R — restart      Watch the cones. Mind the lasers.', W / 2, H / 2 - 14);
  ctx.fillStyle = '#39e07a';
  ctx.font = 'bold 24px system-ui';
  ctx.fillText('Click or press ENTER to choose your heist', W / 2, H / 2 + 40);
}

export function drawSelect(ctx, G, W, H) {
  panel(ctx, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5d7a1';
  ctx.font = 'bold 36px system-ui';
  ctx.fillText('CHOOSE YOUR HEIST', W / 2, 120);
  LEVELS.forEach((lv, i) => {
    const y = 190 + i * 92;
    ctx.fillStyle = i === G.selectIndex ? '#232b4d' : '#141834';
    ctx.fillRect(W / 2 - 330, y - 40, 660, 68);
    ctx.strokeStyle = i === G.selectIndex ? '#f2c230' : '#39406b';
    ctx.strokeRect(W / 2 - 330, y - 40, 660, 68);
    ctx.fillStyle = '#dfe6f5';
    ctx.font = 'bold 21px system-ui';
    ctx.fillText(lv.name, W / 2, y - 8);
    ctx.fillStyle = '#8a93ad';
    ctx.font = '15px system-ui';
    const best = G.best[i] ? 'Best: $' + G.best[i].toLocaleString('en-US') : 'Not attempted';
    ctx.fillText(best + '   ·   click or use ↑ ↓ and ENTER', W / 2, y + 18);
  });
}

export function drawComplete(ctx, G, W, H) {
  panel(ctx, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#39e07a';
  ctx.font = 'bold 44px system-ui';
  ctx.fillText('CLEAN GETAWAY!', W / 2, 150);
  stars(ctx, G.stars, W / 2, 215, 44);
  ctx.font = '22px system-ui';
  ctx.fillStyle = '#dfe6f5';
  const b = G.breakdown;
  ctx.fillText('Loot hauled:        $' + b.loot.toLocaleString('en-US'), W / 2, 300);
  ctx.fillText('Time bonus:         $' + b.timeBonus.toLocaleString('en-US'), W / 2, 340);
  ctx.fillText('Stealth bonus:      $' + b.stealthBonus.toLocaleString('en-US'), W / 2, 380);
  ctx.fillStyle = '#f2c230';
  ctx.font = 'bold 30px system-ui';
  ctx.fillText('TOTAL: $' + b.total.toLocaleString('en-US'), W / 2, 440);
  ctx.fillStyle = '#8a93ad';
  ctx.font = '17px system-ui';
  ctx.fillText('ENTER — next heist      R — replay      ESC — level select', W / 2, 510);
}

export function drawBusted(ctx, G, W, H) {
  panel(ctx, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff3b4e';
  ctx.font = 'bold 52px system-ui';
  ctx.fillText('BUSTED!', W / 2, H / 2 - 60);
  ctx.fillStyle = '#dfe6f5';
  ctx.font = '20px system-ui';
  ctx.fillText('The guards got you with $' + G.lootCollected.toLocaleString('en-US') + ' in the bag.', W / 2, H / 2 - 10);
  ctx.fillStyle = '#39e07a';
  ctx.font = 'bold 22px system-ui';
  ctx.fillText('Press R or click to try again', W / 2, H / 2 + 50);
}

export function drawPaused(ctx, G, W, H) {
  panel(ctx, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dfe6f5';
  ctx.font = 'bold 40px system-ui';
  ctx.fillText('PAUSED', W / 2, H / 2);
  ctx.font = '17px system-ui';
  ctx.fillStyle = '#8a93ad';
  ctx.fillText('Press P to keep going', W / 2, H / 2 + 40);
}
