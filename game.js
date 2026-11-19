/* 汉字乐园 v3 — 笔顺练习游戏
 * 引擎：Hanzi Writer (MIT)。字表与《中国语文》一册课文同步维护。
 * v2：写字秘诀多例练习；写错笔时按笔顺规则语音讲解；字形记忆口诀（听写提示）。
 * v3：选择页鸟瞰（每课/每条秘诀列出所有字）；点任意字单独练习；
 *     掌握度追踪（3 次无错误无提示通过 = 掌握），未掌握的字高亮。
 */

// ---------- 数据 ----------

// 学笔画：每条"秘诀"配多个例字（含课文里的字，重复出现是有意的）
const RULES = [
  { rule: '横：从左到右',     emoji: '➡️', say: '横，要从左写到右。',                       chars: [['一','一个'],['二','第二'],['三','三个']] },
  { rule: '竖：从上到下',     emoji: '⬇️', say: '竖，要从上写到下。',                       chars: [['十','十个'],['中','中间'],['个','一个']] },
  { rule: '先横后竖',         emoji: '➕', say: '横和竖碰在一起，先写横，再写竖。',         chars: [['十','十个'],['土','土地'],['干','干净']] },
  { rule: '先撇后捺',         emoji: '🏔️', say: '先写撇，再写捺。',                         chars: [['人','大人'],['八','八个'],['天','明天']] },
  { rule: '从上到下',         emoji: '🪜', say: '一个字，从上面写到下面。',                 chars: [['三','三个'],['六','六个'],['文','文字']] },
  { rule: '先左后右',         emoji: '👫', say: '左右结构的字，先写左边，再写右边。',       chars: [['川','四川'],['好','你好'],['明','明天']] },
  { rule: '先外后内再封口',   emoji: '🚪', say: '先写外面，再写里面，最后关门封口。',       chars: [['日','太阳'],['目','眼睛'],['白','白色']] },
  { rule: '先中间后两边',     emoji: '⚖️', say: '先写中间，再写两边。',                     chars: [['小','大小'],['山','大山'],['水','喝水']] },
];

// 写生字：与课文同步（字表 = 教材 p.115 生字表；词语 = p.116 词语表）。新一课加一行即可。
// 第 1-5 课为入学（Wk04）前教的课，是她的缺口清单——补缺口优先。
const LESSONS = [
  { id: 1,  title: '第1课',        emoji: '🙋', chars: [['我','我们'],['是','我是'],['一','一名'],['名','一名'],['学','学生'],['生','学生']] },
  { id: 2,  title: '第2课',        emoji: '👩‍🏫', chars: [['中','中文'],['文','中文'],['老','老师'],['师','老师'],['的','我的'],['朋','朋友'],['友','朋友'],['同','同学']] },
  { id: 3,  title: '第3课',        emoji: '⚽', chars: [['上','上课'],['课','上课'],['了','上课了'],['球','皮球'],['下','留下'],['口','一口'],['儿','儿子']] },
  { id: 4,  title: '第4课 数字',   emoji: '🔢', chars: [['二','第二'],['三','三个'],['四','四个'],['五','五个'],['六','六个'],['七','七上八下'],['八','八个']] },
  { id: 5,  title: '第5课',        emoji: '📏', chars: [['大','大小'],['小','大小'],['多','多少'],['少','多少'],['记','记得'],['得','记得'],['牢','记得牢'],['而','而且']] },
  { id: 6,  title: '第6课',        emoji: '😊', chars: [['皮','皮球'],['真','真好'],['好','你好'],['笑','笑脸'],['走','走路'],['来','过来'],['姥','姥姥']] },
  { id: 7,  title: '第7课 手指歌', emoji: '🖐️', chars: [['手','小手'],['指','手指'],['电','电话'],['两','两个'],['个','三个'],['有','我有']] },
  { id: 8,  title: '第8课 大西瓜', emoji: '🍉', chars: [['瓜','西瓜'],['又','又大又圆'],['你','你好'],['吃','吃饭'],['留','留下'],['变','变成']] },
  { id: 9,  title: '第9课',        emoji: '🌸', chars: [['花','花朵'],['破','破了'],['坐','坐下'],['在','在家'],['地','地上'],['哭','哭了'],['补','补衣服']] },
  { id: 10, title: '第10课 中秋节', emoji: '🥮', chars: [['节','中秋节'],['蓝','蓝色'],['明','明天'],['孩','孩子'],['脸','笑脸'],['甜','甜甜的']] },
  { id: 11, title: '第11课',        emoji: '🐟', chars: [['条','一条鱼'],['鱼','小鱼'],['水','河水'],['里','水里'],['游','游来游去'],['发','发生']] },
  { id: 12, title: '第12课',        emoji: '🐦', chars: [['会','开会'],['飞','会飞'],['鸟','小鸟'],['拍','节拍'],['调','大调'],['许','许多']] },
  { id: 13, title: '第13课',        emoji: '🐛', chars: [['虫','小虫'],['动','不动'],['起','起来'],['进','进来'],['洞','山洞'],['搬','搬家']] },
  { id: 14, title: '第14课 小鸭乖乖', emoji: '🦆', chars: [['鸭','鸭子'],['子','鸭子'],['路','走路'],['河','河水'],['开','开门'],['去','回去'],['把','把手']] },
  { id: 15, title: '第15课 轻轻地跳', emoji: '🐰', chars: [['轻','轻轻跳'],['跳','跳高'],['兔','兔子'],['狗','小狗'],['跑','快跑'],['要','不要'],['们','我们']] },
  { id: 16, title: '第16课 头字歌', emoji: '⛰️', chars: [['头','舌头'],['日','日子'],['石','石头'],['舌','舌头'],['山','山头'],['心','中心']] },
  { id: 17, title: '第17课 大雁', emoji: '🦢', chars: [['天','天上'],['往','来往'],['儿','一会儿'],['排','排球'],['成','成人'],['人','人字']] },
  { id: 18, title: '第18课 白鸡下黑蛋', emoji: '🥚', chars: [['白','黑白'],['鸡','鸡蛋'],['黑','黑白'],['蛋','鸡蛋']] },
  { id: 19, title: '第19课 小公鸡做习题', emoji: '🐓', chars: [['公','公鸡'],['做','做习题'],['习','习题'],['十','十米'],['米','一粒米'],['因','因为'],['为','因为'],['粒','一粒米']] },
];

// 词语表（教材 p116-117；= 词语本抄写与家默的出题来源）。按教材分组，插在对应课后面。
const WORD_GROUPS = [
  { id: 'w1', after: 10, emoji: '📝', title: '写词语 · 第1—10课',
    words: ['中文','老师','朋友','同学','学生','留下','补课','皮球','上课','七上八下','大小','多少','姥姥','手指','两个','地瓜','笑脸','节电','小孩','变脸'] },
  { id: 'w2', after: 14, emoji: '📝', title: '写词语 · 第11—14课',
    words: ['节拍','大调','许多','小鸟','开会','鸭子','河水','去路','把手','发生'] },
  { id: 'w3', after: 17, emoji: '📝', title: '写词语 · 第15—17课',
    words: ['我们','兔子','生日','舌头','心跳','来往','成人','儿子','排球','蓝天'] },
  { id: 'w4', after: 19, emoji: '📝', title: '写词语 · 第18—19课',
    words: ['黑白','鸟蛋','公鸡','米粒','因为','学习'] },
  // 第14周复习周（11/16-20）听写词中的新组合（旧字新词，Wk14 作业单）
  { id: 'w5', after: 19, emoji: '🔄', title: '写词语 · 第14周复习',
    words: ['上下','友好','搬进','山洞','飞鸟','鸡蛋','天地','甜瓜'] },
];

// 只认不写（D-006 选择性跳过）：词语里遇到时演示代替书写。
// 黑 = 爸爸 L18 决定；搬 = 爸爸点名的"反效果字"例子（13画，待爸爸确认）
const WATCH_ONLY = new Set(['黑', '搬']);

// ---------- 组字地图 v2（设计规则见 hierarchy_draft.md）----------
// chains = 接龙：后一个字 = 前一个字整个 + 一小块新东西（"熟悉的 + 一点新的"）。
//          同一个锚点可以向几个方向各伸出一条；相邻两条开头相同时，画成分叉。
// more   = 并列：都是"底座 + 别的东西"的一步扩展，彼此不接龙，用顿号并排。
//          base = 底座字（可点）；via = 底座变成的偏旁（只显示，不可点）。
// 只有真正满足"旧 + 新"的才进 chains；凑不成接龙的一律放 more。
const FAMILIES = [
  { anchor: '口', hint: '圆圆的大嘴巴',
    chains: [['口','中','虫','蛋'], ['口','石','破'], ['口','舌','甜'], ['口','同','洞']],
    more: [{ base: '口', chars: ['名','吃','哭'] }] },
  { anchor: '日', hint: '圆圆的太阳',
    chains: [['日','白','的'], ['日','白','拍']],
    more: [{ base: '日', chars: ['电','明','是','里'] }] },
  { anchor: '月', hint: '弯弯的月芽',
    more: [{ base: '月', chars: ['朋','有','明','脸'] }] },
  { anchor: '人', hint: '两条腿站稳',
    chains: [['人','从','坐'], ['人','从','两']],
    more: [{ base: '人', chars: ['个','会'] },
           { base: '人', via: '亻', chars: ['你','们','做'] }] },
  { anchor: '大', hint: '人张开双手',
    chains: [['人','大','天']],
    more: [{ base: '大', chars: ['头','因'] }] },
  { anchor: '土', hint: '🏠 家里先学',
    chains: [['十','土','王','球'], ['十','土','走','起']],
    more: [{ base: '土', chars: ['地','在','去','生'] },
           { base: '王', chars: ['往'] }] },
  { anchor: '木', hint: '一棵树',
    chains: [['木','林','森'], ['木','米','来'], ['木','米','粒']],
    more: [{ base: '木', chars: ['条'] }] },
  { anchor: '又', hint: '像一只伸出来的手',
    chains: [['又','皮','破']],
    more: [{ base: '又', chars: ['友','鸡','变','发'] }] },
  { anchor: '女', hint: '🏠 家里先学',
    more: [{ base: '女', chars: ['好','姥','要'] }] },
  { anchor: '子', hint: '了字加一横',
    chains: [['了','子']],
    more: [{ base: '子', chars: ['好','孩','学'] }] },
  { anchor: '鸟', hint: '一点是眼睛',
    more: [{ base: '鸟', chars: ['鸡','鸭','鹅'] }] },
  { anchor: '水', hint: '变成三点水，站到左边',
    more: [{ base: '水', via: '氵', chars: ['河','游','洞'] }] },
  { anchor: '手', hint: '变成提手旁，站到左边',
    more: [{ base: '手', via: '扌', chars: ['指','把','拍','排','搬'] }] },
  { anchor: '足', hint: '🏠 家里先学 · 口字下面一只脚',
    chains: [['口','足']],
    more: [{ base: '足', via: '足字旁', chars: ['路','跑','跳'] }] },
  { title: '言字旁 讠 家族', hint: '说话的字都带它',
    more: [{ via: '讠', chars: ['记','课','许','调'] }] },
  { title: '草字头 艹 家族', hint: '和植物有关',
    more: [{ via: '艹', chars: ['花','节','蓝'] }] },
  { anchor: '门', hint: '🏠 家里先学',
    more: [{ base: '门', chars: ['们','问'] }] },
  { title: '小 和 八 · 加一点点', hint: '加一两笔，变新字',
    more: [{ base: '小', chars: ['少'] },
           { base: '八', chars: ['六','公'] }] },
  // 几：后面课文里 没、亮、船、朵、风 的部件；九：数字里缺的一个，和 几 同样两笔
  { title: '几 和 九 · 两笔字', hint: '🏠 家里先学',
    more: [{ chars: ['几','九'] }] },
];

// 家族里所有的字（接龙在前，并列在后；去重）
function familyChars(f) {
  const out = [];
  const add = c => { if (!out.includes(c)) out.push(c); };
  (f.chains || []).forEach(ch => ch.forEach(add));
  (f.more || []).forEach(m => { if (m.base) add(m.base); m.chars.forEach(add); });
  return out;
}

// 地图上有、课文里没有的字（家庭补教锚点等）的组词
const MAP_WORDS = {
  '女': '女孩', '土': '土地', '门': '大门', '王': '国王', '足': '足球',
  '月': '月亮', '从': '跟从', '林': '树林', '森': '森林', '鹅': '大白鹅',
  '问': '问好', '几': '几个', '九': '九个', '木': '木头',
};

function charWordFor(c) {
  for (const l of LESSONS) for (const [ch, word] of l.chars) if (ch === c) return word;
  return MAP_WORDS[c] || '';
}

// 字形记忆口诀（听写提示 + 演示时讲解）。逐步补充。
// 写法规则：① 按书写顺序把字里每一块都说到（至少说到大部分）；② 短，一口气说完；
// ③ 不点出还没学、又不在这条链上的部件名，改用样子来说；④ 会被朗读，不用括号。
const MNEMONICS = {
  // —— 口 ——
  '口': '圆圆的大嘴巴',
  '中': '口里中间插根糖，就是中',
  '虫': '中字下面加一横一点，小虫趴在地上，拖着小尾巴',
  '蛋': '蛋壳里有个小虫子，一个小生命要出来啦',
  '石': '一横一撇加个口，山崖下有块石头',
  '破': '石加皮，石头把皮划破了',
  '舌': '千加口，嘴巴里伸出的舌头',
  '甜': '舌加甘，舌头舔甘蔗，甜甜的',
  '同': '门框里，一横一个口，大家同住一间屋',
  '洞': '三点水加同，水冲出来的洞',
  '名': '夕加口——天黑了看不清，要用嘴巴叫名字',
  '吃': '口字旁是嘴巴，右边一个人弯着腰，在吃东西',
  '哭': '哭就是两个大眼睛掉下大大的眼泪',
  // —— 日 月 ——
  '日': '圆圆的太阳，中间一横是阳光',
  '白': '白天有个太阳——日字加一撇就是白',
  '的': '白加勺，白色的小勺子',
  '拍': '提手旁加白，伸出白白的小手拍一拍',
  '电': '日字中间劈下一道闪电，尾巴弯弯的',
  '明': '日加月，太阳月亮在一起，天就明亮啦',
  '是': '上面一个日，下面像迈开的脚步',
  '里': '日加土，太阳落到土里，就是里面',
  '月': '弯弯的月芽挂天上',
  '朋': '两个月字肩并肩，好朋友肩并肩',
  '有': '一横一撇是手，手里抓着月亮，我有月亮',
  '脸': '月字旁是身体，右边人字头下面有眉毛、眼睛和嘴巴',
  // —— 人 大 ——
  '人': '人有两条腿，左边一条，右边支在中间，才站得住',
  '从': '两个人，一个跟着一个走',
  '坐': '两个人，坐在土堆上',
  '两': '一横一个框，里面两个人',
  '个': '人字下面加一竖，一个人拄着拐杖',
  '会': '人字头下面一朵云，人站在云上，我会飞',
  '你': '单人旁，右边帽子下面一个小，戴帽子的小人儿就是你',
  '们': '单人旁加门，很多人进一个门，就是我们',
  '做': '单人旁，中间一个古，右边敲敲打打，人照着古老的办法做东西',
  '大': '一个人张开双手，大大的',
  '天': '大字头上加一横，人头顶上就是天',
  '头': '两点加大，小脑袋上扎着两个小辫子',
  '因': '大口框里一个大，原因包在里面',
  // —— 十 土 王 ——
  '十': '一横一竖交叉，十字路口',
  '土': '十字下面加一横，地面上堆起一堆土',
  '王': '土字头上加一横，站在土地最高处的是大王',
  '球': '王字旁加求，大王求你陪他玩球',
  '走': '土字下面迈开腿，在土路上走',
  '起': '走加己，自己走，自己起床',
  '地': '土加也，泥土也是大地',
  '在': '一横一撇一竖，像人站在土上，我在这儿',
  '去': '土字下面拐个弯，踩着土路走出去',
  '生': '一撇一横是小苗，从土里长出来',
  '往': '双人旁加主，两个人去往主人家',
  // —— 木 米 ——
  '木': '十字是树干和树枝，一撇一捺是树根',
  '林': '两棵树并排站，就是树林',
  '森': '三棵树叠起来，好多好多树',
  '米': '两粒米，落在木头上',
  '来': '一横加米，端着一盘米走过来',
  '粒': '米字旁加立，一粒一粒的米站起来',
  '条': '上面三笔像弯下来的枝条，下面一个木',
  // —— 又 ——
  '又': '一个横撇加一捺，像伸出来的一只手',
  '皮': '上面三笔是一张皮，下面一个又，又掉了一层皮',
  '友': '一横一撇是手，又是一只手，手拉手就是朋友',
  '鸡': '这又是一只鸟，哈哈——又加鸟就是鸡',
  '变': '上面六笔像一顶怪帽子，下面一个又，又变了一个样',
  '发': '下面一个又，上面头发飘，最后一点是发卡',
  // —— 女 子 ——
  '女': '像一位叉腰站着的妈妈',
  '好': '女加子，妈妈抱着孩子，真好',
  '姥': '女加老，年纪老的女人是姥姥',
  '要': '上面一个西，下面一个女，妈妈要去西边',
  '了': '一个横撇加一个竖钩，写完了',
  '子': '了字加一横，小孩子张开手臂要抱抱',
  '孩': '左边一个子，右边像小孩手舞足蹈',
  '学': '三点加屋顶，下面一个子，孩子在屋里学习',
  // —— 鸟 ——
  '鸟': '小鸟侧着身，一点是眼睛',
  '鸭': '甲加鸟，是个大鸟——甲就是大',
  '鹅': '我加鸟——我才是真正的鸟',
  // —— 水 三点水 ——
  '水': '中间竖钩像小河，两边是溅起的水花',
  '河': '三点水加可，有水才是河',
  '游': '三点水，中间一个方，右边戴帽的孩子，在水里游',
  // —— 手 提手旁 ——
  '手': '像张开的手掌',
  '指': '提手旁，右边一个弯钩一个日，用手指太阳',
  '把': '提手旁加巴，用手握住把手',
  '排': '提手旁加非，非像两排队伍，用手排好队',
  '搬': '提手旁，搬东西要用手',
  // —— 足 足字旁 ——
  '足': '上面一个口，下面是迈开的脚',
  '路': '足字旁加各，各人用脚走各人的路',
  '跑': '足字旁加包，背着包，用脚跑',
  '跳': '足字旁，右边像溅起的水花，两脚一蹬跳起来',
  // —— 言字旁 ——
  '记': '言字旁加己，自己说的话要记住',
  '课': '言字旁加果，上课认真听，才有好结果',
  '许': '言字旁加午，中午说句悄悄话，许个愿',
  '调': '言字旁加周，唱歌一周一周练，调子才准',
  // —— 草字头 ——
  '花': '草字头下面一个化，小草一变化，开出了花',
  '节': '草字头下面挂个钩，过节挂灯笼',
  '蓝': '草字头下面一个大盆，蓝草泡在盆里，染出蓝色',
  // —— 门 ——
  '门': '两扇打开的大门',
  '问': '门里一个口，站在门口张嘴问一问',
  // —— 小 八 几 九 ——
  '小': '中间一个竖钩，两边两个点，小小的',
  '少': '小字下面加一撇，撇掉一点，就少了',
  '八': '一撇一捺分两边',
  '六': '一点一横，下面一个八',
  '公': '八字头下面一个厶，公鸡的公',
  '几': '一撇，加一个横折弯钩，像一张小茶几',
  '九': '和几一样只有两笔：一撇穿过横折弯钩，八的后面就是九',
  // —— 还没进地图的字 ——
  '笑': '竹字头像笑眯的眼睛，下面一个人笑弯了腰',
  '瓜': '像藤上挂着一个大瓜',
  '多': '两个夕阳叠在一起，日子多多',
  '儿': '像小孩迈开两条腿',
  '四': '大口框里藏着两条小腿',
  '牢': '宝盖头下面一头牛，牛关在屋里才牢',
  '鱼': '上面是鱼头，中间田是鱼身，一横是鱼尾',
  '飞': '像小鸟张开一只翅膀飞上天',
  '进': '走着走着就掉进井里了',
  '兔': '像蹲着的小兔子，一点是短尾巴',
  '狗': '反犬旁加句，小狗汪汪叫，像在说一句话',
  '心': '弯弯一钩像小碗，三点是跳动的心',
  '山': '三座山峰立起来，中间最高',
  '成': '斜钩像大旗立起来，事情做成了',
  '黑': '下面四点像火苗，被火熏黑了',
  '习': '像小鸟的一只翅膀，天天练习飞',
  '为': '一点一撇加斜钩，为你做事的为',
};

// 特定字特定笔画的手写提示（优先于自动提示）。key = 字，value = {笔画序号: 提示}
const CHAR_HINTS = {
  '笑': { 0: '竹字头，第一笔是小小的撇，从上往左下' },
  '破': { 0: '石字旁，第一笔是一横' },
  '姥': { 0: '女字旁，第一笔是撇点，先往左下，再往右下' },
  '明': { 0: '左边是日，先写左边' },
  '水': { 0: '先写中间的竖钩' },
  '山': { 0: '先写中间的竖' },
  '小': { 0: '先写中间的竖钩' },
};

const PRAISE = ['真棒！', '太好了！', '好厉害！', '写得真好！', '你做到了！'];

// ---------- 部件（组件优先教学，2026-11-14）----------
// 每字按书写顺序列部件 [名称, 笔画数, key]；key=1 的部件红色高亮（可迁移的积木块）。
// 只收部件笔画连续的字（全包围如"因"、笔顺交叉如"里"不收）。
// 笔画总数运行时与字库数据校验，不符则整字自动放弃部件功能，绝不错标。
const COMPONENTS = {
  '好': [['女',3,1],['子',3]],
  '名': [['夕',3],['口',3,1]],
  '多': [['夕',3,1],['夕',3]],
  '牢': [['宝盖头',3],['牛',4,1]],
  '记': [['言字旁',2,1],['己',3]],
  '课': [['言字旁',2,1],['果',8]],
  '调': [['言字旁',2,1],['周',8]],
  '许': [['言字旁',2,1],['午',4]],
  '球': [['王',4,1],['求',7]],
  '朋': [['月',4,1],['月',4]],
  '有': [['横撇',2],['月',4,1]],
  '明': [['日',4,1],['月',4]],
  '的': [['白',5,1],['勺',3]],
  '笑': [['竹字头',6,1],['夭',4]],
  '姥': [['女',3],['老',6,1]],
  '指': [['提手旁',3,1],['旨',6]],
  '把': [['提手旁',3,1],['巴',4]],
  '排': [['提手旁',3,1],['非',8]],
  '搬': [['提手旁',3,1],['舟',6],['殳',4]],
  '拍': [['提手旁',3],['白',5,1]],
  '你': [['单人旁',2,1],['尔',5]],
  '们': [['单人旁',2],['门',3,1]],
  '做': [['单人旁',2],['古',5,1],['反文旁',4]],
  '吃': [['口',3,1],['乞',3]],
  '哭': [['口',3,1],['口',3,1],['犬',4]],
  '留': [['上半',5],['田',5,1]],
  '变': [['上半',6],['又',2,1]],
  '学': [['学字头',5],['子',3,1]],
  '花': [['草字头',3,1],['化',4]],
  '节': [['草字头',3,1],['下半',2]],
  '蓝': [['草字头',3,1],['下半',10]],
  '破': [['石',5,1],['皮',5]],
  '坐': [['从',4,1],['土',3]],
  '在': [['上半',3],['土',3,1]],
  '地': [['土',3,1],['也',3]],
  '补': [['衣字旁',5,1],['卜',2]],
  '孩': [['子',3,1],['亥',6]],
  '脸': [['月',4,1],['右半',7]],
  '甜': [['舌',6,1],['甘',5]],
  '条': [['折文',3],['木',4,1]],
  '游': [['三点水',3,1],['方',4],['右半',5]],
  '洞': [['三点水',3,1],['同',6]],
  '河': [['三点水',3,1],['可',5]],
  '会': [['人',2,1],['云',4]],
  '动': [['云',4],['力',2,1]],
  '起': [['走',7,1],['己',3]],
  '进': [['井',4],['走之底',3,1]],
  '鸭': [['甲',5],['鸟',5,1]],
  '鸡': [['又',2],['鸟',5,1]],
  '蛋': [['疋',5],['虫',6,1]],
  '路': [['足字旁',7,1],['各',6]],
  '跑': [['足字旁',7,1],['包',5]],
  '跳': [['足字旁',7,1],['兆',6]],
  '轻': [['车',4,1],['右半',5]],
  '狗': [['反犬旁',3,1],['句',5]],
  '要': [['西字头',6],['女',3,1]],
  '往': [['双人旁',3],['主',5,1]],
  '舌': [['千',3],['口',3,1]],
  '白': [['撇',1],['日',4,1]],
  '粒': [['米',6,1],['立',5]],
  '从': [['人',2],['人',2,1]],
  '林': [['木',4],['木',4,1]],
  '森': [['木',4,1],['木',4],['木',4]],
  '鹅': [['我',7],['鸟',5,1]],
  '问': [['门',3,1],['口',3,1]],
  // 组字地图接龙：红色 = 链上前一个字
  '中': [['口',3,1],['竖',1]],
  '虫': [['中',4,1],['下半',2]],
  '石': [['横撇',2],['口',3,1]],
  '同': [['门框',2],['一',1],['口',3,1]],
  '电': [['日',4,1],['竖弯钩',1]],
  '是': [['日',4,1],['下半',5]],
  '两': [['一',1],['门框',2],['从',4,1]],
  '个': [['人',2,1],['竖',1]],
  '大': [['一',1],['人',2,1]],
  '天': [['一',1],['大',3,1]],
  '头': [['两点',2],['大',3,1]],
  '土': [['十',2,1],['一',1]],
  '王': [['一',1],['土',3,1]],
  '走': [['土',3,1],['下半',4]],
  '去': [['土',3,1],['下半',2]],
  '生': [['撇横',2],['土',3,1]],
  '米': [['两点',2],['木',4,1]],
  '来': [['一',1],['米',6,1]],
  '皮': [['上半',3],['又',2,1]],
  '友': [['横撇',2],['又',2,1]],
  '发': [['上半',2],['又',2,1],['点',1]],
  '子': [['了',2,1],['一',1]],
  '足': [['口',3,1],['下半',4]],
  '少': [['小',3,1],['撇',1]],
  '六': [['点横',2],['八',2,1]],
  '公': [['八',2,1],['下半',2]],
};

const TAUGHT = new Set(LESSONS.flatMap(L => L.chars.map(([c]) => c)));

function compParts(char) {
  const def = COMPONENTS[char];
  if (!def) return null;
  let s = 0;
  const parts = def.map(([name, n, key]) => {
    const p = { name, start: s, end: s + n - 1, key: !!key,
                known: name.length === 1 && name !== char && (TAUGHT.has(name) || isMastered(name)) };
    s += n;
    return p;
  });
  return { parts, total: s };
}

// 与字库数据校验后的部件（需要 charDataCache 已加载该字）
function compValidated(char) {
  const cp = compParts(char);
  const d = charDataCache[char];
  if (!cp || !d || !d.strokes) return null;
  if (cp.total !== d.strokes.length) {
    console.warn('部件笔画数与字库不符，放弃部件标注：', char, cp.total, d.strokes.length);
    return null;
  }
  return cp;
}

// 红色高亮的笔画序号（无 key 部件或全字皆 key 时不上色）
function keyStrokeIndices(char) {
  const cp = compValidated(char);
  if (!cp) return null;
  const idx = [];
  cp.parts.forEach(p => { if (p.key) { for (let i = p.start; i <= p.end; i++) idx.push(i); } });
  if (!idx.length || idx.length >= cp.total) return null;
  return idx;
}

function moduleOf(char, strokeIdx) {
  const cp = compValidated(char);
  if (!cp) return null;
  return cp.parts.find(p => strokeIdx >= p.start && strokeIdx <= p.end) || null;
}

// ---------- 状态 ----------

const store = {
  load() {
    try { return JSON.parse(localStorage.getItem('hanziGameV1')) || {}; }
    catch { return {}; }
  },
  save(s) { localStorage.setItem('hanziGameV1', JSON.stringify(s)); },
};
let state = Object.assign({ coins: 0, stars: {}, mastery: {}, muted: false }, store.load());
if (!state.mastery) state.mastery = {};
if (!state.wmastery) state.wmastery = {};  // 词语掌握度
if (!state.wstars) state.wstars = {};      // 词语星星

let mode = null;          // 'strokes' | 'lesson' | 'dictation'
let queue = [];           // [{c, word, rule?, say?}]
let qi = 0;
let writer = null;
let strokesDone = 0;
let wrongOnStroke = 0;
let currentLesson = null;
let sessionCoins = 0;
let dictHints = 0;
let lastSpokenHintAt = 0;
let hintUsedThisItem = false; // 本字是否用过提示（影响"掌握"判定）
let returnTo = null;          // 'picker' = 单字练习后回选择页
let lastPicker = null;        // {title, items, onPick} 便于返回重绘

const MASTERY_NEED = 3;       // 连续干净通过次数 = 掌握
const isMastered = (c) => (state.mastery[c] || 0) >= MASTERY_NEED;

const charDataCache = {};
const charDataPending = {};

// 共享的笔画数据加载（练习页与鸟瞰字片共用缓存）
function fetchCharData(char) {
  if (charDataCache[char]) return Promise.resolve(charDataCache[char]);
  if (!charDataPending[char]) {
    charDataPending[char] = fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2/${char}.json`)
      .then(r => r.json())
      .then(data => { charDataCache[char] = data; return data; })
      .catch(err => { delete charDataPending[char]; throw err; });
  }
  return charDataPending[char];
}

// ---------- 小工具 ----------

const $ = (id) => document.getElementById(id);

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(screenId).classList.add('active');
}

function syncCoins() {
  $('coinCount').textContent = state.coins;
  document.querySelectorAll('.coinCountSub').forEach(el => el.textContent = state.coins);
}

// 声音
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
function tone(freq, dur = 0.09, type = 'sine', gain = 0.12, when = 0) {
  if (state.muted || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(gain, audioCtx.currentTime + when);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + when + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(audioCtx.currentTime + when);
  o.stop(audioCtx.currentTime + when + dur + 0.02);
}
const sfx = {
  good() { tone(880, 0.08); },
  bad() { tone(180, 0.15, 'triangle', 0.1); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'sine', 0.12, i * 0.11)); },
};

let zhVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}
function speak(text) {
  if (state.muted || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  if (zhVoice) u.voice = zhVoice;
  u.rate = 0.85;
  speechSynthesis.speak(u);
}

function floatCoin(text) {
  const el = document.createElement('div');
  el.className = 'float-coin';
  el.textContent = text;
  const box = $('gridBox').getBoundingClientRect();
  el.style.left = (box.left + box.width * (0.25 + Math.random() * 0.5)) + 'px';
  el.style.top = (box.top + box.height * 0.3) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ---------- 笔画分析（自动生成讲解，坐标系：x 向右，y 向上，约 0-1024）----------

function strokeDesc(char, idx) {
  const d = charDataCache[char];
  if (!d || !d.medians || !d.medians[idx]) return null;
  const m = d.medians[idx];
  const [x0, y0] = m[0];
  const [xn, yn] = m[m.length - 1];
  const dx = xn - x0;
  const dyDown = y0 - yn; // 正值 = 向下
  const len = Math.hypot(dx, dyDown);
  let type, dir;
  if (len < 80) { type = '点'; dir = '轻轻往右下一点'; }
  else if (dx > 0 && Math.abs(dyDown) < Math.abs(dx) * 0.45) { type = '横'; dir = '从左写到右'; }
  else if (dyDown > 0 && Math.abs(dx) < Math.abs(dyDown) * 0.45) { type = '竖'; dir = '从上写到下'; }
  else if (dx < 0 && dyDown > 0) { type = '撇'; dir = '从上往左下'; }
  else if (dx > 0 && dyDown > 0) { type = '捺'; dir = '从上往右下'; }
  else if (dx > 0 && dyDown < 0) { type = '提'; dir = '从左下挑到右上'; }
  else { type = '弯弯的笔画'; dir = '跟着字帖慢慢描'; }
  const px = x0 < 340 ? '左边' : x0 > 680 ? '右边' : '中间';
  const py = y0 > 600 ? '上面' : y0 < 250 ? '下面' : '';
  return { type, dir, pos: py || px };
}

// 该用哪条一般规则提醒（先上后下 / 先左后右）
function principleFor(char, idx) {
  const d = charDataCache[char];
  if (!d || !d.medians || idx >= d.medians.length - 1) return '';
  const rest = d.medians.slice(idx);
  const [ex, ey] = rest[0][0];
  let topmost = true, leftmost = true;
  for (let k = 1; k < rest.length; k++) {
    const [sx, sy] = rest[k][0];
    if (sy > ey + 60) topmost = false;
    if (sx < ex - 60) leftmost = false;
  }
  if (topmost) return '先上后下：';
  if (leftmost) return '先左后右：';
  return '';
}

function mistakeHint(item, strokeIdx, sd) {
  const custom = (CHAR_HINTS[item.c] || {})[strokeIdx];
  if (custom) return custom + '。';
  const desc = strokeDesc(item.c, strokeIdx);
  if (sd && sd.isBackwards && desc) return `方向反啦！这一笔是${desc.type}，要${desc.dir}。`;
  // 部件优先：这一段其实是孩子会写的字
  const part = moduleOf(item.c, strokeIdx);
  let msg = '';
  if (part && part.known) msg += `这一块就是${part.name}字，想想${part.name}怎么写。`;
  msg += item.rule ? `记住：${item.rule}。` : principleFor(item.c, strokeIdx);
  if (desc) msg += `下一笔在${desc.pos}，是${desc.type}，${desc.dir}。`;
  return msg || '再试一次，你可以的！';
}

// ---------- 田字格 ----------

function drawGrid() {
  const box = $('gridBox');
  box.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  const lines = [
    [0, 0, 100, 100], [100, 0, 0, 100],
    [50, 0, 50, 100], [0, 50, 100, 50],
  ];
  for (const [x1, y1, x2, y2] of lines) {
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', '#f0b9a8');
    l.setAttribute('stroke-width', '0.6');
    l.setAttribute('stroke-dasharray', '3,2');
    svg.appendChild(l);
  }
  box.appendChild(svg);
}

function renderDots() {
  const wrap = $('progressDots');
  wrap.innerHTML = '';
  queue.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i < qi ? ' done' : i === qi ? ' now' : '');
    wrap.appendChild(d);
  });
}

// ---------- 练习核心 ----------

function starsFor(m) { return m === 0 ? 3 : m <= 2 ? 2 : 1; }

let feedbackTimer = null;
function showFeedback(text, bad = false, ms = 2800) {
  const el = $('feedback');
  el.textContent = text;
  el.classList.toggle('bad', bad);
  clearTimeout(feedbackTimer);
  if (ms) feedbackTimer = setTimeout(() => { el.textContent = '\u00a0'; el.classList.remove('bad'); }, ms);
}

function startItem() {
  const item = queue[qi];
  strokesDone = 0;
  wrongOnStroke = 0;
  dictHints = 0;
  hintUsedThisItem = false;
  renderDots();
  showFeedback('\u00a0', false, 0);

  if (item.wseq && item.wseq.i === 0) wordRun = { w: item.wseq.w, mistakes: 0, hints: false };

  if (mode === 'dictation') {
    $('charInfo').textContent = item.wseq ? `🎧 词语 · 第${item.wseq.i + 1}个字` : '🎧 听一听，写出来！';
  } else if (item.wseq) {
    $('charInfo').textContent = `${item.wseq.w} · 第${item.wseq.i + 1}个字：${item.c}`;
  } else {
    $('charInfo').textContent = item.word ? `${item.c} · ${item.word}` : item.c;
  }
  if (item.rule) {
    $('ruleBanner').textContent = item.rule;
    $('ruleBanner').classList.remove('hidden');
  } else {
    $('ruleBanner').classList.add('hidden');
  }
  $('speakBtn').classList.toggle('hidden', mode !== 'dictation');
  $('replayBtn').classList.toggle('hidden', mode === 'dictation');

  drawGrid();
  const box = $('gridBox');
  const size = box.clientWidth;
  const target = document.createElement('div');
  box.appendChild(target);

  writer = HanziWriter.create(target, item.c, {
    width: size, height: size, padding: Math.round(size * 0.06),
    showCharacter: false,
    showOutline: mode !== 'dictation',
    strokeColor: '#4a3728',
    outlineColor: '#e9d7c3',
    drawingColor: '#c0392b',
    drawingWidth: 20,
    leniency: 1.4,
    strokeAnimationSpeed: 0.9,
    delayBetweenStrokes: 180,
    highlightOnComplete: true,
    highlightColor: '#58b368',
    radicalColor: '#d8432a',   // 关键部件红色（经 radStrokes 注入，见 loader）
    charDataLoader: (char, onComplete) => {
      fetchCharData(char)
        .then(data => {
          // 用我们的关键部件替换字典部首：红色 = 可迁移的积木块
          const ki = keyStrokeIndices(char);
          if (ki) data.radStrokes = ki; else delete data.radStrokes;
          onComplete(data);
        })
        .catch(() => $('loadError').classList.remove('hidden'));
    },
  });

  if (mode === 'dictation') {
    if (item.wseq) speak(item.wseq.i === 0 ? `请写词语：${item.wseq.w}。先写第一个字。` : `接着写${item.wseq.w}的第${item.wseq.i + 1}个字。`);
    else speak(`请写：${item.c}。${item.word}的${item.c}。`);
    beginQuiz(4);
  } else if (item.watch || (!item.rule && WATCH_ONLY.has(item.c))) {
    // 只认不写的字：无论从词语、整课还是单字片进入，都只演示
    watchAndAdvance(item);
  } else {
    let intro = item.say || `${item.c}，${item.word}的${item.c}。`;
    if (item.wseq) {
      intro = item.wseq.i === 0
        ? `我们来写词语：${item.wseq.w}！先写${item.c}。`
        : `${wordNextPrefix}接着写${item.wseq.w}的${item.c}。`;
      wordNextPrefix = '';
    }
    if (!item.rule && MNEMONICS[item.c]) intro += `${MNEMONICS[item.c]}。`;
    // 部件结构：把字介绍成积木
    const cp = compParts(item.c);
    if (cp && cp.parts.length > 1 && cp.parts.length <= 3) {
      intro += `${item.c}是拼起来的：${cp.parts.map(p => p.name).join('，加')}。`;
      const kk = cp.parts.find(p => p.key && p.known);
      if (kk) intro += `红色的${kk.name}你已经学过啦！`;
    }
    speak(intro + '看一看，怎么写。');
    writer.animateCharacter({ onComplete: () => setTimeout(() => beginQuiz(3), 350) });
  }
}

function beginQuiz(hintAfter) {
  showFeedback(mode === 'dictation' ? '想一想，用手指写出来' : '轮到你啦，用手指跟着写！', false, 0);
  writer.quiz({
    showHintAfterMisses: hintAfter,
    onCorrectStroke: () => {
      strokesDone++;
      wrongOnStroke = 0;
      state.coins++;
      sessionCoins++;
      syncCoins();
      sfx.good();
      floatCoin('+1 🪙');
      store.save(state);
      // 部件边界提示：把长笔顺拆成孩子认识的模块
      const part = moduleOf(queue[qi].c, strokesDone);
      if (part && part.start === strokesDone && strokesDone > 0) {
        const msg = part.known ? `现在写${part.name}——${part.name}你会写！`
                               : `现在写${part.name}`;
        showFeedback(msg, false, 2200);
        const now = Date.now();
        if (now - lastSpokenHintAt > 1800) { lastSpokenHintAt = now; speak(msg); }
      }
    },
    onMistake: (sd) => {
      wrongOnStroke++;
      sfx.bad();
      const hint = mistakeHint(queue[qi], strokesDone, sd);
      showFeedback(hint, true);
      const now = Date.now();
      if (now - lastSpokenHintAt > 1800) {  // 连续快速画错时不重复念
        lastSpokenHintAt = now;
        speak(hint);
      }
      if (wrongOnStroke >= 2) {
        try { writer.highlightStroke(strokesDone); } catch {}
      }
    },
    onComplete: (summary) => finishItem(summary.totalMistakes),
  });
}

function finishItem(totalMistakes) {
  const item = queue[qi];
  const earned = starsFor(totalMistakes);
  const isDict = mode === 'dictation';
  const bonus = (totalMistakes === 0 ? 5 : totalMistakes <= 2 ? 3 : 1) * (isDict ? 2 : 1);
  state.coins += bonus;
  sessionCoins += bonus;
  state.stars[item.c] = Math.max(state.stars[item.c] || 0, earned);
  // 掌握度：无错误且未用提示 = 一次"干净通过"（词语中的字同样累计——复习效应）
  if (totalMistakes === 0 && !hintUsedThisItem) {
    state.mastery[item.c] = Math.min((state.mastery[item.c] || 0) + 1, 9);
  }

  // 词语模式：累计整词成绩
  if (item.wseq && wordRun) {
    wordRun.mistakes += totalMistakes;
    wordRun.hints = wordRun.hints || hintUsedThisItem;
    const last = item.wseq.i === item.wseq.n - 1;
    if (!last) {
      // 词语中间的字：不打断，直接写下一个（夸奖并入下一字开场白）
      store.save(state);
      syncCoins();
      sfx.good();
      wordNextPrefix = `${item.c}写好啦！`;
      qi++;
      startItem();
      return;
    }
    // 整词完成：词语级的星星/掌握度 + 整词庆祝
    const w = item.wseq.w;
    const wEarned = starsFor(wordRun.mistakes);
    state.wstars[w] = Math.max(state.wstars[w] || 0, wEarned);
    if (wordRun.mistakes === 0 && !wordRun.hints) {
      state.wmastery[w] = Math.min((state.wmastery[w] || 0) + 1, 9);
    }
    const wBonus = (wordRun.mistakes === 0 ? 8 : wordRun.mistakes <= 2 ? 5 : 2) * (isDict ? 2 : 1);
    state.coins += wBonus;
    sessionCoins += wBonus;
    store.save(state);
    syncCoins();
    sfx.win();
    const praiseW = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    speak(`${praiseW}词语${w}写好啦！${[...w].join('，加')}，就是${w}！`);
    $('celebrateStars').textContent = '⭐'.repeat(wEarned) + '☆'.repeat(3 - wEarned);
    $('celebrateChar').textContent = w;
    $('celebrateWord').textContent = '词语写好啦！';
    $('celebrateMnemonic').textContent = `🧩 ${[...w].join(' ＋ ')} ＝ ${w}`;
    $('celebrateCoins').textContent = `+${wBonus} 🪙 奖励！`;
    $('celebrate').classList.remove('hidden');
    wordRun = null;
    return;
  }

  store.save(state);
  syncCoins();
  sfx.win();

  const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  const mn = MNEMONICS[item.c];
  speak(`${praise}${item.c}，${item.word ? item.word + '的' + item.c : ''}。${mn ? mn + '。' : ''}`);
  $('celebrateStars').textContent = '⭐'.repeat(earned) + '☆'.repeat(3 - earned);
  $('celebrateChar').textContent = item.c;
  $('celebrateWord').textContent = item.word || item.rule || '';
  const cpDone = compParts(item.c);
  const structure = (cpDone && cpDone.parts.length > 1)
    ? `🧩 ${cpDone.parts.map(p => p.name).join(' ＋ ')} ＝ ${item.c}` : '';
  $('celebrateMnemonic').textContent = structure ? `${structure}${mn ? '　' + mn : ''}` : (mn || '');
  $('celebrateCoins').textContent = `+${bonus} 🪙 奖励！`;
  $('celebrate').classList.remove('hidden');
}

// 回到上一个选择页（课文选择页或组字地图）
function restorePicker() {
  if (!lastPicker) return goHome();
  if (lastPicker.render) lastPicker.render();
  else renderPicker(lastPicker.title, lastPicker.items, lastPicker.onPick);
}

function nextItem() {
  $('celebrate').classList.add('hidden');
  qi++;
  if (qi < queue.length) {
    startItem();
  } else if (returnTo === 'picker' && lastPicker) {
    // 单字练习完成：直接回到选择页（可见更新后的掌握度）
    if (writer) { try { writer.cancelQuiz(); } catch {} writer = null; }
    restorePicker();
  } else {
    endSession();
  }
}

function endSession() {
  const stickerEl = $('finishSticker');
  let msg = `全部完成！这次得到 ${sessionCoins} 🪙`;
  stickerEl.textContent = '';
  if (mode === 'lesson' && currentLesson) {
    const allDone = currentLesson.chars.every(([c]) => WATCH_ONLY.has(c) || (state.stars[c] || 0) >= 2);
    if (allDone) {
      stickerEl.textContent = currentLesson.emoji;
      msg = `${currentLesson.title} 全部过关！获得贴纸！`;
      sfx.win();
    }
  }
  $('finishMsg').textContent = msg;
  speak(msg);
  $('finish').classList.remove('hidden');
}

// ---------- 选择页（课文 / 写字秘诀 通用）----------

function masteryLabel(chars) {
  const writable = chars.filter(([c]) => !WATCH_ONLY.has(c));
  let got = 0;
  for (const [c] of writable) if (isMastered(c)) got++;
  return `${got}/${writable.length} 🏅`;
}

// 鸟瞰字片上的迷你字形：黑色笔画 + 红色关键部件（与练习页同一套部件表）
function renderMiniChar(el, char) {
  fetchCharData(char).then(data => {
    const ki = keyStrokeIndices(char);
    const keySet = new Set(ki || []);
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('class', 'chip-svg');
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', 'scale(1, -1) translate(0, -900)');
    data.strokes.forEach((d, i) => {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d);
      p.setAttribute('fill', keySet.has(i) ? '#d8432a' : '#333333');
      g.appendChild(p);
    });
    svg.appendChild(g);
    el.textContent = '';
    el.appendChild(svg);
  }).catch(() => {}); // 加载失败就保留文字
}

// 字片（鸟瞰 + 可点跳转）。三种状态：
// mastered = 已掌握（金色）；needs = 练过但未掌握（高亮，优先练）；fresh = 还没练过（中性）
function makeChip(it, idx, onPickSingle) {
  const [c] = it.chars[idx];
  const n = state.mastery[c] || 0;
  const attempted = n > 0 || (state.stars[c] || 0) > 0;
  const chip = document.createElement('button');
  const watch = WATCH_ONLY.has(c);
  chip.className = 'chip ' + (watch ? 'fresh' : isMastered(c) ? 'mastered' : attempted ? 'needs' : 'fresh');
  const dots = watch ? '👀' : isMastered(c) ? '⭐' : '●'.repeat(Math.min(n, MASTERY_NEED)) + '○'.repeat(Math.max(0, MASTERY_NEED - n));
  chip.innerHTML = `<span class="chip-char">${c}</span><span class="chip-dots">${dots}</span>`;
  renderMiniChar(chip.querySelector('.chip-char'), c);
  chip.addEventListener('click', (e) => { e.stopPropagation(); ensureAudio(); onPickSingle(it, idx); });
  return chip;
}

// 词语片（写词语组）
const isWordMastered = (w) => (state.wmastery[w] || 0) >= MASTERY_NEED;
function wordMasteryLabel(words) {
  let got = 0;
  for (const w of words) if (isWordMastered(w)) got++;
  return `${got}/${words.length} 🏅`;
}
function makeWordChip(w) {
  const n = state.wmastery[w] || 0;
  const attempted = n > 0 || (state.wstars[w] || 0) > 0;
  const chip = document.createElement('button');
  chip.className = 'chip word ' + (isWordMastered(w) ? 'mastered' : attempted ? 'needs' : 'fresh');
  const dots = isWordMastered(w) ? '⭐' : '●'.repeat(Math.min(n, MASTERY_NEED)) + '○'.repeat(Math.max(0, MASTERY_NEED - n));
  chip.innerHTML = `<span class="chip-char">${w}</span><span class="chip-dots">${dots}</span>`;
  chip.addEventListener('click', (e) => { e.stopPropagation(); ensureAudio(); startWord(w); });
  return chip;
}

function renderPicker(title, items, onPick) {
  lastPicker = { title, items, onPick };
  $('pickTitle').textContent = title;
  const wrap = $('lessonList');
  wrap.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'lesson-card' + (it.words ? ' word-card' : '');
    const head = document.createElement('button');
    head.className = 'lesson-btn';
    const label = it.words ? wordMasteryLabel(it.words) : masteryLabel(it.chars);
    head.innerHTML = `<span class="lesson-emoji">${it.emoji}</span><span>${it.title || it.rule}</span><span class="lesson-stars">${label}</span>`;
    head.addEventListener('click', () => { ensureAudio(); returnTo = null; onPick(it); });
    card.appendChild(head);
    const row = document.createElement('div');
    row.className = 'chip-row';
    if (it.words) it.words.forEach(w => row.appendChild(makeWordChip(w)));
    else it.chars.forEach((_, idx) => row.appendChild(makeChip(it, idx, startSingle)));
    card.appendChild(row);
    wrap.appendChild(card);
  });
  syncCoins();
  show('lessonPick');
}

// ---------- 组字地图渲染 ----------

function makeMapChip(c, dim, isAnchor) {
  const n = state.mastery[c] || 0;
  const attempted = n > 0 || (state.stars[c] || 0) > 0;
  const chip = document.createElement('button');
  chip.className = 'chip ' + (isMastered(c) ? 'mastered' : attempted ? 'needs' : 'fresh')
    + (dim ? ' dim' : '') + (isAnchor ? ' anchor' : '');
  const home = !TAUGHT.has(c) && !attempted;
  const dots = isMastered(c) ? '⭐' : home ? '🏠'
    : '●'.repeat(Math.min(n, MASTERY_NEED)) + '○'.repeat(Math.max(0, MASTERY_NEED - n));
  chip.innerHTML = `<span class="chip-char">${c}</span><span class="chip-dots">${dots}</span>`;
  renderMiniChar(chip.querySelector('.chip-char'), c);
  chip.addEventListener('click', (e) => { e.stopPropagation(); ensureAudio(); startMapChar(c); });
  return chip;
}

function mapText(cls, text) {
  const el = document.createElement('span');
  el.className = cls;
  el.textContent = text;
  return el;
}

// 占位：和字片一样宽但看不见，用来把分叉对齐到上一行
function mapGhost(isAnchor) {
  const g = document.createElement('span');
  g.className = 'chip ghost' + (isAnchor ? ' anchor' : '');
  return g;
}

function renderMap() {
  lastPicker = { render: renderMap };
  $('pickTitle').textContent = '组字地图 · 一块一块搭起来';
  const wrap = $('lessonList');
  wrap.innerHTML = '';
  FAMILIES.forEach(f => {
    const card = document.createElement('div');
    card.className = 'lesson-card map-card';
    const all = familyChars(f);
    let got = 0;
    for (const c of all) if (isMastered(c)) got++;
    const head = document.createElement('button');
    head.className = 'lesson-btn';
    head.innerHTML = `<span class="lesson-emoji">🧩</span>`
      + `<span>${f.title || f.anchor + ' 家族'}<span class="map-hint">${f.hint || ''}</span></span>`
      + `<span class="lesson-stars">${got}/${all.length} 🏅</span>`;
    head.addEventListener('click', () => { ensureAudio(); startFamily(f); });
    card.appendChild(head);

    const shown = new Set();   // 这张卡片里已经画成字片的字
    const chains = f.chains || [];

    // 接龙：箭头相连；和上一条开头相同的部分不重画，画成分叉
    chains.forEach((chain, k) => {
      const prev = k > 0 ? chains[k - 1] : [];
      let share = 0;
      while (share < chain.length - 1 && share < prev.length && chain[share] === prev[share]) share++;
      const row = document.createElement('div');
      row.className = 'chip-row chain-row';
      chain.forEach((c, i) => {
        const isAnchor = c === f.anchor;
        if (i > 0) {
          const arrow = mapText('chain-arrow', i === share ? '↳' : '➜');
          if (i < share) arrow.classList.add('ghost');
          row.appendChild(arrow);
        }
        if (i < share) { row.appendChild(mapGhost(isAnchor)); return; }
        const dim = i > 0 && !isMastered(chain[i - 1]);
        row.appendChild(makeMapChip(c, dim, isAnchor));
        shown.add(c);
      });
      card.appendChild(row);
    });

    // 并列：底座（或偏旁）在前，后面的字用顿号并排
    (f.more || []).forEach(m => {
      const row = document.createElement('div');
      row.className = 'chip-row chain-row more-row' + (card.querySelector('.chain-row') ? '' : ' no-line');
      if (m.base && !shown.has(m.base)) {
        row.appendChild(makeMapChip(m.base, false, m.base === f.anchor));
        shown.add(m.base);
        row.appendChild(mapText('chain-arrow', m.via ? '➜' : '＋'));
      } else if (m.base && !m.via) {
        row.appendChild(mapText('more-label', m.base + '＋'));
      }
      if (m.via) row.appendChild(mapText('more-label via', m.via));
      const dim = !!m.base && !isMastered(m.base);
      m.chars.forEach((c, i) => {
        if (i > 0) row.appendChild(mapText('chain-sep', '、'));
        row.appendChild(makeMapChip(c, dim, false));
        shown.add(c);
      });
      card.appendChild(row);
    });
    wrap.appendChild(card);
  });
  syncCoins();
  show('lessonPick');
}

// 点地图上的字：单字练习，练完回地图
function startMapChar(c) {
  mode = 'lesson';
  currentLesson = null;
  returnTo = 'picker';
  queue = [{ c, word: charWordFor(c) }];
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// 点家族标题：先接龙、后并列，按顺序练还没掌握的字（最多 5 个）
function startFamily(f) {
  const ordered = familyChars(f);
  const todo = ordered.filter(c => !isMastered(c));
  const pick = (todo.length ? todo : ordered).slice(0, 5);
  mode = 'lesson';
  currentLesson = null;
  returnTo = 'picker';
  queue = pick.map(c => ({ c, word: charWordFor(c) }));
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// 写生字选择页：课文 + 对应词语组（按教材顺序插入）
function lessonPickerItems() {
  const items = [];
  for (const l of LESSONS) {
    items.push(l);
    WORD_GROUPS.filter(g => g.after === l.id).forEach(g => items.push(g));
  }
  return items;
}

// ---------- 写词语 ----------

let wordRun = null;      // 当前词语的累计 {w, mistakes, hints}
let wordNextPrefix = ''; // 词语中间字的夸奖，并入下一字开场白

function wordItems(w) {
  const cs = [...w];
  return cs.map((c, i) => ({
    c, word: w,
    wseq: { w, i, n: cs.length },
    watch: WATCH_ONLY.has(c),
  }));
}

// 点词语片：练这一个词，练完回选择页
function startWord(w) {
  mode = 'word';
  currentLesson = null;
  returnTo = 'picker';
  queue = wordItems(w);
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// 点组标题：练这组里还没掌握的词（最多 4 个，约 10 分钟）
function startWordGroup(group) {
  const todo = group.words.filter(w => !isWordMastered(w));
  const pick = (todo.length ? todo : group.words).slice(0, 4);
  mode = 'word';
  currentLesson = null;
  returnTo = null;
  queue = pick.flatMap(wordItems);
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// 只认不写的字：演示一遍，自动继续
function watchAndAdvance(item) {
  speak(`${item.c}，${item.wseq ? item.wseq.w + '的' : ''}${item.c}。这个字笔画太多，先认识就好——看一看！`);
  writer.animateCharacter({ onComplete: () => {
    showFeedback(`认识${item.c}就好，不用写！`, false, 2400);
    setTimeout(() => {
      qi++;
      if (qi < queue.length) startItem();
      else if (returnTo === 'picker' && lastPicker) restorePicker();
      else endSession();
    }, 1600);
  } });
}

// 单字练习：点字片直达，练完回选择页
function startSingle(it, idx) {
  const [c, word] = it.chars[idx];
  if (it.rule) {
    mode = 'strokes';
    queue = [{ c, word, rule: it.rule, say: it.say }];
  } else {
    mode = 'lesson';
    queue = [{ c, word }];
  }
  currentLesson = null;
  returnTo = 'picker';
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// ---------- 模式入口 ----------

function startRule(ruleObj) {
  mode = 'strokes';
  returnTo = null;
  currentLesson = null;
  queue = ruleObj.chars.map(([c, word]) => ({ c, word, rule: ruleObj.rule, say: `${ruleObj.say}` }));
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

function startLesson(lesson) {
  mode = 'lesson';
  returnTo = null;
  currentLesson = lesson;
  queue = lesson.chars.map(([c, word]) => ({ c, word }));
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

function startDictation() {
  const pool = [];
  for (const l of LESSONS) for (const [c, word] of l.chars) {
    if (!WATCH_ONLY.has(c) && (state.stars[c] || 0) >= 2) pool.push({ c, word });
  }
  if (pool.length < 3) {
    speak('先去写生字，攒够星星再来挑战吧！');
    alert('先去"写生字"攒星星（每个字 2 颗星以上），再来听写挑战！');
    return;
  }
  mode = 'dictation';
  returnTo = null;
  currentLesson = null;
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  queue = pool.slice(0, 6);
  // 默写词语（产出阶梯：先抄写练熟，再进听写）：
  // 抄写≥2次的词语里随机抽 2 个，整词接在后面（含只认不写字的词不默）
  const wReady = WORD_GROUPS.flatMap(g => g.words).filter(w =>
    !([...w].some(c => WATCH_ONLY.has(c))) && (state.wstars[w] || 0) >= 2);
  for (let i = wReady.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wReady[i], wReady[j]] = [wReady[j], wReady[i]];
  }
  wReady.slice(0, 2).forEach(w => queue.push(...wordItems(w)));
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// ---------- 主页 ----------

function renderShelf() {
  const wrap = $('stickerShelf');
  wrap.innerHTML = '';
  for (const l of LESSONS) {
    const done = l.chars.every(([c]) => WATCH_ONLY.has(c) || (state.stars[c] || 0) >= 2);
    const s = document.createElement('span');
    s.textContent = l.emoji;
    if (!done) s.className = 'sticker-locked';
    s.title = l.title;
    wrap.appendChild(s);
  }
}

function goHome() {
  if (writer) { try { writer.cancelQuiz(); } catch {} writer = null; }
  speechSynthesis && speechSynthesis.cancel();
  returnTo = null;
  $('celebrate').classList.add('hidden');
  $('finish').classList.add('hidden');
  renderShelf();
  syncCoins();
  show('home');
}

// 练习页返回：单字练习回选择页，整课练习回主页
function backFromPractice() {
  if (returnTo === 'picker' && lastPicker) {
    if (writer) { try { writer.cancelQuiz(); } catch {} writer = null; }
    speechSynthesis && speechSynthesis.cancel();
    restorePicker();
  } else {
    goHome();
  }
}

// ---------- 事件绑定 ----------

document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    ensureAudio();
    const m = card.dataset.mode;
    if (m === 'strokes') renderPicker('选一个写字秘诀', RULES, startRule);
    else if (m === 'lesson') renderPicker('选一课来写', lessonPickerItems(), (it) => it.words ? startWordGroup(it) : startLesson(it));
    else if (m === 'map') renderMap();
    else startDictation();
  });
});

document.querySelector('#lessonPick .back-btn').addEventListener('click', goHome);
document.querySelector('#practice .back-btn').addEventListener('click', backFromPractice);
$('nextBtn').addEventListener('click', () => { ensureAudio(); nextItem(); });
$('finishBtn').addEventListener('click', goHome);

$('replayBtn').addEventListener('click', () => {
  if (!writer) return;
  ensureAudio();
  try { writer.cancelQuiz(); } catch {}
  const item = queue[qi];
  if (item.say) speak(item.say);
  showFeedback('看一看，怎么写', false, 0);
  writer.animateCharacter({ onComplete: () => setTimeout(() => beginQuiz(3), 350) });
});

$('hintBtn').addEventListener('click', () => {
  if (!writer) return;
  ensureAudio();
  hintUsedThisItem = true;
  const item = queue[qi];
  if (mode === 'dictation') {
    // 提示阶梯：1) 口诀 2) 显示轮廓 3) 闪现下一笔
    dictHints++;
    if (dictHints === 1) {
      speak(MNEMONICS[item.c] ? `想一想：${MNEMONICS[item.c]}。` : `${item.word}的${item.c}。`);
    } else if (dictHints === 2) {
      try { writer.showOutline(); } catch {}
      speak('给你看轮廓啦，照着写！');
    } else {
      try { writer.highlightStroke(strokesDone); } catch {}
    }
  } else {
    const hint = mistakeHint(item, strokesDone, null);
    speak(hint);
    showFeedback(hint, false);
    try { writer.highlightStroke(strokesDone); } catch {}
  }
});

$('speakBtn').addEventListener('click', () => {
  ensureAudio();
  const item = queue[qi];
  if (item.wseq) speak(`请写词语：${item.wseq.w}。现在写第${item.wseq.i + 1}个字。`);
  else speak(`请写：${item.c}。${item.word}的${item.c}。`);
});

$('muteBtn').addEventListener('click', () => {
  state.muted = !state.muted;
  $('muteBtn').textContent = state.muted ? '🔇' : '🔊';
  store.save(state);
  if (state.muted) speechSynthesis && speechSynthesis.cancel();
});

// 家长功能：连点三下标题清空进度
let titleTaps = [];
document.querySelector('.title').addEventListener('click', () => {
  const now = Date.now();
  titleTaps = titleTaps.filter(t => now - t < 1200);
  titleTaps.push(now);
  if (titleTaps.length >= 3) {
    titleTaps = [];
    if (confirm('清空所有金币和星星，重新开始？')) {
      state = { coins: 0, stars: {}, mastery: {}, wmastery: {}, wstars: {}, muted: state.muted };
      store.save(state);
      syncCoins();
      renderShelf();
    }
  }
});

// ---------- 启动 ----------

$('muteBtn').textContent = state.muted ? '🔇' : '🔊';
syncCoins();
renderShelf();
show('home');
