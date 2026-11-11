/* Голосовой чат — схема из «Дикого Запада».
   Звук идёт напрямую между браузерами (WebRTC, каждый с каждым), сервер игры только передаёт приглашения.
   Если напрямую связаться не вышло (строгая сеть, мобильный интернет), включается ретранслятор: голос режется
   на кусочки по 40 мс, сжимается (16 кГц, μ-закон) и идёт через сервер игры тем же соединением, что и сама игра.
   Для проверки: localStorage rybak.voiceRelay = 'always' — сразу через сервер. */
const ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
const SPEAK_LEVEL = 0.035;
const GATE_LEVEL = 0.012;
const RELAY_RATE = 16000;
const CONNECT_WAIT_MS = 10000;
const forceRelay = () => {
  try {
    return localStorage.getItem('rybak.voiceRelay') === 'always';
  } catch {
    return false;
  }
};

const WORKLET = `
class RyCap extends AudioWorkletProcessor {
  constructor() { super(); this.size = Math.round(sampleRate * 0.04); this.buf = new Float32Array(this.size); this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) for (let i = 0; i < ch.length; i++) { this.buf[this.n++] = ch[i]; if (this.n === this.size) { this.port.postMessage(this.buf.slice(0)); this.n = 0; } }
    return true;
  }
}
registerProcessor('ry-cap', RyCap);
class RyPlay extends AudioWorkletProcessor {
  constructor() {
    super(); this.q = new Float32Array(32000); this.r = 0; this.w = 0; this.len = 0; this.pos = 0; this.on = false; this.step = ${RELAY_RATE} / sampleRate;
    this.port.onmessage = e => {
      const d = e.data, Q = this.q.length;
      for (let i = 0; i < d.length; i++) { this.q[this.w] = d[i]; this.w = (this.w + 1) % Q; if (this.len < Q) this.len++; else this.r = (this.r + 1) % Q; }
      if (this.len > 12000) { const drop = this.len - 4000; this.r = (this.r + drop) % Q; this.len -= drop; }
    };
  }
  process(_, outputs) {
    const out = outputs[0][0], Q = this.q.length;
    if (!this.on && this.len >= 2400) this.on = true;
    for (let i = 0; i < out.length; i++) {
      if (!this.on || this.len < 2) { out[i] = 0; this.on = false; continue; }
      const a = this.q[this.r], b = this.q[(this.r + 1) % Q];
      out[i] = a + (b - a) * this.pos;
      this.pos += this.step;
      while (this.pos >= 1) { this.pos -= 1; this.r = (this.r + 1) % Q; this.len--; }
    }
    for (let c = 1; c < outputs[0].length; c++) outputs[0][c].set(out);
    return true;
  }
}
registerProcessor('ry-play', RyPlay);`;

function muEnc(x) {
  let s = Math.max(-1, Math.min(1, x)) * 32767;
  const sign = s < 0 ? 0x80 : 0;
  if (sign) s = -s;
  s = Math.min(32635, s + 132);
  let exp = 7;
  for (let m = 0x4000; (s & m) === 0 && exp > 0; m >>= 1) exp--;
  return ~(sign | (exp << 4) | ((s >> (exp + 3)) & 0x0f)) & 0xff;
}
const MU = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const u = ~i & 0xff;
  const t = (((u & 0x0f) << 3) + 132) << ((u & 0x70) >> 4);
  MU[i] = ((u & 0x80) ? 132 - t : t - 132) / 32768;
}
function pack(buf, rate) {
  const k = rate / RELAY_RATE;
  const n = Math.floor(buf.length / k);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.floor(i * k);
    const b = Math.max(a + 1, Math.min(buf.length, Math.floor((i + 1) * k)));
    let s = 0;
    for (let j = a; j < b; j++) s += buf[j];
    out[i] = muEnc(s / (b - a));
  }
  return out;
}

/** send(json), sendBinary(ArrayBuffer) — через соединение игры; getVolume(vid) — громкость собеседника 0…1 */
export function createVoice({ send, sendBinary, onChange = () => {}, onError = () => {}, getVolume = () => 1, audioCtx: getCtx }) {
  const V = { joined: false, joining: false, me: null, muted: false, stream: null, peers: new Map(), speaking: new Set(), selfSpeaking: false, roster: [] };
  let ac = null;
  let selfAnalyser = null;
  let meterTimer = null;
  let ice = ICE;
  let waitJoin = null;
  const relayTo = new Set();
  let workletReady = null;
  let cap = null;
  let loudAt = 0;

  const audioCtx = () => (ac ||= (getCtx && getCtx()) || new (window.AudioContext || window.webkitAudioContext)());
  const signal = (to, data) => send({ t: 'vsignal', to, data });

  function meter(stream) {
    try {
      const a = audioCtx().createAnalyser();
      a.fftSize = 512;
      audioCtx().createMediaStreamSource(stream).connect(a);
      return a;
    } catch {
      return null;
    }
  }
  let lbuf = null;
  const levelOf = (a) => {
    if (!a) return 0;
    const buf = lbuf && lbuf.length === a.fftSize ? lbuf : (lbuf = new Float32Array(a.fftSize));
    a.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    return Math.sqrt(sum / buf.length);
  };
  function tickMeters() {
    let changed = false;
    const was = V.selfSpeaking;
    V.selfSpeaking = !V.muted && levelOf(selfAnalyser) > SPEAK_LEVEL;
    if (was !== V.selfSpeaking) changed = true;
    const t = performance.now();
    for (const [id, p] of V.peers) {
      const on = p.relay ? t - (p.heardAt || 0) < 300 : levelOf(p.analyser) > SPEAK_LEVEL;
      if (on !== V.speaking.has(id)) {
        on ? V.speaking.add(id) : V.speaking.delete(id);
        changed = true;
      }
      applyVolume(id);
    }
    if (changed) onChange('speaking');
  }

  function peer(id) {
    let p = V.peers.get(id);
    if (p) return p;
    const pc = new RTCPeerConnection({ iceServers: ice });
    p = { pc, audio: null, analyser: null, pending: [], relay: false, state: 'new' };
    V.peers.set(id, p);
    p.waitTimer = setTimeout(() => {
      if (forceRelay() || pc.connectionState !== 'connected') useRelay(id);
    }, forceRelay() ? 300 : CONNECT_WAIT_MS);
    if (V.stream) V.stream.getTracks().forEach((t) => pc.addTrack(t, V.stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) signal(id, { candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      const s = e.streams[0] || new MediaStream([e.track]);
      if (!p.audio) {
        p.audio = new Audio();
        p.audio.autoplay = true;
        p.audio.setAttribute('playsinline', '');
        document.body.append(p.audio);
      }
      p.audio.srcObject = s;
      p.audio.muted = p.relay;
      applyVolume(id);
      p.audio.play().catch(() => {});
      p.analyser = meter(s);
    };
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (!p.relay) p.state = s;
      if (s === 'connected' && !forceRelay()) clearTimeout(p.waitTimer);
      if (s === 'failed') useRelay(id);
      if (s === 'disconnected') {
        clearTimeout(p.waitTimer);
        p.waitTimer = setTimeout(() => {
          if (pc.connectionState !== 'connected') useRelay(id);
        }, 6000);
      }
      onChange('state');
    };
    return p;
  }
  function dropPeer(id) {
    const p = V.peers.get(id);
    if (!p) return;
    clearTimeout(p.waitTimer);
    try {
      p.pc.close();
    } catch {
      /* уже закрыт */
    }
    if (p.audio) p.audio.remove();
    try {
      if (p.player) p.player.disconnect();
      if (p.gain) p.gain.disconnect();
    } catch {
      /* уже отключён */
    }
    V.peers.delete(id);
    V.speaking.delete(id);
    relayTo.delete(id);
    if (!relayTo.size) stopCapture();
  }
  function applyVolume(id) {
    const p = V.peers.get(id);
    if (!p) return;
    const vol = Math.max(0, Math.min(1, getVolume(id)));
    if (p.audio && Math.abs(p.audio.volume - vol) > 0.01) p.audio.volume = vol;
    if (p.gain) p.gain.gain.value = vol;
  }

  function loadWorklet() {
    if (workletReady) return workletReady;
    const ctx = audioCtx();
    if (!ctx.audioWorklet) return (workletReady = Promise.resolve(false));
    const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
    workletReady = ctx.audioWorklet.addModule(url).then(() => true, (e) => {
      console.warn('voice relay', e);
      return false;
    });
    return workletReady;
  }
  async function useRelay(id, notify = true) {
    const p = V.peers.get(id);
    if (!p || p.relay || !V.joined) return;
    p.relay = true;
    p.state = 'relay';
    clearTimeout(p.waitTimer);
    if (p.audio) p.audio.muted = true;
    relayTo.add(id);
    if (notify) signal(id, { relay: true });
    if (!(await loadWorklet())) {
      p.state = 'failed';
      onError('Этот браузер не умеет передавать голос через сервер. Попробуйте Chrome, Edge, Firefox или Safari поновее.');
    } else startCapture();
    onChange('state');
  }
  function startCapture() {
    if (cap || !V.stream || !relayTo.size) return;
    try {
      const ctx = audioCtx();
      const src = ctx.createMediaStreamSource(V.stream);
      const node = new AudioWorkletNode(ctx, 'ry-cap', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1, channelCountMode: 'explicit' });
      const sink = ctx.createGain();
      sink.gain.value = 0;
      src.connect(node);
      node.connect(sink);
      sink.connect(ctx.destination);
      node.port.onmessage = (e) => sendChunk(e.data, ctx.sampleRate);
      cap = { src, node, sink };
    } catch (e) {
      console.warn('voice relay capture', e);
    }
  }
  function stopCapture() {
    if (!cap) return;
    try {
      cap.src.disconnect();
      cap.node.disconnect();
      cap.sink.disconnect();
      cap.node.port.onmessage = null;
    } catch {
      /* уже отключён */
    }
    cap = null;
  }
  function sendChunk(buf, rate) {
    if (!relayTo.size || !V.joined || V.muted) return;
    let sum = 0;
    for (let i = 0; i < buf.length; i += 4) sum += buf[i] * buf[i];
    const t = performance.now();
    if (Math.sqrt(sum / (buf.length / 4)) > GATE_LEVEL) loudAt = t;
    if (t - loudAt > 500) return;
    const d = pack(buf, rate);
    const to = [...relayTo];
    const out = new Uint8Array(2 + to.length * 2 + d.length);
    const dv = new DataView(out.buffer);
    out[0] = 1;
    out[1] = to.length;
    to.forEach((id, i) => dv.setUint16(2 + i * 2, id));
    out.set(d, 2 + to.length * 2);
    sendBinary(out.buffer);
  }
  async function playChunk(from, u8) {
    const p = V.peers.get(from);
    if (!p || !V.joined) return;
    if (!p.relay) useRelay(from, false);
    if (!(await loadWorklet())) return;
    const ctx = audioCtx();
    if (!p.player) {
      try {
        p.player = new AudioWorkletNode(ctx, 'ry-play', { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1] });
        p.gain = ctx.createGain();
        p.player.connect(p.gain);
        p.gain.connect(ctx.destination);
        applyVolume(from);
      } catch (e) {
        console.warn('voice relay player', e);
        return;
      }
    }
    if (ctx.state !== 'running' && ctx.resume) ctx.resume().catch(() => {});
    const f = new Float32Array(u8.length);
    let sum = 0;
    for (let i = 0; i < u8.length; i++) {
      const v = MU[u8[i]];
      f[i] = v;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / Math.max(1, u8.length));
    p.rlvl = rms;
    p.rAt = performance.now();
    if (rms > SPEAK_LEVEL) p.heardAt = p.rAt;
    p.player.port.postMessage(f, [f.buffer]);
  }

  async function onSignal(from, data) {
    if (!V.joined) return;
    const p = peer(from);
    try {
      if (data.relay) {
        useRelay(from, false);
        return;
      }
      if (data.sdp) {
        await p.pc.setRemoteDescription(data.sdp);
        for (const c of p.pending.splice(0)) await p.pc.addIceCandidate(c).catch(() => {});
        if (data.sdp.type === 'offer') {
          const ans = await p.pc.createAnswer();
          await p.pc.setLocalDescription(ans);
          signal(from, { sdp: p.pc.localDescription.toJSON() });
        }
      } else if (data.candidate) {
        if (p.pc.remoteDescription) await p.pc.addIceCandidate(data.candidate).catch(() => {});
        else p.pending.push(data.candidate);
      }
    } catch (e) {
      console.warn('voice signal', e);
    }
  }

  function handle(m) {
    switch (m.t) {
      case 'vjoined':
        if (waitJoin) waitJoin.resolve(m);
        return true;
      case 'vsignal':
        onSignal(m.from, m.data || {});
        return true;
      case 'vleft':
        dropPeer(m.vid);
        onChange('peers');
        return true;
      case 'vroster':
        sync(m.list);
        return true;
      default:
        return false;
    }
  }
  function joinError(message) {
    if (waitJoin) waitJoin.reject(new Error(message));
  }
  function handleBinary(buf) {
    const u8 = new Uint8Array(buf);
    if (u8.length < 4 || u8[0] !== 1) return;
    playChunk((u8[1] << 8) | u8[2], u8.subarray(3));
  }

  async function join(existing = null) {
    if (V.joined || V.joining) return { ok: true };
    V.joining = true;
    onChange('state');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Браузер не даёт доступ к микрофону. Откройте игру по https и в обычном окне браузера.');
      V.stream = existing || (await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }));
      if (audioCtx().resume) audioCtx().resume();
      selfAnalyser = meter(V.stream);
      const r = await new Promise((resolve, reject) => {
        waitJoin = { resolve, reject };
        send({ t: 'vjoin', muted: V.muted });
        setTimeout(() => reject(new Error('Сервер не ответил. Попробуйте ещё раз.')), 8000);
      }).finally(() => (waitJoin = null));
      if (Array.isArray(r.ice) && r.ice.length) ice = r.ice;
      V.joined = true;
      V.me = r.me;
      loadWorklet();
      V.stream.getAudioTracks().forEach((t) => (t.enabled = !V.muted));
      for (const id of r.peers) {
        const p = peer(id);
        const offer = await p.pc.createOffer();
        await p.pc.setLocalDescription(offer);
        signal(id, { sdp: p.pc.localDescription.toJSON() });
      }
      meterTimer ||= setInterval(tickMeters, 120);
      return { ok: true };
    } catch (e) {
      if (!existing) stopStream();
      const msg = e && e.name === 'NotAllowedError' ? 'Без разрешения на микрофон голосовой чат не включится. Разрешите микрофон в настройках браузера для этого сайта.' : e && e.name === 'NotFoundError' ? 'Микрофон не найден. Подключите его и попробуйте снова.' : (e && e.message) || 'Не удалось включить голосовой чат';
      onError(msg);
      return { ok: false, error: msg };
    } finally {
      V.joining = false;
      onChange('state');
    }
  }
  function stopStream() {
    stopCapture();
    if (V.stream) V.stream.getTracks().forEach((t) => t.stop());
    V.stream = null;
    selfAnalyser = null;
  }
  function cleanup() {
    for (const id of [...V.peers.keys()]) dropPeer(id);
    relayTo.clear();
    stopCapture();
    stopStream();
    clearInterval(meterTimer);
    meterTimer = null;
    V.joined = false;
    V.me = null;
    V.selfSpeaking = false;
  }
  function leave(silent) {
    if (!V.joined) return;
    if (!silent) send({ t: 'vleave' });
    cleanup();
    onChange('left');
  }
  function setMuted(m) {
    V.muted = !!m;
    if (V.stream) V.stream.getAudioTracks().forEach((t) => (t.enabled = !V.muted));
    if (V.joined) send({ t: 'vmute', muted: V.muted });
    onChange('mute');
  }
  function reconnected() {
    if (!V.joined) return;
    const s = V.stream;
    for (const id of [...V.peers.keys()]) dropPeer(id);
    relayTo.clear();
    stopCapture();
    V.joined = false;
    join(s);
  }
  function sync(list) {
    V.roster = list || [];
    if (V.joined) {
      const ids = new Set(V.roster.map((p) => p.vid));
      for (const id of [...V.peers.keys()]) if (!ids.has(id)) dropPeer(id);
    }
    onChange('roster');
  }
  function level(vid) {
    let rms = 0;
    if (vid === V.me) rms = V.muted ? 0 : levelOf(selfAnalyser);
    else {
      const p = V.peers.get(vid);
      if (!p) return 0;
      rms = p.relay ? (performance.now() - (p.rAt || 0) < 220 ? p.rlvl || 0 : 0) : levelOf(p.analyser);
    }
    return Math.max(0, Math.min(1, (rms - 0.012) / 0.14));
  }
  return {
    state: V, level, join, leave, setMuted, handle, handleBinary, reconnected, applyVolume, joinError,
    isSpeaking: (vid) => (vid === V.me ? V.selfSpeaking : V.speaking.has(vid)),
    viaRelay: (vid) => !!(V.peers.get(vid) && V.peers.get(vid).relay),
    /** игрок комнаты → его номер в голосовом чате */
    vidOf: (pid) => {
      const m = V.roster.find((r) => r.pid === pid);
      return m ? m.vid : null;
    },
    pidOf: (vid) => {
      const m = V.roster.find((r) => r.vid === vid);
      return m ? m.pid : null;
    }
  };
}
