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

// 写生字：与课文同步。新一课加一行即可。
const LESSONS = [
  { id: 6,  title: '第6课',        emoji: '😊', chars: [['皮','皮球'],['真','真好'],['好','你好'],['笑','笑脸'],['走','走路'],['来','过来'],['姥','姥姥']] },
  { id: 7,  title: '第7课 手指歌', emoji: '🖐️', chars: [['手','小手'],['指','手指'],['电','电话'],['两','两个'],['个','三个'],['有','我有']] },
  { id: 8,  title: '第8课 大西瓜', emoji: '🍉', chars: [['瓜','西瓜'],['又','又大又圆'],['你','你好'],['吃','吃饭'],['留','留下'],['变','变成']] },
  { id: 9,  title: '第9课',        emoji: '🌸', chars: [['花','花朵'],['破','破了'],['坐','坐下'],['在','在家'],['地','地上'],['哭','哭了'],['补','补衣服']] },
  { id: 10, title: '第10课 中秋节', emoji: '🥮', chars: [['节','中秋节'],['蓝','蓝色'],['明','明天'],['孩','孩子'],['脸','笑脸'],['甜','甜甜的']] },
  { id: 'w1', title: '新词 ①', emoji: '📖', chars: [['中','中文'],['文','中文'],['名','一名'],['学','学生'],['生','学生'],['日','节日'],['朋','朋友'],['友','朋友']] },
  { id: 'w2', title: '新词 ②', emoji: '📒', chars: [['多','多少'],['少','多少'],['下','留下'],['大','大地'],['球','皮球']] },
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
  let msg = item.rule ? `记住：${item.rule}。` : principleFor(item.c, strokeIdx);
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
    charDataLoader: (char, onComplete) => {
      fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2/${char}.json`)
        .then(r => r.json())
        .then(data => { charDataCache[char] = data; onComplete(data); })
        .catch(() => $('loadError').classList.remove('hidden'));
    },
  });

  if (mode === 'dictation') {
    speak(`请写：${item.c}。${item.word}的${item.c}。`);
    beginQuiz(4);
  } else {
    let intro = item.say || `${item.c}，${item.word}的${item.c}。`;
    if (!item.rule && MNEMONICS[item.c]) intro += `${MNEMONICS[item.c]}。`;
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
  $('celebrateMnemonic').textContent = mn || '';
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
