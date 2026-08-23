/* ===== 程序化环境音 v2 =====
   分层：drone(常驻) + 房间底噪(常驻) + 八音盒(T2+) + 心跳/耳语/高频(T3)
   首次点击/按键后启动；右下角开关；层级随页面(tier)自动切换。 */

(function () {
  var ctx = null, master = null, started = false;
  var layerGain = {}; /* drone, noise, music, heart, whisper, high */
  var currentTier = 1;

  function tier() {
    var c = document.body ? document.body.className : "";
    if (c.indexOf("t3") !== -1) return 3;
    if (c.indexOf("t2") !== -1) return 2;
    return 1;
  }
  function muted() { return localStorage.getItem("dy_mute") === "1"; }

  function makeNoiseBuffer(seconds, brown) {
    var len = ctx.sampleRate * seconds;
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    return buf;
  }

  function buildGraph() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted() ? 0 : 0.14;
    master.connect(ctx.destination);

    /* drone */
    var dg = ctx.createGain(); dg.gain.value = 0.5; layerGain.drone = dg;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 160;
    [55, 55.4].forEach(function (f) {
      var o = ctx.createOscillator(); o.frequency.value = f; o.type = "sine";
      o.connect(dg); o.start();
    });
    dg.connect(lp); lp.connect(master);

    /* 房间底噪 */
    var ng = ctx.createGain(); ng.gain.value = 0.05; layerGain.noise = ng;
    var nsrc = ctx.createBufferSource(); nsrc.buffer = makeNoiseBuffer(4, true); nsrc.loop = true;
    var nf = ctx.createBiquadFilter(); nf.type = "lowpass"; nf.frequency.value = 320; nf.Q.value = 0.4;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    var lg = ctx.createGain(); lg.gain.value = 140;
    lfo.connect(lg); lg.connect(nf.frequency); lfo.start();
    nsrc.connect(nf); nf.connect(ng); ng.connect(master); nsrc.start();

    /* 八音盒层（T2+，初始静音） */
    var mg = ctx.createGain(); mg.gain.value = 0; layerGain.music = mg; mg.connect(master);
    /* 心跳层（T3） */
    var hg = ctx.createGain(); hg.gain.value = 0; layerGain.heart = hg; hg.connect(master);
    /* 耳语层（T3） */
    var wg = ctx.createGain(); wg.gain.value = 0; layerGain.whisper = wg; wg.connect(master);
    /* 高频细丝（T3） */
    var sg = ctx.createGain(); sg.gain.value = 0; layerGain.high = sg; sg.connect(master);
    var h = ctx.createOscillator(); h.frequency.value = 2900; h.type = "sine";
    var vib = ctx.createOscillator(); vib.frequency.value = 0.13;
    var vg = ctx.createGain(); vg.gain.value = 260;
    vib.connect(vg); vg.connect(h.frequency);
    h.connect(sg); h.start(); vib.start();

    applyTier(tier());
    scheduleMusic(); scheduleHeart(); scheduleWhisper(); scheduleEvent();
    return true;
  }

  function applyTier(t) {
    currentTier = t;
    if (!ctx) return;
    var now = ctx.currentTime;
    layerGain.music.gain.linearRampToValueAtTime(t >= 2 ? 1 : 0, now + 2);
    layerGain.heart.gain.linearRampToValueAtTime(t >= 3 ? 1 : 0, now + 2);
    layerGain.whisper.gain.linearRampToValueAtTime(t >= 3 ? 1 : 0, now + 2);
    layerGain.high.gain.linearRampToValueAtTime(t >= 3 ? 0.006 : 0, now + 2);
    layerGain.noise.gain.linearRampToValueAtTime(t >= 3 ? 0.075 : 0.05, now + 2);
  }

  /* --- 八音盒：小调、稀疏、偶尔弹错 --- */
  var SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880]; /* A C D E G A */
  function pluck(freq, vol) {
    var now = ctx.currentTime;
    [1, 3].forEach(function (mult, i) {
      var o = ctx.createOscillator(); o.type = "sine";
      o.frequency.value = freq * mult * (1 + (Math.random() - 0.5) * 0.004);
      var g = ctx.createGain();
      g.gain.setValueAtTime(vol / (i + 1), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      o.connect(g); g.connect(layerGain.music);
      o.start(now); o.stop(now + 1.7);
    });
  }
  function scheduleMusic() {
    setTimeout(function () {
      if (!muted() && currentTier >= 2) {
        var f = SCALE[Math.floor(Math.random() * SCALE.length)];
        if (Math.random() < 0.12) f *= 1.06; /* 弹错半个音 */
        pluck(f, 0.05);
        if (Math.random() < 0.15) pluck(f * 1.19, 0.03); /* 不和谐双音 */
      }
      scheduleMusic();
    }, 4000 + Math.random() * 7000);
  }

  /* --- 心跳：lub-dub，偶尔漏一拍 --- */
  function thump(t0, vol) {
    var o = ctx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(58, t0);
    o.frequency.exponentialRampToValueAtTime(38, t0 + 0.12);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    o.connect(g); g.connect(layerGain.heart);
    o.start(t0); o.stop(t0 + 0.25);
  }
  function scheduleHeart() {
    setTimeout(function () {
      if (!muted() && currentTier >= 3 && Math.random() > 0.13) { /* 13%漏拍 */
        var now = ctx.currentTime;
        thump(now, 0.5);
        thump(now + 0.24, 0.32);
      }
      scheduleHeart();
    }, 900 + Math.random() * 300);
  }

  /* --- 耳语：带通噪声扫频 --- */
  function scheduleWhisper() {
    setTimeout(function () {
      if (!muted() && currentTier >= 3) {
        var now = ctx.currentTime;
        var s = ctx.createBufferSource(); s.buffer = makeNoiseBuffer(2.5, false);
        var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 6;
        f.frequency.setValueAtTime(500, now);
        f.frequency.linearRampToValueAtTime(1400, now + 1.2);
        f.frequency.linearRampToValueAtTime(700, now + 2.2);
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.028, now + 0.8);
        g.gain.linearRampToValueAtTime(0.0001, now + 2.4);
        s.connect(f); f.connect(g); g.connect(layerGain.whisper);
        s.start(now);
      }
      scheduleWhisper();
    }, 22000 + Math.random() * 26000);
  }

  /* --- 随机闷响/拖拽（全层） --- */
  function scheduleEvent() {
    setTimeout(function () {
      if (!muted()) playEvent();
      scheduleEvent();
    }, (currentTier === 3 ? 12000 : 22000) + Math.random() * 30000);
  }
  function playEvent() {
    if (!ctx) return;
    var now = ctx.currentTime;
    if (Math.random() < 0.6) {
      var o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(46, now);
      o.frequency.exponentialRampToValueAtTime(30, now + 1.4);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      o.connect(g); g.connect(master);
      o.start(now); o.stop(now + 1.7);
    } else {
      var s = ctx.createBufferSource(); s.buffer = makeNoiseBuffer(2, false);
      var dd = s.buffer.getChannelData(0);
      for (var i = 0; i < dd.length; i++) dd[i] *= (1 - i / dd.length);
      var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 240; f.Q.value = 2.5;
      var g2 = ctx.createGain(); g2.gain.value = 0.10;
      s.connect(f); f.connect(g2); g2.connect(master);
      s.start(now);
    }
  }

  function start() {
    if (started) return;
    started = true;
    if (buildGraph()) {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    } else { started = false; }
  }
  function applyMute() {
    if (master) master.gain.value = muted() ? 0 : 0.14;
    var btn = document.getElementById("audio-toggle");
    if (btn) btn.textContent = muted() ? "声音：关" : "声音：开";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.createElement("button");
    btn.id = "audio-toggle"; btn.type = "button";
    btn.addEventListener("click", function () {
      localStorage.setItem("dy_mute", muted() ? "0" : "1");
      applyMute();
    });
    document.body.appendChild(btn);
    applyMute();
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    window.addEventListener("hashchange", function () {
      setTimeout(function () { applyTier(tier()); }, 50);
    });
  });
})();
