/* Extra connective tissue: ordinary conversations that make the main thread
   feel like one thread in a living archive, not a corridor of clues. */
var BBS_EXPANSION = { users: {}, threads: [] };

BBS_EXPANSION.users = {
  "胶卷冲洗店": { reg: "2003-10-12", posts: 188, title: "会员", sig: "相片会说话，底片不会。" },
  "旧钥匙": { reg: "2004-02-18", posts: 41, title: "会员", sig: "房子交出去以后就不是我的了。" },
  "东门值班": { reg: "2004-07-09", posts: 302, title: "会员", sig: "夜里有事敲玻璃。" },
  "无灯": { reg: "2023-11-03", posts: 2, title: "新手上路", sig: "我没有看见灯。" },
  "纸鸢": { reg: "2005-02-01", posts: 117, title: "会员", sig: "白天说的话，晚上不算。" },
  "录音带": { reg: "2004-11-12", posts: 63, title: "会员", sig: "磁带倒放以后，声音还在。" },
  "南城住户": { reg: "2004-06-27", posts: 29, title: "会员", sig: "门牌不是给住户看的。" },
  "机房夜班": { reg: "2006-02-03", posts: 18, title: "会员", sig: "服务器的风扇会认人。" },
  "档案拾荒者": { reg: "2023-09-01", posts: 11, title: "新手上路", sig: "我只捡没有人要的记录。" },
  "夜班接线员": { reg: "2004-01-16", posts: 57, title: "会员", sig: "电话响过就算接通。" },
  "缓存清理员": { reg: "2023-10-28", posts: 6, title: "新手上路", sig: "只清理能解释的东西。" }
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
    { uid: "半夜鸡叫", time: "2005-02-27 02:35", num: 4, html: "<p>右灯说他要开始了。你们别在闲聊版吓自己。</p>" },
    { uid: "纸鸢", time: "2005-02-27 03:02", num: 5, html: "<p>刚才在线数短暂变成 6，刷新后又回到 5。有人在看直播吗？</p>" },
    { uid: "东门值班", time: "2005-02-27 03:07", num: 6, html: "<p>别反复刷新。缓存会把同一个人算两次，老站以前也这样。[[占线]]的时候尤其明显。</p>" }
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

/* -------------------------------------------------------------------------
   Optional branches. These are deliberately ordinary forum conversations:
   the player can miss them, but each one changes the meaning of the final
   floor. They connect the three viewpoints of the story instead of turning
   the archive into a single keyword corridor.
   ------------------------------------------------------------------------- */
BBS_EXPANSION.threads.push({
  id: "f_audio_log", board: "guaitan", tier: 1, hidden: true, doc: true,
  title: "录音里多了一次呼吸，求懂声学的人", author: "录音带", time: "2005-02-26 18:13", views: 742,
  posts: [
    { uid: "录音带", time: "2005-02-26 18:13", num: 1, html:
      "<p>昨晚用旧磁带录空房间的电流声。屋里只有一台收音机，没有人说话，文件却有五次明显的呼吸。</p>" +
      "<p>前四次间隔一样，第五次落在正中间。把磁带暂停，那个声音不会停，它会在下一段继续。[[录音]]编号是 A-0333。</p>" },
    { uid: "唯物主义小刀", time: "2005-02-26 18:29", num: 2, html: "<p>磁带速度和电池都查过了吗？别把底噪当人声。尤其不要反复倒放，耳朵会自己补全。</p>" },
    { uid: "右灯", time: "2005-02-26 19:04", num: 3, html: "<p>如果听见[[第五声]]，不要暂停。暂停以后它会以为你在等它说完。</p>" },
    { uid: "录音带", time: "2005-02-27 03:35", num: 4, html: "<p>我没有再放。刚才磁带自己转了一圈，录音笔上多了一条新文件，名字是空的。</p>" },
    { uid: "半夜鸡叫", time: "2005-02-27 08:02", num: 5, html: "<p>楼主删帖前有人在楼里问，为什么录音里有键盘声。你昨晚不是没开电脑吗？</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_door_watch", board: "xianliao", tier: 1, hidden: false, doc: true,
  title: "南城四号楼：凌晨有人敲门吗", author: "南城住户", time: "2005-02-27 00:18", views: 468,
  posts: [
    { uid: "南城住户", time: "2005-02-27 00:18", num: 1, html:
      "<p>我住四号楼五层。昨晚03:44，楼道里有人敲一扇不存在的门，三下，停一会儿，再三下。</p>" +
      "<p>我打开门，门外只有墙。墙上的旧门牌写着[[门牌]]37，物业说这栋楼没有37号房。</p>" },
    { uid: "东门值班", time: "2005-02-27 00:32", num: 2, html: "<p>四号楼没有顶层，五楼上面是水箱间。别在凌晨开门，先确认猫是不是还在屋里。</p>" },
    { uid: "旧钥匙", time: "2005-02-27 00:41", num: 3, html: "<p>我以前替房东换过门锁。那面墙确实有过门，后来封了。封门前，里面住的是一个论坛用户。</p>" },
    { uid: "青灯", time: "2005-02-27 00:58", num: 4, html: "<p>不要在闲聊版留下具体地址。帖子暂时保留，等我确认[[敲门]]声是不是管道回响。</p>" },
    { uid: "南城住户", time: "2005-02-27 03:46", num: 5, html:
      "<p>刚才又响了。这次不是门外，是我电脑机箱里面。</p>" +
      "<div class='branch-choice' data-choice='door-watch'><span>附件里有一张门牌近照。要打开吗？</span><button type='button' data-choice-value='look'>查看附件</button><button type='button' data-choice-value='leave'>先不看</button></div>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_rack_log", board: "zhanwu", tier: 2, hidden: true, doc: true,
  title: "B27-0344 机柜维护记录（未归档）", author: "机房夜班", time: "2012-02-27 04:02", views: 154,
  posts: [
    { uid: "机房夜班", time: "2012-02-27 04:02", num: 1, html:
      "<p>按工单切断B27-0344电源。断电前最后一条写入来自本机127.0.0.1，用户字段为空，楼层字段是37。</p>" +
      "<p>机器已经断网，写入队列还在增长。每增长四个字节，机柜风扇会转一圈。[[风扇]]不是温控触发的。</p>" },
    { uid: "数据库民工", time: "2012-02-27 04:18", num: 2, html: "<p>别清队列，先把原始日志复制出来。日期字段反复回到2005-02-27 03:44，像有人拿旧时间覆盖现在。</p>" },
    { uid: "青灯", time: "2012-02-27 09:14", num: 3, html: "<p>我会处理。机房门先锁，论坛照常只读。任何人都不要把[[B27-0344]]写进公开公告。</p>" },
    { uid: "系统", time: "2012-02-27 09:15", num: 4, html: "<p class='ghost'>门已锁。里面还有一台机器在线。</p>" },
    { uid: "机房夜班", time: "2012-02-28 02:11", num: 5, html: "<p>昨晚我没进机房。风扇还是转了四次，停在第五次之前。</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_reply_shadow", board: "guaitan", tier: 2, hidden: true, doc: true,
  title: "回归帖的标点为什么变了", author: "档案拾荒者", time: "2023-09-18 03:12", views: 98,
  posts: [
    { uid: "档案拾荒者", time: "2023-09-18 03:12", num: 1, html:
      "<p>我把右灯2005年的帖子和2008年的回归帖放在一起看。内容不像同一个人，标点却在同一处停顿。</p>" +
      "<p>他断更前没有句号，回归帖每句都有句号。编辑器像沿着他的停顿继续写，而且知道原作者没写完的句子。</p>" },
    { uid: "无灯", time: "2023-09-18 03:19", num: 2, html: "<p>别急着给这个停顿找一个用户名。空出来的位置不一定需要账号。</p>" },
    { uid: "关门人", time: "2023-09-18 03:44", num: 3, html: "<p>没有存档依据。请停止比对作者笔迹。</p>" },
    { uid: "档案拾荒者", time: "2023-09-18 03:45", num: 4, html: "<p>我停了。可是编辑框里多了一句没有发送的内容：[[观察者]]已登录。</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_chair_back", board: "tietu", tier: 3, hidden: true, doc: true,
  title: "门背后的四张椅子，照片背面还有一行字", author: "提灯人", time: "2014-03-12 00:21", views: 37,
  posts: [
    { uid: "提灯人", time: "2014-03-12 00:21", num: 1, html:
      "<p>交代帖发完以后，我又找到那张照片的底片。正面是四个角落，背面多了一行冲洗店没有印过的字。</p>" +
      "<p>字不是“不要数”。它写的是：[[第五把椅子]]不在照片里，因为拍照的人站在它上面。</p>" +
      "<div class='photo'><img src='../assets/img/corner_figure.jpg' alt='角落里有旧椅子和一块看不清的人影'><div class='cap'>底片编号：A-0333。右下角的时间不是冲洗时间。</div></div>" },
    { uid: "老镜头", time: "2014-03-12 00:38", num: 2, html: "<p>这张图以前在贴图版出现过，后来被删了。你确定相机前面没有人吗？</p>" },
    { uid: "提灯人", time: "2014-03-12 00:44", num: 3, html: "<p>我确定。可是底片上有一个人的影子，影子朝着镜头，身体却朝着墙。</p>" },
    { uid: "系统", time: "2014-03-12 03:44", num: 4, html: "<p class='ghost'>图片读取完成。请不要站到房间正中间。</p>" }
  ]
});

BBS_EXPANSION.threads.push({
  id: "f_preflight", board: "guaitan", tier: 2, hidden: true, doc: true,
  title: "直播前的最后一次编辑", author: "右灯", time: "2005-02-26 20:44", views: 611,
  posts: [
    { uid: "右灯", time: "2005-02-26 20:44", num: 1, html:
      "<p>把今晚的步骤再写一遍，免得直播时忘。屋里四个角，四把椅子，手机放在中间。</p>" +
      "<p>我找了三个能凑数的账号，用户名都能在论坛搜到，但他们今晚不会来。[[最后一次编辑]]前，在线人数应该是四。</p>" },
    { uid: "青灯", time: "2005-02-26 21:02", num: 2, html: "<p>你不要在帖子里写“凑数”。这是民俗版，不是实验室。直播如果出问题，先关机，不要继续更新。</p>" },
    { uid: "唯物主义小刀", time: "2005-02-27 00:16", num: 3, html: "<p>我会盯着。楼主你至少把门牌号发给我，真出事我好报警。</p>" },
    { uid: "右灯", time: "2005-02-27 02:39", num: 4, html:
      "<p>不用门牌。房间里没有门，只有四面墙。录音文件A-0333已经准备好，里面有一段不是我录的声音。</p>" +
      "<p>如果你们看到在线人数变成五，先把页面留在原处。别替它起名字。</p>" },
    { uid: "系统", time: "2005-02-27 03:44", num: 5, html: "<p class='ghost'>本帖已保存。编辑人字段为空。</p>" },
    { uid: "档案拾荒者", time: "2023-11-02 03:44", num: 6, html: "<p>我找到的原始文件比页面多一层。那层写着：请把[[在线]]人数留在五。</p>" }
  ]
});

/* A character branch: the main thread is more frightening when the reader
   first understands why Right Lamp kept asking strangers to watch. */
BBS_EXPANSION.threads.push({
  id: "f_rightlamp_note", board: "guaitan", tier: 1, hidden: true, doc: true,
  title: "右灯的旧帖：如果没人回帖，就不算发生过", author: "右灯", time: "2004-12-19 01:08", views: 317,
  posts: [
    { uid: "右灯", time: "2004-12-19 01:08", num: 1, html:
      "<p>有人问我为什么每做一个小实验都要发帖。答案很简单：一个人做完的事，没有人回帖，就像没发生过。</p>" +
      "<p>我不需要你们相信有鬼。我只想在第二天打开页面时，确认昨晚确实有人在场。</p>" },
    { uid: "白裙子姐姐", time: "2004-12-19 01:31", num: 2, html: "<p>你是在找见证人，不是在找鬼。两件事别混在一起。</p>" },
    { uid: "右灯", time: "2004-12-19 01:44", num: 3, html: "<p>那就算见证人吧。关灯以后，论坛刷新声比房间里的声音更让我安心。</p>" },
    { uid: "提灯前的蛤蟆", time: "2004-12-19 02:02", num: 4, html: "<p>别把看帖的人当成房间里的人。你总有一天会把两个位置记混。</p>" },
    { uid: "右灯", time: "2005-02-26 20:12", num: 5, html: "<p>今晚不用你们进房间。四个角会替我记住谁来过。[[在场]]就够了。</p>" }
  ]
});

/* The phone line is a mundane, social branch. It gives the player another
   choice that can lead to the return or silent ending without naming either. */
BBS_EXPANSION.threads.push({
  id: "f_phone_line", board: "xianliao", tier: 2, hidden: true, doc: true,
  title: "03:33 之后，值班电话一直占线", author: "夜班接线员", time: "2005-02-27 03:51", views: 133,
  posts: [
    { uid: "夜班接线员", time: "2005-02-27 03:51", num: 1, html:
      "<p>值班电话在03:33响过一次。对方没有说话，只问了一句：四个角都有人吗？</p>" +
      "<p>我还没回答，线路就断了。通话记录却留了44秒。</p>" },
    { uid: "纸鸢", time: "2005-02-27 03:56", num: 2, html: "<p>来电显示是空的。我回拨，听见的不是忙音，是我自己的开场白。</p>" },
    { uid: "右灯", time: "2005-02-27 04:01", num: 3, html: "<p>别替我接电话。我房间里没有电话。</p>" },
    { uid: "夜班接线员", time: "2005-02-27 04:12", num: 4, html: "<p>刚才接线台自己亮了。耳机里有人把我的名字念了一遍，停在姓的最后一笔。</p>" },
    { uid: "缓存清理员", time: "2023-11-03 03:44", num: 5, html:
      "<p>旧系统只保存了一个操作入口。要不要把这条线路重新拨出去？</p>" +
      "<div class='branch-choice' data-choice='phone-return' data-result-call='回拨请求已写入。线路没有接通，但页面记住了你的号码。' data-result-delete='你删掉了号码。删除记录比原记录早了一分钟。' data-whisper-call='你把电话拨回去了。' data-whisper-delete='你把号码留在了断线的一侧。' data-ending-signal-call='return' data-ending-signal-delete='silent'><span>旧电话仍显示“可用”。要回拨吗？</span><button type='button' data-choice-value='call'>回拨</button><button type='button' data-choice-value='delete'>删除记录</button></div>" }
  ]
});

/* An archive-era branch about the editor cache. It turns the player's own
   typing into a diegetic object and supports a quieter ending route. */
BBS_EXPANSION.threads.push({
  id: "f_editor_cache", board: "zhanwu", tier: 2, hidden: true, doc: true,
  title: "编辑器自动保存：最后一句没有发出去", author: "缓存清理员", time: "2023-11-03 03:20", views: 72,
  posts: [
    { uid: "缓存清理员", time: "2023-11-03 03:20", num: 1, html:
      "<p>我从浏览器缓存里捞出一段旧编辑记录。它不是帖子，也不是草稿，只保留了按键间隔。</p>" +
      "<pre class='cache-fragment'>我在\n别\n到我了\n</pre>" },
    { uid: "无灯", time: "2023-11-03 03:27", num: 2, html: "<p>按键间隔不是右灯的。最后一行停了44秒，像有人等另一个人把话说完。</p>" },
    { uid: "档案拾荒者", time: "2023-11-03 03:33", num: 3, html: "<p>我没有把这段贴进主帖。贴进去以后，浏览器会自动把光标放在下一行。</p>" },
    { uid: "系统", time: "2023-11-03 03:44", num: 4, html:
      "<p class='ghost'>缓存读取完成。编辑人字段为空。</p>" +
      "<div class='branch-choice' data-choice='cache-read' data-result-open='原始缓存展开了。末尾多出一个没有按下的回车。' data-result-close='你关掉了缓存。光标仍停在最后一行。' data-whisper-open='你让最后一行继续。' data-whisper-close='你把光标留在原处。' data-ending-signal-open='silent' data-ending-signal-close='echo'><span>原始缓存还可以读取一次。要展开吗？</span><button type='button' data-choice-value='open'>展开缓存</button><button type='button' data-choice-value='close'>先关闭</button></div>" }
  ]
});

/* Search is the branch map. The forum never prints a quest list; these words
   are discoverable from posts, signatures and timestamps. */
BBS.routes["录音"] = "f_audio_log";
BBS.routes["第五声"] = "f_audio_log";
BBS.routes["暂停"] = "f_audio_log";
BBS.routes["门牌"] = "f_door_watch";
BBS.routes["敲门"] = "f_door_watch";
BBS.routes["B27-0344"] = "f_rack_log";
BBS.routes["风扇"] = "f_rack_log";
BBS.routes["替他回帖"] = "f_reply_shadow";
BBS.routes["观察者"] = "f_reply_shadow";
BBS.routes["第五把椅子"] = "f_chair_back";
BBS.routes["照片背面"] = "f_chair_back";
BBS.routes["最后一次编辑"] = "f_preflight";
BBS.routes["直播准备"] = "f_preflight";
BBS.routes["A-0333"] = "f_preflight";
BBS.routes["在场"] = "f_rightlamp_note";
BBS.routes["没人回帖"] = "f_rightlamp_note";
BBS.routes["占线"] = "f_phone_line";
BBS.routes["电话"] = "f_phone_line";
BBS.routes["未发送"] = "f_editor_cache";
BBS.routes["自动保存"] = "f_editor_cache";
BBS.routes["编辑器"] = "f_editor_cache";
