// Звук: музыка и эффекты из ветки I (AUD) + несколько простых звуков для новых событий.
import { AUD } from './aud51.js';
import { prefs } from './save.js';

const S = { ctx: null, master: null, noise: null, on: prefs.get('sound', true), vol: prefs.get('vol', { m: 0.5, a: 0.6, f: 0.9 }), theme: null };

export function soundInit() {
  if (S.ctx) { if (S.ctx.state === 'suspended') S.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const c = S.ctx = new AC();
  S.master = c.createGain(); S.master.gain.value = S.on ? 0.8 : 0; S.master.connect(c.destination);
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  S.noise = buf;
  AUD.init(c, S.master); applyVol();
  if (S.theme) AUD.music.play(S.theme);
}
const ready = () => S.ctx && S.on && S.ctx.state === 'running';
function applyVol() { if (!AUD.ready) return; AUD.music.setVol(S.vol.m); AUD.setAmb(S.vol.a); AUD.setFx(S.vol.f); }

export function setSound(on) { S.on = on; prefs.set('sound', on); if (on) soundInit(); if (S.master) S.master.gain.setTargetAtTime(on ? 0.8 : 0, S.ctx.currentTime, 0.05); }
export function setVol(k, v) { S.vol[k] = v; prefs.set('vol', S.vol); applyVol(); }
export const soundState = () => ({ on: S.on, vol: { ...S.vol } });

/** Музыка: 'day' — в мире, null — тишина. В столице — шум города. */
export function music(theme, city) {
  if (theme !== S.theme) { S.theme = theme; if (AUD.ready) AUD.music.play(theme); }
  if (AUD.ready) AUD.camp.set(city ? 6 : 0);
}

function nz({ dur = 0.1, type = 'bandpass', freq = 1000, q = 1, vol = 0.3, attack = 0.002, delay = 0 }) {
  if (!ready()) return; const c = S.ctx, t = c.currentTime + delay;
  const s = c.createBufferSource(); s.buffer = S.noise;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(AUD.ready ? AUD.nodes().fxo : S.master); s.start(t, Math.random() * 1.5, dur + 0.05);
}
function tone({ freq = 200, to = null, dur = 0.15, type = 'sine', vol = 0.3, attack = 0.003, delay = 0 }) {
  if (!ready()) return; const c = S.ctx, t = c.currentTime + delay;
  const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(AUD.ready ? AUD.nodes().fxo : S.master); o.start(t); o.stop(t + dur + 0.05);
}
const OWN = {
  kill() { tone({ freq: 140, to: 40, dur: 0.4, type: 'sawtooth', vol: 0.12 }); nz({ dur: 0.25, type: 'lowpass', freq: 350, vol: 0.3 }); },
  hurt() { tone({ freq: 320, to: 160, dur: 0.16, type: 'square', vol: 0.08 }); nz({ dur: 0.08, type: 'lowpass', freq: 800, vol: 0.25 }); },
  coin() { tone({ freq: 1320, dur: 0.08, type: 'triangle', vol: 0.15 }); tone({ freq: 1760, dur: 0.12, type: 'triangle', vol: 0.12, delay: 0.06 }); },
  loot() { tone({ freq: 660, dur: 0.12, type: 'triangle', vol: 0.16 }); tone({ freq: 990, dur: 0.18, type: 'triangle', vol: 0.14, delay: 0.08 }); },
  potion() { for (let i = 0; i < 3; i++) tone({ freq: 500 + i * 120, to: 700 + i * 120, dur: 0.1, type: 'sine', vol: 0.12, delay: i * 0.06 }); },
  equip() { nz({ dur: 0.12, freq: 2400, q: 2, vol: 0.2 }); tone({ freq: 220, dur: 0.1, type: 'triangle', vol: 0.15 }); },
  smash() { nz({ dur: 0.35, type: 'lowpass', freq: 400, vol: 0.5 }); tone({ freq: 80, to: 35, dur: 0.4, vol: 0.4 }); },
  die() { tone({ freq: 220, to: 55, dur: 1.2, type: 'sawtooth', vol: 0.12 }); },
  // v61: кирка по камню, плавка, аксессуар, рост навыка
  mine() { nz({ dur: 0.09, freq: 3200, q: 3, vol: 0.32 }); tone({ freq: 1900, to: 1500, dur: 0.12, type: 'triangle', vol: 0.12 }); nz({ dur: 0.18, type: 'lowpass', freq: 600, vol: 0.18, delay: 0.03 }); },
  smelt() { nz({ dur: 0.5, type: 'lowpass', freq: 500, vol: 0.25 }); tone({ freq: 900, dur: 0.1, type: 'triangle', vol: 0.12, delay: 0.35 }); },
  trinket() { for (let i = 0; i < 4; i++) tone({ freq: 440 * Math.pow(1.26, i), dur: 0.18, type: 'sine', vol: 0.1, delay: i * 0.05 }); },
  skill() { tone({ freq: 784, dur: 0.12, type: 'triangle', vol: 0.12 }); tone({ freq: 1046, dur: 0.2, type: 'triangle', vol: 0.12, delay: 0.1 }); },
};

export function sfx(n) {
  if (!ready()) return;
  if (OWN[n]) { OWN[n](); return; }
  if (AUD.ready && AUD.fx[n]) AUD.fx[n]();
}
