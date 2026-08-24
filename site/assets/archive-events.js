/*
 * Deterministic archive events.
 *
 * The events are consequences of reading, not random interruptions. Each one
 * is recorded locally, can be dismissed, and can be revisited through the
 * right-hand event log. The default protagonist is used as the recipient when
 * the player is still a guest, so a later login can still reveal the message.
 */
(function () {
  "use strict";

  var EVENT_KEY = "bbs_event_records";
  var PM_KEY = "bbs_event_pms";
  var DEFAULT_USER = "唯物主义小刀";
  var pendingTimer = null;
  var lastRoute = "";
  var booted = false;

  var EVENTS = [
    {
      id: "pm_rightlamp_0336",
      label: "新短消息 / 右灯",
      kind: "pm",
      tier: 2,
      eligible: function (ctx) { return ctx.visited.indexOf("t_main") !== -1 && ctx.docs >= 3; },
      pm: {
        id: "evt_pm_rightlamp_0336",
        from: "右灯",
        time: "2005-02-27 03:36",
        title: "别回主页",
        html: "<p>你刚刚打开的那几页，不是给现在的人看的。</p><p>如果你看见主页上多了一个在线的人，不要刷新。刷新会让它知道你还在。</p><p>我先下了。你也别回头。</p>"
      },
      toastTitle: "离线镜像收到一封新短消息",
      toastText: "发件人：右灯。时间字段早于本站故障记录。登录后可以在短消息里读取完整内容。"
    },
    {
      id: "admin_warning_floor37",
      label: "站务提醒 / 青灯",
      kind: "modal",
      tier: 2,
      eligible: function (ctx) {
        return ctx.docs >= 8 && (ctx.visited.indexOf("t_notice") !== -1 || ctx.visited.indexOf("t_server") !== -1 || ctx.route === "t_log4");
      },
      modalTitle: "版主提醒",
      modalText: "你已经连续打开了八份隐藏记录。请停止检索“第37楼”。这不是剧情提示，也不是系统建议。继续查找会影响存档完整性。",
      modalStamp: "发件人：青灯　记录时间：2005-02-27 03:41　状态：未确认"
    },
    {
      id: "system_unknown_connection",
      label: "系统告警 / 未知连接",
      kind: "modal",
      tier: 3,
      eligible: function (ctx) {
        return ctx.docs >= 16 && (ctx.visited.indexOf("t_eleven") !== -1 || ctx.visited.indexOf("t_log5") !== -1 || ctx.route === "t_37");
      },
      modalTitle: "连接状态发生变化",
      modalText: "已知连接：4。未知连接：1。该连接没有登录记录，没有请求来源，也没有退出时间。页面将继续提供只读内容。",
      modalStamp: "节点：B27-0344　最后同步：03:44　刷新不会修复此状态"
    }
  ];

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
  function records() {
    var value = read(EVENT_KEY, []);
    return Array.isArray(value) ? value : [];
  }
  function hasRecord(id) {
    var list = records();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return true;
    return false;
  }
  function context() {
    var hash = location.hash.replace(/^#\/?/, "").split("/");
    var docs = window.ArchiveBBS && window.ArchiveBBS.docCount ? window.ArchiveBBS.docCount() : 0;
    return { route: hash[1] || "", visited: visited(), docs: docs };
  }
  function esc(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function appendRecord(evt) {
    var list = records();
    list.push({ id: evt.id, label: evt.label, time: new Date().toISOString() });
    write(EVENT_KEY, list.slice(-12));
    updateEventLog();
  }
  function addEventPm(pm) {
    var map = read(PM_KEY, {}), users = [DEFAULT_USER], session = localStorage.getItem("bbs_session");
    if (session && users.indexOf(session) === -1) users.push(session);
    for (var i = 0; i < users.length; i++) {
      var name = users[i];
      if (!map[name]) map[name] = [];
      var exists = false;
      for (var j = 0; j < map[name].length; j++) if (map[name][j].id === pm.id) exists = true;
      if (!exists) map[name].unshift(pm);
    }
    write(PM_KEY, map);
    try { window.dispatchEvent(new Event("archivepm")); } catch (e) {}
  }
  function currentTier() {
    if (window.ArchiveAtmosphereState) return window.ArchiveAtmosphereState.get();
    var cls = document.body.className || "";
    return cls.indexOf("t3") !== -1 ? 3 : (cls.indexOf("t2") !== -1 ? 2 : 1);
  }
  function updateRail() {
    var ctx = context(), tier = currentTier();
    var depth = document.getElementById("rail-depth"), signal = document.getElementById("rail-signal");
    var monitor = document.getElementById("monitor-state"), copy = document.getElementById("monitor-copy"), last = document.getElementById("rail-last-read");
    if (depth) depth.textContent = tier >= 3 ? "红色记录" : (tier >= 2 ? "异常记录" : "正常记录");
    if (signal) signal.textContent = tier >= 3 ? "未知连接" : (tier >= 2 ? "读取中" : "只读连接");
    if (monitor) monitor.textContent = tier >= 3 ? "4 个已知连接 / 1 个未知" : (tier >= 2 ? "4 个连接 / 读取中" : "4 个已知连接");
    if (copy) copy.textContent = ctx.docs >= 16 ? "索引正在回写" : (ctx.docs >= 8 ? "部分记录被移动" : "正在读取旧索引");
    if (last) last.textContent = localStorage.getItem("bbs_last_thread") || "还没有读取记录";
  }
  function updateEventLog() {
    var node = document.getElementById("event-log-list");
    if (!node) return;
    var list = records();
    if (!list.length) { node.innerHTML = "<span>尚无异常记录</span>"; return; }
    var html = "";
    for (var i = list.length - 1; i >= 0 && i >= list.length - 4; i--) {
      html += '<div class="event-log-entry"><b>' + esc(list[i].label) + '</b><span>已写入本地读取记录</span></div>';
    }
    node.innerHTML = html;
  }
  function root() { return document.getElementById("archive-event-root"); }
  function clearRoot() {
    var node = root();
    if (node) node.innerHTML = "";
  }
  function showToast(evt) {
    var node = root();
    if (!node) return;
    clearRoot();
    var logged = !!localStorage.getItem("bbs_session");
    var link = logged ? "#/pm" : "#/login";
    var label = logged ? "打开短消息" : "登录读取";
    var toast = document.createElement("section");
    toast.className = "archive-toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = '<b>' + esc(evt.toastTitle) + '</b><p>' + esc(evt.toastText) + '</p><a href="' + link + '">' + label + '</a><button type="button" data-event-dismiss>收起</button>';
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
    backdrop.innerHTML = '<section class="archive-modal" role="dialog" aria-modal="true" aria-labelledby="archive-modal-title"><header class="archive-modal-head"><span>离线镜像 / 事件回写</span><b>03:44</b></header><div class="archive-modal-body"><h2 id="archive-modal-title">' + esc(evt.modalTitle) + '</h2><p>' + esc(evt.modalText) + '</p><p class="modal-stamp">' + esc(evt.modalStamp) + '</p></div><div class="archive-modal-actions"><button type="button" data-event-close>记录并关闭</button></div></section>';
    node.appendChild(backdrop);
    var close = function () { clearRoot(); };
    backdrop.querySelector("[data-event-close]").addEventListener("click", close);
    backdrop.addEventListener("click", function (ev) { if (ev.target === backdrop) close(); });
    backdrop.querySelector("[data-event-close]").focus();
  }
  function fire(evt) {
    if (evt.tier && window.ArchiveAtmosphereState) window.ArchiveAtmosphereState.apply(evt.tier);
    if (evt.tier && document.body) document.body.setAttribute("data-archive-depth", String(evt.tier));
    updateRail();
    appendRecord(evt);
    if (evt.kind === "pm") { addEventPm(evt.pm); showToast(evt); }
    else showModal(evt);
  }
  function evaluate() {
    updateRail(); updateEventLog();
    var ctx = context();
    for (var i = 0; i < EVENTS.length; i++) {
      var evt = EVENTS[i];
      if (!hasRecord(evt.id) && evt.eligible(ctx)) { fire(evt); break; }
    }
  }
  function schedule() {
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = setTimeout(evaluate, 240);
  }
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") clearRoot();
  });
  function boot() {
    if (booted) return;
    booted = true;
    updateRail(); updateEventLog(); schedule();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 0);
  window.addEventListener("hashchange", function () {
    var now = location.hash;
    if (now === lastRoute) return;
    lastRoute = now;
    schedule();
  });
  window.addEventListener("archivepm", function () {
    if (window.ArchiveBBS && window.ArchiveBBS.enhance) window.ArchiveBBS.enhance(true);
  });
  window.ArchiveEvents = { evaluate: evaluate, records: records, addEventPm: addEventPm };
})();
