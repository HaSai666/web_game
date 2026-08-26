/* Six-stage procedural room tone. Audio begins after the first user gesture,
 * never spikes in volume and always has a visual or textual equivalent. */
(function () {
  "use strict";

  var ctx = null, master = null, started = false;
  var mutedKey = "dy_mute", levelKey = "dy_audio_level", stageNow = 0, ambientTimer = null, ambientIndex = 0;
  var layers = {};

  function audioLevel() {
    try {
      var saved = localStorage.getItem(levelKey);
      if (saved !== null) return Math.max(0, Math.min(3, parseInt(saved, 10) || 0));
      return localStorage.getItem(mutedKey) === "1" ? 0 : 2;
    } catch (e) { return 2; }
  }
  function isMuted() {
    return audioLevel() === 0;
  }
  function saveLevel(value) {
    value = Math.max(0, Math.min(3, parseInt(value, 10) || 0));
    try {
      localStorage.setItem(levelKey, String(value));
      localStorage.setItem(mutedKey, value === 0 ? "1" : "0");
    } catch (e) {}
  }
  function masterTarget(scale) {
    var values = [0, .044, .073, .105];
    var value = values[audioLevel()] || 0;
    if (stageNow >= 4 && stageNow < 5) value *= 1.08;
    return value * (scale == null ? 1 : scale);
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
      whisper: "左右声道各记录到一段无法转写的气音。",
      heartbeat: "页面底部的低频指示连续跳动两次。",
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
    master.gain.value = masterTarget();
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

    /* A nearly sub-audible fifth presence. It is absent in the clean archive,
       enters below speech range, and becomes a slow pressure pulse late on. */
    layers.presence = ctx.createGain(); layers.presence.gain.value = 0;
    var presenceFilter = ctx.createBiquadFilter(); presenceFilter.type = "lowpass"; presenceFilter.frequency.value = 68;
    var presence = ctx.createOscillator(); presence.type = "sine"; presence.frequency.value = 34.4;
    var presenceLfo = ctx.createOscillator(), presenceDepth = ctx.createGain(), presencePulse = ctx.createGain();
    presenceLfo.type = "sine"; presenceLfo.frequency.value = .17; presenceDepth.gain.value = .006; presencePulse.gain.value = .009;
    presence.connect(presenceFilter); presenceFilter.connect(presencePulse); presencePulse.connect(layers.presence); layers.presence.connect(master);
    presenceLfo.connect(presenceDepth); presenceDepth.connect(presencePulse.gain);
    presence.start(); presenceLfo.start();

    layers.wire = ctx.createGain(); layers.wire.gain.value = 0;
    var wire = ctx.createBufferSource(); wire.buffer = seededNoise(5, false); wire.loop = true;
    var wireFilter = ctx.createBiquadFilter(); wireFilter.type = "bandpass"; wireFilter.frequency.value = 1160; wireFilter.Q.value = .42;
    wire.connect(wireFilter); wireFilter.connect(layers.wire); layers.wire.connect(master); wire.start();

    layers.fx = ctx.createGain(); layers.fx.gain.value = 1; layers.fx.connect(master);
    applyStage(true);
    return true;
  }

  function connectSpatial(node, destination, pan) {
    var output = destination || layers.fx;
    if (ctx && typeof ctx.createStereoPanner === "function" && isFinite(pan)) {
      var panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(panner); panner.connect(output);
    } else node.connect(output);
  }
  function tone(freq, duration, volume, type, destination, delay, pan) {
    if (!ctx) return;
    var at = ctx.currentTime + (delay || 0), oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(freq, at);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(18, freq * .58), at + duration);
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain); connectSpatial(gain, destination, pan);
    oscillator.start(at); oscillator.stop(at + duration + .04);
  }
  function noiseHit(delay, frequency, volume, duration, pan) {
    if (!ctx) return;
    var at = ctx.currentTime + (delay || 0), source = ctx.createBufferSource();
    source.buffer = seededNoise(.55, false);
    var filter = ctx.createBiquadFilter(); filter.type = "bandpass"; filter.frequency.value = frequency; filter.Q.value = 4;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(volume, at + .012); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    source.connect(filter); filter.connect(gain); connectSpatial(gain, layers.fx, pan); source.start(at); source.stop(at + duration + .05);
  }

  function cue(kind) {
    if (isMuted() || !ctx) { equivalent(kind); return; }
    if (ctx.state === "suspended") ctx.resume();
    if (kind === "knock") {
      noiseHit(0, 112, .052, .18, -.88); noiseHit(.43, 138, .044, .18, .72); noiseHit(.91, 92, .058, .22, -.18);
    } else if (kind === "step") {
      noiseHit(0, 84, .044, .24, ambientIndex % 2 ? .78 : -.78);
    } else if (kind === "key") {
      tone(720, .075, .038, "square", layers.fx, 0, .38); tone(410, .06, .021, "triangle", layers.fx, .07, -.32);
    } else if (kind === "glass") {
      tone(286, .72, .021, "sine", layers.fx, 0, -.72); tone(303, .66, .015, "sine", layers.fx, .1, .58);
    } else if (kind === "fifth") {
      tone(50, .84, .105, "sine", layers.fx, 0, 0); noiseHit(.36, 176, .038, .7, .12);
    } else if (kind === "breathe") {
      noiseHit(0, 210, .036, 1.35, ambientIndex % 2 ? -.92 : .92);
    } else if (kind === "whisper") {
      noiseHit(0, 840, .024, 1.55, -.84); noiseHit(.28, 1280, .015, 1.15, .62);
      tone(72, 1.3, .025, "sine", layers.fx, .08, 0);
    } else if (kind === "heartbeat") {
      tone(34, .24, .095, "sine", layers.fx, 0, -.08); tone(31, .28, .072, "sine", layers.fx, .34, .08);
    } else if (kind === "deep") {
      tone(46, .64, .09, "sine", layers.fx, 0, 0);
    } else {
      tone(148, .28, .026, "triangle");
    }
  }

  function scheduleAmbient() {
    if (ambientTimer) clearTimeout(ambientTimer);
    if (!started || stageNow < 2 || stageNow >= 5) return;
    var intervals = [52000, 43000, 28500, 18500];
    ambientTimer = setTimeout(function () {
      var patterns = stageNow === 2 ? ["step", "knock", "glass"] :
        (stageNow === 3 ? ["knock", "whisper", "step", "glass"] : ["heartbeat", "breathe", "key", "whisper", "knock"]);
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
      master.gain.setValueAtTime(masterTarget(.42), ctx.currentTime);
      cue("breathe");
    }, 4200);
  }
  function applyStage(initial) {
    var previous = stageNow;
    stageNow = Math.max(stageNow, stage());
    if (ctx) {
      var drone = [.12, .15, .20, .24, .28, 0][stageNow];
      var room = [.035, .04, .046, .052, .058, 0][stageNow];
      var presence = [0, 0, .006, .014, .026, 0][stageNow];
      var wire = [0, 0, .003, .007, .012, 0][stageNow];
      gainTo(layers.drone, drone, initial ? .05 : 1.6);
      gainTo(layers.room, room, initial ? .05 : 1.6);
      gainTo(layers.presence, presence, initial ? .05 : 2.2);
      gainTo(layers.wire, wire, initial ? .05 : 2.2);
      if (stageNow === 5) enterFinalSilence(previous);
      else gainTo(master, masterTarget(), .45);
    }
    if (!initial && stageNow > previous && stageNow === 2) cue("soft");
    if (!initial && stageNow > previous && stageNow === 3) cue("fifth");
    if (!initial && stageNow > previous && stageNow === 4) { cue("heartbeat"); setTimeout(function () { cue("whisper"); }, 1050); }
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
      var labels = ["环境音：关", "环境音：低", "环境音：中", "环境音：强"];
      button.textContent = labels[audioLevel()];
      button.setAttribute("aria-pressed", isMuted() ? "true" : "false");
      button.setAttribute("aria-label", "环境音强度：" + labels[audioLevel()].split("：")[1] + "。点击切换下一档");
      button.title = "点击切换：关 / 低 / 中 / 强";
    }
    if (master && stageNow < 5) gainTo(master, masterTarget(), .18);
  }
  function duck() {
    if (master) gainTo(master, masterTarget(.12), .7);
  }
  function returnCue(level) {
    if (master && stageNow < 5) gainTo(master, masterTarget(), .9);
    setTimeout(function () { cue(level >= 4 ? "whisper" : "key"); }, 180);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.createElement("button");
    button.id = "audio-toggle"; button.type = "button"; button.title = "切换环境音";
    button.addEventListener("click", function () {
      saveLevel((audioLevel() + 1) % 4);
      start(); updateButton();
    });
    var nav = document.getElementById("navbar");
    (nav || document.body).appendChild(button); updateButton();
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
  });
  window.addEventListener("archiveevidencechange", function () { setTimeout(function () { applyStage(false); }, 40); });
  window.addEventListener("hashchange", function () { setTimeout(function () { applyStage(false); }, 100); });
  window.ArchiveAudio = { pulse: cue, cue: cue, refresh: applyStage, duck: duck, returnCue: returnCue, level: audioLevel };
})();
