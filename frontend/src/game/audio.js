import { SOUND_FILES, soundUrl } from "./assets.config";

const STORAGE = "hog_island_audio";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE)) || {};
  } catch {
    return {};
  }
}

function makeNoise(ctx) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// Procedural Web Audio engine. Any key in SOUND_FILES that exists on disk overrides the synth.
class AudioEngine {
  constructor() {
    const p = loadPrefs();
    this.ctx = null;
    this.volume = p.volume ?? 0.7;
    this.muted = p.muted ?? false;
    this.buffers = {};
    this.ambient = null;
    this.mystical = false;
    this.listeners = new Set();
  }

  // ---- prefs / state ----
  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit() {
    const s = this.prefs();
    this.listeners.forEach((fn) => fn(s));
  }
  prefs() {
    return { volume: this.volume, muted: this.muted };
  }
  save() {
    localStorage.setItem(STORAGE, JSON.stringify(this.prefs()));
  }
  applyMaster() {
    if (!this.master) return;
    const v = this.muted ? 0 : this.volume;
    this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.03);
  }
  setVolume(v) {
    this.volume = clamp(v, 0, 1);
    this.applyMaster();
    this.save();
    this.emit();
  }
  setMuted(m) {
    this.muted = !!m;
    this.applyMaster();
    this.save();
    this.emit();
  }
  toggleMute() {
    this.setMuted(!this.muted);
  }

  // ---- graph ----
  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 20000;
    this.delay = ctx.createDelay(1.0);
    this.delay.delayTime.value = 0.31;
    this.feedback = ctx.createGain();
    this.feedback.gain.value = 0.45;
    this.wet = ctx.createGain();
    this.wet.gain.value = 0;
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.9;
    this.amb = ctx.createGain();
    this.amb.gain.value = 0.55;

    this.sfx.connect(this.filter);
    this.amb.connect(this.filter);
    this.filter.connect(this.master);
    this.filter.connect(this.delay);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay);
    this.delay.connect(this.wet);
    this.wet.connect(this.master);
    this.master.connect(ctx.destination);
    this.noise = makeNoise(ctx);
    this.loadFiles();
  }

  async loadFiles() {
    await Promise.all(
      Object.keys(SOUND_FILES).map(async (key) => {
        try {
          const r = await fetch(soundUrl(key));
          const ct = r.headers.get("content-type") || "";
          if (!r.ok || ct.includes("text/html")) return;
          const ab = await r.arrayBuffer();
          this.buffers[key] = await this.ctx.decodeAudioData(ab);
        } catch {
          /* missing file: keep synth */
        }
      })
    );
  }

  // output bus with per-sound gain + stereo pan
  bus(dest, gain = 1, pan = 0) {
    const g = this.ctx.createGain();
    g.gain.value = gain;
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = clamp(pan, -1, 1);
      g.connect(p).connect(dest);
    } else g.connect(dest);
    return g;
  }

  playBuffer(key, { gain = 1, rate = 1, pan = 0, loop = false, dest } = {}) {
    const buf = this.buffers[key];
    if (!buf) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    src.playbackRate.value = rate;
    src.connect(this.bus(dest || this.sfx, gain, pan));
    src.start();
    return src;
  }

  tone({ type = "sine", f0, f1, dur, g = 0.5, pan = 0, at = 0, dest }) {
    const { ctx } = this;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(g, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(env).connect(this.bus(dest || this.sfx, 1, pan));
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  burst({ lp = 2000, hp = 0, dur, g = 0.8, pan = 0, at = 0, sweep = 0.3 }) {
    const { ctx } = this;
    const t = ctx.currentTime + at;
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(lp, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(60, lp * sweep), t + dur);
    const h = ctx.createBiquadFilter();
    h.type = "highpass";
    h.frequency.value = hp;
    const env = ctx.createGain();
    env.gain.setValueAtTime(g, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(h).connect(env).connect(this.bus(this.sfx, 1, pan));
    n.start(t);
    n.stop(t + dur + 0.05);
  }

  // Stereo pan + attenuation of a world position relative to the camera.
  spatial(pos, camera) {
    const dx = pos.x - camera.position.x;
    const dz = pos.z - camera.position.z;
    const dist = Math.hypot(dx, dz) || 1;
    const rx = camera.matrixWorld.elements[0];
    const rz = camera.matrixWorld.elements[2];
    const pan = clamp((dx * rx + dz * rz) / dist, -1, 1);
    const gain = clamp(1 - dist / 55, 0.05, 1);
    return { pan, gain };
  }

  // ---- sfx ----
  shot(kind, pan = 0) {
    if (!this.ctx) return;
    if (this.playBuffer(`shot_${kind}`, { pan })) return;
    const cfg = {
      rifle: { dur: 0.18, lp: 5000, thump: 160, g: 0.9 },
      shotgun: { dur: 0.36, lp: 2600, thump: 105, g: 1.25 },
      marksman: { dur: 0.46, lp: 9000, thump: 210, g: 1.05 },
    }[kind];
    this.burst({ lp: cfg.lp, dur: cfg.dur, g: cfg.g, pan, sweep: 0.12 });
    this.tone({ type: "sine", f0: cfg.thump, f1: 36, dur: 0.16, g: 0.9, pan });
    if (kind === "marksman") this.tone({ type: "triangle", f0: 2400, f1: 900, dur: 0.3, g: 0.12, at: 0.02 });
  }
  dryfire() {
    if (!this.ctx) return;
    if (this.playBuffer("dryfire")) return;
    this.burst({ lp: 3000, hp: 800, dur: 0.05, g: 0.35 });
  }
  reload(ms = 1200) {
    if (!this.ctx) return;
    if (this.playBuffer("reload")) return;
    const s = ms / 1000;
    this.burst({ lp: 4000, hp: 1200, dur: 0.05, g: 0.4, at: 0.05 });
    this.tone({ type: "square", f0: 900, f1: 500, dur: 0.06, g: 0.08, at: 0.06 });
    this.burst({ lp: 2600, hp: 900, dur: 0.07, g: 0.45, at: s * 0.55 });
    this.burst({ lp: 5000, hp: 1500, dur: 0.05, g: 0.5, at: s * 0.92 });
    this.tone({ type: "square", f0: 1400, f1: 700, dur: 0.05, g: 0.1, at: s * 0.93 });
  }
  swap() {
    if (!this.ctx) return;
    if (this.playBuffer("swap")) return;
    this.burst({ lp: 6000, hp: 2000, dur: 0.04, g: 0.35 });
    this.tone({ type: "square", f0: 700, f1: 1100, dur: 0.07, g: 0.08, at: 0.03 });
  }
  hit() {
    if (!this.ctx) return;
    if (this.playBuffer("hit")) return;
    this.tone({ type: "triangle", f0: 1300, f1: 900, dur: 0.05, g: 0.25 });
  }
  kill() {
    if (!this.ctx) return;
    if (this.playBuffer("kill")) return;
    this.tone({ type: "triangle", f0: 880, f1: 660, dur: 0.09, g: 0.3 });
    this.tone({ type: "triangle", f0: 660, f1: 330, dur: 0.16, g: 0.3, at: 0.08 });
    this.burst({ lp: 900, dur: 0.25, g: 0.4, at: 0.02 });
  }
  hurt() {
    if (!this.ctx) return;
    if (this.playBuffer("hurt")) return;
    this.tone({ type: "sine", f0: 120, f1: 40, dur: 0.25, g: 0.8 });
    this.burst({ lp: 800, dur: 0.2, g: 0.5 });
  }
  pickup() {
    if (!this.ctx) return;
    if (this.playBuffer("pickup")) return;
    [523, 659, 784, 1046].forEach((f, i) => this.tone({ type: "sine", f0: f, dur: 0.14, g: 0.22, at: i * 0.07 }));
  }
  wave() {
    if (!this.ctx) return;
    if (this.playBuffer("wave")) return;
    this.tone({ type: "sine", f0: 110, f1: 100, dur: 1.6, g: 0.5 });
    this.tone({ type: "triangle", f0: 220, f1: 215, dur: 1.2, g: 0.18, at: 0.02 });
    this.burst({ lp: 1200, dur: 0.5, g: 0.3 });
  }
  surge(on) {
    if (!this.ctx) return;
    if (this.playBuffer("surge", { rate: on ? 1 : 0.8 })) return;
    if (on) {
      this.tone({ type: "sawtooth", f0: 80, f1: 640, dur: 1.4, g: 0.18 });
      this.tone({ type: "sine", f0: 160, f1: 1280, dur: 1.4, g: 0.12, at: 0.1 });
    } else {
      this.tone({ type: "sawtooth", f0: 640, f1: 70, dur: 1.2, g: 0.15 });
    }
  }
  roar(type, scale = 1, pan = 0, gain = 1) {
    if (!this.ctx) return;
    if (this.playBuffer(`roar_${type}`, { pan, gain }) || this.playBuffer("roar", { pan, gain, rate: 1 / scale })) return;
    const { ctx } = this;
    const t = ctx.currentTime;
    const base = 150 / scale;
    const dur = 0.5 + scale * 0.45;
    const dest = this.bus(this.sfx, gain * 0.7, pan);
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(base * 1.5, t);
    o.frequency.exponentialRampToValueAtTime(base * 0.75, t + dur);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 9 + Math.random() * 4;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 30;
    lfo.connect(lfoG).connect(o.detune);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(1400 / scale, t);
    f.frequency.exponentialRampToValueAtTime(300 / scale, t + dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.8, t + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(env).connect(dest);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const nf = ctx.createBiquadFilter();
    nf.type = "bandpass";
    nf.frequency.value = 600 / scale;
    nf.Q.value = 0.8;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8);
    n.connect(nf).connect(ng).connect(dest);
    n.start(t);
    n.stop(t + dur);
  }

  // ---- ambience ----
  startAmbient() {
    if (!this.ctx || this.ambient) return;
    const { ctx } = this;
    const nodes = [];
    const file = this.playBuffer("ambient", { loop: true, dest: this.amb });
    if (file) {
      this.ambient = { stop: () => file.stop() };
      return;
    }
    const detune = ctx.createGain();
    detune.gain.value = 0;
    this.detuneDepth = detune;
    const warble = ctx.createOscillator();
    warble.frequency.value = 0.6;
    warble.connect(detune);
    nodes.push(warble);

    const droneF = ctx.createBiquadFilter();
    droneF.type = "lowpass";
    droneF.frequency.value = 200;
    const droneG = ctx.createGain();
    droneG.gain.value = 0.28;
    droneF.connect(droneG).connect(this.amb);
    [
      ["sawtooth", 48],
      ["sawtooth", 48.6],
      ["sine", 96],
      ["triangle", 72],
    ].forEach(([type, f]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      detune.connect(o.detune);
      o.connect(droneF);
      nodes.push(o);
    });
    const fLfo = ctx.createOscillator();
    fLfo.frequency.value = 0.07;
    const fLfoG = ctx.createGain();
    fLfoG.gain.value = 110;
    fLfo.connect(fLfoG).connect(droneF.frequency);
    nodes.push(fLfo);

    const wind = ctx.createBufferSource();
    wind.buffer = this.noise;
    wind.loop = true;
    const windF = ctx.createBiquadFilter();
    windF.type = "bandpass";
    windF.frequency.value = 520;
    windF.Q.value = 0.7;
    const windG = ctx.createGain();
    windG.gain.value = 0.11;
    wind.connect(windF).connect(windG).connect(this.amb);
    const wLfo = ctx.createOscillator();
    wLfo.frequency.value = 0.11;
    const wLfoG = ctx.createGain();
    wLfoG.gain.value = 320;
    wLfo.connect(wLfoG).connect(windF.frequency);
    const gLfo = ctx.createOscillator();
    gLfo.frequency.value = 0.13;
    const gLfoG = ctx.createGain();
    gLfoG.gain.value = 0.06;
    gLfo.connect(gLfoG).connect(windG.gain);
    nodes.push(wind, wLfo, gLfo);

    nodes.forEach((n) => n.start());
    this.ambient = { stop: () => nodes.forEach((n) => n.stop()) };
  }
  stopAmbient() {
    if (this.ambient) this.ambient.stop();
    this.ambient = null;
    this.detuneDepth = null;
  }

  // Mystical surge: reality smears — muffled highs, echoing feedback, warbling drone.
  setMystical(on) {
    this.mystical = on;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.filter.frequency.cancelScheduledValues(t);
    this.filter.frequency.setTargetAtTime(on ? 650 : 20000, t, 0.6);
    this.wet.gain.setTargetAtTime(on ? 0.55 : 0, t, 0.6);
    this.amb.gain.setTargetAtTime(on ? 0.85 : 0.55, t, 0.6);
    if (this.detuneDepth) this.detuneDepth.gain.setTargetAtTime(on ? 60 : 0, t, 0.8);
  }
}

export const audio = new AudioEngine();
