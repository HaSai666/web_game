/* ===== 莲灯夜话 数据·深层支线 =====
   这些记录不参与第37楼的必读门禁。它们把“房间里发生了什么”拆成
   几个普通人的视角：房东、邻居、版主、旧物和存档访客。每条线都
   留一点没有被解释的空白，玩家可以错过，也可以带着自己的选择走
   到最后一页。
*/
(function () {
  "use strict";
  if (!window.BBS_EXPANSION || window.BBS_EXPANSION.__deepBranchesLoaded) return;
  var X = window.BBS_EXPANSION;
  X.__deepBranchesLoaded = true;
  X.users = X.users || {};
  X.threads = X.threads || [];

  var users = {
    "隔墙的人": { reg: "2005-03-04", posts: 12, title: "会员", sig: "墙的另一边也有回声。" },
    "抄表员": { reg: "2004-02-09", posts: 74, title: "会员", sig: "表会走，房子不一定。" },
    "旧台灯": { reg: "2004-12-20", posts: 31, title: "会员", sig: "借出去的光，总要有地方回来。" },
    "回形针": { reg: "2023-10-02", posts: 19, title: "新手上路", sig: "把散页夹在一起。" },
    "折角": { reg: "2023-08-21", posts: 8, title: "新手上路", sig: "纸张折过就会记得。" },
    "纸灯笼": { reg: "2014-03-13", posts: 27, title: "会员", sig: "灯亮的时候不要看窗外。" }
  };
  Object.keys(users).forEach(function (name) {
    if (!X.users[name]) X.users[name] = users[name];
  });

  function add(thread) { X.threads.push(thread); }

  /* ---------- 房间线：从一笔普通的租客登记开始 ---------- */
  add({
    id: "f_floorplan", board: "xianliao", tier: 2, hidden: false, doc: true,
    title: "南城四号楼的租客登记，少了一页", author: "旧钥匙", time: "2005-02-12 20:18", views: 734,
    posts: [
      { uid: "旧钥匙", time: "2005-02-12 20:18", num: 1, html:
        "<p>帮房东整理旧账本。南城四号楼的租客登记从第36页直接翻到第38页，中间那张像是被整齐地抽走了，不是撕掉。</p>" +
        "<p>缺页上本来应该写房间号和退租日期。房东说那间房一直是空的，可钥匙柜里少了一把，标签只剩一个“37”。</p>" },
      { uid: "抄表员", time: "2005-02-12 21:03", num: 2, html:
        "<p>我抄过那栋楼的表。五层最里面有一块旧电表，户名栏是空的，读数每个月都会在凌晨三点多跳一格。</p>" +
        "<p>不是用电量，像有人把指针拨回去。物业让我别写进工单，我就没写。</p>" },
      { uid: "南城住户", time: "2005-02-13 00:27", num: 3, html:
        "<p>我住五层。水箱间旁边那面墙确实有过一扇门，门牌是[[37号房]]，现在用水泥封了。</p>" +
        "<p>封墙前我进去看过一次，屋里没有家具，只有四张旧凳子，分别靠着四面墙。凳脚下面的灰很厚，像没人动过。</p>" },
      { uid: "旧钥匙", time: "2005-02-13 09:14", num: 4, html:
        "<p>钥匙找到了，在房东抽屉最底下。四道齿，正常。奇怪的是钥匙背面多了一道新划痕，刚好像第五道。</p>" +
        "<p>我问房东谁住过37号，他只说“别把不存在的房间写进账本”。这句话听着不像在说房子。</p>" },
      { uid: "关门人", time: "2023-08-22 01:06", num: 5, html:
        "<p>我从旧钥匙手里拿到一张扫描件。折角里面有一行被压平的铅笔字：[[租客登记]]不是按房间排的，是按“谁最后回来”排的。</p>" +
        "<p>扫描仪在这一行停了44秒，文件没有报错。我没有继续展开。</p>" },
      { uid: "折角", time: "2023-08-22 01:19", num: 6, html:
        "<p>我看过原件。纸角不是向里折，是有人从背面把它按住，像怕这一页自己翻出来。</p>" +
        "<div class='branch-choice' data-choice='floorplan-fold' data-result-open='折角被展开了。平面图多出一条不通向任何房间的走廊，尽头标着37。' data-result-close='你保留了折角。纸面下仍有一块温热，像刚被手指按过。' data-whisper-open='墙后面还有一条路。' data-whisper-close='你让那一页继续压着。'><span>扫描件仍有一页没有摊平。要把折角展开吗？</span><button type='button' data-choice-value='open'>展开扫描</button><button type='button' data-choice-value='close'>保留折角</button></div>" }
    ]
  });

  /* ---------- 证人线：声音比新闻更早记住那一晚 ---------- */
  add({
    id: "f_neighbor_tape", board: "guaitan", tier: 2, hidden: true, doc: true,
    title: "那晚隔墙的人，录音没有录到门", author: "隔墙的人", time: "2005-03-04 22:07", views: 602,
    posts: [
      { uid: "隔墙的人", time: "2005-03-04 22:07", num: 1, html:
        "<p>我住右灯那间出租屋的隔壁。警察来问过一次，我当时说只听见拖椅子的声音，现在想起来还漏了一段。</p>" +
        "<p>2月27日凌晨三点多，墙里先是走动，停了很久，然后有人很轻地报数。数到四以后，墙上像多了一下敲击。</p>" },
      { uid: "唯物主义小刀", time: "2005-03-04 22:31", num: 2, html:
        "<p>老楼的水管会传声，听见数数不代表什么。你有录音的话只贴频谱，别贴原声，免得大家跟着脑补。</p>" },
      { uid: "隔墙的人", time: "2005-03-05 00:02", num: 3, html:
        "<p>我确实录了。磁带编号是A-0333，前四下分别来自四面墙，第五下在房间正中间。</p>" +
        "<p>最奇怪的是录音里没有门响。那间屋明明有门，我每天都看见它。[[隔墙录音]]的末尾却像有人从屋里把门拿走了。</p>" },
      { uid: "提灯前的蛤蟆", time: "2005-03-05 00:17", num: 4, html:
        "<p>别反复放。录下来的房间也是房间，听久了就会给它找一个空角。</p>" },
      { uid: "关门人", time: "2023-09-02 03:12", num: 5, html:
        "<p>我拿到的是复制带。原带中间少了44秒，复制带反而把这44秒补成了连续的底噪。</p>" +
        "<p>底噪里有一句听不清的话。波形像“别替我开门”，也像“你已经在里面”。</p>" },
      { uid: "隔墙的人", time: "2023-09-02 03:44", num: 6, html:
        "<div class='branch-choice' data-choice='neighbor-tape' data-result-listen='你播放了未剪片段。前四次敲击之后，耳机里传来一次贴近麦克风的吸气。' data-result-transcript='你只看了转录。文字在“第五下”后多出一个没有编号的空行。' data-whisper-listen='这次声音来自你这一侧。' data-whisper-transcript='空行也算一条记录。'><span>未剪片段还可以读取一次。要播放原声吗？</span><button type='button' data-choice-value='listen'>播放原声</button><button type='button' data-choice-value='transcript'>只看转录</button></div>" }
    ]
  });

  /* ---------- 人物线：让右灯在作死之前先像一个真实的人 ---------- */
  add({
    id: "f_lamp_debt", board: "xianliao", tier: 1, hidden: false, doc: true,
    title: "右灯借走的那盏台灯，后来还回来了吗", author: "旧台灯", time: "2004-12-20 19:42", views: 921,
    posts: [
      { uid: "旧台灯", time: "2004-12-20 19:42", num: 1, html:
        "<p>替朋友问。右灯去年借走过一盏夹在桌边的小台灯，说出租屋的顶灯总在半夜灭，想拿它照着写东西。</p>" +
        "<p>他说只借一晚，结果一借就是两个月。有人知道他搬去哪儿了吗？</p>" },
      { uid: "白裙子姐姐", time: "2004-12-20 20:08", num: 2, html:
        "<p>他不是怕黑，是怕黑下来以后看不清角落。以前版聊到半夜，他总要留一盏灯，说这样第二天还能确认自己没有睡着。</p>" },
      { uid: "右灯", time: "2004-12-20 20:41", num: 3, html:
        "<p>灯挺好用的，别催。我写完这几篇就还。屋里只留一盏也够，至少能看见[[在场]]。</p>" },
      { uid: "提灯前的蛤蟆", time: "2004-12-20 21:02", num: 4, html:
        "<p>一盏灯照不亮四个角。你要真想睡，把门打开，别把自己关在一间只有一个光源的屋里。</p>" },
      { uid: "旧台灯", time: "2005-02-28 08:06", num: 5, html:
        "<p>灯昨晚自己回来了。包在旧报纸里，开关是开的，灯泡还是热的。</p>" +
        "<p>右灯没回来。报纸日期停在2月27日，边角被谁折成了四层。</p>" },
      { uid: "档案拾荒者", time: "2023-10-12 00:18", num: 6, html:
        "<p>我比对过照片。主帖最后一张图里确实有一根台灯电线，线头伸出画面，像连到了照片外面。</p>" }
    ]
  });

  /* ---------- 版主线：青灯不是神秘管理员，而是一直在补洞的人 ---------- */
  add({
    id: "f_mod_backup", board: "zhanwu", tier: 3, hidden: true, doc: true,
    title: "版主备份：锁帖之前我保存了什么", author: "青灯", time: "2005-02-27 05:08", views: 447,
    posts: [
      { uid: "青灯", time: "2005-02-27 05:08", num: 1, html:
        "<p>我把主帖锁了。不是因为有人刷屏，是因为后台每刷新一次，楼层计数就少一层。</p>" +
        "<p>03:46我保存了第一份快照。快照里没有37楼，只有一个空作者字段和四个字节的长度。</p>" },
      { uid: "数据库民工", time: "2005-02-27 05:31", num: 2, html:
        "<p>建议不要直接恢复。旧库的写入指针还在动，复制文件时硬盘灯会按一、二、三、四的节奏闪。</p>" +
        "<p>我把镜像放到离线盘，文件名只写了[[锁帖备份]]，没写主帖标题。</p>" },
      { uid: "青灯", time: "2005-02-27 06:02", num: 3, html:
        "<p>我做了两份。一份放回收站，一份留在机房。回收站那份能看到删除记录，机房那份只有一个光标，光标每隔44秒向下跳。</p>" },
      { uid: "站务组", time: "2005-02-27 09:20", num: 4, html:
        "<p>公告按你的意思发了。大家都说是缓存故障。只要不再打开那份快照，应该不会继续写。</p>" },
      { uid: "青灯", time: "2005-02-28 03:44", num: 5, html:
        "<p>“应该”不是处理状态。我昨晚关掉机房灯，离开前看见离线盘的指示灯还亮着。</p>" +
        "<p>它没有联网，为什么会显示[[在线]]？</p>" },
      { uid: "关门人", time: "2023-09-15 03:44", num: 6, html:
        "<p>这条备份记录是我从旧站务信箱里捞出来的。末尾有一行手写选择：</p>" +
        "<div class='branch-choice' data-choice='mod-snapshot' data-result-restore='快照恢复到屏幕上。楼层仍然从36跳到38，但多出了一行没有作者的“谢谢”。' data-result-seal='你把快照重新封存。封条上的日期比今天早了十八年。' data-whisper-restore='恢复不是回到原处。' data-whisper-seal='门外的日期先被封上了。' data-ending-signal-restore='echo' data-ending-signal-seal='sealed'><span>旧快照仍可操作一次。要恢复，还是继续封存？</span><button type='button' data-choice-value='restore'>恢复快照</button><button type='button' data-choice-value='seal'>继续封存</button></div>" }
    ]
  });

  /* ---------- 存档访客线：把“看的人”放回论坛的社会关系里 ---------- */
  add({
    id: "f_guestbook", board: "zhanwu", tier: 2, hidden: false, doc: true,
    title: "存档留言簿：请不要把名字写在这里", author: "回形针", time: "2023-11-03 02:58", views: 182,
    posts: [
      { uid: "回形针", time: "2023-11-03 02:58", num: 1, html:
        "<p>这个镜像没有留言功能。我在页面底部看见一个空白输入框，刷新以后它又不见了。</p>" +
        "<p>我没有输入名字，只打了“在”。第二天回来看，旧主帖第38楼的末尾多了一个句号。</p>" },
      { uid: "无灯", time: "2023-11-03 03:07", num: 2, html:
        "<p>我也见过。输入框的提示不是“留言”，是“留下四个字符”。四个字符以后，光标不会回到开头。</p>" },
      { uid: "关门人", time: "2023-11-03 03:21", num: 3, html:
        "<p>请不要在存档里留下个人信息。这里没有真正的留言簿，任何输入都不会上传，也不会被我读取。</p>" },
      { uid: "回形针", time: "2023-11-03 03:33", num: 4, html:
        "<p>我把页面关了。再打开时，输入框还在，里面已经有一串我没打过的标点。</p>" +
        "<p>它们排成一条很短的路，最后一个位置是空的。</p>" },
      { uid: "系统", time: "2023-11-03 03:44", num: 5, html:
        "<div class='branch-choice' data-choice='guestbook-mark' data-result-leave='你留下了一个时间戳。页面没有显示名字，只把当前分钟写进了旧索引。' data-result-erase='你清空了留言。输入框消失了，但浏览器历史里多了一条没有标题的记录。' data-whisper-leave='镜像记住了你停留的分钟。' data-whisper-erase='删除也会留下一个位置。' data-ending-signal-leave='occupied' data-ending-signal-erase='silent'><span>空白留言簿仍在等待一次输入。要留下时间，还是清空它？</span><button type='button' data-choice-value='leave'>留下时间</button><button type='button' data-choice-value='erase'>清空留言</button></div>" }
    ]
  });

  /* ---------- 家庭线：把“角落”追溯到右灯最早听见的那句话 ---------- */
  add({
    id: "f_granny_letter", board: "guaitan", tier: 2, hidden: true, doc: true,
    title: "外婆留下的信：灯亮时不要替谁开门", author: "纸灯笼", time: "2014-03-13 20:44", views: 261,
    posts: [
      { uid: "纸灯笼", time: "2014-03-13 20:44", num: 1, html:
        "<p>提灯人交代帖发完后，寄来一张外婆的信纸。信没有写给右灯，落款却用了他小时候的小名。</p>" +
        "<p>信上只留了几句家常：晚上留一盏灯，四个角不要都照亮；有人敲门先看影子，不要先看人。</p>" },
      { uid: "提灯人", time: "2014-03-13 21:12", num: 2, html:
        "<p>他小时候把这句话听反了。他以为“不要都照亮”是给角落留位置，后来才发现外婆说的是让屋里保持一个能回来的方向。</p>" +
        "<p>右灯不喜欢门。他说门一关，房间就只剩四面墙。</p>" },
      { uid: "老镜头", time: "2014-03-13 21:40", num: 3, html:
        "<p>信纸背面有一块橙色的擦痕，和A-0333底片上的数字很像。冲洗店说那不是印章，是有人用指甲反复刮过。</p>" },
      { uid: "纸灯笼", time: "2014-03-14 00:02", num: 4, html:
        "<p>最后一行被折在信封里，我没有强行抚平。只看见半个字，像“替”，也像“回”。</p>" +
        "<div class='branch-choice' data-choice='granny-letter' data-result-unfold='你把信纸摊平。折痕下面不是字，是一小块没有被灯照到的纸。' data-result-fold='你把信纸放回信封。信封内侧留着一圈温热的灰。' data-whisper-unfold='那句话没有写完。' data-whisper-fold='有人替你把信收好了。'><span>信封的折痕还没有打开。要把最后一行摊平吗？</span><button type='button' data-choice-value='unfold'>摊平信纸</button><button type='button' data-choice-value='fold'>放回信封</button></div>" }
    ]
  });

  /* ---------- 主线补页：断更之后，论坛先继续像论坛一样说话 ---------- */
  var main = null;
  var coreThreads = window.BBS && BBS.threads ? BBS.threads : [];
  for (var i = 0; i < coreThreads.length; i++) if (coreThreads[i].id === "t_main") main = coreThreads[i];
  var deepMainPosts = [
      { uid: "青灯", time: "2005-02-27 03:49", num: 43, html:
        "<p>本帖暂时锁十分钟。不是删帖，别再刷[[在线人数]]。</p>" +
        "<p>后台最后一条请求没有用户名，来源栏只写着“墙后”。我会把[[锁帖备份]]留在站务版，其他人不要动。</p>" },
      { uid: "东门值班", time: "2005-02-27 03:52", num: 44, html:
        "<p>刚才值班台的灯自己亮了。电话没有响，线路却显示接通，耳机里有人问：房间的门朝哪边开？</p>" +
        "<p>我没有回答。记录里还是多了一次[[电话记录]]。</p>" },
      { uid: "唯物主义小刀", time: "2005-02-27 04:06", num: 45, html:
        "<p>我去南城找楼主，房东说那间屋不存在。五楼水箱间旁边的墙上却有新水泥，地上还留着四道凳脚印。</p>" +
        "<p>我拍了照，回到电脑前照片只剩一面白墙。[[租客登记]]也搜不到了。</p>" },
      { uid: "半夜鸡叫", time: "2005-02-27 04:18", num: 46, html:
        "<p>在线数从5退回4，又跳回5。我截的图里没有第五个头像，只有头像之间多了一段空白。</p>" +
        "<p>谁能解释一下？别跟我说缓存，我今晚已经把缓存清了三遍。</p>" },
      { uid: "提灯前的蛤蟆", time: "2005-02-27 04:41", num: 47, html:
        "<p>都别在这里喊他的名字。右灯发帖不是为了让人来房间，是为了确认页面另一边还有人。</p>" +
        "<p>你们继续回，他就会以为人还没齐。[[见证]]不是位置，别替他把两个词混在一起。</p>" },
      { uid: "青灯", time: "2005-02-27 05:02", num: 48, html:
        "<p>公告已经发了，主帖只读。有人问为什么不直接删掉，我没有回复。</p>" +
        "<p>删掉以后，回收站会多一条记录；不删，页面会自己补一条。两边都不是好办法。</p>" },
      { uid: "系统", time: "2005-02-28 09:05", num: 49, html:
        "<p class='stamp'>系统校正：本帖显示共50楼，实体记录49楼。缺失楼层编号：37。</p>" +
        "<p>校正失败后，页面把最后一次读取时间写成了03:44。</p>" },
      { uid: "（用户信息已损坏）", time: "2005-03-01 03:44", num: 50, html:
        "<p>灯还亮着。</p><p class='stamp'>本楼作者字段无法还原。下一次编辑请求来自[[墙后]]。</p>" }
    ];
  X.deepMainPosts = deepMainPosts;
  if (main && !main.__deepPostsAdded) {
    main.__deepPostsAdded = true;
    main.views = Math.max(main.views || 0, 4388);
    main.posts = main.posts.concat(deepMainPosts);
  }

  /* Search words are still discovered in ordinary sentences. */
  var routes = {
    "37号房": "f_floorplan", "租客登记": "f_floorplan", "平面图": "f_floorplan", "空表": "f_floorplan", "折角": "f_floorplan", "墙后": "f_floorplan",
    "隔墙录音": "f_neighbor_tape", "第五下": "f_neighbor_tape", "未剪片段": "f_neighbor_tape", "隔墙": "f_neighbor_tape", "电话记录": "f_phone_line",
    "在线人数": "f_night_presence",
    "台灯": "f_lamp_debt", "借灯": "f_lamp_debt", "灯泡": "f_lamp_debt", "见证": "f_rightlamp_note",
    "锁帖备份": "f_mod_backup", "快照": "f_mod_backup", "离线盘": "f_mod_backup", "恢复": "f_mod_backup", "封存": "f_mod_backup",
    "留言簿": "f_guestbook", "留下时间": "f_guestbook", "空白输入框": "f_guestbook", "个人信息": "f_guestbook",
    "外婆的信": "f_granny_letter", "信纸": "f_granny_letter", "折痕": "f_granny_letter", "小名": "f_granny_letter"
  };
  if (window.BBS && BBS.routes) Object.keys(routes).forEach(function (key) { BBS.routes[key] = routes[key]; });
})();
