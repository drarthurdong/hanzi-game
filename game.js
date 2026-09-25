/* 汉字乐园 — 笔顺练习游戏
 * 引擎：Hanzi Writer (MIT)。字表与《中国语文》一册课文同步维护。
 */

// ---------- 数据 ----------

// 学笔画：用最能体现笔顺规则的简单字
const STROKE_BASICS = [
  { c: '一', rule: '横：从左到右', say: '一。横，要从左写到右。' },
  { c: '十', rule: '先横后竖', say: '十。先写横，再写竖。' },
  { c: '三', rule: '从上到下', say: '三。从上写到下。' },
  { c: '人', rule: '先撇后捺', say: '人。先写撇，再写捺。' },
  { c: '八', rule: '先撇后捺', say: '八。先撇，后捺。' },
  { c: '口', rule: '先外后内', say: '口。先写外面，再封口。' },
  { c: '日', rule: '先外后内再封口', say: '日。先外面，再里面，最后封口。' },
  { c: '小', rule: '先中间后两边', say: '小。先写中间，再写两边。' },
];

// 写生字：与课文同步。新一课加一行即可。
const LESSONS = [
  { id: 6,  title: '第6课',        emoji: '😊', chars: [['皮','皮球'],['真','真好'],['好','你好'],['笑','笑脸'],['走','走路'],['来','过来'],['姥','姥姥']] },
  { id: 7,  title: '第7课 手指歌', emoji: '🖐️', chars: [['手','小手'],['指','手指'],['电','电话'],['两','两个'],['个','三个'],['有','我有']] },
  { id: 8,  title: '第8课 大西瓜', emoji: '🍉', chars: [['瓜','西瓜'],['又','又大又圆'],['你','你好'],['吃','吃饭'],['留','留下'],['变','变成']] },
  { id: 9,  title: '第9课',        emoji: '🌸', chars: [['花','花朵'],['破','破了'],['坐','坐下'],['在','在家'],['地','地上'],['哭','哭了'],['补','补衣服']] },
  { id: 10, title: '第10课 中秋节', emoji: '🥮', chars: [['节','中秋节'],['蓝','蓝色'],['明','明天'],['孩','孩子'],['脸','笑脸'],['甜','甜甜的']] },
];

const PRAISE = ['真棒！', '太好了！', '好厉害！', '写得真好！', '你做到了！'];

// ---------- 状态 ----------

const store = {
  load() {
    try { return JSON.parse(localStorage.getItem('hanziGameV1')) || {}; }
    catch { return {}; }
  },
  save(s) { localStorage.setItem('hanziGameV1', JSON.stringify(s)); },
};
let state = Object.assign({ coins: 0, stars: {}, muted: false }, store.load());

let mode = null;          // 'strokes' | 'lesson' | 'dictation'
let queue = [];           // [{c, word, rule?, say?}]
let qi = 0;               // 当前位置
let writer = null;
let strokesDone = 0;
let mistakes = 0;
let currentLesson = null;
let sessionCoins = 0;

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

// 声音：简单音效 + 中文语音
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
  coin() { tone(988, 0.07); tone(1319, 0.12, 'sine', 0.12, 0.07); },
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
    [0, 0, 100, 100], [100, 0, 0, 100],   // 斜线
    [50, 0, 50, 100], [0, 50, 100, 50],   // 十字
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

// ---------- 进度点 ----------

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

function startItem() {
  const item = queue[qi];
  strokesDone = 0;
  mistakes = 0;
  renderDots();
  $('feedback').textContent = '\u00a0';
  $('feedback').classList.remove('bad');

  // 顶部信息
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
        .then(r => r.json()).then(onComplete)
        .catch(() => $('loadError').classList.remove('hidden'));
    },
  });

  if (mode === 'dictation') {
    speak(`请写：${item.c}。${item.word}的${item.c}。`);
    beginQuiz(3);
  } else {
    if (item.say) speak(item.say); else speak(`${item.c}，${item.word}的${item.c}。看一看，怎么写。`);
    writer.animateCharacter({ onComplete: () => setTimeout(() => beginQuiz(2), 350) });
  }
}

function beginQuiz(hintAfter) {
  $('feedback').textContent = mode === 'dictation' ? '想一想，用手指写出来' : '轮到你啦，用手指跟着写！';
  $('feedback').classList.remove('bad');
  writer.quiz({
    showHintAfterMisses: hintAfter,
    onCorrectStroke: () => {
      strokesDone++;
      state.coins++;
      sessionCoins++;
      syncCoins();
      sfx.good();
      floatCoin('+1 🪙');
      store.save(state);
    },
    onMistake: () => {
      mistakes++;
      sfx.bad();
      $('feedback').textContent = '再试一次，你可以的！';
      $('feedback').classList.add('bad');
      setTimeout(() => { $('feedback').textContent = '\u00a0'; $('feedback').classList.remove('bad'); }, 1200);
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
  if (mode !== 'strokes') {
    state.stars[item.c] = Math.max(state.stars[item.c] || 0, earned);
  }
  store.save(state);
  syncCoins();
  sfx.win();

  const praise = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  speak(`${praise}${item.c}，${item.word ? item.word + '的' + item.c : ''}`);
  $('celebrateStars').textContent = '⭐'.repeat(earned) + '☆'.repeat(3 - earned);
  $('celebrateChar').textContent = item.c;
  $('celebrateWord').textContent = item.word || item.rule || '';
  $('celebrateCoins').textContent = `+${bonus} 🪙 奖励！`;
  $('celebrate').classList.remove('hidden');
}

function nextItem() {
  $('celebrate').classList.add('hidden');
  qi++;
  if (qi < queue.length) {
    startItem();
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

// ---------- 模式入口 ----------

function startStrokes() {
  mode = 'strokes';
  queue = STROKE_BASICS.map(s => ({ c: s.c, rule: s.rule, say: s.say, word: '' }));
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

function startLesson(lesson) {
  mode = 'lesson';
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
  // 洗牌，最多 8 个
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  queue = pool.slice(0, 8);
  qi = 0; sessionCoins = 0;
  show('practice');
  startItem();
}

// ---------- 主页渲染 ----------

function lessonStars(lesson) {
  let got = 0;
  for (const [c] of lesson.chars) if ((state.stars[c] || 0) >= 2) got++;
  return `${got}/${lesson.chars.length} ⭐`;
}

function renderLessonList() {
  const wrap = $('lessonList');
  wrap.innerHTML = '';
  for (const l of LESSONS) {
    const b = document.createElement('button');
    b.className = 'lesson-btn';
    b.innerHTML = `<span class="lesson-emoji">${l.emoji}</span><span>${l.title}</span><span class="lesson-stars">${lessonStars(l)}</span>`;
    b.addEventListener('click', () => { ensureAudio(); startLesson(l); });
    wrap.appendChild(b);
  }
}

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
  $('celebrate').classList.add('hidden');
  $('finish').classList.add('hidden');
  renderShelf();
  syncCoins();
  show('home');
}

// ---------- 事件绑定 ----------

document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    ensureAudio();
    const m = card.dataset.mode;
    if (m === 'strokes') startStrokes();
    else if (m === 'lesson') { renderLessonList(); syncCoins(); show('lessonPick'); }
    else startDictation();
  });
});

document.querySelectorAll('.back-btn').forEach(b => b.addEventListener('click', goHome));
$('nextBtn').addEventListener('click', () => { ensureAudio(); nextItem(); });
$('finishBtn').addEventListener('click', goHome);

$('replayBtn').addEventListener('click', () => {
  if (!writer) return;
  ensureAudio();
  try { writer.cancelQuiz(); } catch {}
  const item = queue[qi];
  if (item.say) speak(item.say);
  $('feedback').textContent = '看一看，怎么写';
  writer.animateCharacter({ onComplete: () => setTimeout(() => beginQuiz(2), 350) });
});

$('hintBtn').addEventListener('click', () => {
  if (!writer) return;
  ensureAudio();
  speak('看，这一笔这样写。');
  try { writer.highlightStroke(strokesDone); } catch {}
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
      state = { coins: 0, stars: {}, muted: state.muted };
      store.save(state);
      syncCoins();
      renderShelf();
    }
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

// ---------- 启动 ----------

$('muteBtn').textContent = state.muted ? '🔇' : '🔊';
syncCoins();
renderShelf();
show('home');
