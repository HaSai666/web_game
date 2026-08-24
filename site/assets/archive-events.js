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
      label: "短消息 / 右灯",
      kind: "pm",
      tier: 2,
      eligible: function (ctx) { return ctx.visited.indexOf("t_main") !== -1 && ctx.docs >= 3; },
      pm: {
        id: "evt_pm_rightlamp_0336",
        from: "右灯",
        time: "2005-02-27 03:36",
        title: "刚才那页",
        html: "<p>刚才那页在我这里显示的是另一种排法。</p><p>我把时间抄下来，回头再看，它又少了一行。</p><p>如果右上角的数字变了，先别急着刷新。</p>"
      },
      toastTitle: "收到一封新短消息",
      toastText: "发件人：右灯。留言时间：03:36。镜像已经把它放进收件箱。"
    },
    {
      id: "admin_warning_floor37",
      label: "版务留言 / 青灯",
      kind: "modal",
      tier: 2,
      eligible: function (ctx) {
        return ctx.docs >= 8 && (ctx.visited.indexOf("t_notice") !== -1 || ctx.visited.indexOf("t_server") !== -1 || ctx.route === "t_log4");
      },
      modalTitle: "版面暂时锁定",
      modalText: "你好。旧版块刚刚收到一份无法归档的请求。为了避免重复写入，部分页面会保持只读。若你正在核对时间，请以页面当下显示为准。",
      modalStamp: "发件人：青灯　留言时间：2005-02-27 03:41　状态：未确认"
    },
    {
      id: "system_unknown_connection",
      label: "系统记录 / 03:44",
      kind: "modal",
      tier: 3,
      eligible: function (ctx) {
        return ctx.docs >= 16 && (ctx.visited.indexOf("t_eleven") !== -1 || ctx.visited.indexOf("t_log5") !== -1 || ctx.route === "t_37");
      },
      modalTitle: "同步记录",
      modalText: "镜像收到一条没有对应页面的请求。它只留下了一个时间戳，随后又被同一时间覆盖。页面仍可读取。",
      modalStamp: "节点：B27-0344　最后同步：03:44　校验：未回传"
    },
    {
      id: "phantom_typing_floor",
      label: "回复记录 / 未注册用户",
      kind: "modal",
      tier: 2,
      eligible: function (ctx) {
        return ctx.visited.indexOf("f_audio_log") !== -1 && ctx.visited.indexOf("t_main") !== -1 && ctx.docs >= 3;
      },
      modalTitle: "回复框正在被使用",
      modalText: "你没有点击回复框。镜像却记录到四次键盘输入，随后又收到第五次退格。草稿内容没有保存，作者字段为空。",
      modalStamp: "页面：主帖　输入字节：4　访客：未登记"
    },
    {
      id: "preflight_reserved_presence",
      label: "在线记录 / 预留访客",
      kind: "modal",
      tier: 2,
      eligible: function (ctx) {
        return ctx.visited.indexOf("f_preflight") !== -1 && ctx.visited.indexOf("t_main") !== -1;
      },
      modalTitle: "在线人数被提前写入",
      modalText: "主帖还没有开始直播，在线人数已经被记录为5。记录人字段为空，刷新后这条数据会被挪到页面底部。",
      modalStamp: "快照：2005-02-27 02:39　在线：5　来源：未登记"
    },
    {
      id: "hallway_knock_record",
      label: "环境记录 / 三次敲击",
      kind: "modal",
      tier: 2,
      eligible: function (ctx) {
        return ctx.visited.indexOf("f_door_watch") !== -1 && (ctx.route === "t_main" || ctx.route === "f_rack_log");
      },
      modalTitle: "页面外收到三次敲击",
      modalText: "声源不在当前音频轨道。第一次来自左声道，第二次来自右声道，第三次没有方向。镜像没有请求麦克风权限。",
      modalStamp: "记录时间：03:44　来源：页面外"
    },
    {
      id: "pm_unlit_punctuation",
      label: "短消息 / 无灯",
      kind: "pm",
      tier: 3,
      eligible: function (ctx) {
        return ctx.visited.indexOf("f_reply_shadow") !== -1 && (ctx.visited.indexOf("t_log3") !== -1 || ctx.visited.indexOf("t_eleven") !== -1);
      },
      pm: {
        id: "evt_pm_unlit_punctuation",
        from: "无灯",
        time: "2023-11-03 03:44",
        title: "你也看见那个句号了吗",
        html: "<p>我比对过你正在看的那一页。</p><p>右灯最后三层每一句都有句号，可他以前从来不用。不要继续学他的停顿。</p><p>它会等你写完一句，再替你补最后一个点。</p>"
      },
      toastTitle: "收到一封没有投递记录的短消息",
      toastText: "发件人：无灯。收件箱时间比当前页面晚一分钟。"
    },
    {
      id: "negative_returned_image",
      label: "图像记录 / 底片回传",
      kind: "modal",
      tier: 3,
      eligible: function (ctx) {
        return ctx.visited.indexOf("f_chair_back") !== -1 && (ctx.visited.indexOf("t_eleven") !== -1 || ctx.route === "t_37");
      },
      modalTitle: "底片多出第五个受力点",
      modalText: "图像分析没有识别到第五把椅子，但地面的灰尘留下了四条椅腿和一双鞋。鞋尖朝向拍照的人。",
      modalStamp: "附件：A-0333　校验：与原图不一致"
    },
    {
      id: "phone_line_recalled",
      label: "线路记录 / 回拨",
      kind: "modal",
      tier: 3,
      eligible: function (ctx) {
        return ctx.visited.indexOf("f_phone_line") !== -1 && localStorage.getItem("bbs_choice_phone-return") === "call" && (ctx.route === "t_main" || ctx.route === "t_37");
      },
      modalTitle: "回拨请求已被接收",
      modalText: "你没有授予麦克风权限。线路仍然留下了一段44秒的静默，末尾有一次像键盘的轻响。",
      modalStamp: "入口：值班电话　状态：无人接听　回传：03:44"
    },
    {
      id: "cache_cursor_waiting",
      label: "编辑记录 / 光标",
      kind: "modal",
      tier: 3,
      eligible: function (ctx) {
        return ctx.visited.indexOf("f_editor_cache") !== -1 && localStorage.getItem("bbs_choice_cache-read") === "open" && (ctx.visited.indexOf("t_eleven") !== -1 || ctx.route === "t_37");
      },
      modalTitle: "编辑器没有关闭",
      modalText: "缓存里的最后一个回车没有对应按键。你离开页面后，光标仍停在下一行，等待一个新的作者字段。",
      modalStamp: "缓存段：A-0333　作者：空　校验：未完成"
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
  var LABEL_ALIASES = {
    "新短消息 / 右灯": "短消息 / 右灯",
    "站务提醒 / 青灯": "版务留言 / 青灯",
    "系统告警 / 未知连接": "系统记录 / 03:44"
  };
  function records() {
    var value = read(EVENT_KEY, []);
    if (!Array.isArray(value)) return [];
    var changed = false;
    for (var i = 0; i < value.length; i++) {
      if (LABEL_ALIASES[value[i].label]) {
        value[i].label = LABEL_ALIASES[value[i].label];
        changed = true;
      }
    }
    if (changed) write(EVENT_KEY, value);
    return value;
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
  function migratePms() {
    var map = read(PM_KEY, {}), current = EVENTS[0].pm, changed = false;
    for (var name in map) {
      if (!Array.isArray(map[name])) continue;
      for (var i = 0; i < map[name].length; i++) {
        if (map[name][i] && map[name][i].id === current.id && (map[name][i].title !== current.title || map[name][i].html !== current.html)) {
          map[name][i] = current;
          changed = true;
        }
      }
    }
    if (changed) {
      write(PM_KEY, map);
      try { window.dispatchEvent(new Event("archivepm")); } catch (e) {}
    }
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
    if (depth) depth.textContent = tier >= 3 ? "03:44" : (tier >= 2 ? "03:36" : "03:33");
    if (signal) signal.textContent = tier >= 3 ? "回声延迟" : (tier >= 2 ? "静默同步" : "离线镜像");
    if (monitor) monitor.textContent = tier >= 3 ? "03:44" : (tier >= 2 ? "延迟" : "同步");
    if (copy) copy.textContent = tier >= 3 ? "页脚没有落款" : (tier >= 2 ? "同一行出现两次" : "镜像正在等待请求");
    if (last) last.textContent = localStorage.getItem("bbs_last_thread") || "暂无读取痕迹";
    document.body.setAttribute("data-archive-whisper", tier >= 3 ? "echo" : (tier >= 2 ? "offset" : "still"));
  }
  function updateEventLog() {
    var node = document.getElementById("event-log-list");
    if (!node) return;
    var list = records();
    if (!list.length) { node.innerHTML = "<span>暂未收到新条目</span>"; return; }
    var html = "";
    for (var i = list.length - 1; i >= 0 && i >= list.length - 4; i--) {
      html += '<div class="event-log-entry"><b>' + esc(list[i].label) + '</b><span>已保存到本地浏览记录</span></div>';
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
    backdrop.innerHTML = '<section class="archive-modal" role="dialog" aria-modal="true" aria-labelledby="archive-modal-title"><header class="archive-modal-head"><span>离线镜像 / 系统记录</span><b>03:44</b></header><div class="archive-modal-body"><h2 id="archive-modal-title">' + esc(evt.modalTitle) + '</h2><p>' + esc(evt.modalText) + '</p><p class="modal-stamp">' + esc(evt.modalStamp) + '</p></div><div class="archive-modal-actions"><button type="button" data-event-close>保存并关闭</button></div></section>';
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
    /* A conclusion/replay page is a reading surface. Do not place a pending
       forum alert over the ending chapter or its reset controls. */
    var current = location.hash.replace(/^#\/?/, "");
    if (current.indexOf("ending") === 0 || current.indexOf("replay") === 0 || current.indexOf("thread/t_37") === 0) return;
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
    migratePms();
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
