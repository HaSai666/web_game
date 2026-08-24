/*
 * Quiet anomalies instead of jump scares.
 * The fear should come from noticing a mismatch in a familiar archive. Every
 * event is short, optional, and respects the existing audio mute switch.
 */
(function () {
  "use strict";
  var observer = null;
  var lastMirror = 0;

  function muted() { return localStorage.getItem("dy_mute") === "1"; }
  function audioPulse(kind) {
    if (muted()) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var c;
    try { c = new AC(); } catch (e) { return; }
    var now = c.currentTime, out = c.createGain();
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(kind === "deep" ? 0.075 : 0.035, now + 0.025);
    out.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "deep" ? 1.2 : .42));
    out.connect(c.destination);
    var o = c.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(kind === "deep" ? 54 : 240, now);
    o.frequency.exponentialRampToValueAtTime(kind === "deep" ? 31 : 120, now + .7);
    o.connect(out); o.start(now); o.stop(now + 1.3);
    setTimeout(function () { try { c.close(); } catch (e2) {} }, 1600);
  }
  function overlay() {
    var el = document.getElementById("anomaly-overlay");
    if (el) return el;
    el = document.createElement("div");
    el.id = "anomaly-overlay";
    el.innerHTML = '<img class="anomaly-image" alt=""><span class="anomaly-note"></span>';
    document.body.appendChild(el);
    return el;
  }
  function showPhoto(file, duration, note, kind) {
    var el = overlay(), image = el.querySelector(".anomaly-image"), label = el.querySelector(".anomaly-note");
    image.src = "../assets/img/" + file;
    image.alt = "档案图像短暂重读";
    label.textContent = note || "图像读取中";
    el.classList.add("is-visible");
    audioPulse(kind || "soft");
    setTimeout(function () {
      el.classList.remove("is-visible");
      setTimeout(function () { image.removeAttribute("src"); }, 180);
    }, duration || 680);
  }
  function once(key) {
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1"); return true;
    } catch (e) { return true; }
  }
  function currentHash() { return location.hash || "#/"; }
  function setupMain() {
    if (observer) { observer.disconnect(); observer = null; }
    if (currentHash().indexOf("thread/t_main") === -1) return;
    var floor = document.querySelector('[data-floor="36"]') || document.getElementById("next-floor-btn");
    if (!floor || !once("archive_anomaly_floor36")) return;
    var target = floor.closest ? floor.closest(".floor") || floor : floor;
    observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) if (entries[i].isIntersecting) {
        observer.disconnect();
        setTimeout(function () { showPhoto("corner-v2.jpg", 820, "附件重读 / 时间字段：03:44", "soft"); }, 1500);
        break;
      }
    }, { threshold: .55 });
    observer.observe(target);
  }
  function setupFinal() {
    var hash = currentHash();
    if (hash.indexOf("thread/t_37") === -1 && hash !== "#/37" && hash.indexOf("#/37/") !== 0) return;
    if (!once("archive_anomaly_final")) return;
    setTimeout(function () {
      var view = document.getElementById("view");
      if (view) view.classList.add("t37-watch");
      audioPulse("deep");
      document.title = "它在数你";
      setTimeout(function () { document.title = "莲灯夜话 - 只读档案"; }, 1600);
    }, 3200);
  }
  function setupMirror() {
    if (currentHash().indexOf("thread/t_exp3") === -1) return;
    var images = document.querySelectorAll(".p-cont .photo img");
    for (var i = 0; i < images.length; i++) {
      if (images[i].getAttribute("data-mirror-bound") === "1") continue;
      images[i].setAttribute("data-mirror-bound", "1");
      images[i].addEventListener("click", function () {
        var now = Date.now();
        if (now - lastMirror < 9000) return;
        lastMirror = now;
        showPhoto("bathroom-v2.jpg", 360, "反射延迟：未记录", "soft");
        this.classList.add("sc-tint");
        var self = this;
        setTimeout(function () { self.classList.remove("sc-tint"); }, 900);
      });
    }
  }
  function setupIdleTitle() {
    if (document.body.getAttribute("data-archive-depth") !== "3") return;
    if (!once("archive_anomaly_idle")) return;
    setTimeout(function () {
      if (document.hidden) return;
      var old = document.title;
      document.title = "它在数你";
      setTimeout(function () { document.title = old; }, 900);
    }, 38000);
  }
  function setup() {
    setupMain(); setupFinal(); setupMirror(); setupIdleTitle();
  }
  window.addEventListener("hashchange", function () { setTimeout(setup, 100); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(setup, 180); });
  else setTimeout(setup, 180);
  window.ArchiveAtmosphere = { showPhoto: showPhoto, pulse: audioPulse };
})();
