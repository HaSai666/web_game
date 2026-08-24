/* Restrained procedural room tone. It starts only after a user gesture. */
(function () {
  "use strict";
  var ctx = null, master = null, started = false, mutedKey = "dy_mute";
  var gains = {}, tierNow = 1;

  function isMuted() { return localStorage.getItem(mutedKey) === "1"; }
  function getTier() {
    var c = (document.body && document.body.className) || "";
    if (c.indexOf("t3") !== -1 || document.body.getAttribute("data-archive-depth") === "3") return 3;
    if (c.indexOf("t2") !== -1 || document.body.getAttribute("data-archive-depth") === "2") return 2;
    return 1;
  }
  function noise(seconds, brown) {
    var length = Math.floor(ctx.sampleRate * seconds), buffer = ctx.createBuffer(1, length, ctx.sampleRate), data = buffer.getChannelData(0), last = 0;
    for (var i = 0; i < length; i++) {
      var v = Math.random() * 2 - 1;
      if (brown) { last = (last + .018 * v) / 1.018; data[i] = last * 3.6; }
      else data[i] = v;
    }
    return buffer;
  }
  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain(); master.gain.value = isMuted() ? 0 : .09; master.connect(ctx.destination);

    var drone = ctx.createGain(); drone.gain.value = .32; gains.drone = drone;
    var low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 145; low.Q.value = .5;
    [47, 47.35].forEach(function (freq) { var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq; o.connect(drone); o.start(); });
    drone.connect(low); low.connect(master);

    var room = ctx.createGain(); room.gain.value = .055; gains.room = room;
    var source = ctx.createBufferSource(); source.buffer = noise(5, true); source.loop = true;
    var filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 290; filter.Q.value = .35;
    source.connect(filter); filter.connect(room); room.connect(master); source.start();

    gains.music = ctx.createGain(); gains.music.gain.value = 0; gains.music.connect(master);
    gains.heart = ctx.createGain(); gains.heart.gain.value = 0; gains.heart.connect(master);
    applyTier(); scheduleNote(); schedulePulse(); scheduleRoomEvent();
    return true;
  }
  function applyTier() {
    tierNow = getTier();
    if (!ctx) return;
    var now = ctx.currentTime;
    gains.music.gain.linearRampToValueAtTime(tierNow >= 2 ? .40 : 0, now + 1.8);
    gains.heart.gain.linearRampToValueAtTime(tierNow >= 3 ? .20 : 0, now + 1.8);
    gains.room.gain.linearRampToValueAtTime(tierNow >= 3 ? .07 : .055, now + 1.8);
  }
  function note(freq, volume) {
    if (!ctx || isMuted() || tierNow < 2) return;
    var now = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(volume, now + .025); g.gain.exponentialRampToValueAtTime(.0001, now + 2.2);
    o.connect(g); g.connect(gains.music); o.start(now); o.stop(now + 2.4);
  }
  function scheduleNote() {
    setTimeout(function () {
      if (tierNow >= 2 && Math.random() > .2) {
        var scale = [196, 233, 261.6, 293.7, 349.2];
        var f = scale[Math.floor(Math.random() * scale.length)];
        if (Math.random() < .16) f *= .94;
        note(f, .025);
      }
      scheduleNote();
    }, 9000 + Math.random() * 15000);
  }
  function thump(at, volume) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine";
    o.frequency.setValueAtTime(54, at); o.frequency.exponentialRampToValueAtTime(34, at + .18);
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(volume, at + .03); g.gain.exponentialRampToValueAtTime(.0001, at + .32);
    o.connect(g); g.connect(gains.heart); o.start(at); o.stop(at + .36);
  }
  function pulse(kind) {
    if (!ctx || isMuted()) return;
    var now = ctx.currentTime, deep = kind === "deep";
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = deep ? "sine" : "triangle";
    o.frequency.setValueAtTime(deep ? 48 : 156, now);
    o.frequency.exponentialRampToValueAtTime(deep ? 27 : 82, now + (deep ? .48 : .22));
    g.gain.setValueAtTime(.0001, now);
    g.gain.exponentialRampToValueAtTime(deep ? .18 : .055, now + .025);
    g.gain.exponentialRampToValueAtTime(.0001, now + (deep ? .72 : .34));
    o.connect(g); g.connect(deep ? gains.heart : gains.music);
    o.start(now); o.stop(now + (deep ? .8 : .4));
  }
  function schedulePulse() {
    setTimeout(function () {
      if (tierNow >= 3 && !isMuted() && Math.random() > .18) {
        var now = ctx.currentTime; thump(now, .13); thump(now + .23, .08);
      }
      schedulePulse();
    }, 2900 + Math.random() * 2100);
  }
  function scheduleRoomEvent() {
    setTimeout(function () {
      if (ctx && !isMuted() && tierNow >= 2 && Math.random() > .28) {
        var now = ctx.currentTime, src = ctx.createBufferSource(); src.buffer = noise(1.5, false);
        var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = tierNow === 3 ? 180 : 120; f.Q.value = 3;
        var g = ctx.createGain(); g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(tierNow === 3 ? .045 : .024, now + .08); g.gain.exponentialRampToValueAtTime(.0001, now + 1.2);
        src.connect(f); f.connect(g); g.connect(master); src.start(now);
      }
      scheduleRoomEvent();
    }, 18000 + Math.random() * 24000);
  }
  function start() {
    if (started) return;
    started = true;
    if (!build()) { started = false; return; }
    window.removeEventListener("pointerdown", start); window.removeEventListener("keydown", start);
  }
  function updateButton() {
    var btn = document.getElementById("audio-toggle");
    if (btn) btn.textContent = isMuted() ? "声音：关" : "声音：开";
    if (master) master.gain.value = isMuted() ? 0 : .09;
  }
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.createElement("button"); btn.id = "audio-toggle"; btn.type = "button"; btn.setAttribute("aria-label", "切换环境音");
    btn.addEventListener("click", function () { localStorage.setItem(mutedKey, isMuted() ? "0" : "1"); updateButton(); });
    document.body.appendChild(btn); updateButton();
    window.addEventListener("pointerdown", start); window.addEventListener("keydown", start);
    window.addEventListener("hashchange", function () { setTimeout(applyTier, 60); });
  });
  window.ArchiveAudio = { pulse: pulse, refresh: applyTier };
})();
