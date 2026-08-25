/* Six-stage procedural room tone. Audio begins after the first user gesture,
 * never spikes in volume and always has a visual or textual equivalent. */
(function () {
  "use strict";

  var ctx = null, master = null, started = false;
  var mutedKey = "dy_mute", stageNow = 0, ambientTimer = null, ambientIndex = 0;
  var layers = {};

  function isMuted() {
    try { return localStorage.getItem(mutedKey) === "1"; }
    catch (e) { return false; }
  }
  function stage() {
    if (window.ArchiveEvidenceState) return window.ArchiveEvidenceState.get();
    return parseInt(document.body && document.body.getAttribute("data-haunt-stage") || "0", 10) || 0;
  }
  function equivalent(kind) {
    var text = {
      knock: "监视条记录到三次无方向敲击。",
      step: "页面外多出一次没有方向的脚步。",
      key: "回复框的光标自行向下一行移动。",
      fifth: "报数字段先于声音更新。",
      breathe: "在线人数由空白恢复为5。",
      glass: "附件读取记录出现一次玻璃摩擦。"
    }[kind] || "监视条在没有声音时跳动了一次。";
    if (window.ArchiveCorruption && window.ArchiveCorruption.showEquivalent) window.ArchiveCorruption.showEquivalent(text);
    else {
      var node = document.getElementById("monitor-copy");
      if (node) node.textContent = text;
    }
  }

  function seededNoise(seconds, brown) {
    var length = Math.floor(ctx.sampleRate * seconds);
    var buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = buffer.getChannelData(0), last = 0, seed = 370344;
    for (var i = 0; i < length; i++) {
      seed = (seed * 48271) % 2147483647;
      var value = (seed / 2147483647) * 2 - 1;
      if (brown) {
        last = (last + .018 * value) / 1.018;
        data[i] = last * 3.4;
      } else data[i] = value;
    }
    return buffer;
  }
  function gainTo(node, value, seconds) {
    if (!ctx || !node) return;
    var now = ctx.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(Math.max(.0001, node.gain.value), now);
    node.gain.linearRampToValueAtTime(value, now + (seconds || .8));
  }
  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    master = ctx.createGain();
    master.gain.value = isMuted() ? 0 : .065;
    master.connect(ctx.destination);

    layers.drone = ctx.createGain(); layers.drone.gain.value = .12;
    var low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 128; low.Q.value = .55;
    var a = ctx.createOscillator(), b = ctx.createOscillator();
    a.type = "sine"; b.type = "sine"; a.frequency.value = 46.8; b.frequency.value = 47.15;
    a.connect(layers.drone); b.connect(layers.drone); layers.drone.connect(low); low.connect(master); a.start(); b.start();

    layers.room = ctx.createGain(); layers.room.gain.value = .04;
    var room = ctx.createBufferSource(); room.buffer = seededNoise(6, true); room.loop = true;
    var roomFilter = ctx.createBiquadFilter(); roomFilter.type = "lowpass"; roomFilter.frequency.value = 250; roomFilter.Q.value = .4;
    room.connect(roomFilter); roomFilter.connect(layers.room); layers.room.connect(master); room.start();

    layers.fx = ctx.createGain(); layers.fx.gain.value = 1; layers.fx.connect(master);
    applyStage(true);
    return true;
  }

  function tone(freq, duration, volume, type, destination, delay) {
    if (!ctx) return;
    var at = ctx.currentTime + (delay || 0), oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(freq, at);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(18, freq * .58), at + duration);
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain); gain.connect(destination || layers.fx);
    oscillator.start(at); oscillator.stop(at + duration + .04);
  }
  function noiseHit(delay, frequency, volume, duration) {
    if (!ctx) return;
    var at = ctx.currentTime + (delay || 0), source = ctx.createBufferSource();
    source.buffer = seededNoise(.55, false);
    var filter = ctx.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = frequency; filter.Q.value = 4;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(volume, at + .012); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    source.connect(filter); filter.connect(gain); gain.connect(layers.fx); source.start(at); source.stop(at + duration + .05);
  }

  function cue(kind) {
    if (isMuted() || !ctx) { equivalent(kind); return; }
    if (ctx.state === "suspended") ctx.resume();
    if (kind === "knock") {
      noiseHit(0, 112, .05, .18); noiseHit(.43, 138, .042, .18); noiseHit(.91, 92, .055, .22);
    } else if (kind === "step") {
      noiseHit(0, 84, .04, .24);
    } else if (kind === "key") {
      tone(720, .075, .035, "square"); tone(410, .06, .018, "triangle", layers.fx, .07);
    } else if (kind === "glass") {
      tone(286, .72, .018, "sine"); tone(303, .66, .012, "sine", layers.fx, .1);
    } else if (kind === "fifth") {
      tone(50, .78, .10, "sine"); noiseHit(.36, 176, .035, .7);
    } else if (kind === "breathe") {
      noiseHit(0, 210, .032, 1.2);
    } else if (kind === "deep") {
      tone(46, .64, .09, "sine");
    } else {
      tone(148, .28, .026, "triangle");
    }
  }

  function scheduleAmbient() {
    if (ambientTimer) clearTimeout(ambientTimer);
    if (!started || stageNow < 2 || stageNow >= 5) return;
    var intervals = [78000, 69000, 61000, 54000];
    ambientTimer = setTimeout(function () {
      var patterns = stageNow === 2 ? ["step", "knock"] : (stageNow === 3 ? ["knock", "glass", "step"] : ["key", "breathe", "knock"]);
      cue(patterns[ambientIndex % patterns.length]);
      ambientIndex++;
      scheduleAmbient();
    }, intervals[Math.min(intervals.length - 1, Math.max(0, stageNow - 2))]);
  }

  function enterFinalSilence(previous) {
    if (!ctx || previous >= 5) return;
    gainTo(master, 0, .35);
    equivalent("breathe");
    setTimeout(function () {
      if (!ctx || isMuted()) return;
      master.gain.setValueAtTime(.032, ctx.currentTime);
      cue("breathe");
    }, 4200);
  }
  function applyStage(initial) {
    var previous = stageNow;
    stageNow = Math.max(stageNow, stage());
    if (ctx) {
      var drone = [.12, .15, .20, .24, .28, 0][stageNow];
      var room = [.035, .04, .046, .052, .058, 0][stageNow];
      gainTo(layers.drone, drone, initial ? .05 : 1.6);
      gainTo(layers.room, room, initial ? .05 : 1.6);
      if (stageNow === 5) enterFinalSilence(previous);
      else gainTo(master, isMuted() ? 0 : .065, .45);
    }
    if (!initial && stageNow > previous && stageNow === 2) cue("soft");
    if (!initial && stageNow > previous && stageNow === 3) cue("fifth");
    if (!initial && stageNow > previous && stageNow === 4) cue("key");
    scheduleAmbient();
    updateButton();
  }

  function start() {
    if (started) {
      if (ctx && ctx.state === "suspended") ctx.resume();
      return;
    }
    started = true;
    if (!build()) { started = false; return; }
    window.removeEventListener("pointerdown", start);
    window.removeEventListener("keydown", start);
  }
  function updateButton() {
    var button = document.getElementById("audio-toggle");
    if (button) {
      button.textContent = isMuted() ? "环境音：静音" : "环境音：开";
      button.setAttribute("aria-pressed", isMuted() ? "true" : "false");
    }
    if (master && stageNow < 5) gainTo(master, isMuted() ? 0 : .065, .18);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.createElement("button");
    button.id = "audio-toggle"; button.type = "button"; button.title = "切换环境音";
    button.addEventListener("click", function () {
      try { localStorage.setItem(mutedKey, isMuted() ? "0" : "1"); } catch (e) {}
      start(); updateButton();
    });
    document.body.appendChild(button); updateButton();
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
  });
  window.addEventListener("archiveevidencechange", function () { setTimeout(function () { applyStage(false); }, 40); });
  window.addEventListener("hashchange", function () { setTimeout(function () { applyStage(false); }, 100); });
  window.ArchiveAudio = { pulse: cue, cue: cue, refresh: applyStage };
})();
