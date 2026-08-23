/* ===== 惊吓模块：jump scare + 环境异变 ===== */
(function () {
  "use strict";

  /* ---------- 音效（尖啸/低鸣，遵守静音开关） ---------- */
  var actx = null;
  function ac() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function muted() { return localStorage.getItem("dy_mute") === "1"; }

  function shriek(intensity) {
    if (muted()) return;
    var c = ac(); if (!c) return;
    var now = c.currentTime;
    var out = c.createGain(); out.gain.value = 0.55 * intensity; out.connect(c.destination);

    /* 白噪尖啸 */
    var len = c.sampleRate * 0.5;
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var ns = c.createBufferSource(); ns.buffer = buf;
    var hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 700;
    ns.connect(hp); hp.connect(out); ns.start(now);

    /* 三条下滑锯齿（失谐"人声"感） */
    [0, 7, -5].forEach(function (dt) {
      var o = c.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(1500 * Math.pow(2, dt / 1200), now);
      o.frequency.exponentialRampToValueAtTime(620, now + 0.5);
      var g = c.createGain();
      g.gain.setValueAtTime(0.14 * intensity, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      o.connect(g); g.connect(out);
      o.start(now); o.stop(now + 0.6);
    });

    /* 低频砸击 */
    var o2 = c.createOscillator(); o2.type = "sine";
    o2.frequency.setValueAtTime(70, now);
    o2.frequency.exponentialRampToValueAtTime(28, now + 0.6);
    var g2 = c.createGain();
    g2.gain.setValueAtTime(0.7 * intensity, now);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    o2.connect(g2); g2.connect(out);
    o2.start(now); o2.stop(now + 0.75);
  }

  /* ---------- 全屏闪现 ---------- */
  function overlay() {
    var el = document.getElementById("scare-overlay");
    if (!el) {
      el = document.createElement("div");
      el.id = "scare-overlay";
      el.innerHTML = '<img id="scare-img" alt="">';
      document.body.appendChild(el);
    }
    return el;
  }
  function scare(img, ms, intensity, zoomTo) {
    var el = overlay();
    var im = document.getElementById("scare-img");
    im.src = "../assets/img/" + img;
    im.style.transform = "scale(1)";
    el.style.display = "block";
    shriek(intensity);
    /* 强制回流后做推近动画 */
    void el.offsetWidth;
    im.style.transition = "transform " + ms + "ms ease-in";
    im.style.transform = "scale(" + (zoomTo || 1.12) + ")";
    setTimeout(function () {
      el.style.display = "none";
      im.src = "";
    }, ms);
  }

  /* ---------- 触发器 ---------- */
  function tier() {
    var c = document.body.className || "";
    if (c.indexOf("t3") !== -1) return 3;
    if (c.indexOf("t2") !== -1) return 2;
    return 1;
  }
  function once(key) {
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
      return true;
    } catch (e) { return false; }
  }

  var observer = null;
  function setupTriggers() {
    var h = location.hash;

    /* t_main 第36楼：滚动到"到我了"后2.5秒 */
    if (h.indexOf("thread/t_main") !== -1 && !sessionStorage.getItem("sc_f36")) {
      setTimeout(function () {
        var anchor = document.getElementById("next-floor-btn");
        if (!anchor) return;
        var floor = anchor.closest ? anchor.closest(".floor") : null;
        var target = floor || anchor;
        if (observer) observer.disconnect();
        observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && once("sc_f36")) {
              observer.disconnect();
              setTimeout(function () { scare("corner_figure.jpg", 650, 1.0, 1.12); }, 2500);
            }
          });
        }, { threshold: 0.5 });
        observer.observe(target);
      }, 400);
    }

    /* t_37：进入4秒后，它走近了 */
    if ((h.indexOf("thread/t_37") !== -1 || h === "#/37") && !sessionStorage.getItem("sc_37")) {
      once("sc_37");
      setTimeout(function () { scare("corner_close.jpg", 850, 1.0, 1.22); }, 4000);
    }
  }

  /* t_exp3 镜子：点照片，她眨眼（短促亚感知闪现） */
  var lastMirror = 0;
  document.addEventListener("click", function (e) {
    if (location.hash.indexOf("thread/t_exp3") === -1) return;
    var t = e.target;
    if (!t || t.tagName !== "IMG") return;
    if (!t.closest || !t.closest(".photo")) return;
    var now = Date.now();
    if (now - lastMirror < 10000) return;
    lastMirror = now;
    scare("scare_face.jpg", 140, 0.5, 1.05);
    t.classList.add("sc-tint");
    setTimeout(function () { t.classList.remove("sc-tint"); }, 3000);
  });

  /* ---------- 环境异变 ---------- */
  function ambientTick() {
    var t = tier();
    var roll = Math.random();
    if (t >= 2 && roll < 0.30) {
      /* 灯灭一下 */
      document.body.classList.add("lights-out");
      setTimeout(function () { document.body.classList.remove("lights-out"); }, 160);
    } else if (t >= 3 && roll < 0.55) {
      /* 标签页标题异变 */
      var old = document.title;
      document.title = "它在数你";
      setTimeout(function () { document.title = old; }, 1400);
    } else if (t >= 3 && roll < 0.75) {
      /* 飘过的"五" */
      var s = document.createElement("div");
      s.className = "wander-five";
      s.textContent = "五";
      s.style.left = (10 + Math.random() * 80) + "vw";
      s.style.top = (10 + Math.random() * 75) + "vh";
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 2600);
    } else if (t >= 2) {
      /* 在线人数跳一下 */
      var n = document.getElementById("online-num");
      if (n && n.textContent === "4") {
        n.textContent = "5";
        setTimeout(function () {
          var v = 4;
          try {
            var vis = JSON.parse(localStorage.getItem("bbs_visited") || "[]");
            if (vis.indexOf("t_eleven") !== -1 || vis.indexOf("t_37") !== -1) v = 5;
          } catch (e) {}
          n.textContent = v;
        }, 1800);
      }
    }
    setTimeout(ambientTick, 25000 + Math.random() * 30000);
  }

  window.addEventListener("hashchange", function () { setTimeout(setupTriggers, 100); });
  document.addEventListener("DOMContentLoaded", function () {
    setupTriggers();
    setTimeout(ambientTick, 20000 + Math.random() * 15000);
  });
})();
