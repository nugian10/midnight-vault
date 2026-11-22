// player.js — the thief: movement, wall collision, loot pickup, vault cracking, escape.
import { isWall } from './levels.js';
import { sfx } from './audio.js';

export const PLAYER_RADIUS = 0.32; // in tiles

export function makePlayer(parsed) {
  return {
    x: parsed.exit.tx + 0.5,
    y: parsed.exit.ty + 0.5,
    speed: 3.4,        // tiles per second
    sneakSpeed: 1.9,
    sneaking: false,
    facing: 0,
    moving: false,
  };
}

// Axis-separated circle-vs-grid collision move.
export function moveEntity(parsed, e, dx, dy, radius) {
  const nx = e.x + dx;
  if (!hitsWall(parsed, nx, e.y, radius)) e.x = nx;
  const ny = e.y + dy;
  if (!hitsWall(parsed, e.x, ny, radius)) e.y = ny;
}

export function hitsWall(parsed, x, y, r) {
  const x0 = Math.floor(x - r), x1 = Math.floor(x + r);
  const y0 = Math.floor(y - r), y1 = Math.floor(y + r);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (isWall(parsed, tx, ty)) return true;
  return false;
}

export function updatePlayer(G, dt, input) {
  const p = G.player;
  let dx = 0, dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  const len = Math.hypot(dx, dy);
  p.moving = len > 0;
  p.sneaking = !!input.sneak;
  if (len > 0) {
    const sp = p.sneaking ? p.sneakSpeed : p.speed;
    moveEntity(G.parsed, p, (dx / len) * sp * dt, (dy / len) * sp * dt, PLAYER_RADIUS);
    p.facing = Math.atan2(dy, dx);
  }
  // Loot pickup.
  for (const item of G.parsed.loot) {
    if (!item.taken && Math.hypot(p.x - (item.tx + 0.5), p.y - (item.ty + 0.5)) < 0.55) {
      item.taken = true;
      G.lootCollected += item.value;
      G.lootCount++;
      if (item.kind === 'c') sfx.cash(); else sfx.gem();
    }
  }
  // Vault cracking: stand on or next to the vault and hold the action key.
  const v = G.parsed.vault;
  const nearVault = Math.abs(p.x - (v.tx + 0.5)) < 1.15 && Math.abs(p.y - (v.ty + 0.5)) < 1.15;
  G.nearVault = nearVault && !G.vaultCracked;
  if (G.nearVault && input.action && !G.vaultCracked) {
    G.cracking = true;
    const before = Math.floor(G.crackProgress * 8);
    G.crackProgress += dt / 4; // 4 seconds to crack
    if (Math.floor(G.crackProgress * 8) !== before) sfx.crackTick();
    G.alarm = Math.min(100, G.alarm + 5 * dt); // cracking is noisy
    if (G.crackProgress >= 1) {
      G.crackProgress = 1;
      G.vaultCracked = true;
      G.cracking = false;
      sfx.crackDone();
    }
  } else {
    G.cracking = false;
  }
  // Escape: reach the van once the vault is cracked.
  const ex = G.parsed.exit;
  if (G.vaultCracked && Math.abs(p.x - (ex.tx + 0.5)) < 0.6 && Math.abs(p.y - (ex.ty + 0.5)) < 0.6) {
    finishLevel(G);
  }
}

export function finishLevel(G) {
  const timeBonus = Math.max(0, Math.round((G.parsed.def.par - G.time) * 10));
  const stealthBonus = G.spotted ? 0 : 1500;
  G.score = G.lootCollected + timeBonus + stealthBonus;
  G.breakdown = { loot: G.lootCollected, timeBonus, stealthBonus, total: G.score };
  const allLoot = G.lootCollected >= G.parsed.totalLoot;
  G.stars = allLoot && !G.spotted ? 3 : G.lootCollected >= G.parsed.totalLoot * 0.6 ? 2 : 1;
  G.screen = 'complete';
  sfx.win();
  const prev = G.best[G.levelIndex];
  if (!prev || G.score > prev) G.best[G.levelIndex] = G.score;
  try { localStorage.setItem('midnight-vault-best', JSON.stringify(G.best)); } catch (e) { /* offline ok */ }
}
