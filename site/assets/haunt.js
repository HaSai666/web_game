/*
 * Persistent haunt layer.
 *
 * Horror comes from forum behaviour that should be impossible: a reply box
 * used by nobody, a reflection that changes after navigation, and one missing
 * floor briefly returning to the thread. Every anomaly is deterministic and
 * tied to something the reader opened.
 */
(function () {
  "use strict";

  var timer = null;
  var idleTimer = null;
  var observer = null;
  var BRANCHES = ["f_preflight", "f_audio_log", "f_door_watch", "f_rack_log", "f_reply_shadow", "f_chair_back", "f_rightlamp_note", "f_phone_line", "f_editor_cache", "f_floorplan", "f_neighbor_tape", "f_lamp_debt", "f_mod_backup", "f_guestbook", "f_granny_letter"];

  function read(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }
  function visited() {
    var list = read("bbs_visited", []);
    return Array.isArray(list) ? list : [];
  }
  function has(id) { return visited().indexOf(id) !== -1; }
  function branchCount() {
    var n = 0;
    for (var i = 0; i < BRANCHES.length; i++) if (has(BRANCHES[i])) n++;
    return n;
  }
  function routeParts() {
    var hash = location.hash.replace(/^#\/?/, "");
    return hash ? hash.split("/") : [];
  }
  function threadId() {
    var parts = routeParts();
    return parts[0] === "thread" ? (parts[1] || "") : "";
  }
  function tier() {
    var name = String(document.body && document.body.className || "");
    if (name.indexOf("t3") !== -1) return 3;
    if (name.indexOf("t2") !== -1) return 2;
    return 1;
  }
  function once(key) {
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
      return true;
    } catch (e) { return true; }
  }
  function pulse(kind) {
    if (window.ArchiveAudio && window.ArchiveAudio.pulse) window.ArchiveAudio.pulse(kind || "soft");
    else if (window.ArchiveAtmosphere && window.ArchiveAtmosphere.pulse) window.ArchiveAtmosphere.pulse(kind === "deep" ? "deep" : "soft");
  }

  function setBodyState() {
    if (!document.body) return;
    var parts = routeParts();
    var id = threadId() || parts[0] || "index";
    document.body.setAttribute("data-haunt-route", id);
    document.body.setAttribute("data-haunt-branches", String(branchCount()));
    document.body.classList.toggle("haunt-final", id === "t_37" || parts[0] === "ending");
    document.body.classList.toggle("haunt-has-audio", has("f_audio_log"));
    document.body.classList.toggle("haunt-has-door", has("f_door_watch"));
    document.body.classList.toggle("haunt-has-rack", has("f_rack_log"));
    document.body.classList.toggle("haunt-has-watcher", has("f_reply_shadow"));
    document.body.classList.toggle("haunt-has-negative", has("f_chair_back"));
    document.body.classList.toggle("haunt-has-phone", has("f_phone_line"));
    document.body.classList.toggle("haunt-has-cache", has("f_editor_cache"));
    document.body.classList.toggle("haunt-has-floorplan", has("f_floorplan"));
    document.body.classList.toggle("haunt-has-neighbor", has("f_neighbor_tape"));
    document.body.classList.toggle("haunt-has-lamp", has("f_lamp_debt"));
    document.body.classList.toggle("haunt-has-backup", has("f_mod_backup"));
    document.body.classList.toggle("haunt-has-guestbook", has("f_guestbook"));
    document.body.classList.toggle("haunt-has-letter", has("f_granny_letter"));
  }

  function updateReflection() {
    var frame = document.querySelector(".rail-reflection");
    var copy = document.getElementById("rail-reflection-copy");
    if (!frame || !copy) return;
    var n = branchCount(), id = threadId(), finalFrame = id === "t_37" || routeParts()[0] === "ending";
    frame.setAttribute("data-reflection-depth", String(finalFrame ? 3 : Math.min(3, n)));
    if (id === "t_37" || routeParts()[0] === "ending") copy.textContent = "离镜头最近的位置已经有人坐过";
    else if (has("f_chair_back")) copy.textContent = "底片里的人影没有面向房间";
    else if (has("f_rack_log")) copy.textContent = "断电后，反射帧仍在更新";
    else if (has("f_phone_line")) copy.textContent = "接线台的空号还保持占线";
    else if (has("f_editor_cache")) copy.textContent = "光标停在一行没有发送的文字后面";
    else if (has("f_floorplan")) copy.textContent = "墙后多出一条没有门的走廊";
    else if (has("f_neighbor_tape")) copy.textContent = "第五下敲击没有对应的墙面";
    else if (has("f_mod_backup")) copy.textContent = "离线盘的指示灯仍在闪";
    else if (has("f_guestbook")) copy.textContent = "留言簿的光标没有回到开头";
    else if (has("f_granny_letter")) copy.textContent = "信纸折痕里没有被灯照到的地方";
    else if (has("f_lamp_debt")) copy.textContent = "灯线伸到画面以外，仍然通着电";
    else if (has("f_audio_log") || has("f_door_watch")) copy.textContent = "右下角的阴影没有对应光源";
    else copy.textContent = "当前帧没有可辨认的人影";
  }

  function updateTyping() {
    var nav = document.getElementById("navbar");
    if (!nav) return;
    var node = document.getElementById("haunt-typing");
    var show = tier() >= 2 && (has("f_audio_log") || has("f_reply_shadow") || has("f_phone_line") || has("f_editor_cache") || has("t_eleven"));
    if (!show) {
      if (node) node.remove();
      return;
    }
    if (!node) {
      node = document.createElement("span");
      node.id = "haunt-typing";
      node.setAttribute("role", "status");
      node.innerHTML = '<i aria-hidden="true"></i><span></span>';
      var online = document.getElementById("online-stat");
      if (online && online.parentNode) online.parentNode.insertBefore(node, online);
      else nav.appendChild(node);
    }
    var text = node.querySelector("span");
    if (text) {
      if (has("t_37")) text.textContent = "第37楼仍在输入";
      else if (has("f_reply_shadow")) text.textContent = "未登记用户正在补全一句话";
      else if (has("f_editor_cache")) text.textContent = "光标正在等待下一次回车";
      else if (has("f_phone_line")) text.textContent = "一条没有号码的线路正在占线";
      else text.textContent = "一名未登记用户正在输入";
    }
  }

  function ghostPostHtml() {
    var content = has("t_eleven") ? "正在恢复四个字" : "正在恢复一条没有作者的回复";
    return '<article class="floor postbit haunt-ghost-post" aria-label="未归档回复">' +
      '<div class="p-side"><div class="p-avatar">空</div><div class="p-uid">（未登记）</div><div class="p-title">访客</div><div class="p-meta">注册：--<br>发帖：1</div></div>' +
      '<div class="p-main"><div class="p-bar"><span class="p-time">2005-02-27 03:44</span><span class="p-fn">　楼</span><span class="p-links">缓存恢复</span></div>' +
      '<div class="p-cont"><p class="haunt-type-line"><span>' + content + '</span><b aria-hidden="true">▌</b></p><p class="stamp">这条回复不计入楼层总数。</p></div></div></article>';
  }
  function injectGhostPost() {
    var id = threadId();
    if (id !== "t_main" || !(has("f_reply_shadow") || has("t_eleven") || has("f_audio_log") || has("f_door_watch"))) return;
    var view = document.getElementById("view");
    if (!view || view.querySelector(".haunt-ghost-post")) return;
    var reply = view.querySelector(".reply-box");
    if (!reply) return;
    reply.insertAdjacentHTML("beforebegin", ghostPostHtml());
    var post = view.querySelector(".haunt-ghost-post");
    setTimeout(function () {
      var line = post && post.querySelector(".haunt-type-line span");
      if (line) line.textContent = has("t_eleven") ? "恢复失败。正文已经被当前访客读取。" : "恢复失败。作者仍然在线。";
      if (post) post.classList.add("is-resolved");
      pulse("soft");
    }, 2800);
  }

  function showWhisper(text) {
    var old = document.querySelector(".haunt-whisper");
    if (old) old.remove();
    var node = document.createElement("div");
    node.className = "haunt-whisper";
    node.setAttribute("role", "status");
    node.textContent = text;
    document.body.appendChild(node);
    setTimeout(function () { node.classList.add("is-visible"); }, 30);
    setTimeout(function () {
      node.classList.remove("is-visible");
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 500);
    }, 3900);
  }

  function setupThreshold() {
    if (observer) { observer.disconnect(); observer = null; }
    if (threadId() !== "t_main" || typeof IntersectionObserver === "undefined") return;
    var targets = document.querySelectorAll(".threshold-post");
    if (!targets.length) return;
    observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        document.body.classList.add("haunt-threshold-near");
        if (once("haunt_threshold_notice")) {
          setTimeout(function () {
            showWhisper(has("f_audio_log") ? "录音比页面先数到五。" : "浏览记录里多出了一次向下滚动。");
            pulse("deep");
          }, 900);
        }
        break;
      }
    }, { threshold: .48 });
    for (var j = 0; j < targets.length; j++) observer.observe(targets[j]);
  }

  function setupPhoto() {
    var id = threadId();
    var view = document.getElementById("view");
    if (!view) return;
    var image = view.querySelector(".photo img");
    if (!image) return;
    if (id === "f_chair_back" || id === "t_37") {
      image.classList.add("haunt-photo-watch");
      if (once("haunt_photo_" + id)) setTimeout(function () { image.classList.add("is-awake"); pulse("soft"); }, 2300);
      if (id === "f_chair_back" && image.getAttribute("data-haunt-click-bound") !== "1") {
        image.setAttribute("data-haunt-click-bound", "1");
        image.addEventListener("click", function () {
          image.classList.toggle("is-awake");
          showWhisper(image.classList.contains("is-awake") ? "照片里少了一把椅子。" : "你把照片翻回原来的样子。");
          pulse("deep");
        });
      }
    }
  }

  function bindChoice(choice) {
    if (!choice || choice.getAttribute("data-bound") === "1") return;
    choice.setAttribute("data-bound", "1");
    var key = "bbs_choice_" + (choice.getAttribute("data-choice") || "branch");
    function applyChoice(value) {
      write(key, value);
      var signal = choice.getAttribute("data-ending-signal-" + value);
      if (signal) write("bbs_ending_signal", signal);
      choice.classList.add("is-chosen", "choice-" + value);
      var buttons = choice.querySelectorAll("button");
      for (var j = 0; j < buttons.length; j++) buttons[j].disabled = true;
      if (!choice.querySelector(".choice-result")) {
        var result = document.createElement("p");
        result.className = "choice-result";
        result.textContent = choice.getAttribute("data-result-" + value) || (value === "look" ? "附件读取完成。照片拍摄时间：03:44。门牌背后的墙比房间多出一层。" : "你没有打开附件。页面仍然把请求记在了读取记录里。");
        choice.appendChild(result);
      }
      updateReflection();
      showWhisper(choice.getAttribute("data-whisper-" + value) || (value === "look" ? "你看过门牌背面了。" : "页面记住了你没有看。"));
      pulse(value === "look" || value === "open" || value === "call" ? "deep" : "soft");
    }
    var saved = "";
    try { saved = localStorage.getItem(key) || ""; } catch (e) {}
    if (saved) applyChoice(saved);
    else {
      var buttons = choice.querySelectorAll("button[data-choice-value]");
      for (var k = 0; k < buttons.length; k++) {
        buttons[k].addEventListener("click", function () {
          applyChoice(this.getAttribute("data-choice-value") || "leave");
        });
      }
    }
  }
  function bindChoices() {
    var choices = document.querySelectorAll(".branch-choice");
    for (var i = 0; i < choices.length; i++) bindChoice(choices[i]);
  }

  function scheduleIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    if (tier() < 2) return;
    idleTimer = setTimeout(function () {
      var id = threadId() || routeParts()[0] || "index";
      if (!once("haunt_idle_" + id)) return;
      document.body.classList.add("haunt-looked-back");
      updateReflection();
      showWhisper(branchCount() >= 3 ? "反射帧在你没有操作时更新了一次。" : "页面边缘刚才少了一把椅子。");
      pulse("soft");
      setTimeout(function () { document.body.classList.remove("haunt-looked-back"); }, 4600);
    }, 12000);
  }

  function refresh() {
    document.body.classList.remove("haunt-threshold-near", "haunt-looked-back");
    setBodyState();
    updateReflection();
    updateTyping();
    injectGhostPost();
    bindChoices();
    setupThreshold();
    setupPhoto();
    scheduleIdle();
  }
  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(refresh, 130);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
  else schedule();
  window.addEventListener("hashchange", schedule);
  window.addEventListener("archivepm", schedule);
  window.ArchiveHaunt = { refresh: refresh, branchCount: branchCount };
})();
