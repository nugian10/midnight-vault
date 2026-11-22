// audio.js — WebAudio-synthesized sound effects only; no audio files, no network.
let ctx = null;

export function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, gain, when = 0, slideTo = null) {
  if (!ensureAudio()) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  cash() { tone(880, 0.09, 'square', 0.06); tone(1320, 0.12, 'square', 0.05, 0.07); },
  gem() { tone(1180, 0.1, 'triangle', 0.08); tone(1760, 0.16, 'triangle', 0.06, 0.08); },
  laser() { tone(220, 0.25, 'sawtooth', 0.09, 0, 90); },
  spot() { tone(520, 0.12, 'square', 0.07); },
  alarmBeep() { tone(980, 0.14, 'square', 0.07); tone(980, 0.14, 'square', 0.07, 0.2); },
  crackTick() { tone(340, 0.05, 'square', 0.05); },
  crackDone() { tone(660, 0.12, 'triangle', 0.09); tone(880, 0.12, 'triangle', 0.09, 0.1); tone(1320, 0.22, 'triangle', 0.09, 0.2); },
  busted() { tone(300, 0.5, 'sawtooth', 0.1, 0, 60); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.09, i * 0.13)); },
  click() { tone(700, 0.05, 'square', 0.04); },
};
