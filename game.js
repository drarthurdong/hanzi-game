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

// 字形记忆口诀（听写提示 + 演示时讲解）。逐步补充。
const MNEMONICS = {
  '明': '日加月，太阳和月亮在一起，天就亮啦',
  '好': '女加子，妈妈抱着宝宝，真好',
  '坐': '两个人，坐在土堆上',
  '哭': '两个口像眼睛，一点像眼泪，哇哇哭',
  '吃': '口字旁，吃东西要用嘴巴',
  '甜': '舌字旁，舌头尝到甜甜的味道',
  '笑': '竹字头像弯弯的眼睛，下面像笑弯了腰',
  '花': '草字头，花是植物',
  '节': '草字头，节日的节',
  '蓝': '草字头，蓝天下面的草地',
  '孩': '子字旁，小孩子的孩',
  '脸': '月字旁，月字旁常常和身体有关',
  '地': '土字旁，大地是泥土做的',
  '在': '土字旁，站在土地上',
  '指': '提手旁，手指是手的一部分',
  '电': '像天上弯弯的闪电',
  '瓜': '像藤上挂着一个大瓜',
  '手': '像张开的手掌',
  '你': '单人旁，你是一个人',
  '破': '石字旁，石头把东西打破了',
  '姥': '女字旁，姥姥是女的',
  '有': '下面藏着一个月字',
  '名': '夕加口——天黑了看不清，要用嘴巴叫名字',
  '朋': '两个月字肩并肩，好朋友肩并肩',
  '学': '上面像小屋顶，下面是子，孩子在屋里学习',
  '生': '小苗从土里长出来',
  '多': '两个夕阳叠在一起，日子多多',
  '中': '一个口，一竖穿过正中间',
  '大': '一个人张开手脚，大大的',
  '日': '圆圆的太阳，中间一横是阳光',
  '是': '上面一个日，下面像迈开的脚步',
  '的': '白加勺，白色的小勺子',
  '同': '大门框里一横一个口',
  '口': '像张开的嘴巴',
  '儿': '像小孩迈开两条腿',
  '四': '大口框里藏着两条小腿',
  '记': '言字旁，用话把事情记下来',
  '牢': '宝盖头下面一头牛，牛关在屋里才牢',
  '鱼': '上面是鱼头，中间田是鱼身，一横是鱼尾',
  '水': '中间竖钩像小河，两边是溅起的水花',
  '里': '日加土，太阳落到土里，就是里面',
  '游': '三点水，在水里游来游去',
  '飞': '像小鸟张开一只翅膀飞上天',
  '鸟': '小鸟侧着身，一点是眼睛',
  '虫': '口下一条身体，一点是小尾巴',
  '洞': '三点水加同，水冲出来的洞',
  '进': '井加走之底，走着走着就进去了',
  '鸭': '甲加鸟，鸭子也是鸟',
  '河': '三点水加可，有水才是河',
  '路': '足字旁，路是用脚走出来的',
  '兔': '像蹲着的小兔子，一点是短尾巴',
  '狗': '反犬旁，小狗是动物',
  '跑': '足字旁，跑步要用脚',
  '们': '单人旁加门，很多人进一个门，就是我们',
  '头': '两点加大，小脑袋上扎着两个小辫子',
  '石': '一横一撇加个口，山崖下有块石头',
  '舌': '千加口，嘴巴里伸出的舌头',
  '心': '弯弯一钩像小碗，三点是跳动的心',
  '山': '三座山峰立起来，中间最高',
  '天': '大字头上加一横，人头顶上就是天',
  '往': '双人旁加主，去往别人家',
  '排': '提手旁加非，用手排好队',
  '成': '斜钩像大旗立起来，事情做成了',
  '人': '一撇一捺，两条腿站稳的人',
  '白': '白天有个太阳——日字加一撇就是白',
  '鸡': '这又是一只鸟，哈哈——又加鸟就是鸡',
  '黑': '下面四点像火苗，被火熏黑了',
  '蛋': '蛋壳里有个小虫子，一个小生命要出来啦',
  '公': '八字头下面一个厶，公鸡的公',
  '做': '单人旁，人在做事情',
  '习': '像小鸟的一只翅膀，天天练习飞',
  '十': '一横一竖交叉，十字路口',
  '米': '像一粒米向四面八方溅开',
  '因': '大口框里一个大，原因包在里面',
  '为': '一点一撇加斜钩，为你做事的为',
  '粒': '米字旁加立，一粒一粒的米站起来',
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
  '坐': [['人',2],['人',2],['土',3,1]],
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
};

const TAUGHT = new Set(LESSONS.flatMap(L => L.chars.map(([c]) => c)));

function compParts(char) {
  const def = COMPONENTS[char];
  if (!def) return null;
  let s = 0;
  const parts = def.map(([name, n, key]) => {
    const p = { name, start: s, end: s + n - 1, key: !!key,
                known: name.length === 1 && TAUGHT.has(name) && name !== char };
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

  if (mode === 'dictation') {
    $('charInfo').textContent = '🎧 听一听，写出来！';
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
      fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2/${char}.json`)
        .then(r => r.json())
        .then(data => {
          charDataCache[char] = data;
          // 用我们的关键部件替换字典部首：红色 = 可迁移的积木块
          const ki = keyStrokeIndices(char);
          if (ki) data.radStrokes = ki; else delete data.radStrokes;
          onComplete(data);
        })
        .catch(() => $('loadError').classList.remove('hidden'));
    },
  });

  if (mode === 'dictation') {
    speak(`请写：${item.c}。${item.word}的${item.c}。`);
    beginQuiz(4);
  } else {
    let intro = item.say || `${item.c}，${item.word}的${item.c}。`;
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
  // 掌握度：无错误且未用提示 = 一次"干净通过"
  if (totalMistakes === 0 && !hintUsedThisItem) {
    state.mastery[item.c] = Math.min((state.mastery[item.c] || 0) + 1, 9);
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

function nextItem() {
  $('celebrate').classList.add('hidden');
  qi++;
  if (qi < queue.length) {
    startItem();
  } else if (returnTo === 'picker' && lastPicker) {
    // 单字练习完成：直接回到选择页（可见更新后的掌握度）
    if (writer) { try { writer.cancelQuiz(); } catch {} writer = null; }
    renderPicker(lastPicker.title, lastPicker.items, lastPicker.onPick);
  } else {
    endSession();
  }
}

function endSession() {
  const stickerEl = $('finishSticker');
  let msg = `全部完成！这次得到 ${sessionCoins} 🪙`;
  stickerEl.textContent = '';
  if (mode === 'lesson' && currentLesson) {
    const allDone = currentLesson.chars.every(([c]) => (state.stars[c] || 0) >= 2);
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
  let got = 0;
  for (const [c] of chars) if (isMastered(c)) got++;
  return `${got}/${chars.length} 🏅`;
}

// 字片（鸟瞰 + 可点跳转）。三种状态：
// mastered = 已掌握（金色）；needs = 练过但未掌握（高亮，优先练）；fresh = 还没练过（中性）
function makeChip(it, idx, onPickSingle) {
  const [c] = it.chars[idx];
  const n = state.mastery[c] || 0;
  const attempted = n > 0 || (state.stars[c] || 0) > 0;
  const chip = document.createElement('button');
  chip.className = 'chip ' + (isMastered(c) ? 'mastered' : attempted ? 'needs' : 'fresh');
  const dots = isMastered(c) ? '⭐' : '●'.repeat(Math.min(n, MASTERY_NEED)) + '○'.repeat(Math.max(0, MASTERY_NEED - n));
  chip.innerHTML = `<span class="chip-char">${c}</span><span class="chip-dots">${dots}</span>`;
  chip.addEventListener('click', (e) => { e.stopPropagation(); ensureAudio(); onPickSingle(it, idx); });
  return chip;
}

function renderPicker(title, items, onPick) {
  lastPicker = { title, items, onPick };
  $('pickTitle').textContent = title;
  const wrap = $('lessonList');
  wrap.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    const head = document.createElement('button');
    head.className = 'lesson-btn';
    head.innerHTML = `<span class="lesson-emoji">${it.emoji}</span><span>${it.title || it.rule}</span><span class="lesson-stars">${masteryLabel(it.chars)}</span>`;
    head.addEventListener('click', () => { ensureAudio(); returnTo = null; onPick(it); });
    card.appendChild(head);
    const row = document.createElement('div');
    row.className = 'chip-row';
    it.chars.forEach((_, idx) => row.appendChild(makeChip(it, idx, startSingle)));
    card.appendChild(row);
    wrap.appendChild(card);
  });
  syncCoins();
  show('lessonPick');
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
    if ((state.stars[c] || 0) >= 2) pool.push({ c, word });
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
  queue = pool.slice(0, 8);
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// ---------- 主页 ----------

function renderShelf() {
  const wrap = $('stickerShelf');
  wrap.innerHTML = '';
  for (const l of LESSONS) {
    const done = l.chars.every(([c]) => (state.stars[c] || 0) >= 2);
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
    renderPicker(lastPicker.title, lastPicker.items, lastPicker.onPick);
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
    else if (m === 'lesson') renderPicker('选一课来写', LESSONS, startLesson);
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
  speak(`请写：${item.c}。${item.word}的${item.c}。`);
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
      state = { coins: 0, stars: {}, mastery: {}, muted: state.muted };
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
