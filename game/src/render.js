// render.js — draws the bank: floor grid, walls, loot, vault, van, lasers,
// cameras and guards with their vision cones, and the thief.
import { laserActive } from './guards.js';

export function computeView(G, W, H) {
  const ts = Math.floor(Math.min((W - 24) / G.parsed.cols, (H - 92) / G.parsed.rows));
  G.view = {
    ts,
    ox: Math.floor((W - ts * G.parsed.cols) / 2),
    oy: 84 + Math.floor((H - 92 - ts * G.parsed.rows) / 2),
  };
  return G.view;
}

function cone(ctx, v, x, y, angle, fov, range, color) {
  ctx.beginPath();
  ctx.moveTo(v.ox + x * v.ts, v.oy + y * v.ts);
  ctx.arc(v.ox + x * v.ts, v.oy + y * v.ts, range * v.ts, angle - fov / 2, angle + fov / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function drawWorld(ctx, G, W, H) {
  const v = computeView(G, W, H);
  const { parsed } = G;
  ctx.fillStyle = '#0b0e1a';
  ctx.fillRect(0, 0, W, H);
  // Floor tiles (chequered marble grid).
  for (let y = 0; y < parsed.rows; y++) {
    for (let x = 0; x < parsed.cols; x++) {
      if (parsed.walls[y][x]) continue;
      ctx.fillStyle = (x + y) % 2 ? '#1c2340' : '#232b4d';
      ctx.fillRect(v.ox + x * v.ts, v.oy + y * v.ts, v.ts, v.ts);
    }
  }
  // Getaway van at the entrance.
  const ex = parsed.exit;
  ctx.fillStyle = '#31456e';
  ctx.fillRect(v.ox + ex.tx * v.ts + 2, v.oy + ex.ty * v.ts + 4, v.ts - 4, v.ts - 8);
  ctx.fillStyle = '#9fd8ff';
  ctx.fillRect(v.ox + ex.tx * v.ts + v.ts - 12, v.oy + ex.ty * v.ts + 7, 7, v.ts - 14);
  ctx.fillStyle = '#0b0e1a';
  ctx.beginPath();
  ctx.arc(v.ox + ex.tx * v.ts + 9, v.oy + ex.ty * v.ts + v.ts - 6, 4, 0, 7);
  ctx.arc(v.ox + ex.tx * v.ts + v.ts - 9, v.oy + ex.ty * v.ts + v.ts - 6, 4, 0, 7);
  ctx.fill();
  if (G.vaultCracked) {
    ctx.fillStyle = '#39e07a';
    ctx.font = `bold ${Math.max(10, v.ts - 8)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('GO!', v.ox + (ex.tx + 0.5) * v.ts, v.oy + (ex.ty + 0.45) * v.ts);
  }
  // Loot.
  for (const item of parsed.loot) {
    if (item.taken) continue;
    const cx = v.ox + (item.tx + 0.5) * v.ts, cy = v.oy + (item.ty + 0.5) * v.ts;
    if (item.kind === 'c') {
      ctx.fillStyle = '#3f9e4d';
      ctx.fillRect(cx - v.ts * 0.26, cy - v.ts * 0.19, v.ts * 0.52, v.ts * 0.38);
      ctx.fillStyle = '#d8ffd8';
      ctx.font = `bold ${Math.round(v.ts * 0.42)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('$', cx, cy + v.ts * 0.15);
    } else if (item.kind === 'g') {
      ctx.fillStyle = '#f2c230';
      ctx.fillRect(cx - v.ts * 0.3, cy - v.ts * 0.11, v.ts * 0.6, v.ts * 0.22);
      ctx.fillStyle = '#ffe98a';
      ctx.fillRect(cx - v.ts * 0.3, cy - v.ts * 0.11, v.ts * 0.6, 3);
    } else {
      ctx.fillStyle = '#57d8ff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - v.ts * 0.3);
      ctx.lineTo(cx + v.ts * 0.24, cy);
      ctx.lineTo(cx, cy + v.ts * 0.3);
      ctx.lineTo(cx - v.ts * 0.24, cy);
      ctx.closePath();
      ctx.fill();
    }
  }
  // Vault door.
  const vt = parsed.vault;
  ctx.fillStyle = G.vaultCracked ? '#39e07a' : '#8a93ad';
  ctx.fillRect(v.ox + vt.tx * v.ts + 2, v.oy + vt.ty * v.ts + 2, v.ts - 4, v.ts - 4);
  ctx.strokeStyle = '#2a2f45';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(v.ox + (vt.tx + 0.5) * v.ts, v.oy + (vt.ty + 0.5) * v.ts, v.ts * 0.24, 0, 7);
  ctx.stroke();
  // Lasers.
  for (const l of G.lasers) {
    const x0 = v.ox + (Math.min(l.x1, l.x2) + 0.5) * v.ts, x1 = v.ox + (Math.max(l.x1, l.x2) + 0.5) * v.ts;
    const y0 = v.oy + (Math.min(l.y1, l.y2) + 0.5) * v.ts, y1 = v.oy + (Math.max(l.y1, l.y2) + 0.5) * v.ts;
    ctx.fillStyle = '#39406b';
    ctx.fillRect(x0 - 3, y0 - 3, 6, 6);
    ctx.fillRect(x1 - 3, y1 - 3, 6, 6);
    if (laserActive(l, G.time)) {
      ctx.strokeStyle = 'rgba(255,60,80,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }
  // Camera + guard vision cones (under the actors).
  for (const c of G.cameras) cone(ctx, v, c.x + 0.5, c.y + 0.5, c.angle, c.fov, c.range, 'rgba(255,170,40,0.20)');
  for (const g of G.guards) {
    cone(ctx, v, g.x, g.y, g.angle, g.fov, g.range, g.mode === 'chase' ? 'rgba(255,60,60,0.28)' : 'rgba(255,220,90,0.20)');
  }
  // Cameras.
  for (const c of G.cameras) {
    const cx = v.ox + (c.x + 0.5) * v.ts, cy = v.oy + (c.y + 0.5) * v.ts;
    ctx.fillStyle = '#dfe6f5';
    ctx.beginPath();
    ctx.arc(cx, cy, v.ts * 0.2, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#e33';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(c.angle) * v.ts * 0.1, cy + Math.sin(c.angle) * v.ts * 0.1, v.ts * 0.07, 0, 7);
    ctx.fill();
  }
  // Guards.
  for (const g of G.guards) {
    const cx = v.ox + g.x * v.ts, cy = v.oy + g.y * v.ts;
    ctx.fillStyle = g.mode === 'chase' ? '#c22e3e' : '#2e5fc2';
    ctx.beginPath();
    ctx.arc(cx, cy, v.ts * 0.32, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#f5d7a1';
    ctx.beginPath();
    ctx.arc(cx, cy - v.ts * 0.05, v.ts * 0.17, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#16264d';
    ctx.fillRect(cx - v.ts * 0.18, cy - v.ts * 0.24, v.ts * 0.36, v.ts * 0.09);
    if (g.mode === 'chase') {
      ctx.fillStyle = '#ff5252';
      ctx.font = `bold ${Math.round(v.ts * 0.55)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('!', cx, cy - v.ts * 0.42);
    }
  }
  // The thief.
  const p = G.player;
  const px = v.ox + p.x * v.ts, py = v.oy + p.y * v.ts;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.arc(px, py + v.ts * 0.28, v.ts * 0.3, 0, 7);
  ctx.fill();
  ctx.fillStyle = p.sneaking ? '#5b4a8a' : '#17171f';
  ctx.beginPath();
  ctx.arc(px, py, v.ts * 0.32, 0, 7);
  ctx.fill();
  ctx.fillStyle = '#0d0d12';
  ctx.beginPath();
  ctx.arc(px, py - v.ts * 0.06, v.ts * 0.18, 0, 7);
  ctx.fill();
  ctx.strokeStyle = '#f5d7a1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px - v.ts * 0.18, py - v.ts * 0.1);
  ctx.lineTo(px + v.ts * 0.18, py - v.ts * 0.1);
  ctx.stroke();
  // Vault-cracking progress ring.
  if (G.cracking || (G.nearVault && G.crackProgress > 0)) {
    const cx = v.ox + (parsed.vault.tx + 0.5) * v.ts, cy = v.oy + (parsed.vault.ty + 0.5) * v.ts;
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, v.ts * 0.62, 0, 7);
    ctx.stroke();
    ctx.strokeStyle = '#39e07a';
    ctx.beginPath();
    ctx.arc(cx, cy, v.ts * 0.62, -Math.PI / 2, -Math.PI / 2 + G.crackProgress * Math.PI * 2);
    ctx.stroke();
  }
  // Walls on top so actors tuck behind them visually.
  ctx.fillStyle = '#39406b';
  for (let y = 0; y < parsed.rows; y++) {
    for (let x = 0; x < parsed.cols; x++) {
      if (!parsed.walls[y][x]) continue;
      ctx.fillRect(v.ox + x * v.ts, v.oy + y * v.ts, v.ts, v.ts);
      ctx.fillStyle = '#4a539a';
      ctx.fillRect(v.ox + x * v.ts, v.oy + y * v.ts, v.ts, 3);
      ctx.fillStyle = '#39406b';
    }
  }
}
