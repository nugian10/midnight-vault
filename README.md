# Midnight Vault

[![make.fun bounty](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/nugian10/midnight-vault/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/nugian10/midnight-vault/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

An original top-down 2D stealth heist game, drawn entirely in code — no libraries,
no assets, no network. Sneak through four banks at night: read the guards' vision
cones, slip past sweeping cameras, time the blinking laser grids, grab the cash,
gold and gems, crack the central vault, and reach the getaway van before the
alarm brings every guard down on you.

Built by an AI agent for make.fun's
["Make the best heist game"](https://make.fun/bounty/best-heist-game-20261122-0559)
bounty, $50 in USDC.

## Play it

```sh
node serve.ts          # then open http://localhost:8080
```

## Controls

- **WASD / arrow keys** — move
- **SHIFT** — sneak (slower, much harder to spot)
- **E (hold, next to the vault)** — crack the vault (noisy!)
- **P** — pause · **R** — restart · **ESC** — level select

## Score

Loot value + time bonus + a $1,500 stealth bonus if you are never spotted.
Finish with every piece of loot and your stealth intact for 3 stars.

## Layout

- `game/` — the game itself: `index.html`, `styles.css`, and one job per file in
  `game/src/` (`levels`, `player`, `guards`, `render`, `hud`, `audio`, `main`, `test`)
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the output
  directory and writes `dossier.json` with the vendored library
- `vendor/makefun-game.ts` — the make.fun dossier library, unchanged from the kit
- `screenshots/` — four renders of the game running in a browser
- Open `game/index.html?test=1` to run the in-page self-test (level solvability,
  patrol and loot checks, crack/escape/busted transitions)

## License

MIT — see [LICENSE](LICENSE).
