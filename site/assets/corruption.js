/*
 * Deterministic corruption grammar.
 *
 * Nothing here rolls a random chance. A visible anomaly is the consequence of
 * a record the reader opened, an action they chose or a story anchor they
 * reached. The same investigation therefore remains coherent after refresh.
 */
(function () {
  "use strict";

  var timer = null;
  var floorObserver = null;
  var CHOICE_KEYS = [
    "bbs_choice_door-watch", "bbs_choice_phone-return", "bbs_choice_cache-read",
    "bbs_choice_floorplan-fold", "bbs_choice_neighbor-tape", "bbs_choice_mod-snapshot",
    "bbs_choice_guestbook-mark", "bbs_choice_granny-letter"
  ];

  var MAIN_BATCH = [
    ["水晶之恋", "mars", "莪祗媞想問，剛剛那層誰刪ㄋ？"],
    ["青灯", "mojibake", "鍒洖澶?　伱已經數過。"],
    ["（作者字段为空）", "mars", "4　4　4　4　5"],
    ["右灯", "mars", "珴卜侍右燈　珴只侍借他啲字"],
    ["唯物主义小刀", "markup", "[quote floor=\"37\" author=\"{visitor}\"]你刚才为什么回头[/quote]"],
    ["系统", "markup", "&lt;td author=\"\"&gt;到你了&lt;/td&gt;"],
    ["半夜鸡叫", "mojibake", "锟斤拷锟斤拷锟斤拷　門外冇亾"],
    ["提灯前的蛤蟆", "mars", "空角卜侍亾　卜崾替它起名字"],
    ["2023访客", "mojibake", "浣犳悳杩囩殑璇嶅凡缁忓啓杩涘幓"],
    ["纸鸢", "mars", "在線亾數冇變　但名單哆ㄋ一格"],
    ["数据库民工", "markup", "&lt;tr data-floor=\"37\" data-reader=\"{visitor}\"&gt;"],
    ["右灯", "mojibake", "鎴戞病鏈夊洖澶?　鏄綘鍥炵殑"],
    ["（未登记）", "mars", "莪等伱按下一次囙車"],
    ["系统", "markup", "&lt;/table&gt;　实体记录：49　显示位置：50"]
  ];
  var COPY_LINES = [
    ["（作者字段为空）", "mars", "別數　別數　別數　別數　到伱了"],
    ["右灯", "mojibake", "鎴戜笉鍦ㄩ棬澶栥€€浣犲湪闂ㄩ噷"],
    ["唯物主义小刀", "markup", "[quote author=\"{visitor}\"]不要替我承认第五声[/quote]"],
    ["（未登记）", "mars", "四個角都冇空　伱站啲位置算誰啲"],
    ["系统", "markup", "&lt;input name=\"reader\" value=\"{visitor}\"&gt;"],
    ["2023访客", "mojibake", "浣犳悳杩囩殑璇嶏細{search}　已寫進這一樓"],
    ["水晶之恋", "mars", "莪沒冇囙復　頁面洎己復製ㄋ莪"]
  ];
  var TRANSFER_BATCH = [
    ["无灯", "mars", "迩离开主帖以后，它跟过来了。"],
    ["（未登记）", "mojibake", "褰撳墠璁块棶鑰?　{visitor}"],
    ["系统", "markup", "&lt;input value=\"{search}\" readonly&gt;"],
    ["右灯", "mars", "别刷新。刷新只是让我换一页。"]
  ];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function read(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch (e) {}
  }
  function localOnce(key) {
    try {
      if (localStorage.getItem(key)) return false;
      localStorage.setItem(key, "1");
      return true;
    } catch (e) { return true; }
  }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function state() {
    return window.ArchiveEvidenceState ? window.ArchiveEvidenceState.summary() : {
      stage: 0, evidence: { person: [], room: [], ritual: [], identity: [], server: [] }, anchors: {}, finalReady: false
    };
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
  function chosenAction() {
    var labels = {
      look: "查看附件", leave: "先不查看", call: "回拨", delete: "删除记录",
      open: "展开记录", close: "关闭记录", listen: "播放原声", transcript: "只看转录",
      restore: "恢复快照", seal: "继续封存", unfold: "摊平信纸", fold: "放回信封",
      erase: "清空留言"
    };
    for (var i = CHOICE_KEYS.length - 1; i >= 0; i--) {
      try {
        var value = localStorage.getItem(CHOICE_KEYS[i]);
        if (value) return { key: CHOICE_KEYS[i], value: value, label: labels[value] || value };
      } catch (e) {}
    }
    return null;
  }
  function interpolate(text) {
    return String(text || "")
      .replace(/\{visitor\}/g, esc(visitor()))
      .replace(/\{search\}/g, esc(lastSearch()));
  }

  function mainBatchRows() {
    var out = MAIN_BATCH.slice();
    while (out.length < 37) {
      var offset = out.length - MAIN_BATCH.length;
      var source = COPY_LINES[offset % COPY_LINES.length];
      var pass = Math.floor(offset / COPY_LINES.length);
      var repeats = pass === 0 ? 2 : (pass === 1 ? 4 : 8);
      var pieces = [];
      for (var i = 0; i < repeats; i++) pieces.push(source[2]);
      out.push([
        source[0], source[1], pieces.join(source[1] === "markup" ? "<br>" : "　"),
        { duplicate: true, group: (offset % COPY_LINES.length) + 1, density: pass + 1 }
      ]);
    }
    return out;
  }

  function corruptionFloor(row, index, transferred) {
    var uid = row[0], dialect = row[1], body = interpolate(row[2]);
    var meta = row[3] || {};
    var glyph = dialect === "markup" ? "源" : (dialect === "mojibake" ? "码" : "空");
    var duplicateClass = meta.duplicate ? ' is-duplicate copy-density-' + meta.density : '';
    var duplicateAttr = meta.duplicate ? ' data-copy-group="' + meta.group + '"' : '';
    var stamp = meta.duplicate ? '复制组：0' + meta.group + '　字节校验：与上一份一致　实体记录：0' : '本楼不计入当前主题回复数。';
    var time = meta.duplicate && index % 5 === 0 ? "2005-02-27 03:33" : "2005-02-27 03:44";
    return '<article class="floor postbit corruption-floor dialect-' + dialect + (transferred ? ' is-transferred' : '') + duplicateClass + '" data-source-floor="37"' + duplicateAttr + '>' +
      '<div class="p-side"><div class="p-avatar">' + glyph + '</div><div class="p-uid">' + esc(uid) + '</div><div class="p-title">' + (transferred ? "跨版回复" : "会员") + '</div><div class="p-meta">注册：--<br>发帖：' + (index + 1) + '</div></div>' +
      '<div class="p-main"><div class="p-bar"><span class="p-time">' + time + '</span><span class="p-fn">37楼</span><span class="p-links">引用　回复</span></div>' +
      '<div class="p-cont"><p>' + body + '</p><p class="stamp">' + stamp + '</p></div></div></article>';
  }

  function addSingleLeak(summary) {
    var id = threadId(), view = document.getElementById("view");
    if (!view || summary.stage < 1) return;
    view.setAttribute("data-corruption-stage", String(summary.stage));

    if ((id === "x_apple_lab" || id === "t_exp1") && parseInt(localStorage.getItem("bbs_reads_" + id) || "0", 10) >= 2) {
      var target = view.querySelector('.postbit:nth-of-type(5) .p-cont p, .postbit:nth-of-type(4) .p-cont p');
      if (target && target.innerHTML.indexOf("data-mars-leak") === -1) {
        var changed = target.innerHTML.replace("是", '<span class="mars-leak" data-mars-leak="1">昰</span>');
        if (changed === target.innerHTML) changed += '<span class="mars-leak" data-mars-leak="1"> 昰</span>';
        target.innerHTML = changed;
      }
    }

    if (summary.stage >= 1) {
      var times = view.querySelectorAll(".p-time");
      if (times.length > 2) times[times.length - 1].setAttribute("data-time-echo", "03:44");
    }
  }

  function addIdentitySlip(summary) {
    if (summary.stage < 2 || !summary.evidence.identity.length) return;
    var id = threadId();
    if (["t_return", "x_anniversary_2006", "x_witnesses", "f_reply_shadow"].indexOf(id) === -1) return;
    var posts = document.querySelectorAll("#view .postbit");
    for (var i = 0; i < posts.length; i++) {
      var uid = posts[i].querySelector(".p-uid");
      var avatar = posts[i].querySelector(".p-avatar");
      var body = posts[i].querySelector(".p-cont");
      if (!uid || !avatar || !body) continue;
      if (uid.textContent.replace(/\s+/g, "").indexOf("右灯") !== -1 || i === posts.length - 1) {
        posts[i].classList.add("identity-slip");
        avatar.textContent = "提";
        avatar.removeAttribute("style");
        if (!body.querySelector(".borrowed-signature")) body.insertAdjacentHTML("beforeend", '<div class="sigline borrowed-signature">替他交代几件事。密码是那一天的时刻。</div>');
        break;
      }
    }
  }

  function injectMainBatch(summary) {
    if (summary.stage < 3 || !summary.anchors.fifth_voice || threadId() !== "t_main") return;
    var view = document.getElementById("view");
    var floor35 = view && view.querySelector('[data-source-floor="35"]');
    if (!floor35 || view.querySelector(".corruption-batch")) return;
    var section = document.createElement("section");
    section.className = "corruption-batch";
    section.setAttribute("aria-label", "缓存中恢复的异常回复");
    var rows = mainBatchRows();
    var html = '<div class="corruption-batch-head"><b>页面缓存正在重复写入同一楼层</b><span>显示回复：37　实体记录：0</span></div>';
    for (var i = 0; i < rows.length; i++) html += corruptionFloor(rows[i], i, false);
    section.innerHTML = html;
    floor35.insertAdjacentElement("afterend", section);
    document.body.classList.add("corruption-has-batch");
  }

  function injectTransferredBatch(summary) {
    var id = threadId();
    if (summary.stage < 4 || id === "t_main" || id === "t_37") return;
    if (["x_live_water", "f_night_presence", "x_visitor_mail", "x_restore_notes", "t_return", "f_archive_comment"].indexOf(id) === -1) return;
    var view = document.getElementById("view");
    if (!view || view.querySelector(".corruption-transfer")) return;
    var posts = view.querySelectorAll(".floor.postbit:not(.corruption-floor)");
    if (!posts.length) return;
    var section = document.createElement("section");
    section.className = "corruption-transfer";
    section.setAttribute("aria-label", "从其他主题转移来的回复");
    var html = '<div class="corruption-batch-head"><b>回复来源与当前主题不一致</b><span>移动记录缺失</span></div>';
    for (var i = 0; i < TRANSFER_BATCH.length; i++) html += corruptionFloor(TRANSFER_BATCH[i], i, true);
    section.innerHTML = html;
    posts[posts.length - 1].insertAdjacentElement("afterend", section);
  }

  function shortFrame(kind, copy) {
    if (reducedMotion()) {
      showEquivalent(copy || "页面记录到一次无法显示的图像帧。");
      return;
    }
    var node = document.createElement("div");
    node.className = "archive-short-frame archive-short-frame-" + kind;
    node.setAttribute("aria-hidden", "true");
    if (kind === "reader") {
      node.innerHTML = '<div class="short-frame-forum"><span>莲灯夜话</span><b>' + esc(visitor()) + '</b><p>' + esc(copy || lastSearch()) + '</p></div>';
    } else {
      node.innerHTML = '<div class="short-frame-room"><i></i><i></i><i></i><i></i><b></b></div>';
    }
    document.body.appendChild(node);
    requestAnimationFrame(function () { node.classList.add("is-visible"); });
    setTimeout(function () {
      node.classList.remove("is-visible");
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 40);
    }, kind === "reader" ? 180 : 160);
    if (window.ArchiveAudio && window.ArchiveAudio.cue) window.ArchiveAudio.cue(kind === "reader" ? "key" : "fifth");
  }
  function showEquivalent(text) {
    var monitor = document.getElementById("monitor-copy");
    if (monitor) {
      monitor.textContent = text;
      monitor.classList.add("is-audio-equivalent");
      setTimeout(function () { monitor.classList.remove("is-audio-equivalent"); }, 2600);
    }
  }

  function setupFirstFrame(summary) {
    if (floorObserver) { floorObserver.disconnect(); floorObserver = null; }
    if (summary.stage < 3 || threadId() !== "t_main" || localStorage.getItem("bbs_flash_fifth_seen")) return;
    var floor = document.querySelector('#view [data-source-floor="35"]');
    if (!floor) return;
    var fire = function () {
      if (!localOnce("bbs_flash_fifth_seen")) return;
      setTimeout(function () { shortFrame("room", "第五声先于图像到达。"); }, 620);
    };
    if (typeof IntersectionObserver === "undefined") { fire(); return; }
    floorObserver = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) if (entries[i].isIntersecting) {
        floorObserver.disconnect();
        fire();
        break;
      }
    }, { threshold: .5 });
    floorObserver.observe(floor);
  }

  function injectPlayerQuote(summary) {
    if (summary.stage < 4 || threadId() === "t_37" || threadId() === "t_main") return;
    var action = chosenAction();
    if (!action) return;
    var selected = "";
    try { selected = localStorage.getItem("bbs_corrupt_quote_thread") || ""; } catch (e) {}
    var id = threadId();
    if (selected && selected !== id) return;
    if (!selected) write("bbs_corrupt_quote_thread", id);
    var view = document.getElementById("view");
    if (!view || view.querySelector(".player-archive-quote")) return;
    var post = view.querySelector(".floor.postbit .p-cont");
    if (!post) return;
    var quote = document.createElement("div");
    quote.className = "quote player-archive-quote";
    quote.innerHTML = '<div class="archive-quote-meta">引用自：' + esc(visitor()) + '　记录时间：2005-02-27 03:44</div>' +
      '<p>[quote author="' + esc(visitor()) + '"]你刚才为什么选择「' + esc(action.label) + '」[/quote]</p>' +
      '<p class="stamp">引用来源晚于本主题最后回复。</p>';
    post.appendChild(quote);
    if (localOnce("bbs_flash_reader_seen")) setTimeout(function () { shortFrame("reader", action.label + " / " + lastSearch()); }, 760);
  }

  function corruptPagination(summary) {
    if (summary.stage < 3 || !summary.evidence.ritual.length) return;
    var pagers = document.querySelectorAll(".thread-pagination");
    for (var i = 0; i < pagers.length; i++) {
      if (pagers[i].querySelector(".page-phantom")) continue;
      var item;
      if (summary.finalReady) {
        item = document.createElement("a");
        item.href = "#/thread/t_37";
      } else {
        item = document.createElement("span");
        item.setAttribute("aria-hidden", "true");
      }
      item.className = "page-phantom";
      item.textContent = "37";
      pagers[i].appendChild(item);
    }
  }

  function preserveSearch(summary) {
    if (summary.stage < 4 || !summary.evidence.server.length) return;
    var input = document.getElementById("search-input");
    if (input && !input.value) {
      input.value = lastSearch();
      input.setAttribute("data-restored-query", "true");
    }
  }

  function updatePortal(summary) {
    var signal = document.getElementById("rail-signal");
    var monitor = document.getElementById("monitor-state");
    var copy = document.getElementById("monitor-copy");
    var online = document.getElementById("online-num");
    var postCount = document.getElementById("rail-post-count");
    if (signal) signal.textContent = summary.stage >= 4 ? "1条新回复" : (summary.stage >= 3 ? "主题只读" : (summary.stage >= 2 ? "夜间开放" : "只读开放"));
    if (monitor) monitor.textContent = (online ? online.textContent : (summary.stage >= 3 ? "5" : "4")) + " 人";
    if (copy) copy.textContent = summary.stage >= 4 ? "一名会员没有用户名" : (summary.stage >= 2 ? "最高在线记录正在重算" : "最高在线 57 人");
    if (postCount && summary.stage >= 4 && postCount.getAttribute("data-count-shift") !== "1") {
      var n = parseInt(postCount.textContent, 10);
      if (isFinite(n)) postCount.textContent = String(n + 1);
      postCount.setAttribute("data-count-shift", "1");
    }
  }

  function refresh() {
    var summary = state();
    addSingleLeak(summary);
    addIdentitySlip(summary);
    injectMainBatch(summary);
    injectTransferredBatch(summary);
    injectPlayerQuote(summary);
    corruptPagination(summary);
    preserveSearch(summary);
    updatePortal(summary);
    setupFirstFrame(summary);
  }
  function schedule(delay) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(refresh, delay == null ? 180 : delay);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { schedule(220); });
  else schedule(220);
  window.addEventListener("hashchange", function () { schedule(220); });
  window.addEventListener("archiveevidencechange", function () { schedule(80); });
  window.addEventListener("archivechoice", function () { schedule(80); });
  window.ArchiveCorruption = { refresh: refresh, showEquivalent: showEquivalent, shortFrame: shortFrame };
})();
