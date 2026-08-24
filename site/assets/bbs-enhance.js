/*
 * Archive interaction layer.
 * The original BBS engine still owns routing and the source data. This layer
 * makes the same archive behave like a real, imperfect forum: search returns
 * an index, reading is remembered, notes are optional, and posts have usable
 * quote/reply affordances.
 */
(function () {
  "use strict";

  var state = { lastHash: null, hintLevel: 0, bound: false };
  var VISITED_KEY = "bbs_visited";

  function visited() {
    try { return JSON.parse(localStorage.getItem(VISITED_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function hasSeen(id) { return visited().indexOf(id) !== -1; }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function norm(value) {
    return String(value || "").toLowerCase().replace(/[\s「」『』《》〈〉【】“”‘’]/g, "");
  }
  function decode(value) {
    try { return decodeURIComponent(value || ""); } catch (e) { return value || ""; }
  }
  function hashParts() {
    var h = location.hash.replace(/^#\/?/, "");
    return h ? h.split("/") : [];
  }
  function htmlText(html) {
    var box = document.createElement("div");
    box.innerHTML = html || "";
    return (box.textContent || box.innerText || "")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/\s+/g, " ").trim();
  }
  function allThreads() {
    var seen = {}, out = [];
    var groups = [window.BBS && BBS.threads, window.BBS_STORY && BBS_STORY.threads, window.BBS_FILLER && BBS_FILLER.threads, window.BBS_EXPANSION && BBS_EXPANSION.threads];
    for (var g = 0; g < groups.length; g++) {
      var list = groups[g] || [];
      for (var i = 0; i < list.length; i++) {
        if (!list[i] || seen[list[i].id]) continue;
        seen[list[i].id] = true;
        out.push(list[i]);
      }
    }
    return out;
  }
  function canSeeFinal() {
    if (hasSeen("t_eleven") || hasSeen("t_37")) return true;
    var docs = (window.BBS && BBS.docs) || [];
    var v = visited();
    for (var i = 0; i < docs.length; i++) if (v.indexOf(docs[i]) === -1) return false;
    return true;
  }
  function threadById(id) {
    var list = allThreads();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function threadFromHash() {
    var p = hashParts();
    return p[0] === "thread" ? p[1] : "";
  }

  /* A real old forum often carried a small "related posts" trail at the
     bottom of a thread.  It gives the reader a way to follow conversations
     without turning the archive into a visible quest list. */
  var RELATED = {
    t_main: [
      ["f_preflight", "同一晚的编辑记录"],
      ["f_audio_log", "录音帖的后续回复"],
      ["f_night_presence", "闲聊版的在线记录"]
    ],
    t_return: [
      ["t_ip", "回帖地址考据"],
      ["f_reply_shadow", "作者标点比对"],
      ["f_phone_line", "一通没有接通的电话"]
    ],
    t_recovered: [
      ["f_chair_back", "底片背面的补记"],
      ["f_room_rental", "南城房间的旧帖"]
    ],
    f_audio_log: [
      ["f_preflight", "直播前的编辑记录"],
      ["f_chair_back", "同一编号的底片"]
    ],
    f_door_watch: [
      ["f_room_rental", "四号楼的旧租客"],
      ["f_phone_line", "值班电话记录"]
    ],
    f_reply_shadow: [
      ["f_editor_cache", "自动保存的半句话"],
      ["t_log3", "第37楼的残留字段"]
    ],
    f_phone_line: [
      ["f_door_watch", "南城四号楼的敲门帖"],
      ["t_main", "直播主帖"]
    ],
    f_editor_cache: [
      ["f_reply_shadow", "谁在替右灯回帖"],
      ["t_eleven", "补遗页的最后一行"]
    ],
    f_rightlamp_note: [
      ["t_main", "右灯后来的直播主帖"],
      ["t_granny", "他讲过的守灵夜"],
      ["f_phone_line", "断更夜的值班电话"]
    ]
  };

  function relatedThread(id) {
    var item = threadById(id);
    return item && !item.final ? item : null;
  }

  function decorateRelated(tid) {
    var view = document.getElementById("view");
    if (!view || tid === "t_37" || view.querySelector(".related-records")) return;
    var links = RELATED[tid] || [];
    if (!links.length) return;
    var panel = document.createElement("aside");
    panel.className = "related-records";
    panel.setAttribute("aria-label", "相关记录");
    var html = '<div class="related-records-head"><span>相关记录</span><small>引用链仍在</small></div><div class="related-records-list">';
    var count = 0;
    for (var i = 0; i < links.length; i++) {
      var target = relatedThread(links[i][0]);
      if (!target) continue;
      var readState = hasSeen(target.id) ? "已读" : "未读";
      html += '<a class="related-record" href="#/thread/' + esc(target.id) + '">' +
        '<span class="related-record-copy"><b>' + esc(links[i][1]) + '</b><em>' + esc(target.title) + '</em></span>' +
        '<span class="related-record-meta">' + readState + '<br>' + esc(target.time || "时间缺失") + '</span></a>';
      count++;
    }
    if (!count) return;
    panel.innerHTML = html + "</div>";
    var box = view.querySelector(".reply-box");
    if (box && box.parentNode) box.parentNode.insertBefore(panel, box.nextSibling);
    else view.appendChild(panel);
  }
  function docCount() {
    var docs = (window.BBS && BBS.docs) || [], v = visited(), n = 0;
    for (var i = 0; i < docs.length; i++) if (v.indexOf(docs[i]) !== -1) n++;
    return n;
  }
  function archiveObservation(n) {
    var observations = [
      "夜间帖子使用的时间格式与白天不同。",
      "同一位用户的签名在旧年份留下了另一种写法。",
      "图片下方的空白比原帖记录得更长。",
      "版务公告的间距与回复页不一致。",
      "03:44 在两个位置出现，间隔没有说明。",
      "有一行在每次打开时向下移动。"
    ];
    return observations[Math.min(observations.length - 1, Math.floor(n / 6))];
  }
  function archiveWhisper(n, level) {
    var whispers = [
      "有个用户名在别的年份出现过，写法不完全相同。",
      "版块列表没有这条记录，正文里却留着入口。",
      "照片的拍摄时间和编辑时间没有对齐。",
      "公告与同一时段的闲聊回复使用了不同的标点。",
      "登录页的空白字段比其他页面宽一点。",
      "如果听见自己开始报数，把窗口留在原处。"
    ];
    var idx = Math.min(whispers.length - 1, Math.max(0, Math.floor(n / 7) + level - 1));
    return whispers[idx];
  }
  function setDepth() {
    var n = docCount(), depth = n >= 24 ? 3 : (n >= 8 ? 2 : 1);
    /* Progress can only deepen the colour grade. Route changes must not undo it. */
    if (window.ArchiveAtmosphereState) depth = window.ArchiveAtmosphereState.apply(depth);
    document.body.setAttribute("data-archive-depth", depth);
    var presence = document.getElementById("archive-presence");
    if (!presence) {
      presence = document.createElement("span");
      presence.id = "archive-presence";
      presence.setAttribute("aria-hidden", "true");
      var stat = document.getElementById("online-stat");
      if (stat && stat.parentNode) stat.parentNode.insertBefore(presence, stat);
    }
    presence.textContent = "";
    presence.setAttribute("data-whisper", depth >= 3 ? "echo" : (depth >= 2 ? "offset" : "still"));
  }
  function enhanceNotes() {
    var old = document.getElementById("notes-box");
    if (!old) return;
    var n = docCount(), level = 0;
    try { level = parseInt(localStorage.getItem("bbs_hint_level") || "0", 10) || 0; } catch (e) {}
    var collapsed = false, savedCollapse = null;
    try { savedCollapse = localStorage.getItem("bbs_notes_collapsed"); } catch (e2) {}
    collapsed = savedCollapse === "1" || (savedCollapse === null && window.innerWidth < 760);
    old.innerHTML =
      '<div id="notes-head" role="button" tabindex="0" aria-expanded="' + (!collapsed) + '">阅读旁注 <span class="notes-mark" aria-hidden="true">▦</span>　' + (collapsed ? "▸" : "▾") + '</div>' +
      '<div id="notes-body"' + (collapsed ? ' style="display:none"' : '') + '>' +
      '<div class="notes-sec">原始记录：夜间帖子有一段时间字段没有对齐。</div>' +
      '<div class="notes-sec">观察：<span class="notes-goal">' + archiveObservation(n) + '</span></div>' +
      '<div class="notes-sec notes-recent">最近打开：' + esc((localStorage.getItem("bbs_last_thread") || "暂无")) + '</div>' +
      '<button type="button" class="notes-hint" id="notes-hint">' + (level ? "展开旧注" : "留下旁注") + '</button>' +
      '<div class="notes-sec notes-recent" id="notes-hint-text"' + (level ? '' : ' style="display:none"') + '>' + (level ? esc(archiveWhisper(n, level)) : '') + '</div>' +
      '</div>';
    var head = document.getElementById("notes-head");
    var body = document.getElementById("notes-body");
    function toggleNotes() {
      var isHidden = body.style.display === "none";
      body.style.display = isHidden ? "block" : "none";
      head.setAttribute("aria-expanded", String(isHidden));
      head.lastChild.textContent = isHidden ? "　▾" : "　▸";
      try { localStorage.setItem("bbs_notes_collapsed", isHidden ? "0" : "1"); } catch (e) {}
    }
    head.addEventListener("click", toggleNotes);
    head.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggleNotes(); } });
    var hint = document.getElementById("notes-hint");
    if (hint) hint.addEventListener("click", function () {
      level = Math.min(6, level + 1);
      try { localStorage.setItem("bbs_hint_level", String(level)); } catch (e) {}
      var target = document.getElementById("notes-hint-text");
      if (target) { target.style.display = "block"; target.textContent = archiveWhisper(n, level); }
      hint.textContent = level >= 6 ? "旧注已展开" : "展开旧注";
    });
  }
  function ensureChrome() {
    var sub = document.getElementById("logo-sub");
    if (sub) sub.textContent = "liandeng.net / 怪谈 / 民俗 / 都市传说 / 只读副本";
    var form = document.querySelector(".searchform-wrap");
    if (form) {
      form.classList.add("archive-search");
      var input = form.querySelector("input[type=text]");
      if (input) { input.setAttribute("aria-label", "搜索论坛存档"); input.setAttribute("placeholder", "输入一个词，例如：右灯"); }
      var hint = form.querySelector("span");
      if (hint) { hint.className = "search-hint"; hint.textContent = "原站索引不完整，结果可能不止一页"; }
    }
    var footer = document.getElementById("footer");
    if (footer) footer.innerHTML = '<span>莲灯夜话 / 离线镜像 / 字段未校验</span><span>镜像时标：03:44</span>';
  }
  function addRoutePresence(tid) {
    var view = document.getElementById("view");
    if (!view || view.querySelector(".presence-warning")) return;
    var text = "";
    var n = docCount();
    if (tid === "t_37") text = "作者字段为空。页面把这一行留在原位。";
    else if (tid === "t_main" && n >= 8) text = "本页有一处楼层断层。";
    else if (tid === "t_log4" || tid === "t_log5") text = "最后编辑时间与读取时间重叠。";
    if (!text) return;
    var note = document.createElement("div");
    note.className = "presence-warning";
    note.innerHTML = "<b>读取备注</b>　" + esc(text);
    var title = view.querySelector(".thread-head-bar");
    if (title) title.parentNode.insertBefore(note, title.nextSibling);
  }
  function decorateBoard() {
    var view = document.getElementById("view");
    if (!view || view.getAttribute("data-board-enhanced") === location.hash) return;
    var table = view.querySelector("table.bbs");
    if (!table) return;
    var tools = document.createElement("div");
    tools.className = "board-tools";
    tools.innerHTML = '<span>版块快照</span><button type="button" data-board-filter="all">全部</button><button type="button" data-board-filter="sticky">只看置顶</button><button type="button" data-board-filter="unread">未读主题</button>';
    table.parentNode.insertBefore(tools, table);
    var rows = table.querySelectorAll("tr");
    for (var i = 1; i < rows.length; i++) {
      var link = rows[i].querySelector("a[href*='#/thread/']");
      if (!link) continue;
      var match = link.getAttribute("href").match(/thread\/([^#]+)/);
      var id = match ? match[1] : "";
      rows[i].setAttribute("data-thread-id", id);
      if (hasSeen(id)) rows[i].classList.add("is-read");
    }
    tools.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest("button[data-board-filter]") : null;
      if (!btn) return;
      var filter = btn.getAttribute("data-board-filter");
      var all = table.querySelectorAll("tr[data-thread-id]");
      for (var j = 0; j < all.length; j++) {
        var show = filter === "all" || (filter === "sticky" && all[j].textContent.indexOf("置顶") !== -1) || (filter === "unread" && !all[j].classList.contains("is-read"));
        all[j].style.display = show ? "" : "none";
      }
      var buttons = tools.querySelectorAll("button");
      for (var k = 0; k < buttons.length; k++) buttons[k].classList.toggle("active", buttons[k] === btn);
    });
    view.setAttribute("data-board-enhanced", location.hash);
  }
  function decorateThread(tid) {
    var view = document.getElementById("view");
    if (!view) return;
    var posts = view.querySelectorAll(".floor.postbit");
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].getAttribute("data-post-enhanced") === "1") continue;
      var bar = posts[i].querySelector(".p-bar");
      var num = bar && bar.querySelector(".p-fn") ? bar.querySelector(".p-fn").textContent : String(i + 1);
      posts[i].setAttribute("data-floor", num.replace(/\D/g, ""));
      var uid = posts[i].querySelector(".p-uid");
      var links = posts[i].querySelector(".p-links");
      if (links && tid !== "t_37") links.innerHTML = '<button type="button" class="quote-action" data-quote-user="' + esc(uid ? uid.textContent : "网友") + '">引用</button><button type="button" class="reply-action">回复</button>';
      if (links && tid === "t_37") links.textContent = "终局记录";
      var body = posts[i].querySelector(".p-cont");
      if (body && /到我了|五\?|第五声|不要数/.test(body.textContent || "")) posts[i].classList.add("threshold-post");
      posts[i].setAttribute("data-post-enhanced", "1");
    }
    addRoutePresence(tid);
    if (tid === "t_main" || tid === "t_37") {
      var image = view.querySelector(".photo img");
      if (image) image.setAttribute("loading", "lazy");
    }
  }
  function decorateLogin() {
    var panel = document.querySelector(".login-panel");
    if (!panel || panel.getAttribute("data-login-enhanced") === "1") return;
    var name = panel.querySelector("#login-name"), pass = panel.querySelector("#login-pass");
    if (name) { name.setAttribute("autocomplete", "username"); name.setAttribute("placeholder", "用户名"); name.insertAdjacentHTML("beforebegin", '<label for="login-name">用户名</label>'); }
    if (pass) { pass.setAttribute("autocomplete", "current-password"); pass.setAttribute("placeholder", "密码"); pass.insertAdjacentHTML("beforebegin", '<label for="login-pass">密码</label>'); }
    panel.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var button = panel.querySelector("#login-btn");
      if (button) button.click();
    });
    panel.setAttribute("data-login-enhanced", "1");
  }
  function decoratePM() {
    var view = document.getElementById("view");
    if (!view || view.querySelector(".pm-security")) return;
    var bar = document.createElement("div");
    bar.className = "pm-security";
    bar.textContent = "站内信来自离线镜像。时间字段按原样保留。";
    var table = view.querySelector("table.bbs");
    if (table) table.parentNode.insertBefore(bar, table);
  }
  function searchData(query) {
    var q = norm(query), list = allThreads(), results = [], i;
    if (!q) return results;
    for (i = 0; i < list.length; i++) {
      var t = list[i];
      if (t.id === "t_37" && !canSeeFinal()) continue;
      var body = "";
      var posts = t.posts || [];
      for (var p = 0; p < posts.length; p++) body += " " + htmlText(posts[p].html);
      var title = norm(t.title), author = norm(t.author), content = norm(body), score = 0;
      if (title === q) score += 30;
      else if (title.indexOf(q) !== -1) score += 16;
      if (author.indexOf(q) !== -1) score += 9;
      if (content.indexOf(q) !== -1) score += Math.min(12, content.split(q).length - 1);
      if (window.BBS && BBS.routes && BBS.routes[query] === t.id) score += 20;
      if (score) results.push({ type: "thread", item: t, score: score, body: body });
    }
    var users = Object.assign({}, (window.BBS && BBS.users) || {}, (window.BBS_STORY && BBS_STORY.users) || {}, (window.BBS_FILLER && BBS_FILLER.users) || {}, (window.BBS_EXPANSION && BBS_EXPANSION.users) || {});
    for (var name in users) {
      if (norm(name).indexOf(q) !== -1) results.push({ type: "user", name: name, score: 18, body: users[name].sig || "用户资料" });
    }
    results.sort(function (a, b) { return b.score - a.score || String(a.item ? a.item.time : "").localeCompare(String(b.item ? b.item.time : "")); });
    return results.slice(0, 9);
  }
  function snippet(text, query) {
    var clean = String(text || "").replace(/\s+/g, " ");
    var at = norm(clean).indexOf(norm(query));
    if (at > 70) at -= 45;
    if (at < 0) at = 0;
    var part = clean.slice(at, at + 124);
    return esc(part) + (at + 124 < clean.length ? "..." : "");
  }
  function renderSearch(query) {
    var view = document.getElementById("view");
    if (!view || view.getAttribute("data-search-query") === query) return;
    var results = searchData(query), html = '<div class="search-head"><div><span class="gate-kicker">ARCHIVE INDEX</span><h2>检索存档</h2></div><span class="archive-clock">' + esc(query) + '</span></div>';
    html += '<div class="search-meta">查询：<b>' + esc(query) + '</b>　找到 ' + results.length + ' 条记录。索引不保证完整。</div>';
    if (!results.length) {
      var n = docCount();
      html += '<div class="search-empty"><strong>没有匹配记录。</strong><p>' + (n > 10 ? "查询已经写入这份镜像，但返回为空。请换一个更接近原帖的词。" : "旧索引只收录正文里出现过的词。回到已读帖子里再找一次。") + '</p><p class="stamp">搜索不会告诉你哪些字被删过。</p></div>';
    } else {
      for (var i = 0; i < results.length; i++) {
        var r = results[i];
        if (r.type === "user") {
          html += '<article class="search-result-item user-result"><div class="result-kind">用户资料</div><a href="#/user/' + encodeURIComponent(r.name) + '">' + esc(r.name) + '</a><div class="snippet">' + esc(r.body) + '</div></article>';
        } else {
          var t = r.item, hidden = t.hidden ? '<span class="result-flag">隐藏记录</span>' : '';
          html += '<article class="search-result-item"><div class="result-kind">' + (t.board === "zhanwu" ? "站务版" : "怪谈版") + ' ' + hidden + '</div><a href="#/thread/' + esc(t.id) + '">' + esc(t.title) + '</a><div class="snippet">' + snippet(r.body, query) + '</div><div class="result-meta">' + esc(t.author) + '　' + esc(t.time || "时间缺失") + '</div></article>';
        }
      }
    }
    var history = [];
    try { history = JSON.parse(localStorage.getItem("bbs_searches") || "[]"); } catch (e) {}
    if (history.length) {
      html += '<div class="search-history"><span>最近检索</span>';
      for (var h = 0; h < Math.min(5, history.length); h++) html += '<a href="#/search/' + encodeURIComponent(history[h]) + '">' + esc(history[h]) + '</a>';
      html += '</div>';
    }
    view.innerHTML = html;
    view.setAttribute("data-search-query", query);
    try {
      history = history.filter(function (x) { return x !== query; });
      history.unshift(query); localStorage.setItem("bbs_searches", JSON.stringify(history.slice(0, 8)));
    } catch (e2) {}
  }
  function rememberThread(tid) {
    if (!tid) return;
    var t = threadById(tid), reads = 0;
    var head = document.querySelector("#view .thread-head-bar .stamp");
    var alreadyStamped = head && head.getAttribute("data-read-stamped") === "1";
    try {
      localStorage.setItem("bbs_last_thread", t ? t.title : tid);
      reads = parseInt(localStorage.getItem("bbs_reads_" + tid) || "0", 10);
      if (!alreadyStamped) {
        reads += 1;
        localStorage.setItem("bbs_reads_" + tid, String(reads));
      }
    } catch (e) {}
    if (head && reads && !alreadyStamped) {
      head.textContent += "　读取 " + reads;
      head.setAttribute("data-read-stamped", "1");
    }
  }
  function enhance(force) {
    var view = document.getElementById("view");
    if (!view) return;
    var current = location.hash;
    if (!force && state.lastHash === current) return;
    state.lastHash = current;
    ensureChrome(); setDepth(); enhanceNotes();
    var p = hashParts(), kind = p[0] || "index";
    if (kind === "search") {
      renderSearch(decode(p.slice(1).join("/")));
    } else if (kind === "board") {
      decorateBoard();
    } else if (kind === "thread") {
      var tid = p[1] || ""; rememberThread(tid); decorateThread(tid);
      decorateRelated(tid);
    } else if (kind === "pm") {
      decoratePM();
    } else if (kind === "login") {
      decorateLogin();
    }
    view.classList.remove("route-enter");
    void view.offsetWidth;
    view.classList.add("route-enter");
  }
  function bindGlobal() {
    if (state.bound) return;
    state.bound = true;
    document.addEventListener("click", function (ev) {
      var target = ev.target;
      var quote = target && target.closest ? target.closest(".quote-action") : null;
      var reply = target && target.closest ? target.closest(".reply-action") : null;
      if (quote || reply) {
        var box = document.getElementById("reply-text");
        if (!box) return;
        if (quote) {
          var who = quote.getAttribute("data-quote-user") || "网友";
          box.value = "引用 " + who + "：\n";
        }
        box.focus();
        ev.preventDefault();
      }
      if (target && target.id === "login-btn") setTimeout(function () { enhance(true); }, 30);
      if (target && target.id === "reply-btn") setTimeout(function () { enhance(true); }, 80);
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "/" && document.activeElement && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        var input = document.getElementById("search-input");
        if (input) { ev.preventDefault(); input.focus(); }
      }
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    bindGlobal();
    setTimeout(function () { enhance(true); }, 0);
  });
  window.addEventListener("hashchange", function () { setTimeout(function () { enhance(true); }, 30); });
  window.ArchiveBBS = { enhance: enhance, allThreads: allThreads, docCount: docCount, canSeeFinal: canSeeFinal };
})();
