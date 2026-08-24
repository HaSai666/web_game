/* ===== 莲灯夜话 BBS 引擎 ===== */
(function () {
"use strict";

/* ---------- 数据合并 ---------- */
var BOARDS = BBS.boards, USERS = BBS.users, ACCOUNTS = BBS.accounts;
function loadUsers(u) {
  if (!u) return;
  for (var k in u) if (!USERS[k]) USERS[k] = u[k];
}
loadUsers(window.BBS_STORY && BBS_STORY.users);
loadUsers(window.BBS_FILLER && BBS_FILLER.users);
loadUsers(window.BBS_EXPANSION && BBS_EXPANSION.users);
var THREADS = {};
function loadThreads(arr) {
  if (!arr) return;
  for (var i = 0; i < arr.length; i++) THREADS[arr[i].id] = arr[i];
}
loadThreads(BBS.threads);
loadThreads(window.BBS_STORY && BBS_STORY.threads);
loadThreads(window.BBS_FILLER && BBS_FILLER.threads);
loadThreads(window.BBS_EXPANSION && BBS_EXPANSION.threads);
if (window.BBS_STORY && BBS_STORY.pms) {
  for (var k in BBS_STORY.pms) {
    if (!BBS.pms[k]) BBS.pms[k] = { inbox: [], drafts: [] };
    if (BBS_STORY.pms[k].inbox) BBS.pms[k].inbox = BBS.pms[k].inbox.concat(BBS_STORY.pms[k].inbox);
    if (BBS_STORY.pms[k].drafts) BBS.pms[k].drafts = BBS.pms[k].drafts.concat(BBS_STORY.pms[k].drafts);
  }
}

/* ---------- 状态 ---------- */
function getVisited() {
  try { return JSON.parse(localStorage.getItem("bbs_visited") || "[]"); }
  catch (e) { return []; }
}
function markVisited(id) {
  if (!id) return;
  var v = getVisited();
  if (v.indexOf(id) === -1) { v.push(id); try { localStorage.setItem("bbs_visited", JSON.stringify(v)); } catch (e) {} }
}
function session() { return localStorage.getItem("bbs_session") || ""; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function pmWasRead(id) {
  try { return JSON.parse(localStorage.getItem("bbs_pm_read") || "[]").indexOf(id) !== -1; }
  catch (e) { return false; }
}
function markPmRead(id) {
  if (!id) return;
  var list = [];
  try { list = JSON.parse(localStorage.getItem("bbs_pm_read") || "[]"); } catch (e) {}
  if (list.indexOf(id) === -1) list.push(id);
  try { localStorage.setItem("bbs_pm_read", JSON.stringify(list)); } catch (e2) {}
}
function eventPmsFor(name) {
  var map = {};
  try { map = JSON.parse(localStorage.getItem("bbs_event_pms") || "{}"); } catch (e) {}
  return map && Array.isArray(map[name]) ? map[name] : [];
}
function pmDataFor(name) {
  var base = BBS.pms[name] || { inbox: [], drafts: [] };
  return { inbox: eventPmsFor(name).concat(base.inbox || []), drafts: (base.drafts || []).slice() };
}
function pmUnreadCount(name) {
  var data = pmDataFor(name), n = 0;
  for (var i = 0; i < data.inbox.length; i++) if (!pmWasRead(data.inbox[i].id)) n++;
  return n;
}

/* ---------- 热词 ---------- */
function hotwords(html) {
  return html.replace(/\[\[([^\]]+)\]\]/g, '<span class="hw" data-kw="$1">$1</span>');
}
document.addEventListener("click", function (e) {
  var t = e.target;
  if (t && t.classList && t.classList.contains("hw")) {
    location.hash = "#/search/" + encodeURIComponent(t.getAttribute("data-kw"));
  }
});

/* ---------- 头像 ---------- */
function avatarColor(name) {
  var h = 0;
  for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return "hsl(" + h + ",30%,38%)";
}

/* ---------- 计数器 ---------- */
function onlineNum() {
  var v = getVisited();
  if (v.indexOf("t_eleven") !== -1 || v.indexOf("t_37") !== -1 || v.indexOf("f_night_presence") !== -1) return 5;
  return 4;
}

/* ---------- 缺失楼层门禁 ---------- */
function canSee37() {
  var v = getVisited();
  if (v.indexOf("t_eleven") !== -1) return true;
  for (var i = 0; i < BBS.docs.length; i++) {
    if (v.indexOf(BBS.docs[i]) === -1) return false;
  }
  return true;
}

function setEndingSignal(value) {
  try { localStorage.setItem("bbs_ending_signal", value); } catch (e) {}
}
function noteRouteTransition(next) {
  var previous = "";
  try { previous = localStorage.getItem("bbs_last_route") || ""; } catch (e) {}
  if (!next && previous.indexOf("pm") === 0 && localStorage.getItem("bbs_read_rightlamp") === "1") {
    try { localStorage.setItem("bbs_returned_home_after_pm", "1"); } catch (e2) {}
  }
  if (next.indexOf("thread/t_37") === 0 && previous.indexOf("search/") === 0) {
    try { localStorage.setItem("bbs_entered_final_from_search", "1"); } catch (e3) {}
  }
  try { localStorage.setItem("bbs_last_route", next); } catch (e4) {}
}

/* ---------- 渲染·骨架 ---------- */
function setTier(t) {
  if (window.ArchiveAtmosphereState) {
    window.ArchiveAtmosphereState.apply(t || 1);
    return;
  }
  /* Fallback for a partially cached page while the shared state script loads. */
  var current = parseInt(document.body.getAttribute("data-atmosphere-tier") || "1", 10) || 1;
  var next = Math.max(1, current, parseInt(t, 10) || 1);
  document.body.classList.remove("t1", "t2", "t3");
  document.body.classList.add("t" + Math.min(3, next));
  document.body.setAttribute("data-atmosphere-tier", String(Math.min(3, next)));
}
function renderChrome(crumbsHtml) {
  var endingLink = "";
  try {
    var endingSeen = JSON.parse(localStorage.getItem("bbs_endings_seen") || "[]");
    if (Array.isArray(endingSeen) && endingSeen.length) endingLink = ' | <a href="#/ending">结局档案</a>';
  } catch (e) {}
  document.getElementById("nav-links").innerHTML =
    '<a href="#/">论坛首页</a> | <a href="#/board/guaitan">怪谈版</a> | <a href="#/board/xianliao">闲聊版</a> | <a href="#/board/zhanwu">站务版</a> | 排行榜' + endingLink;
  document.getElementById("online-num").textContent = onlineNum();
  document.getElementById("crumbs").innerHTML = '<a href="#/">莲灯夜话</a> ' + crumbsHtml;
  var s = session();
  var ub = document.getElementById("userbar");
  if (s) {
    var recycleLink = (s === "青灯") ? ' | <a href="#/recycle">回收站</a>' : "";
    var unread = pmUnreadCount(s);
    var pmLabel = "短消息" + (unread ? " <span class='pm-unread'>(" + unread + ")</span>" : "");
    ub.innerHTML = "您好：<b>" + esc(s) + "</b>　<a href='#/pm'>" + pmLabel + "</a>" + recycleLink + " | <a href='#' id='logout-link'>退出</a>";
    document.getElementById("logout-link").addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("bbs_session");
      location.hash = "#/"; location.reload();
    });
  } else {
    ub.innerHTML = "您好：游客　<a href='#/login'>登录</a> | <span title='注册已关闭'>注册</span>";
  }
  var f = document.querySelector(".searchform-wrap");
  if (!f) {
    var sb = document.createElement("div");
    sb.className = "searchform-wrap";
    sb.innerHTML = '搜索：<input type="text" id="search-input" aria-label="搜索论坛存档" placeholder="输入一个词，例如：右灯"> <button id="search-btn">搜索</button> <span>原站索引不完整，结果可能不止一页</span>';
    var view = document.getElementById("view");
    view.parentNode.insertBefore(sb, view);
    document.getElementById("search-btn").addEventListener("click", function () {
      var q = document.getElementById("search-input").value;
      if (q) location.hash = "#/search/" + encodeURIComponent(q.replace(/^\s+|\s+$/g, ""));
    });
    document.getElementById("search-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") document.getElementById("search-btn").click();
    });
  }
  injectNotes();
}

/* ---------- 阅读旁注 ---------- */
function archiveMarginNote() {
  var v = getVisited();
  if (v.indexOf("t_37") !== -1 || v.indexOf("t_eleven") !== -1) return "03:44 在两个位置出现，间隔没有说明。";
  if (v.indexOf("t_log4") !== -1 || v.indexOf("t_log5") !== -1) return "最后编辑时间与读取时间重叠。";
  if (v.indexOf("t_main") !== -1) return "同一位用户的签名在旧年份留下了另一种写法。";
  return "夜间帖子使用的时间格式与白天不同。";
}
function injectNotes() {
  var old = document.getElementById("notes-box");
  if (old) old.remove();
  var box = document.createElement("div");
  box.id = "notes-box";
  box.innerHTML =
    '<div id="notes-head">阅读旁注 ▾</div>' +
    '<div id="notes-body">' +
      '<div class="notes-sec">原始记录：夜间帖子有一段时间字段没有对齐。</div>' +
      '<div class="notes-sec">观察：<span class="notes-goal">' + archiveMarginNote() + '</span></div>' +
    '</div>';
  document.body.appendChild(box);
  document.getElementById("notes-head").addEventListener("click", function () {
    var b = document.getElementById("notes-body");
    b.style.display = (b.style.display === "none") ? "block" : "none";
  });
}

/* ---------- 视图·首页 ---------- */
function viewIndex() {
  setTier(1);
  renderChrome("» 论坛首页");
  var html = '<table class="bbs"><tr><th>版块</th><th class="c" style="width:90px;">主题 / 帖数</th><th style="width:220px;">最后发表</th></tr>';
  for (var i = 0; i < BOARDS.length; i++) {
    var b = BOARDS[i], n = 0, posts = 0, last = null;
    for (var id in THREADS) {
      var t = THREADS[id];
      if (t.board === b.id && !t.hidden) {
        n++; posts += t.posts.length;
        var lp = t.posts[t.posts.length - 1];
        if (!last || lp.time > last.time) last = { time: lp.time, uid: lp.uid, title: t.title, id: t.id };
      }
    }
    var name = b.broken ? '<span style="color:#999;">' + b.name + '</span>' : '<a href="#/board/' + b.id + '">' + b.name + '</a>';
    html += '<tr' + (i % 2 ? ' class="alt"' : '') + '><td><div class="board-name">' + name + '</div><div class="board-desc">' + b.desc + '</div></td>' +
      '<td class="c">' + (b.broken ? "-- / --" : n + " / " + posts) + '</td><td class="lastpost">' +
      (last ? '<a href="#/thread/' + last.id + '">' + esc(last.title) + '</a><br>' + last.time + '　' + esc(last.uid) : "-") + '</td></tr>';
  }
  html += '</table>';
  html += '<div class="quote" style="margin-top:14px;">本论坛已于2012年9月关闭。当前为只读存档。帖子里的<span class="hw">点状词</span>是存档系统自动标记的检索词，点击即可搜索。</div>';
  document.getElementById("view").innerHTML = html;
}

/* ---------- 视图·版块 ---------- */
function viewBoard(bid) {
  var b = null;
  for (var i = 0; i < BOARDS.length; i++) if (BOARDS[i].id === bid) b = BOARDS[i];
  if (!b) { location.hash = "#/"; return; }
  setTier(1);
  renderChrome("» <a href='#/board/" + b.id + "'>" + b.name + "</a>");
  if (b.broken) {
    document.getElementById("view").innerHTML =
      '<div class="quote">贴图版数据在2012年2月27日的机房事故中全损，无法访问。</div>' +
      '<p style="margin-top:10px;">只有一个帖子被抢救了出来，<a href="#/thread/t_recovered">点这里查看</a>。</p>';
    return;
  }
  var list = [];
  for (var id in THREADS) {
    var t = THREADS[id];
    if (t.board === bid && !t.hidden) list.push(t);
  }
  list.sort(function (a, c) {
    if (!!a.sticky !== !!c.sticky) return a.sticky ? -1 : 1;
    var la = a.posts[a.posts.length - 1].time, lc = c.posts[c.posts.length - 1].time;
    return la < lc ? 1 : -1;
  });
  var html = '<table class="bbs"><tr><th>主题</th><th class="c" style="width:110px;">作者</th><th class="c" style="width:80px;">回复/查看</th><th style="width:190px;">最后发表</th></tr>';
  for (i = 0; i < list.length; i++) {
    t = list[i];
    var badge = (t.sticky ? '<span class="sticky-badge">[置顶]</span> ' : "") + (t.jing ? '<span class="jing-badge">[精华]</span> ' : "");
    var lp = t.posts[t.posts.length - 1];
    html += '<tr' + (i % 2 ? ' class="alt"' : '') + '><td class="thread-title-cell">' + badge +
      '<a href="#/thread/' + t.id + '">' + esc(t.title) + '</a></td>' +
      '<td class="c">' + esc(t.author) + '</td><td class="c">' + (t.posts.length - 1) + ' / ' + (t.views || "--") + '</td>' +
      '<td class="lastpost">' + lp.time + '<br>' + esc(lp.uid) + '</td></tr>';
  }
  html += '</table>';
  document.getElementById("view").innerHTML = html;
}

/* ---------- 楼层渲染 ---------- */
function postHtml(p, tier) {
  var u = USERS[p.uid] || { reg: "2004-××-××", posts: "??", title: "会员", sig: "" };
  return '<div class="floor postbit">' +
    '<div class="p-side"><div class="p-avatar" style="background:' + avatarColor(p.uid) + '">' + esc(p.uid.charAt(0)) + '</div>' +
    '<div class="p-uid"><a href="#/user/' + encodeURIComponent(p.uid) + '">' + esc(p.uid) + '</a></div>' +
    '<div class="p-title">' + esc(u.title) + '</div>' +
    '<div class="p-meta">注册：' + u.reg + '<br>发帖：' + u.posts + '</div></div>' +
    '<div class="p-main"><div class="p-bar"><span class="p-time">' + p.time + '</span><span class="p-fn">' + (p.num ? p.num + "楼" : "") + '</span><span class="p-links">引用　回复</span></div>' +
    '<div class="p-cont">' + hotwords(p.html) +
    (u.sig ? '<div class="sigline">' + esc(u.sig) + '</div>' : "") +
    '</div></div></div>';
}

/* ---------- 视图·读帖 ---------- */
function viewThread(tid) {
  var t = THREADS[tid];
  if (!t) { viewSearch(""); return; }
  if (t.id === "t_37" && !canSee37()) {
    setTier(3);
    renderChrome("» <a href='#/board/guaitan'>怪谈版</a> » （不存在）");
    document.getElementById("view").innerHTML =
      '<div class="thread-head-bar">该楼层不存在</div>' +
      '<div class="quote">版规第十条：本版块没有第37楼。</div>' +
      '<p class="stamp">（也许还没有到能看到它的时候。）</p>';
    return;
  }
  setTier(t.tier || 1);
  var bname = "怪谈版";
  for (var i = 0; i < BOARDS.length; i++) if (BOARDS[i].id === t.board) bname = BOARDS[i].name;
  renderChrome("» <a href='#/board/" + t.board + "'>" + bname + "</a> » " + esc(t.title));
  if (t.doc) markVisited(t.id);
  if (t.id === "t_37") markVisited("t_37");

  /* 玩家自己发的楼层（通关后） */
  var myFloors = [];
  try { myFloors = JSON.parse(localStorage.getItem("bbs_myfloors") || "[]"); } catch (e) {}

  var html = '<div class="thread-head-bar">' + esc(t.title) +
    '<span class="stamp">查看: ' + (t.views || "--") + '　回复: ' + (t.posts.length - 1) + '</span></div>';
  for (i = 0; i < t.posts.length; i++) html += postHtml(t.posts[i], t.tier);
  for (i = 0; i < myFloors.length; i++) if (myFloors[i].tid === t.id) html += postHtml(myFloors[i], t.tier);

  /* 回复框。终局帖不再把玩家留在输入框里，结局章节直接接管页面。 */
  var unlocked = BBS.docs.every(function (d) { return getVisited().indexOf(d) !== -1; });
  var isFinalThread = t.id === "t_37";
  if (!isFinalThread) {
    html += '<div class="reply-box"><b>快速回复</b>　<span class="reply-note">（本论坛已于2012年关闭）</span>' +
      '<textarea id="reply-text"></textarea><br><button id="reply-btn">发表回复</button></div>';
  }
  var endingId = "";
  if (t.id === "t_37" && window.ArchiveEndings) {
    endingId = window.ArchiveEndings.pick();
    html += window.ArchiveEndings.render(endingId);
  }
  document.getElementById("view").innerHTML = html;
  if (endingId && window.ArchiveEndings && window.ArchiveEndings.announce) {
    window.ArchiveEndings.announce(endingId);
  }

  /* 第37楼按钮 */
  var btn = document.getElementById("next-floor-btn");
  if (btn && unlocked) {
    btn.className = "next-floor unlocked";
    btn.textContent = "下一楼（37）";
    btn.removeAttribute("onclick");
    btn.href = "#/thread/t_37";
  }

  var replyButton = document.getElementById("reply-btn");
  if (!replyButton) return;
  replyButton.addEventListener("click", function () {
    var txt = document.getElementById("reply-text").value;
    if (!txt || !txt.replace(/^\s+|\s+$/g, "")) return;
    if (unlocked && t.id === "t_main") {
      var f = { tid: t.id, uid: session() || "游客", time: "2005-02-27 03:44", num: "??",
        html: "<p>" + esc(txt) + "</p>" };
      myFloors.push(f);
      setEndingSignal("occupied");
      try { localStorage.setItem("bbs_myfloors", JSON.stringify(myFloors)); } catch (e) {}
      viewThread(t.id);
    } else {
      alert("论坛已于2012年9月关闭，存档为只读，无法发帖。");
    }
  });
}

/* ---------- 视图·用户资料 ---------- */
function viewUser(name) {
  name = decodeURIComponent(name);
  var u = USERS[name];
  if (!u) { location.hash = "#/"; return; }
  setTier(name === "提灯人" ? 2 : 1);
  renderChrome("» 用户 » " + esc(name));
  if (name === "右灯") markVisited("u_youdeng");
  if (name === "提灯人") markVisited("u_tidengren");
  var extra = "";
  if (name === "右灯") {
    extra = '<p>最后在线：<span class="red">2005-02-27 03:44</span></p>' +
      '<p class="stamp">存档注：03:44之后，这个号再没上来过。他早年发过一个讲家里事的帖，《[[外婆的守灵夜]]》，看完你就知道，这人胆子其实不大。</p>';
  } else if (name === "提灯人") {
    extra = '<p>注册时间：<span class="red">2005-02-27 03:44</span></p>' +
      '<p>主题帖：0　短消息草稿：3篇（<a href="#/login">登录</a>后可见）</p>' +
      '<p class="stamp">签名档写着：密码是那一天的时刻。</p>';
  } else if (name === "提灯前的蛤蟆") {
    extra = '<p>最后在线：2005-02-27 03:44</p><p class="stamp">此后再未登录。</p>';
  } else {
    extra = '<p>最后在线：2008年以前</p>';
  }
  document.getElementById("view").innerHTML =
    '<div class="thread-head-bar">用户资料 · ' + esc(name) + '</div>' +
    '<div class="floor postbit"><div class="p-side"><div class="p-avatar" style="background:' + avatarColor(name) + '">' + esc(name.charAt(0)) + '</div>' +
    '<div class="p-uid">' + esc(name) + '</div><div class="p-title">' + esc(u.title) + '</div></div>' +
    '<div class="p-main"><div class="p-cont"><p>注册时间：' + u.reg + '</p><p>发帖：' + u.posts + '</p><p>签名档：' + esc(u.sig || "（无）") + '</p>' + hotwords(extra) + '</div></div></div>';
}

/* ---------- 视图·登录 ---------- */
function viewLogin(msg) {
  setTier(1);
  renderChrome("» 会员登录");
  document.getElementById("view").innerHTML =
    '<form class="login-panel" onsubmit="return false;"><h3>会员登录</h3>' +
    '<input type="text" id="login-name" placeholder="用户名">' +
    '<input type="password" id="login-pass" placeholder="密码">' +
    '<button id="login-btn">登录</button>' +
    '<div class="login-err">' + (msg || "") + '</div>' +
    '<div class="login-tip">提示：注册功能已关闭。旧账号的密码仍按原站规则校验。</div></form>';
  document.getElementById("login-btn").addEventListener("click", function () {
    var n = document.getElementById("login-name").value.replace(/^\s+|\s+$/g, "");
    var p = document.getElementById("login-pass").value.replace(/^\s+|\s+$/g, "");
    if (BBS.frozen[n]) {
      viewLogin("该账号已被冻结。冻结时间：" + BBS.frozen[n]);
      return;
    }
    if (ACCOUNTS[n] && ACCOUNTS[n].pw === p) {
      localStorage.setItem("bbs_session", n);
      location.hash = "#/pm";
    } else {
      viewLogin("用户名或密码错误。");
    }
  });
}

/* ---------- 视图·短消息 ---------- */
function viewPM(box, idx) {
  var s = session();
  if (!s) { viewLogin("请先登录。"); return; }
  setTier(s === "提灯人" ? 3 : 2);
  renderChrome("» 短消息");
  var data = pmDataFor(s);
  if (idx !== undefined && idx !== null && idx !== "") {
    var list = box === "drafts" ? data.drafts : data.inbox;
    var pm = list[parseInt(idx, 10)];
    if (!pm) { location.hash = "#/pm"; return; }
    if (pm.doc) markVisited(pm.id);
    markPmRead(pm.id);
    if (pm.id === "evt_pm_rightlamp_0336") {
      try { localStorage.setItem("bbs_read_rightlamp", "1"); } catch (e) {}
    }
    document.getElementById("view").innerHTML =
      '<div class="thread-head-bar">' + esc(pm.title) + '</div>' +
      '<div class="quote">' + (box === "drafts" ? "存于草稿箱" : "发件人：" + esc(pm.from)) + "　" + pm.time + '</div>' +
      '<div class="floor postbit"><div class="p-side"><div class="p-avatar" style="background:' + avatarColor(pm.from) + '">' + esc(pm.from.charAt(0)) + '</div><div class="p-uid">' + esc(pm.from) + '</div></div>' +
      '<div class="p-main"><div class="p-cont">' + hotwords(pm.html) + '</div></div></div>' +
      '<p><a href="#/pm">« 返回短消息列表</a></p>';
    return;
  }
  var html = '<div class="pm-tabs"><b>' + esc(s) + ' 的短消息</b>　<a href="#/pm">收件箱 (' + data.inbox.length + ')</a> | <a href="#/pm/drafts">草稿箱 (' + data.drafts.length + ')</a></div>';
  var show = (box === "drafts") ? data.drafts : data.inbox;
  html += '<table class="bbs"><tr><th>标题</th><th class="c" style="width:120px;">' + (box === "drafts" ? "类型" : "发件人") + '</th><th style="width:170px;">时间</th></tr>';
  if (!show.length) html += '<tr><td colspan="3" class="c" style="color:#999;">（空）</td></tr>';
  for (var i = 0; i < show.length; i++) {
    var pm2 = show[i];
    html += '<tr' + (i % 2 ? ' class="alt"' : '') + '><td>' + (pmWasRead(pm2.id) ? '' : '<span class="pm-unread">未读　</span>') + '<a href="#/pm/' + (box === "drafts" ? "drafts/" : "") + i + '">' + esc(pm2.title) + '</a></td>' +
      '<td class="c">' + (box === "drafts" ? "草稿" : esc(pm2.from)) + '</td><td class="pm-time">' + pm2.time + '</td></tr>';
  }
  html += '</table>';
  document.getElementById("view").innerHTML = html;
}

/* ---------- 视图·回收站 ---------- */
function viewRecycle(idx) {
  var s = session();
  if (!s) { viewLogin("请先登录。"); return; }
  if (s !== "青灯") {
    setTier(2);
    renderChrome("» 回收站");
    document.getElementById("view").innerHTML = '<div class="quote">回收站仅版主可见。你当前的身份是「' + esc(s) + '」。</div>';
    return;
  }
  setTier(3);
  renderChrome("» 回收站（版主）");
  if (idx !== undefined && idx !== null && idx !== "") {
    var d = BBS.deleted[parseInt(idx, 10)];
    if (!d) { location.hash = "#/recycle"; return; }
    markVisited(d.id);
    if (d.id === "del_37" && s === "青灯") setEndingSignal("sealed");
    document.getElementById("view").innerHTML =
      '<div class="thread-head-bar">' + esc(d.title) + '</div>' +
      '<div class="quote">' + d.log + '　原时间：' + d.time + '</div>' +
      '<div class="floor postbit"><div class="p-side"><div class="p-avatar" style="background:#333">删</div><div class="p-uid">' + esc(d.by) + '</div></div>' +
      '<div class="p-main"><div class="p-cont">' + d.html + '</div></div></div>' +
      '<p><a href="#/recycle">« 返回回收站</a></p>';
    return;
  }
  var html = '<div class="quote">已删除的内容。只有版主能看到这里。</div><table class="bbs"><tr><th>标题</th><th style="width:260px;">删除记录</th></tr>';
  for (var i = 0; i < BBS.deleted.length; i++) {
    var d2 = BBS.deleted[i];
    html += '<tr' + (i % 2 ? ' class="alt"' : '') + '><td><a href="#/recycle/' + i + '">' + esc(d2.title) + '</a></td><td class="pm-time">' + d2.log + '</td></tr>';
  }
  html += '</table>';
  document.getElementById("view").innerHTML = html;
}

/* ---------- 搜索路由：精确 → 去括号 → 包含匹配 ---------- */
function findRoute(q) {
  if (BBS.routes[q]) return BBS.routes[q];
  var norm = q.replace(/[「」『』《》〈〉""''【】\s]/g, "");
  if (BBS.routes[norm]) return BBS.routes[norm];
  if (norm.length >= 2) {
    for (var k in BBS.routes) {
      if (k.length >= 2 && (norm.indexOf(k) !== -1 || k.indexOf(norm) !== -1)) {
        return BBS.routes[k];
      }
    }
  }
  return null;
}

/* ---------- 视图·搜索 ---------- */
function viewSearch(q) {
  q = decodeURIComponent(q || "").replace(/^\s+|\s+$/g, "");
  setTier(getVisited().length >= 20 ? 3 : (getVisited().length >= 8 ? 2 : 1));
  renderChrome("» 搜索");
  if (!q) { document.getElementById("view").innerHTML = '<div class="quote">请输入关键词。</div>'; return; }
  var r = findRoute(q);
  if (r === "t_37" && !canSee37()) r = null; /* 缺失楼层仍保持隐藏 */
  if (!r) {
    var v = getVisited().length, msg;
    if (v < 8) msg = "<p>没有找到与「" + esc(q) + "」相关的内容。</p><p class='stamp'>请检查关键词，或回到帖子里找别的词。</p>";
    else if (v < 20) msg = "<p>没有找到与「" + esc(q) + "」相关的内容。</p><p class='stamp'>这个词不在存档里。也可能是它<span class='red'>不想被找到</span>。</p>";
    else msg = "<p>没有找到。</p><p>别搜了。</p><p class='corrupt'>它在数到你了。</p>";
    document.getElementById("view").innerHTML = '<div class="floor postbit"><div class="p-main" style="flex:1"><div class="p-cont">' + msg + '</div></div></div>';
    return;
  }
  if (r.indexOf("u:") === 0) { location.hash = "#/user/" + encodeURIComponent(r.slice(2)); return; }
  var t = THREADS[r];
  if (!t) { document.getElementById("view").innerHTML = '<div class="quote">数据缺失。</div>'; return; }
  /* 搜索结果页：像论坛一样列出来，点进去 */
  var snippet = t.posts[0].html.replace(/<[^>]+>/g, "").replace(/\[\[|\]\]/g, "").slice(0, 80);
  document.getElementById("view").innerHTML =
    '<div class="quote">搜索「' + esc(q) + '」，找到 1 个结果' + (t.hidden ? '（<span class="red">隐藏文档</span>，不出现在版块列表中）' : '') + '：</div>' +
    '<div class="search-result-item"><a href="#/thread/' + t.id + '" style="font-size:15px;font-weight:bold;">' + esc(t.title) + '</a>' +
    '<div class="snippet">' + esc(snippet) + '……</div>' +
    '<div class="snippet">' + t.author + '　' + t.time + '</div></div>';
}

/* ---------- 路由 ---------- */
function viewEnding(id) {
  var endings = window.ArchiveEndings;
  if (!endings) { viewIndex(); return; }
  setTier(3);
  if (!id) {
    document.title = "结局档案 · 莲灯夜话";
    renderChrome("» 结局档案");
    document.getElementById("view").innerHTML = endings.renderGallery();
    return;
  }
  var chosen = endings.valid(id) ? id : endings.pick();
  document.title = "结局记录 · " + endings.list[chosen].title;
  renderChrome("» 结局档案 » " + esc(endings.list[chosen].label));
  document.getElementById("view").innerHTML = endings.render(chosen);
}

/* Keep the ending gallery, but offer a real replay entry instead of asking
   the author to open developer tools.  Only investigation state is cleared;
   audio preference and already unlocked endings remain available. */
function resetInvestigation() {
  var keep = { "bbs_endings_seen": true, "dy_mute": true };
  var remove = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf("bbs_") === 0 && !keep[key]) remove.push(key);
    }
    for (i = 0; i < remove.length; i++) localStorage.removeItem(remove[i]);
  } catch (e) {}
  try { sessionStorage.clear(); } catch (e2) {}
}
function viewReplay() {
  setTier(3);
  renderChrome("» 重新开始调查");
  document.getElementById("view").innerHTML =
    '<section class="replay-panel" aria-labelledby="replay-title">' +
      '<div class="ending-kicker">ARCHIVE RESET / NEW READER</div>' +
      '<h2 id="replay-title">重新打开这份档案</h2>' +
      '<p>新的调查会清除本次阅读、私信、选择和页面异常，让论坛回到第一次打开时的状态。已经读取过的结局不会被删除。</p>' +
      '<div class="replay-record"><span>会清除</span><b>阅读痕迹 · 支线选择 · 事件记录 · 登录状态</b></div>' +
      '<div class="replay-record"><span>会保留</span><b>结局档案 · 声音设置</b></div>' +
      '<div class="replay-actions"><button type="button" id="replay-confirm">清除本次调查并重开</button><a href="#/ending">返回结局档案</a><a href="#/">先回论坛首页</a></div>' +
    '</section>';
  var button = document.getElementById("replay-confirm");
  if (button) button.addEventListener("click", function () {
    resetInvestigation();
    /* Reset the live DOM before navigation as well. Otherwise the current
       t3 class can be observed during the hash change and written back to
       the persistent atmosphere key. */
    try { localStorage.removeItem("bbs_atmosphere_tier"); } catch (e) {}
    if (document.body) {
      document.body.classList.remove("t2", "t3");
      document.body.classList.add("t1");
      document.body.setAttribute("data-atmosphere-tier", "1");
    }
    location.href = location.pathname + location.search + "#/";
  });
}
function route() {
  var h = location.hash.replace(/^#\/?/, "");
  var parts = h.split("/");
  noteRouteTransition(h);
  if (!(parts[0] === "thread" && parts[1] === "t_37") && parts[0] !== "ending") {
    document.title = "莲灯夜话 - 只读档案";
  }
  if (!h) return viewIndex();
  if (parts[0] === "board") return viewBoard(parts[1]);
  if (parts[0] === "thread") return viewThread(parts[1]);
  if (parts[0] === "user") return viewUser(parts[1]);
  if (parts[0] === "login") return viewLogin();
  if (parts[0] === "logout") { localStorage.removeItem("bbs_session"); location.hash = "#/"; return location.reload(); }
  if (parts[0] === "pm") {
    /* Inbox links are kept short ("#/pm/0") like old BBS software. */
    if (parts[1] && /^\d+$/.test(parts[1])) return viewPM("inbox", parts[1]);
    return viewPM(parts[1] || "inbox", parts[2]);
  }
  if (parts[0] === "recycle") return viewRecycle(parts[1]);
  if (parts[0] === "ending") return viewEnding(parts[1]);
  if (parts[0] === "replay") return viewReplay();
  if (parts[0] === "search") return viewSearch(parts.slice(1).join("/"));
  if (parts[0] === "37") return viewThread("t_37");
  viewIndex();
}
window.addEventListener("hashchange", route);
document.addEventListener("DOMContentLoaded", route);
})();
