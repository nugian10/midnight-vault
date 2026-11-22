// test.js — in-page self-test, run with ?test=1. Checks level solvability by BFS,
// patrol sanity, loot bookkeeping, and the crack / escape / busted state transitions.
import { LEVELS, parseLevel, reachable, isWall, LOOT_VALUES } from './levels.js';

export function runTests(MV) {
  const results = [];
  const check = (name, ok) => results.push({ name, ok: !!ok });

  LEVELS.forEach((def, i) => {
    const parsed = parseLevel(def);
    check(`L${i + 1} entrance reaches vault`, reachable(parsed, parsed.exit, parsed.vault));
    check(`L${i + 1} vault reaches entrance`, reachable(parsed, parsed.vault, parsed.exit));
    let allLoot = true;
    for (const item of parsed.loot) {
      if (!reachable(parsed, parsed.exit, item)) allLoot = false;
    }
    check(`L${i + 1} entrance reaches every loot tile`, allLoot);
    let patrolOk = true;
    for (const g of def.guards) for (const [x, y] of g.path) if (isWall(parsed, x, y)) patrolOk = false;
    check(`L${i + 1} guard patrols stay on walkable tiles`, patrolOk);
    let sum = 0;
    for (const row of def.map) for (const ch of row) if (LOOT_VALUES[ch]) sum += LOOT_VALUES[ch];
    check(`L${i + 1} loot total in data matches placed loot`, sum === parsed.totalLoot);
    let rowsOk = def.map.every((r) => r.length === def.map[0].length);
    check(`L${i + 1} map rows are all the same width`, rowsOk);
  });

  // State transitions on a simulated game.
  const G = MV.startLevel(0);
  const v = G.parsed.vault;
  G.player.x = v.tx + 0.5;
  G.player.y = v.ty + 1.5;
  G.crackProgress = 0.9;
  MV.step(0.5, { action: true });
  check('holding E at the vault finishes the crack', G.vaultCracked === true);
  G.player.x = G.parsed.exit.tx + 0.5;
  G.player.y = G.parsed.exit.ty + 0.5;
  MV.step(0.05, {});
  check('reaching the van after the crack completes the level', G.screen === 'complete');
  const G2 = MV.startLevel(0);
  MV.bust(G2);
  check('getting caught switches to the busted screen', G2.screen === 'busted');

  const passed = results.filter((r) => r.ok).length;
  const lines = results.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}`);
  lines.push(`${passed}/${results.length} checks passed`);
  const pre = document.getElementById('testout');
  if (pre) pre.textContent = lines.join('\n');
  document.title = `Midnight Vault test: ${passed}/${results.length}`;
  console.log(lines.join('\n'));
  return { passed, total: results.length };
}
