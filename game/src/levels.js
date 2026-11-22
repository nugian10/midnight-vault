// levels.js — level data for Midnight Vault: ASCII maps plus patrol, camera and laser setups.
// Map legend: '#' wall, '.' floor, 'E' entrance / getaway van, 'V' vault,
// 'c' cash bag ($100), 'g' gold bar ($250), 'j' gem ($500).
export const LOOT_VALUES = { c: 100, g: 250, j: 500 };

export const LEVELS = [
  {
    name: 'Level 1 — First National Bank',
    par: 90,
    map: [
      '######################',
      '#E....#......c.......#',
      '#.....#..............#',
      '#..c..#..g......#....#',
      '#.....###.####..#..V.#',
      '#...............#....#',
      '#.....#......#..####.#',
      '#..g..#..j...#.......#',
      '#.....#......#..#....#',
      '#.....###.####..#..c.#',
      '#..c.............#...#',
      '#....................#',
      '######################',
    ],
    guards: [
      { path: [[10, 2], [16, 2], [15, 6], [10, 6]] },
      { path: [[4, 10], [12, 10], [12, 7], [4, 7]] },
    ],
    cameras: [{ x: 19, y: 1, base: Math.PI / 2, sweep: 0.8, range: 4.5 }],
    lasers: [{ x1: 14, y1: 8, x2: 14, y2: 10, period: 3.2, on: 1.9, offset: 0 }],
  },
  {
    name: 'Level 2 — Meridian Trust',
    par: 120,
    map: [
      '##########################',
      '#E.....#.......#.....c...#',
      '#......#...g...#.........#',
      '#..c...#.......#....#....#',
      '#......###.#####....#..V.#',
      '#...................#....#',
      '#..#......j......#..####.#',
      '#..#.............#.......#',
      '#..#....#........#..#....#',
      '#.......#...c....#..#..g.#',
      '#..g....#........#..####.#',
      '#.......#####.####.......#',
      '#..c..........#......c...#',
      '#.............#..........#',
      '##########################',
    ],
    guards: [
      { path: [[9, 2], [14, 2], [14, 6], [9, 6]] },
      { path: [[18, 8], [21, 8], [21, 12], [18, 12]] },
      { path: [[3, 12], [10, 12], [10, 9], [3, 9]] },
    ],
    cameras: [
      { x: 12, y: 1, base: Math.PI / 2, sweep: 0.9, range: 5 },
      { x: 22, y: 13, base: -Math.PI / 2, sweep: 0.7, range: 4.5 },
    ],
    lasers: [
      { x1: 8, y1: 5, x2: 8, y2: 7, period: 3.6, on: 2.1, offset: 0.6 },
      { x1: 17, y1: 10, x2: 19, y2: 10, period: 2.8, on: 1.6, offset: 0 },
    ],
  },
  {
    name: 'Level 3 — Crown Reserve',
    par: 150,
    map: [
      '############################',
      '#E.....#........#......c...#',
      '#......#....g...#..........#',
      '#..c...#........#.....#....#',
      '#......###.######.....#..V.#',
      '#.....................#....#',
      '#..#.......j.......#..####.#',
      '#..#...............#.......#',
      '#..#....#..........#..#....#',
      '#.......#....c.....#..#..g.#',
      '#..g....#..........#..####.#',
      '#.......#####.######.......#',
      '#..c..........#.......c....#',
      '#.............#............#',
      '#....j........#......j.....#',
      '#.............#............#',
      '############################',
    ],
    guards: [
      { path: [[10, 2], [17, 2], [17, 6], [10, 6]] },
      { path: [[20, 8], [24, 8], [24, 13], [20, 13]] },
      { path: [[4, 13], [12, 13], [12, 10], [4, 10]] },
      { path: [[13, 15], [22, 15], [22, 12], [13, 12]] },
    ],
    cameras: [
      { x: 14, y: 1, base: Math.PI / 2, sweep: 0.9, range: 5 },
      { x: 25, y: 15, base: -Math.PI / 2, sweep: 0.8, range: 5 },
      { x: 1, y: 8, base: 0, sweep: 0.7, range: 4.5 },
    ],
    lasers: [
      { x1: 9, y1: 5, x2: 9, y2: 7, period: 3.4, on: 2, offset: 0 },
      { x1: 18, y1: 10, x2: 20, y2: 10, period: 2.6, on: 1.5, offset: 0.9 },
      { x1: 12, y1: 12, x2: 12, y2: 14, period: 3, on: 1.7, offset: 1.4 },
    ],
  },
  {
    name: 'Level 4 — The Grand Vault',
    par: 180,
    map: [
      '################################',
      '#E.....#.........#.......c.....#',
      '#......#.....g...#.............#',
      '#..c...#.........#......#......#',
      '#......###.#######......#...V..#',
      '#.......................#......#',
      '#..#.......j.........#..#####..#',
      '#..#.................#.........#',
      '#..#....#............#..#......#',
      '#.......#.....c......#..#...g..#',
      '#..g....#............#..#####..#',
      '#.......#####.########.........#',
      '#..c..........#..........c.....#',
      '#.............#................#',
      '#....j........#......j.........#',
      '#.............#...........j....#',
      '#..c..........#................#',
      '#.............#................#',
      '################################',
    ],
    guards: [
      { path: [[11, 2], [19, 2], [19, 6], [11, 6]] },
      { path: [[23, 8], [28, 8], [28, 13], [23, 13]] },
      { path: [[4, 13], [13, 13], [13, 10], [4, 10]] },
      { path: [[16, 16], [25, 16], [25, 13], [16, 13]] },
      { path: [[6, 5], [6, 8], [12, 8], [12, 5]] },
    ],
    cameras: [
      { x: 16, y: 1, base: Math.PI / 2, sweep: 0.9, range: 5.5 },
      { x: 29, y: 17, base: -Math.PI / 2, sweep: 0.8, range: 5 },
      { x: 1, y: 9, base: 0, sweep: 0.7, range: 5 },
      { x: 30, y: 9, base: Math.PI, sweep: 0.7, range: 5 },
    ],
    lasers: [
      { x1: 10, y1: 5, x2: 10, y2: 7, period: 3.2, on: 1.9, offset: 0 },
      { x1: 21, y1: 10, x2: 23, y2: 10, period: 2.6, on: 1.5, offset: 0.7 },
      { x1: 14, y1: 12, x2: 14, y2: 14, period: 3, on: 1.7, offset: 1.2 },
      { x1: 26, y1: 5, x2: 26, y2: 7, period: 2.8, on: 1.6, offset: 2 },
    ],
  },
];

// Parse a level definition into grids and entity lists the engine uses.
export function parseLevel(def) {
  const rows = def.map.length;
  const cols = def.map[0].length;
  const walls = [];
  const loot = [];
  let vault = null;
  let exit = null;
  let totalLoot = 0;
  for (let y = 0; y < rows; y++) {
    walls.push([]);
    for (let x = 0; x < cols; x++) {
      const ch = def.map[y][x];
      walls[y].push(ch === '#');
      if (ch === 'V') vault = { tx: x, ty: y };
      if (ch === 'E') exit = { tx: x, ty: y };
      if (LOOT_VALUES[ch]) {
        loot.push({ tx: x, ty: y, kind: ch, value: LOOT_VALUES[ch], taken: false });
        totalLoot += LOOT_VALUES[ch];
      }
    }
  }
  return { def, rows, cols, walls, loot, vault, exit, totalLoot };
}

export function isWall(parsed, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= parsed.cols || ty >= parsed.rows) return true;
  return parsed.walls[ty][tx];
}

// Breadth-first reachability over walkable tiles; used by the self-test.
export function reachable(parsed, from, to) {
  const key = (x, y) => y * parsed.cols + x;
  const seen = new Set([key(from.tx, from.ty)]);
  const queue = [[from.tx, from.ty]];
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === to.tx && y === to.ty) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!isWall(parsed, nx, ny) && !seen.has(key(nx, ny))) {
        seen.add(key(nx, ny));
        queue.push([nx, ny]);
      }
    }
  }
  return false;
}
