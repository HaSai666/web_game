/*
 * Diegetic endings for the archive.
 *
 * The last floor is still a forum record, but it now opens a real ending
 * chapter. A reader should know that a route is complete, understand what
 * happened, and have a quiet place to sit with it before returning to the
 * archive.
 */
(function () {
  "use strict";

  var ENDINGS = {
    echo: {
      id: "echo",
      label: "回声结局",
      code: "ECHO / 03:44",
      title: "页面没有把你送回去",
      lede: "你没有替任何人占位。你只是读到了最后一页，但最后一页记住了你。",
      plot: [
        "03:44，右灯的账号被冻结，主帖从36楼直接跳到38楼。你打开第37楼时，服务器没有返回正文，只返回了一个读取成功的空壳。",
        "那四个字不在正文里。它们出现在浏览器准备绘制页面的间隙，像有人先写好，再把纸抽走。你看见的不是删除，而是有人把内容从页面里面挪到了页面外面。",
        "你关掉窗口以后，房间里的显示器没有立刻熄灭。光标停在你离开的地方，像还有一个人坐在你身后，等你再回来。"
      ],
      reveal: "右灯没有被删除。他只是把最后一个位置留给了阅读这份档案的人。",
      records: [
        ["最后可见楼层", "36 → 38"],
        ["第37楼正文", "空"],
        ["读取状态", "完成，返回地址缺失"]
      ],
      closing: "你没有加入游戏。你成为了它的回声。",
      after: "回到首页时，不要急着刷新。镜像会把你刚才读过的那一行再放回去一次。",
      thanks: "感谢你读完《莲灯夜话·断更事件》。这份镜像没有把你的名字上传到公开楼层，但它记得你停留过。"
    },
    occupied: {
      id: "occupied",
      label: "占位结局",
      code: "OCCUPIED / 03:44",
      title: "有人替你占了那一楼",
      lede: "你写下了一句回复。服务器替你把它归档成了一个人。",
      plot: [
        "你把所有散落的记录拼回主帖，在回复框里留下自己的话。发送成功的提示只闪了一下，随后楼层号从问号变成37。",
        "你的文字仍然在主帖里，可作者栏不再显示你的账号。下一次打开时，系统把回复的时间改成了右灯断更的那一分钟。",
        "提灯人的草稿说过，四角游戏最重要的不是四个人，而是必须留有一个空角。你填上了那个空角，所以页面终于完整了。"
      ],
      reveal: "第37楼不是一条被删掉的帖子，而是一个需要有人承认的身份。你替它签了名。",
      records: [
        ["新建楼层", "37"],
        ["作者字段", "空白"],
        ["回复时间", "2005-02-27 03:44"]
      ],
      closing: "有人替你占了那一楼。现在轮到你给它让路。",
      after: "如果你回到主帖，别再编辑那句话。它已经不属于你了。",
      thanks: "感谢你把一句话留在这份旧论坛里。请记住，回复框只是看起来像输入框。"
    },
    sealed: {
      id: "sealed",
      label: "封存结局",
      code: "SEALED / 03:44",
      title: "版主把页面重新命名",
      lede: "青灯没有删除第37楼。她只是把门改成了一个文件名。",
      plot: [
        "回收站里那条记录没有删除人，也没有删除时间。只有content_len=4，像有人在服务器断电前留下了一把很短的钥匙。",
        "你用青灯的账号打开它，页面先显示一行空白，再把标题改成了一个无法复制的名字。那一刻，论坛所有版块的最后访问时间同时跳到了03:44。",
        "青灯一直在替论坛关门。她以为关掉页面就能把里面的东西留在里面，直到回收站证明，门和文件名其实是同一个东西。"
      ],
      reveal: "所谓封存不是保护读者，而是保护页面里面的那个人。青灯把自己留在了门后。",
      records: [
        ["操作人", "青灯"],
        ["删除记录", "无"],
        ["页面状态", "只读，仍可访问"]
      ],
      closing: "门已经关上。门牌还在里面。",
      after: "不要再打开回收站的空标题。它会把你上次离开的地方当成入口。",
      thanks: "感谢你读完这份封存记录。你看到的每一行，都是有人努力留下的关门声。"
    },
    return: {
      id: "return",
      label: "回归结局",
      code: "RETURN / 03:44",
      title: "主页多了一位访客",
      lede: "右灯没有从收件箱回来。他从你的返回动作里回来。",
      plot: [
        "你读完那封03:36的短消息，回到论坛首页。在线人数没有变化，首页也没有弹出欢迎语。只有一条旧帖的最后回复时间，从很多年前变成了刚刚。",
        "你再次打开第37楼时，右灯的短消息仍然标记为未读。系统知道你看过它，却拒绝承认那次读取发生过。",
        "那一刻你才明白，私信不是右灯发给你的求救，而是一条返回通道。他借你的浏览器回到了论坛，借论坛回到了房间。"
      ],
      reveal: "主页多出的访客没有头像，也没有用户名。它只在你离开收件箱之后出现。",
      records: [
        ["在线会员", "5"],
        ["最后回复", "刚刚"],
        ["右灯短消息", "未读"]
      ],
      closing: "你把他带回来了。现在不要回头确认身后是不是多了一把椅子。",
      after: "如果首页的在线人数再次变成5，不要替它刷新。刷新只是让它换一个位置。",
      thanks: "感谢你读完这条回归记录。离开收件箱之前，请确认身边没有第二个光标。"
    },
    silent: {
      id: "silent",
      label: "静默结局",
      code: "SILENT / 03:44",
      title: "四个字被留在屏幕外",
      lede: "你没有听见声音，页面也没有闪烁。最安静的结局，往往最难关掉。",
      plot: [
        "你从搜索结果进入第37楼。页面按顺序加载了标题、时间和照片，唯独正文保持空白。搜索框却记得你输入过的那四个字，并且拒绝被清空。",
        "你刷新页面，四个字仍然在那里。你换到首页，它们不再显示，可输入框的光标还在等待下一次回车，像有人知道你迟早会再搜一次。",
        "没有脚步，没有弹窗，没有突然出现的脸。只有键盘上的回车键，在你没有触碰它的时候，自己发出了一声很轻的响。"
      ],
      reveal: "第37楼的内容不在网页里。搜索框才是它真正的正文。",
      records: [
        ["查询缓存", "保留"],
        ["正文", "空"],
        ["索引", "继续写入"]
      ],
      closing: "四个字被留在屏幕外。它们正在等一个新的屏幕。",
      after: "不要在同一台设备上重复搜索。镜像会把两次查询当成两个人。",
      thanks: "感谢你读完这条静默记录。关掉声音并不会让它消失，真正有用的是关掉页面。"
    }
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
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
  function has(id) { return visited().indexOf(id) !== -1; }
  function hasReply() {
    var value = read("bbs_myfloors", []);
    return Array.isArray(value) && value.some(function (floor) { return floor && floor.tid === "t_main"; });
  }
  function hasSearch(term) {
    var list = read("bbs_searches", []);
    return Array.isArray(list) && list.some(function (item) { return String(item) === term; });
  }
  function valid(id) { return !!ENDINGS[id]; }
  function remember(id) {
    var list = read("bbs_endings_seen", []);
    if (!Array.isArray(list)) list = [];
    if (list.indexOf(id) === -1) { list.push(id); write("bbs_endings_seen", list); }
  }
  function seen(id) {
    var list = read("bbs_endings_seen", []);
    return Array.isArray(list) && list.indexOf(id) !== -1;
  }

  function pick() {
    var signal = localStorage.getItem("bbs_ending_signal") || "";
    if (signal === "sealed" || (localStorage.getItem("bbs_session") === "青灯" && has("del_37"))) return "sealed";
    if (signal === "occupied" || hasReply()) return "occupied";
    if (signal === "return" || (localStorage.getItem("bbs_returned_home_after_pm") === "1" && localStorage.getItem("bbs_read_rightlamp") === "1")) return "return";
    if (signal === "silent" || localStorage.getItem("bbs_entered_final_from_search") === "1" || hasSearch("第37楼")) return "silent";
    return "echo";
  }

  function renderRecords(rows) {
    var html = '<dl class="ending-record-list">';
    for (var i = 0; i < rows.length; i++) {
      html += '<div><dt>' + esc(rows[i][0]) + '</dt><dd>' + esc(rows[i][1]) + '</dd></div>';
    }
    return html + "</dl>";
  }
  function renderParagraphs(lines, klass) {
    var html = '<div class="' + klass + '">';
    for (var i = 0; i < lines.length; i++) html += "<p>" + esc(lines[i]) + "</p>";
    return html + "</div>";
  }
  function branchTraces() {
    var traces = [];
    if (has("f_audio_log")) traces.push(["录音支线", "你确认第五声早在直播开始前就被录下。右灯不是第一次听见它。"]);
    if (has("f_preflight")) traces.push(["直播支线", "你看过最后一次编辑。右灯从一开始就知道房间里没有门。"]);
    if (has("f_door_watch")) {
      var doorChoice = localStorage.getItem("bbs_choice_door-watch") || "";
      traces.push(["南城支线", doorChoice === "look" ? "你打开了门牌附件。墙后的房间比论坛记录多出一层。" : "你没有打开门牌附件，但页面已经记录了你的拒绝。"]);
    }
    if (has("f_rack_log")) traces.push(["封存支线", "你读过B27-0344的断电记录。论坛离线以后，写入并没有停止。"]);
    if (has("f_reply_shadow")) traces.push(["观察者支线", "你比对过右灯的标点。断更后的回复来自另一个正在模仿他的人。"]);
    if (has("f_chair_back")) traces.push(["底片支线", "你看见第五把椅子的影子。拍照的人从一开始就不在安全的位置。"]);
    if (has("f_rightlamp_note")) traces.push(["在场支线", "你读过右灯留下的旧帖。他发帖不是为了证明有鬼，而是为了确认有人还在页面另一端。"]);
    if (has("f_phone_line")) {
      var phoneChoice = localStorage.getItem("bbs_choice_phone-return") || "";
      traces.push(["电话支线", phoneChoice === "call" ? "你回拨了那条没有号码的线路。通话没有接通，记录却把你的号码留了下来。" : phoneChoice === "delete" ? "你删掉了来电记录。删除时间比来电时间更早。" : "你读过值班电话记录。那条线路在03:33之后一直没有真正断开。"]);
    }
    if (has("f_editor_cache")) {
      var cacheChoice = localStorage.getItem("bbs_choice_cache-read") || "";
      traces.push(["缓存支线", cacheChoice === "open" ? "你展开了自动保存的末行。多出的回车没有对应的按键。" : "你没有展开缓存，但光标停留的位置被镜像保留了下来。"]);
    }
    return traces;
  }
  function renderBranchTraces() {
    var traces = branchTraces();
    if (!traces.length) return "";
    var html = '<section class="ending-section ending-branches"><h3>你带到结局里的证据</h3><div class="ending-branch-list">';
    for (var i = 0; i < traces.length; i++) {
      html += '<div><b>' + esc(traces[i][0]) + '</b><p>' + esc(traces[i][1]) + '</p></div>';
    }
    return html + "</div></section>";
  }
  function render(id) {
    var ending = ENDINGS[valid(id) ? id : pick()] || ENDINGS.echo;
    remember(ending.id);
    var titleId = "ending-title-" + ending.id;
    return '<section class="ending-screen ending-' + esc(ending.id) + '" data-ending-id="' + esc(ending.id) + '" aria-labelledby="' + titleId + '">' +
      '<div class="ending-complete-mark"><span>ARCHIVE CLOSED</span><b>结局已触发</b><em>READ COMPLETE</em></div>' +
      '<header class="ending-hero">' +
        '<div class="ending-kicker">终局记录 / 03:44</div>' +
        '<div class="ending-route-label">' + esc(ending.label) + '<span>' + esc(ending.code) + '</span></div>' +
        '<h2 id="' + titleId + '">' + esc(ending.title) + '</h2>' +
        '<p class="ending-lede">' + esc(ending.lede) + '</p>' +
      '</header>' +
      '<div class="ending-divider" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<div class="ending-content">' +
        '<section class="ending-section"><h3>发生了什么</h3>' + renderParagraphs(ending.plot, "ending-story") + '</section>' +
        '<section class="ending-section ending-reveal"><h3>你现在知道的事</h3><p>' + esc(ending.reveal) + '</p></section>' +
        renderBranchTraces() +
        '<section class="ending-section"><h3>最后一份记录</h3>' + renderRecords(ending.records) + '</section>' +
        '<p class="ending-closing">' + esc(ending.closing) + '</p>' +
        '<p class="ending-after">' + esc(ending.after) + '</p>' +
      '</div>' +
      '<footer class="ending-thanks"><div><span class="ending-thanks-kicker">感谢你读到这里</span><p>' + esc(ending.thanks) + '</p></div><strong>THE END<br><small>OF THIS ARCHIVE</small></strong></footer>' +
      '<div class="ending-actions"><a class="ending-primary" href="#/ending/' + esc(ending.id) + '">再次读取本结局</a><a href="#/ending">查看结局档案</a><a href="#/replay">重新开始调查</a><a href="#/">回到论坛首页</a></div>' +
      '</section>';
  }

  function renderGallery() {
    var html = '<section class="ending-gallery" aria-labelledby="ending-gallery-title">' +
      '<div class="ending-kicker">ARCHIVE INDEX / ENDINGS</div><h2 id="ending-gallery-title">结局档案</h2>' +
      '<p class="ending-gallery-lede">每一次进入第37楼，都会把你做过的选择留在页面里。已读取的结局会保留完整记录，未读取的结局只显示一行空标题。</p>' +
      '<div class="ending-gallery-list">';
    for (var id in ENDINGS) {
      var ending = ENDINGS[id], unlocked = seen(id);
      html += '<article class="ending-gallery-item ' + (unlocked ? "is-seen" : "is-hidden") + '">' +
        '<div class="ending-gallery-meta"><span>' + esc(ending.label) + '</span><b>' + (unlocked ? "已读取" : "未读取") + '</b></div>' +
        '<h3>' + (unlocked ? esc(ending.title) : "（标题字段为空）") + '</h3>' +
        '<p>' + (unlocked ? esc(ending.lede) : "这条记录还没有对当前访客开放。") + '</p>' +
        (unlocked ? '<a href="#/ending/' + esc(id) + '">打开完整结局</a>' : '<span class="ending-locked-note">索引等待下一次选择</span>') +
        '</article>';
    }
    return html + '</div><div class="ending-gallery-actions"><a href="#/replay">重新开始调查</a><a href="#/">返回论坛首页</a></div></section>';
  }

  function safeSessionGet(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSessionSet(key, value) {
    try { sessionStorage.setItem(key, value); } catch (e) {}
  }
  function announce(id) {
    var ending = ENDINGS[valid(id) ? id : pick()];
    if (!ending || !document.body) return;
    document.title = "结局已触发 · " + ending.title;
    var key = "bbs_ending_notice_" + ending.id;
    if (safeSessionGet(key)) return;
    safeSessionSet(key, "1");
    var root = document.getElementById("ending-event-root") || document.getElementById("archive-event-root");
    if (!root) return;
    var curtain = document.createElement("div");
    curtain.className = "ending-curtain";
    curtain.setAttribute("role", "dialog");
    curtain.setAttribute("aria-modal", "true");
    curtain.setAttribute("aria-labelledby", "ending-curtain-title");
    curtain.innerHTML = '<div class="ending-curtain-panel"><div class="ending-curtain-signal">03:44 / 读取结束</div><h2 id="ending-curtain-title">结局已触发</h2><p>这份档案到此为止。下面的章节会告诉你，刚才那一页发生了什么。</p><div class="ending-curtain-actions"><button type="button" data-ending-open>查看结局正文</button><button type="button" data-ending-close>留在第37楼</button></div></div>';
    root.appendChild(curtain);
    var keyHandler;
    var routeHandler;
    var close = function () {
      if (curtain.parentNode) curtain.parentNode.removeChild(curtain);
      if (keyHandler) document.removeEventListener("keydown", keyHandler);
      if (routeHandler) window.removeEventListener("hashchange", routeHandler);
    };
    var open = curtain.querySelector("[data-ending-open]");
    var stay = curtain.querySelector("[data-ending-close]");
    if (open) open.addEventListener("click", function () {
      close();
      var target = document.querySelector(".ending-screen");
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    if (stay) stay.addEventListener("click", close);
    curtain.addEventListener("click", function (ev) { if (ev.target === curtain) close(); });
    keyHandler = function (ev) { if (ev.key === "Escape") close(); };
    routeHandler = function () { if (location.hash.indexOf("thread/t_37") === -1) close(); };
    document.addEventListener("keydown", keyHandler);
    window.addEventListener("hashchange", routeHandler);
    if (open && open.focus) setTimeout(function () { open.focus(); }, 40);
  }

  window.ArchiveEndings = {
    list: ENDINGS,
    pick: pick,
    render: render,
    renderGallery: renderGallery,
    announce: announce,
    valid: valid,
    seen: seen
  };
})();
