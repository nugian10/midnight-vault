// main.js — Midnight Vault boot: game state, screens, input, the frame loop,
// screenshot staging (?shot=1..4) and the ?test=1 self-test hook.
import { LEVELS, parseLevel } from './levels.js';
import { makePlayer, updatePlayer } from './player.js';
import { makeGuards, makeCameras, makeLasers, updateSecurity, bustPlayer } from './guards.js';
import { drawWorld } from './render.js';
import { drawHUD, drawTitle, drawSelect, drawComplete, drawBusted, drawPaused } from './hud.js';
import { ensureAudio, sfx } from './audio.js';
import { runTests } from './test.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const params = new URLSearchParams(location.search);

const G = {
  screen: 'title',
  levelIndex: 0,
  selectIndex: 0,
  parsed: null,
  player: null,
  guards: [],
  cameras: [],
  lasers: [],
  time: 0,
  alarm: 0,
  alarmFull: false,
  alarmTimer: 0,
  spotted: false,
  cracking: false,
  nearVault: false,
  crackProgress: 0,
  vaultCracked: false,
  lootCollected: 0,
  lootCount: 0,
  score: 0,
  stars: 0,
  breakdown: null,
  paused: false,
  frozen: false,
  best: {},
};
try { G.best = JSON.parse(localStorage.getItem('midnight-vault-best') || '{}'); } catch (e) { G.best = {}; }

function startLevel(i) {
  G.levelIndex = i;
  G.parsed = parseLevel(LEVELS[i]);
  G.player = makePlayer(G.parsed);
  G.guards = makeGuards(LEVELS[i]);
  G.cameras = makeCameras(LEVELS[i]);
  G.lasers = makeLasers(LEVELS[i]);
  G.time = 0;
  G.alarm = 0;
  G.alarmFull = false;
  G.alarmTimer = 0;
  G.spotted = false;
  G.cracking = false;
  G.nearVault = false;
  G.crackProgress = 0;
  G.vaultCracked = false;
  G.lootCollected = 0;
  G.lootCount = 0;
  G.paused = false;
  G.screen = 'play';
  return G;
}

const input = { left: false, right: false, up: false, down: false, sneak: false, action: false };
const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  ShiftLeft: 'sneak', ShiftRight: 'sneak', KeyE: 'action',
};
addEventListener('keydown', (e) => {
  ensureAudio();
  if (KEYMAP[e.code]) { input[KEYMAP[e.code]] = true; e.preventDefault(); }
  if (e.code === 'KeyP' && G.screen === 'play') G.paused = !G.paused;
  if (e.code === 'KeyR' && (G.screen === 'play' || G.screen === 'busted' || G.screen === 'complete')) startLevel(G.levelIndex);
  if (e.code === 'Enter') {
    if (G.screen === 'title') { G.screen = 'select'; sfx.click(); }
    else if (G.screen === 'select') { startLevel(G.selectIndex); sfx.click(); }
    else if (G.screen === 'complete') {
      if (G.levelIndex + 1 < LEVELS.length) startLevel(G.levelIndex + 1);
      else G.screen = 'select';
    }
  }
  if (e.code === 'Escape' && (G.screen === 'complete' || G.screen === 'play')) G.screen = 'select';
  if (G.screen === 'select') {
    if (e.code === 'ArrowDown') G.selectIndex = Math.min(LEVELS.length - 1, G.selectIndex + 1);
    if (e.code === 'ArrowUp') G.selectIndex = Math.max(0, G.selectIndex - 1);
  }
});
addEventListener('keyup', (e) => { if (KEYMAP[e.code]) input[KEYMAP[e.code]] = false; });

canvas.addEventListener('click', (e) => {
  ensureAudio();
  const rect = canvas.getBoundingClientRect();
  const y = (e.clientY - rect.top) * (H / rect.height);
  if (G.screen === 'title') { G.screen = 'select'; sfx.click(); }
  else if (G.screen === 'select') {
    LEVELS.forEach((lv, i) => {
      if (y > 190 + i * 92 - 40 && y < 190 + i * 92 + 28) { G.selectIndex = i; startLevel(i); sfx.click(); }
    });
  } else if (G.screen === 'busted' || G.screen === 'complete') {
    startLevel(G.levelIndex);
  }
});

function step(dt, inp) {
  updatePlayer(G, dt, inp || input);
  if (G.screen === 'play') updateSecurity(G, dt);
}

let last = 0;
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;
  if (G.screen === 'play' && !G.paused && !G.frozen) {
    G.time += dt;
    step(dt, input);
  }
  drawWorld(ctx, G, W, H);
  drawHUD(ctx, G, W);
  if (G.screen === 'title') drawTitle(ctx, G, W, H);
  if (G.screen === 'select') drawSelect(ctx, G, W, H);
  if (G.screen === 'complete') drawComplete(ctx, G, W, H);
  if (G.screen === 'busted') drawBusted(ctx, G, W, H);
  if (G.paused && G.screen === 'play') drawPaused(ctx, G, W, H);
  requestAnimationFrame(frame);
}

// ---- Screenshot staging: deterministic scenes for ?shot=1..4 ----
function stageShot(n) {
  if (n === 1) {
    startLevel(1);
    G.player.x = 12.5; G.player.y = 5.5; G.player.facing = 0.4;
    let taken = 0;
    for (const item of G.parsed.loot) {
      if (taken < 3) { item.taken = true; G.lootCollected += item.value; G.lootCount++; taken++; }
    }
    G.alarm = 30; G.time = 47;
    G.guards[0].x = 13.5; G.guards[0].y = 3.5; G.guards[0].angle = 2.4;
    G.guards[1].x = 20.5; G.guards[1].y = 9.5; G.guards[1].angle = -1.2;
  } else if (n === 2) {
    startLevel(1);
    const v = G.parsed.vault;
    G.player.x = v.tx - 0.5; G.player.y = v.ty + 0.5; G.player.facing = 0;
    for (const item of G.parsed.loot) {
      if (item.kind !== 'j') { item.taken = true; G.lootCollected += item.value; G.lootCount++; }
    }
    G.crackProgress = 0.6; G.cracking = true; G.nearVault = true;
    G.alarm = 42; G.spotted = true; G.time = 83;
    G.guards[0].x = 11.5; G.guards[0].y = 5.5; G.guards[0].angle = 0.8;
  } else if (n === 3) {
    startLevel(0);
    G.vaultCracked = true;
    G.player.x = G.parsed.exit.tx + 2.5; G.player.y = G.parsed.exit.ty + 0.5; G.player.facing = Math.PI;
    G.alarm = 100; G.alarmFull = true; G.spotted = true; G.time = 66;
    G.lootCollected = 600; G.lootCount = 3;
    G.guards[0].mode = 'chase'; G.guards[0].x = G.player.x + 2.2; G.guards[0].y = G.player.y + 0.8; G.guards[0].angle = Math.PI;
    G.guards[1].mode = 'chase'; G.guards[1].x = G.player.x + 0.7; G.guards[1].y = G.player.y + 2.3; G.guards[1].angle = -Math.PI / 2;
  } else if (n === 4) {
    startLevel(0);
    G.lootCollected = G.parsed.totalLoot; G.lootCount = G.parsed.loot.length;
    G.breakdown = { loot: G.parsed.totalLoot, timeBonus: 240, stealthBonus: 1500, total: G.parsed.totalLoot + 1740 };
    G.score = G.breakdown.total;
    G.stars = 3;
    G.screen = 'complete';
  }
  G.frozen = true;
}

// ---- Boot ----
const MV = { G, startLevel, step, bust: bustPlayer };
window.MV = MV;
if (params.has('test')) {
  startLevel(0);
  runTests(MV);
} else if (params.has('shot')) {
  stageShot(Number(params.get('shot')) || 1);
} else {
  startLevel(0);
  G.screen = 'title';
}
requestAnimationFrame(frame);
