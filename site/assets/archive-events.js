/* Deterministic forum events. Each event is a delayed consequence of a record
 * the player has actually opened. No probability checks are used. */
(function () {
  "use strict";

  var EVENT_KEY = "bbs_event_records";
  var PM_KEY = "bbs_event_pms";
  var DEFAULT_USER = "唯物主义小刀";
  var timer = null, lastRoute = "", booted = false;

  function read(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function visited() {
    var value = read("bbs_visited", []);
    return Array.isArray(value) ? value : [];
  }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function records() {
    var value = read(EVENT_KEY, []);
    return Array.isArray(value) ? value : [];
  }
  function hasRecord(id) {
    var list = records();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return true;
    return false;
  }
  function appendRecord(evt) {
    var list = records();
    list.push({ id: evt.id, label: evt.label, time: new Date().toISOString() });
    write(EVENT_KEY, list.slice(-24));
    updateEventLog();
  }
  function getSession() {
    try { return localStorage.getItem("bbs_session") || DEFAULT_USER; }
    catch (e) { return DEFAULT_USER; }
  }
  function visitor() {
    try { return localStorage.getItem("bbs_session") || "当前访客"; }
    catch (e) { return "当前访客"; }
  }
  function fill(value) {
    return String(value || "").replace(/\{visitor\}/g, visitor());
  }
  function addEventPm(pm) {
    var name = getSession();
    var map = read(PM_KEY, {});
    if (!map || typeof map !== "object") map = {};
    if (!Array.isArray(map[name])) map[name] = [];
    for (var i = 0; i < map[name].length; i++) if (map[name][i].id === pm.id) return;
    map[name].unshift({
      id: pm.id, from: fill(pm.from), time: pm.time, title: fill(pm.title),
      html: fill(pm.html), doc: !!pm.doc
    });
    write(PM_KEY, map);
    try { window.dispatchEvent(new Event("archivepm")); } catch (e) {}
  }
  function currentContext() {
    var parts = location.hash.replace(/^#\/?/, "").split("/");
    var summary = window.ArchiveEvidenceState ? window.ArchiveEvidenceState.summary() : {
      stage: 0, typeCount: 0, evidence: { person: [], room: [], ritual: [], identity: [], server: [] }, anchors: {}, finalReady: false
    };
    return {
      kind: parts[0] || "index", route: parts[1] || "", page: parts[3] || "1",
      visited: visited(), stage: summary.stage, typeCount: summary.typeCount,
      evidence: summary.evidence, anchors: summary.anchors, finalReady: summary.finalReady
    };
  }
  function has(ctx, id) { return ctx.visited.indexOf(id) !== -1; }
  function readCount(id) {
    try { return parseInt(localStorage.getItem("bbs_reads_" + id) || "0", 10) || 0; }
    catch (e) { return 0; }
  }
  function hasChoice() {
    var keys = ["door-watch", "phone-return", "cache-read", "floorplan-fold", "neighbor-tape", "mod-snapshot", "guestbook-mark", "granny-letter"];
    try { for (var i = 0; i < keys.length; i++) if (localStorage.getItem("bbs_choice_" + keys[i])) return true; }
    catch (e) {}
    return false;
  }

  var EVENTS = [
    {
      id: "unread_returns", label: "短消息 / 空标题", kind: "pm",
      eligible: function (c) { return has(c, "t_exp1") || has(c, "x_apple_lab"); },
      pm: { id: "evt_unread_returns", from: "右灯", time: "2005-02-21 00:45", title: "（无主题）", html: "<p>这封信刚才显示已读。</p><p>我没有发第二次。你再打开时，先看发件时间有没有变。</p>" },
      toastTitle: "收到一封没有主题的短消息", toastText: "它在收件箱里先显示已读，随后又变回未读。"
    },
    {
      id: "single_mars_character", label: "主题记录 / 字符替换", kind: "silent",
      eligible: function (c) { return (has(c, "x_apple_lab") && readCount("x_apple_lab") >= 2) || (has(c, "t_exp1") && readCount("t_exp1") >= 2); }
    },
    {
      id: "avatar_signature_mismatch", label: "用户资料 / 头像缓存", kind: "silent",
      eligible: function (c) { return c.evidence.person.length && c.evidence.identity.length && (has(c, "x_meet_rightlamp") || has(c, "t_return")); }
    },
    {
      id: "photo_delete_warning", label: "版务短消息 / 青灯", kind: "pm",
      eligible: function (c) { return has(c, "x_mary_delete") || (has(c, "t_exp3b") && c.evidence.server.length); },
      pm: { id: "evt_photo_delete_warning", from: "青灯", time: "2005-02-27 03:41", title: "不要再打开那张附件", html: "<p>附件删除请求不是我批准的，后台却把操作人写成了右灯。</p><p>你若已经看过第二张图，不要用引用按钮。它会引用到一个没有作者的账号。</p>" },
      toastTitle: "版主给你发来一封短消息", toastText: "青灯要求你停止引用一张已经删除的附件。"
    },
    {
      id: "directionless_knocks", label: "站内动态 / 无方向敲击", kind: "cue", cue: "knock",
      eligible: function (c) { return c.evidence.room.length && (c.route === "x_wall_live" || c.route === "t_main" || c.route === "f_door_watch"); }
    },
    {
      id: "first_system_pm", label: "系统短消息 / 投递记录缺失", kind: "pm",
      eligible: function (c) { return c.typeCount >= 2; },
      pm: { id: "evt_first_system_pm", from: "系统", time: "2005-02-27 02:17", title: "在线名单校正", html: "<p>当前在线名单无法与会员会话对应。</p><p>第五个位置已预留给：{visitor}。</p><p>本消息投递时间早于本次登录。</p>" },
      toastTitle: "系统短消息", toastText: "消息的投递时间早于你进入论坛。"
    },
    {
      id: "unregistered_typing", label: "回复框 / 未登记用户", kind: "modal",
      eligible: function (c) { return !!c.anchors.fifth_voice && c.route === "t_main"; },
      modalTitle: "这篇主题正在被回复", modalText: "回复框收到四次输入和第五次退格。当前页面是只读镜像，作者字段为空。草稿里只剩一句：到我了。", modalStamp: "主题：关于几种所谓通灵游戏的亲身体验　用户：未登记"
    },
    {
      id: "corrupt_floors_arrive", label: "短消息 / 无灯", kind: "pm",
      eligible: function (c) { return !!c.anchors.fifth_voice && (has(c, "x_lock_discussion") || c.stage >= 3); },
      pm: { id: "evt_corrupt_floors", from: "无灯", time: "2023-11-03 03:44", title: "别逐字读那些回复", html: "<p>乱码里只有少数句子是写给人的，其余是在练习像人说话。</p><p>如果它引用你的名字，离开主帖。不要刷新，刷新会把回复带到别的版。</p>" },
      toastTitle: "收到一封来自2023年的短消息", toastText: "发件人提醒你不要刷新刚刚出现的乱码楼层。"
    },
    {
      id: "floor37_restore", label: "恢复记录 / 空作者", kind: "modal",
      eligible: function (c) { return has(c, "x_restore_first") || (has(c, "f_mod_backup") && !!localStorage.getItem("bbs_choice_mod-snapshot")); },
      modalTitle: "旧快照恢复了一条空回复", modalText: "主帖短暂出现第37楼，正文仍为空。作者栏先显示青灯，随后改成当前登录账号。关闭窗口不会撤销这次读取。", modalStamp: "快照：B27-0344　实体记录：49　页面位置：50"
    },
    {
      id: "online_fixed_five", label: "在线会员 / 无法注销", kind: "silent",
      eligible: function (c) { return c.evidence.identity.length && c.evidence.server.length && c.stage >= 3; }
    },
    {
      id: "old_post_quotes_reader", label: "短消息 / 当前访客", kind: "pm",
      eligible: function (c) { return c.stage >= 4 && hasChoice(); },
      pm: { id: "evt_old_post_quotes_reader", from: "{visitor}", time: "2005-02-27 03:44", title: "你刚才为什么选那一边", html: "<p>[quote author=\"{visitor}\"]你的选择已经被旧帖引用。[/quote]</p><p>请不要回复这封信。发件人与收件人是同一个本地记录。</p>" },
      toastTitle: "你给自己发来一封短消息", toastText: "发件时间是2005年，正文引用了你刚做出的选择。"
    },
    {
      id: "structure_alignment", label: "站务警告 / 关门人", kind: "modal",
      eligible: function (c) { return c.stage >= 4 && (has(c, "x_restore_notes") || has(c, "x_visitor_mail") || has(c, "t_log5")); },
      modalTitle: "页面模板停止校验", modalText: "论坛的四个页面区域正在使用同一个位置编号。导航仍可用，请不要关闭静音按钮或返回入口。若分页出现37，不要替它补标题。", modalStamp: "站务：关门人　状态：已锁定　在线会员：5"
    }
  ];

  function root() { return document.getElementById("archive-event-root"); }
  function clearRoot() {
    var node = root();
    if (node) node.innerHTML = "";
  }
  function showToast(evt) {
    var node = root();
    if (!node) return;
    clearRoot();
    var logged = false;
    try { logged = !!localStorage.getItem("bbs_session"); } catch (e) {}
    var toast = document.createElement("section");
    toast.className = "archive-toast"; toast.setAttribute("role", "status");
    toast.innerHTML = '<b>' + esc(evt.toastTitle) + '</b><p>' + esc(evt.toastText) + '</p>' +
      '<a href="' + (logged ? "#/pm" : "#/login") + '">' + (logged ? "打开短消息" : "登录读取") + '</a>' +
      '<button type="button" data-event-dismiss>收起</button>';
    node.appendChild(toast);
    toast.querySelector("[data-event-dismiss]").addEventListener("click", clearRoot);
    toast.querySelector("a").addEventListener("click", function () { setTimeout(clearRoot, 80); });
  }
  function showModal(evt) {
    var node = root();
    if (!node) return;
    clearRoot();
    var backdrop = document.createElement("div");
    backdrop.className = "archive-modal-backdrop";
    backdrop.innerHTML = '<section class="archive-modal" role="dialog" aria-modal="true" aria-labelledby="archive-modal-title">' +
      '<header class="archive-modal-head"><span>莲灯夜话 / 站内通知</span><b>只读</b></header>' +
      '<div class="archive-modal-body"><h2 id="archive-modal-title">' + esc(evt.modalTitle) + '</h2><p>' + esc(evt.modalText) + '</p><p class="modal-stamp">' + esc(evt.modalStamp) + '</p></div>' +
      '<div class="archive-modal-actions"><button type="button" data-event-close>知道了</button></div></section>';
    node.appendChild(backdrop);
    var close = function () { clearRoot(); };
    backdrop.querySelector("[data-event-close]").addEventListener("click", close);
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) close(); });
    backdrop.querySelector("[data-event-close]").focus();
  }
  function updateEventLog() {
    var node = document.getElementById("event-log-list");
    if (!node) return;
    var list = records();
    if (!list.length) { node.innerHTML = "<span>暂无新消息</span>"; return; }
    var html = "";
    for (var i = list.length - 1; i >= 0 && i >= list.length - 4; i--) {
      html += '<div class="event-log-entry"><b>' + esc(list[i].label) + '</b><span>已写入站内记录</span></div>';
    }
    node.innerHTML = html;
  }
  function updateRail() {
    var summary = window.ArchiveEvidenceState ? window.ArchiveEvidenceState.summary() : { stage: 0 };
    var signal = document.getElementById("rail-signal");
    var depth = document.getElementById("rail-depth");
    var last = document.getElementById("rail-last-read");
    var monitor = document.getElementById("monitor-state");
    var online = document.getElementById("online-num");
    if (signal) signal.textContent = summary.stage >= 4 ? "1条新回复" : (summary.stage >= 3 ? "主题只读" : "只读开放");
    if (depth) depth.textContent = summary.stage >= 4 ? "（离线）" : "青灯";
    if (last) {
      try { last.textContent = localStorage.getItem("bbs_last_thread") || "站务问题请在版面留言"; }
      catch (e) { last.textContent = "站务问题请在版面留言"; }
    }
    if (monitor) monitor.textContent = (online ? online.textContent : (summary.stage >= 3 ? "5" : "4")) + " 人";
  }
  function fire(evt) {
    appendRecord(evt); updateRail();
    if (evt.kind === "pm") { addEventPm(evt.pm); showToast(evt); }
    else if (evt.kind === "modal") showModal(evt);
    else if (evt.kind === "cue") {
      if (window.ArchiveAudio && window.ArchiveAudio.cue) window.ArchiveAudio.cue(evt.cue || "soft");
      else if (window.ArchiveCorruption && window.ArchiveCorruption.showEquivalent) window.ArchiveCorruption.showEquivalent("页面外记录到一次无方向敲击。");
    }
  }
  function evaluate() {
    updateRail(); updateEventLog();
    var current = location.hash.replace(/^#\/?/, "");
    if (current.indexOf("ending") === 0 || current.indexOf("replay") === 0 || current.indexOf("thread/t_37") === 0) return;
    var ctx = currentContext();
    for (var i = 0; i < EVENTS.length; i++) {
      if (!hasRecord(EVENTS[i].id) && EVENTS[i].eligible(ctx)) { fire(EVENTS[i]); break; }
    }
  }
  function schedule(delay) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(evaluate, delay == null ? 420 : delay);
  }
  function boot() {
    if (booted) return;
    booted = true; updateRail(); updateEventLog(); schedule(520);
  }

  document.addEventListener("keydown", function (event) { if (event.key === "Escape") clearRoot(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 0);
  window.addEventListener("hashchange", function () {
    var now = location.hash;
    if (now === lastRoute) return;
    lastRoute = now; schedule(520);
  });
  window.addEventListener("archivechoice", function () { schedule(700); });
  window.addEventListener("archivepm", function () {
    if (window.ArchiveBBS && window.ArchiveBBS.enhance) window.ArchiveBBS.enhance(true);
  });
  window.ArchiveEvents = { evaluate: evaluate, records: records, addEventPm: addEventPm };
})();
