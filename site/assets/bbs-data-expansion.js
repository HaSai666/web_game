/* Extra connective tissue: ordinary conversations that make the main thread
   feel like one thread in a living archive, not a corridor of clues. */
var BBS_EXPANSION = { users: {}, threads: [] };

BBS_EXPANSION.users = {
  "胶卷冲洗店": { reg: "2003-10-12", posts: 188, title: "会员", sig: "相片会说话，底片不会。" },
  "旧钥匙": { reg: "2004-02-18", posts: 41, title: "会员", sig: "房子交出去以后就不是我的了。" },
  "东门值班": { reg: "2004-07-09", posts: 302, title: "会员", sig: "夜里有事敲玻璃。" },
  "无灯": { reg: "2023-11-03", posts: 2, title: "新手上路", sig: "我没有看见灯。" },
  "纸鸢": { reg: "2005-02-01", posts: 117, title: "会员", sig: "白天说的话，晚上不算。" }
};

BBS_EXPANSION.threads.push({
  id: "f_photo_clock", board: "guaitan", tier: 1, hidden: false,
  title: "求助：相机拍出来的时间总是 03:44", author: "胶卷冲洗店", time: "2005-02-18 16:20", views: 684,
  posts: [
    { uid: "胶卷冲洗店", time: "2005-02-18 16:20", num: 1, html:
      "<p>不是灵异求助，先说清楚。我用一台二手数码相机拍夜景，照片文件的日期总会跳到 03:44，拍白天的没事。</p>" +
      "<p>电池换过，时间也校过。昨晚在阳台拍了三张，文件时间分别是 00:12、00:13、03:44，最后一张相机屏幕上没有显示。</p>" +
      "<p>有没有人遇到过？相机是 2003 年的旧货，型号就不写了。</p>" },
    { uid: "唯物主义小刀", time: "2005-02-18 17:03", num: 2, html: "<p>先查电池和时区。文件系统坏了会乱写时间，别先往怪事上靠。</p>" },
    { uid: "右灯", time: "2005-02-18 23:44", num: 3, html: "<p>我的也会。不是每张都跳，只有拍到空房间的时候。</p>" },
    { uid: "胶卷冲洗店", time: "2005-02-19 00:02", num: 4, html: "<p>你这句不像在开玩笑。能把相机型号私信我吗？</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_room_rental", board: "xianliao", tier: 1, hidden: false,
  title: "有人住过南城四号楼吗", author: "旧钥匙", time: "2004-12-05 21:18", views: 512,
  posts: [
    { uid: "旧钥匙", time: "2004-12-05 21:18", num: 1, html:
      "<p>帮朋友问。南城四号楼顶层有间空屋，房东说以前租客退房时把四张凳子都留在角落里，清洁工搬走以后，第二天又回来了。</p>" +
      "<p>房东不肯说上一任是谁，只说那人不欠房租，走得很干净。有没有夜话人住附近？</p>" },
    { uid: "东门值班", time: "2004-12-05 22:10", num: 2, html: "<p>四号楼没有顶层，五楼上面就是水箱间。你朋友可能记错楼了。</p>" },
    { uid: "白裙子姐姐", time: "2004-12-06 09:02", num: 3, html: "<p>别替房东找租客。南城那边的空房，晚上不要进去看角落。</p>" },
    { uid: "旧钥匙", time: "2004-12-06 13:44", num: 4, html: "<p>朋友说房子已经租出去了。谢谢各位，帖子沉了吧。</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_night_presence", board: "xianliao", tier: 1, hidden: false,
  title: "今晚论坛怎么多一个人", author: "纸鸢", time: "2005-02-27 02:19", views: 208,
  posts: [
    { uid: "纸鸢", time: "2005-02-27 02:19", num: 1, html: "<p>首页在线会员从 4 变成 5 了。现在明明只有我们几个熬夜，谁在登录？</p>" },
    { uid: "东门值班", time: "2005-02-27 02:22", num: 2, html: "<p>别看在线数。缓存两分钟刷新一次，老站经常把访客算进去。</p>" },
    { uid: "纸鸢", time: "2005-02-27 02:29", num: 3, html: "<p>我刷新了三次，还是 5。怪谈版那边有人直播吗？</p>" },
    { uid: "半夜鸡叫", time: "2005-02-27 02:35", num: 4, html: "<p>右灯说他要开始了。你们别在闲聊版吓自己。</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_mod_log", board: "zhanwu", tier: 2, hidden: true,
  title: "版主能不能看到已删除的编辑记录", author: "青灯", time: "2005-02-26 18:07", views: 391,
  posts: [
    { uid: "青灯", time: "2005-02-26 18:07", num: 1, html: "<p>技术问题。删掉附件以后，编辑记录还会不会保留？后台最近有几条记录的日期不对，先问问。</p>" },
    { uid: "数据库民工", time: "2005-02-26 18:22", num: 2, html: "<p>正常会留操作人和时间。日期错了通常是服务器时钟，别把记录删了，留着以后查。</p>" },
    { uid: "青灯", time: "2005-02-26 18:44", num: 3, html: "<p>收到。那就先不动。今晚版面有直播，大家注意一下。</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_archive_comment", board: "zhanwu", tier: 3, hidden: true,
  title: "有人还记得右灯吗", author: "无灯", time: "2023-11-03 03:33", views: 41,
  posts: [
    { uid: "无灯", time: "2023-11-03 03:33", num: 1, html: "<p>我不是来问第37楼的。我只想问一件事：右灯以前是不是从来不用句号？</p><p>我看过旧帖，他每句话都写得很快。断更前那几层，句号突然变多了。</p>" },
    { uid: "关门人", time: "2023-11-03 03:44", num: 2, html: "<p>这个问题没有存档依据。请不要再开新帖讨论第37楼。</p>" },
    { uid: "无灯", time: "2023-11-03 03:45", num: 3, html: "<p>好。那我只把这句留在这里：他不是一个人打字。</p>" }
  ]
});
