/*
 * Diegetic endings for the archive.
 *
 * An ending is selected from something the reader actually did. The page
 * never shows a route number or a completion meter. It simply appends one
 * final forum record to the missing-floor thread.
 */
(function () {
  "use strict";

  var ENDINGS = {
    echo: {
      id: "echo",
      title: "页面没有把你送回去",
      copy: "你读到的四个字没有出现在正文。它们只在页面加载前的一瞬间留下了影子，随后所有楼层恢复原样。",
      fragment: "正文：空　作者字段：空　返回：无",
      note: "你可以关掉窗口。镜像不会替你关掉页面。"
    },
    occupied: {
      id: "occupied",
      title: "有人替你占了那一楼",
      copy: "你的回复仍然显示在主帖里，但楼层号已经变成 37。下一次打开，作者栏会写成空白。",
      fragment: "回复：已保存　楼层：37　发件人：游客",
      note: "如果你还记得自己写了什么，先不要告诉任何人。"
    },
    sealed: {
      id: "sealed",
      title: "版主把页面重新命名",
      copy: "青灯的账号在回收站留下了最后一次操作。那不是删除，而是把一扇门改成了一个文件名。",
      fragment: "操作人：青灯　记录：未删除　状态：只读",
      note: "回收站的空标题仍然占着位置。"
    },
    return: {
      id: "return",
      title: "主页多了一位访客",
      copy: "你从收件箱回到首页时，在线人数没有变。只有一条旧帖的最后回复时间变成了刚刚。",
      fragment: "在线：5　最后回复：03:44　发件人：",
      note: "右灯的短消息没有显示已读。"
    },
    silent: {
      id: "silent",
      title: "四个字被留在屏幕外",
      copy: "你没有听见声音，页面也没有闪烁。刷新之后，只有搜索框还保留着那四个字。",
      fragment: "查询缓存：保留　正文：空　索引：继续",
      note: "输入框里的光标没有熄灭。"
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

  function pick() {
    var signal = localStorage.getItem("bbs_ending_signal") || "";
    if (signal === "sealed" || (localStorage.getItem("bbs_session") === "青灯" && has("del_37"))) return "sealed";
    if (signal === "occupied" || hasReply()) return "occupied";
    if (signal === "return" || (localStorage.getItem("bbs_returned_home_after_pm") === "1" && localStorage.getItem("bbs_read_rightlamp") === "1")) return "return";
    if (signal === "silent" || localStorage.getItem("bbs_entered_final_from_search") === "1" || hasSearch("第37楼")) return "silent";
    return "echo";
  }

  function render(id) {
    var ending = ENDINGS[valid(id) ? id : pick()] || ENDINGS.echo;
    var klass = "ending-record ending-" + ending.id;
    return '<section class="' + klass + '" data-ending-id="' + esc(ending.id) + '" aria-labelledby="ending-title">' +
      '<div class="ending-kicker">页面尾端 / 03:44</div>' +
      '<h2 id="ending-title">' + esc(ending.title) + '</h2>' +
      '<p class="ending-copy">' + esc(ending.copy) + '</p>' +
      '<p class="ending-fragment">' + esc(ending.fragment) + '</p>' +
      '<p class="ending-note">' + esc(ending.note) + '</p>' +
      '<div class="ending-actions"><a href="#/">回到论坛首页</a><a href="#/board/guaitan">查看其他帖子</a></div>' +
      '</section>';
  }

  window.ArchiveEndings = {
    list: ENDINGS,
    pick: pick,
    render: render,
    valid: valid
  };
})();
