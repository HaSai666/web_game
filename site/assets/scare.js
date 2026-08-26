/*
 * Deterministic intrusion director.
 *
 * The archive becomes frightening by violating behaviours a forum reader
 * trusts: an old post names the current account as its editor, a reply is
 * written while the tab is hidden, and a visitor's search leaks into 2005.
 * Each intrusion is bounded and evidence-driven; there are no random jumps.
 */
(function () {
  "use strict";

  var timer = null, hiddenAt = 0, titleBeforeHidden = "";
  var pointerBound = false, pointerFrame = 0, lastPointer = null;
  var scrollBound = false, scrollFrame = 0;

  function read(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) {}
  }
  function onceSession(key) {
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
      return true;
    } catch (e) { return true; }
  }
  function stage() {
    if (window.ArchiveEvidenceState) return window.ArchiveEvidenceState.get();
    return parseInt(document.body && document.body.getAttribute("data-haunt-stage") || "0", 10) || 0;
  }
  function routeParts() {
    var hash = location.hash.replace(/^#\/?/, "");
    return hash ? hash.split("/") : [];
  }
  function threadId() {
    var parts = routeParts();
    return parts[0] === "thread" ? (parts[1] || "") : "";
  }
  function visitor() {
    try { return localStorage.getItem("bbs_session") || "当前访客"; }
    catch (e) { return "当前访客"; }
  }
  function lastSearch() {
    var list = read("bbs_searches", []);
    return Array.isArray(list) && list.length ? String(list[0]) : "第37楼";
  }
  function readCount(id) {
    try { return parseInt(localStorage.getItem("bbs_reads_" + id) || "0", 10) || 0; }
    catch (e) { return 0; }
  }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function pulse(kind) {
    if (window.ArchiveAudio && window.ArchiveAudio.cue) window.ArchiveAudio.cue(kind || "soft");
  }
  function equivalent(text) {
    if (window.ArchiveCorruption && window.ArchiveCorruption.showEquivalent) window.ArchiveCorruption.showEquivalent(text);
  }
  function showPhoto(file, duration, note, kind) {
    equivalent(note || "附件在读取时缺少一帧。");
    pulse(kind || "soft");
  }

  function landingIntrusion() {
    if (!document.body || !document.body.classList.contains("landing-page")) return;
    if (!onceSession("archive_landing_second_exposure")) {
      document.body.classList.add("landing-haunted");
      return;
    }
    setTimeout(function () {
      if (!document.body || document.hidden) return;
      document.body.classList.add("landing-haunted");
      var note = document.querySelector(".archive-warning");
      if (note) note.setAttribute("data-afterimage", "照片缓存：2帧 / 页面声明：1帧");
      pulse("glass");
    }, 9000);
  }

  function memoryRewrite() {
    var level = stage(), id = threadId();
    if (level < 2 || !id || id === "t_37" || readCount(id) < 2) return;
    if (!onceSession("archive_memory_rewrite_" + id)) return;
    var view = document.getElementById("view");
    if (!view || view.querySelector(".haunt-memory-rewrite")) return;
    var target = null;
    if (id === "t_main") target = view.querySelector('[data-source-floor="35"] .p-cont');
    var posts = view.querySelectorAll(".floor.postbit:not(.corruption-floor):not(.haunt-ghost-post) .p-cont");
    if (!target && posts.length) target = posts[posts.length - 1];
    if (!target) return;
    var currentRoute = location.hash;
    setTimeout(function () {
      if (location.hash !== currentRoute || !target.isConnected || target.querySelector(".haunt-memory-rewrite")) return;
      var line = document.createElement("div");
      line.className = "haunt-memory-rewrite";
      if (id === "t_main") {
        line.innerHTML = '<span>编辑缓存 / 03:44</span><p>原文只数到四。第五行由“' + esc(visitor()) + '”补入。</p>';
      } else {
        line.innerHTML = '<span>本楼最后编辑于 2005-02-27 03:44</span><p>编辑用户：' + esc(visitor()) + '　原文备份：你还在看。</p>';
      }
      target.appendChild(line);
      document.body.classList.add("haunt-memory-open");
      pulse(level >= 4 ? "whisper" : "key");
      setTimeout(function () { document.body.classList.remove("haunt-memory-open"); }, 2600);
    }, level >= 4 ? 650 : 1450);
  }

  function phantomEligible(id) {
    return [
      "t_server", "f_rack_log", "x_rent_37", "f_floorplan", "t_return",
      "t_log3", "x_restore_first", "x_server_night", "f_reply_shadow",
      "x_visitor_mail", "t_rules"
    ].indexOf(id) !== -1;
  }
  function injectPhantomReply() {
    var level = stage(), id = threadId();
    if (level < 3 || !phantomEligible(id)) return;
    if (!onceSession("archive_phantom_route_" + id)) return;
    var count = parseInt(read("bbs_intrusion_reply_count", 0), 10) || 0;
    if (count >= 3) return;
    var view = document.getElementById("view");
    if (!view || view.querySelector(".haunt-account-post")) return;
    var posts = view.querySelectorAll(".floor.postbit:not(.corruption-floor):not(.haunt-ghost-post)");
    if (!posts.length) return;
    var currentRoute = location.hash, name = visitor();
    setTimeout(function () {
      if (location.hash !== currentRoute || !view.isConnected || view.querySelector(".haunt-account-post")) return;
      var post = document.createElement("article");
      post.className = "floor postbit haunt-account-post";
      post.setAttribute("data-source-floor", "37");
      post.innerHTML = '<div class="p-side"><div class="p-avatar">' + esc(name.charAt(0) || "空") + '</div>' +
        '<div class="p-uid">' + esc(name) + '</div><div class="p-title">当前会话</div><div class="p-meta">注册：--<br>发帖：1</div></div>' +
        '<div class="p-main"><div class="p-bar"><span class="p-time">2005-02-27 03:44</span><span class="p-fn">37楼</span><span class="p-links">刚刚发表</span></div>' +
        '<div class="p-cont"><p>我没有在这里回过帖。</p><p>这个账号却说，它刚刚搜索过“' + esc(lastSearch()) + '”。</p>' +
        '<p class="stamp">IP：127.0.0.1　投递页：' + esc(id) + '</p></div></div>';
      posts[Math.min(posts.length - 1, 1)].insertAdjacentElement("afterend", post);
      write("bbs_intrusion_reply_count", count + 1);
      document.body.classList.add("haunt-account-arrived");
      pulse("key");
      setTimeout(function () { document.body.classList.remove("haunt-account-arrived"); }, 2200);
      setTimeout(function () {
        if (!post.isConnected) return;
        post.classList.add("is-erased");
        var body = post.querySelector(".p-cont");
        var links = post.querySelector(".p-links");
        if (links) links.textContent = "已删除";
        if (body) body.innerHTML = '<p>该回复已被作者删除。</p><p class="stamp">删除人：' + esc(name) + '　删除时间：本次读取之前</p>';
        pulse("soft");
      }, level >= 4 ? 5200 : 7600);
    }, level >= 4 ? 1800 : 3300);
  }

  function showReturnNotice(level) {
    var nav = document.getElementById("navbar");
    if (!nav || nav.querySelector(".haunt-return-notice")) return;
    var notice = document.createElement("span");
    notice.className = "haunt-return-notice";
    notice.textContent = level >= 4 ? "未登记用户在你离开时翻到了下一楼" : "你离开时，有人重新打开了本页";
    nav.appendChild(notice);
    setTimeout(function () { notice.classList.add("is-visible"); }, 30);
    setTimeout(function () {
      notice.classList.remove("is-visible");
      setTimeout(function () { if (notice.parentNode) notice.parentNode.removeChild(notice); }, 500);
    }, 5600);
  }

  function handleVisibility() {
    var level = stage();
    if (document.hidden) {
      if (level < 2) return;
      hiddenAt = Date.now();
      titleBeforeHidden = document.title;
      setTimeout(function () {
        if (document.hidden && hiddenAt) document.title = "（1）有人回复了你";
      }, 1200);
      if (window.ArchiveAudio && window.ArchiveAudio.duck) window.ArchiveAudio.duck();
      return;
    }
    if (!hiddenAt || level < 2) return;
    var away = Date.now() - hiddenAt;
    hiddenAt = 0;
    if (away < 1500 || !onceSession("archive_tab_return_stage_" + level)) {
      document.title = titleBeforeHidden || document.title;
      return;
    }
    document.body.classList.add("haunt-tab-return");
    document.title = level >= 4 ? "（1）第37楼有新回复" : "（1）莲灯夜话";
    showReturnNotice(level);
    if (level >= 4) write("bbs_tab_returned", "1");
    if (window.ArchiveAudio && window.ArchiveAudio.returnCue) window.ArchiveAudio.returnCue(level);
    else pulse(level >= 4 ? "breathe" : "key");
    setTimeout(function () { document.title = titleBeforeHidden || "莲灯夜话 - 只读档案"; }, 1700);
    setTimeout(function () { document.body.classList.remove("haunt-tab-return"); }, 6500);
  }

  function bindPointerWatcher() {
    if (pointerBound || reducedMotion()) return;
    pointerBound = true;
    window.addEventListener("pointermove", function (event) {
      lastPointer = event;
      if (pointerFrame || stage() < 3) return;
      pointerFrame = requestAnimationFrame(function () {
        pointerFrame = 0;
        if (!lastPointer || !document.body) return;
        var x = (lastPointer.clientX / Math.max(1, window.innerWidth) - .5) * 12;
        var y = (lastPointer.clientY / Math.max(1, window.innerHeight) - .5) * 7;
        document.body.style.setProperty("--watcher-x", x.toFixed(2) + "px");
        document.body.style.setProperty("--watcher-y", y.toFixed(2) + "px");
      });
    }, { passive: true });
  }

  function updateScrollHaunt() {
    if (!document.body) return;
    var level = stage();
    var root = document.scrollingElement || document.documentElement;
    var max = Math.max(0, (root ? root.scrollHeight : 0) - window.innerHeight);
    var ratio = max ? Math.max(0, Math.min(1, (root.scrollTop || window.scrollY || 0) / max)) : 0;
    document.body.style.setProperty("--archive-scroll", ratio.toFixed(3));
    document.body.classList.toggle("haunt-reading-deep", level >= 3 && ratio >= .22);
    document.body.classList.toggle("haunt-reading-bottom", level >= 4 && ratio >= .72);
  }
  function bindScrollHaunt() {
    if (scrollBound) return;
    scrollBound = true;
    function scheduleScroll() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(function () {
        scrollFrame = 0;
        updateScrollHaunt();
      });
    }
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
  }

  function refresh() {
    if (!document.body) return;
    document.body.setAttribute("data-intrusion-stage", String(stage()));
    landingIntrusion();
    bindPointerWatcher();
    bindScrollHaunt();
    updateScrollHaunt();
    memoryRewrite();
    injectPhantomReply();
  }
  function schedule(delay) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(refresh, delay == null ? 220 : delay);
  }

  document.addEventListener("visibilitychange", handleVisibility);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { schedule(180); });
  else schedule(180);
  window.addEventListener("hashchange", function () { schedule(260); });
  window.addEventListener("archiveevidencechange", function () { schedule(100); });
  window.addEventListener("archivepm", function () { schedule(120); });

  window.ArchiveAtmosphere = { showPhoto: showPhoto, pulse: pulse, refresh: refresh };
})();
