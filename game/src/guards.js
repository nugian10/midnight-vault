// guards.js — patrol guards with vision cones, sweeping cameras, blinking lasers,
// the alarm meter and the chase that follows a full alarm.
import { isWall } from './levels.js';
import { moveEntity, hitsWall, PLAYER_RADIUS } from './player.js';
import { sfx } from './audio.js';

export function makeGuards(def) {
  return def.guards.map((g) => ({
    path: g.path,
    wp: 0,
    x: g.path[0][0] + 0.5,
    y: g.path[0][1] + 0.5,
    angle: 0,
    speed: 1.7,
    chaseSpeed: 3.1,
    range: 5.2,
    fov: 1.15, // radians, full width
    mode: 'patrol',
    lastSeen: null,
    waitT: 0,
  }));
}

export function makeCameras(def) {
  return def.cameras.map((c) => ({ ...c, angle: c.base, range: c.range || 4.5, fov: 0.85 }));
}

export function makeLasers(def) {
  return def.lasers.map((l) => ({ ...l, tripped: 0 }));
}

export function laserActive(laser, t) {
  return ((t + laser.offset) % laser.period) < laser.on;
}

// Line of sight by sampling along the segment; walls block the view.
export function lineOfSight(parsed, x0, y0, x1, y1) {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(dist / 0.2));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    if (isWall(parsed, Math.floor(x0 + (x1 - x0) * t), Math.floor(y0 + (y1 - y0) * t))) return false;
  }
  return true;
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Can this watcher (guard or camera) see the player right now?
export function canSee(parsed, w, player) {
  const dx = player.x - w.x, dy = player.y - w.y;
  const dist = Math.hypot(dx, dy);
  const range = player.sneaking ? w.range * 0.62 : w.range;
  if (dist > range) return false;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, w.angle)) > w.fov / 2) return false;
  return lineOfSight(parsed, w.x, w.y, player.x, player.y);
}

export function updateSecurity(G, dt) {
  const p = G.player;
  let seen = 0;
  // Guards: patrol waypoints, or chase when the alarm is full.
  for (const g of G.guards) {
    if (G.alarmFull) {
      g.mode = 'chase';
      if (canSee(G.parsed, g, p)) g.lastSeen = { x: p.x, y: p.y };
    } else if (g.mode === 'chase' && G.alarm < 35) {
      g.mode = 'patrol';
      g.lastSeen = null;
    }
    if (g.mode === 'chase') {
      const target = g.lastSeen || { x: p.x, y: p.y };
      const dx = target.x - g.x, dy = target.y - g.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.1) {
        g.angle = Math.atan2(dy, dx);
        moveEntity(G.parsed, g, (dx / d) * g.chaseSpeed * dt, (dy / d) * g.chaseSpeed * dt, PLAYER_RADIUS);
      }
      if (Math.hypot(p.x - g.x, p.y - g.y) < 0.55) bustPlayer(G);
    } else {
      const [tx, ty] = g.path[g.wp];
      const cx = tx + 0.5, cy = ty + 0.5;
      const dx = cx - g.x, dy = cy - g.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.08) {
        g.wp = (g.wp + 1) % g.path.length;
        g.waitT = 0.7;
      } else if (g.waitT > 0) {
        g.waitT -= dt;
      } else {
        g.angle = Math.atan2(dy, dx);
        moveEntity(G.parsed, g, (dx / d) * g.speed * dt, (dy / d) * g.speed * dt, PLAYER_RADIUS);
      }
    }
    if (canSee(G.parsed, g, p)) seen = Math.max(seen, 1);
  }
  // Cameras sweep back and forth.
  for (const c of G.cameras) {
    c.angle = c.base + Math.sin(G.time * 0.7 + c.x) * c.sweep;
    if (canSee(G.parsed, c, p)) seen = Math.max(seen, 0.7);
  }
  // Lasers: crossing an active beam spikes the alarm.
  for (const l of G.lasers) {
    l.tripped = Math.max(0, l.tripped - dt);
    if (laserActive(l, G.time) && l.tripped <= 0 && crossesBeam(p, l)) {
      l.tripped = 1.2;
      G.alarm = Math.min(100, G.alarm + 35);
      G.spotted = true;
      sfx.laser();
    }
  }
  // Alarm meter.
  if (seen > 0) {
    const before = G.alarm;
    G.alarm = Math.min(100, G.alarm + (seen === 1 ? 46 : 30) * dt * (p.sneaking ? 0.6 : 1));
    if (before < 20 && G.alarm >= 20) sfx.spot();
    G.spotted = true;
  } else if (!G.cracking) {
    G.alarm = Math.max(0, G.alarm - 7 * dt);
  }
  if (G.alarm >= 100 && !G.alarmFull) {
    G.alarmFull = true;
    sfx.alarmBeep();
  }
  if (G.alarmFull) {
    G.alarmTimer += dt;
    if (G.alarmTimer > 0.85) { G.alarmTimer = 0; sfx.alarmBeep(); }
    if (G.alarm < 30) G.alarmFull = false;
  }
}

function crossesBeam(p, l) {
  // Player centre within the beam segment's bounding span, close to its line.
  const x0 = Math.min(l.x1, l.x2) + 0.5, x1 = Math.max(l.x1, l.x2) + 0.5;
  const y0 = Math.min(l.y1, l.y2) + 0.5, y1 = Math.max(l.y1, l.y2) + 0.5;
  if (l.x1 === l.x2) return Math.abs(p.x - x0) < 0.3 && p.y > y0 - 0.3 && p.y < y1 + 0.3;
  return Math.abs(p.y - y0) < 0.3 && p.x > x0 - 0.3 && p.x < x1 + 0.3;
}

export function bustPlayer(G) {
  if (G.screen !== 'play') return;
  G.screen = 'busted';
  sfx.busted();
}

export { hitsWall };
