/* A. 설정값 */

const SUPABASE_URL = 'https://qyofyiebadjraeaanqli.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SGzts52JUOhYlqRu4W5kXw_MrR3lP3o';

const isConfigured = !SUPABASE_URL.includes('여기에') && !SUPABASE_KEY.includes('여기에');

// 임시 정보 (랜덤생성)
const myId    = Math.random().toString(36).slice(2);
const myName  = randomNickname();
const myColor = randomColor();

const scene      = document.getElementById('scene');
const bottle     = document.getElementById('bottle');
const liquid     = document.getElementById('liquid');
const label      = document.getElementById('label');
const hint       = document.getElementById('hint');
const counterBox = document.getElementById('counter');
const controls   = document.getElementById('controls');
const quickBox   = document.getElementById('quick');
const roomsBox   = document.getElementById('rooms');
const muteBtn    = document.getElementById('mute');
const statusBox  = document.getElementById('status');
const statusText = document.getElementById('statusText');
const userListBtn = document.getElementById('userListBtn');
const userPanel   = document.getElementById('userPanel');
const userList    = document.getElementById('userList');

// 접속자 패널 토글
userListBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  userPanel.classList.toggle('open');
});
document.addEventListener('click', function (e) {
  if (!userPanel.contains(e.target) && e.target !== userListBtn) {
    userPanel.classList.remove('open');
  }
});

const DEFAULT_HINT = '두유병을 꾹 눌러 마셔보세요 · 배경을 탭하면 한마디 남길 수 있어요';


/* B. 두유 */

let level = 100;
let timer = null;
let gulpTick = 0;
let cupsToday = loadCups();
updateCounter();

bottle.addEventListener('pointerdown', function () {
  if (level <= 0) { refill(); return; }
  sendSip();
  timer = setInterval(drink, 80);
});
window.addEventListener('pointerup', function () {
  clearInterval(timer);
  timer = null;
});

function drink() {
  level = level - 4;
  gulpTick++;
  if (gulpTick % 5 === 0) playGulp();   // 약 0.4초마다 "꿀꺽" 소리
  if (level <= 0) {
    level = 0;
    clearInterval(timer);
    emptyBottle();
  }
  liquid.style.height = level + '%';
}

function refill() {
  level = 100;
  liquid.style.height = '100%';
  setHint(DEFAULT_HINT);
}

function emptyBottle() {
  cupsToday++;
  saveCups(cupsToday);
  updateCounter();
  setHint('클릭해서 새 두유를 리필 🥛');
  showReaction('캬~');
}

function updateCounter() { counterBox.textContent = '오늘 ' + cupsToday + '잔'; }

// 오늘 마신 잔 수를 브라우저에 저장 (배포 사이트에서 날짜별로 기억 가능)
function todayKey() {
  const d = new Date();
  return 'duyu-cups-' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function loadCups() { try { return parseInt(localStorage.getItem(todayKey()) || '0', 10) || 0; } catch (e) { return 0; } }
function saveCups(n) { try { localStorage.setItem(todayKey(), String(n)); } catch (e) {} }

// --- 소리 ---
let muted = false;
let audioCtx = null;

// ★ 추가됨: 오디오 엔진을 한 번만 만들어 같이 쓰는 도우미 (음악 코드가 이걸 사용)
function getCtx() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

muteBtn.addEventListener('click', function () {
  muted = !muted;
  muteBtn.textContent = muted ? '🔇' : '🔊';
});

function playGulp() {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);  // 음이 뚝 떨어짐 = 꿀꺽 느낌
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + 0.2);
  } catch (e) {}
}
// ★ 위의 '}' 가 playGulp 함수를 닫습니다. (원래 이게 빠져 있어서 음악 코드가 안에 갇혀 있었어요)


/* bgm */
const musicBtn = document.getElementById('music');
let musicOn = false;
let music = null;   // 재생 중인 음악 부품들을 담아둠 (끌 때 필요)

const CHORDS = [
  [130.81, 164.81, 196.00],  // 도미솔 (C)
  [146.83, 174.61, 220.00],  // 레파라 (Dm)
  [174.61, 220.00, 261.63],  // 파라도 (F)
  [196.00, 246.94, 293.66]   // 솔시레 (G)
];

// 음원
const bgm = document.getElementById('bgm');
bgm.volume = 0.4;
let bgmAvailable = true;
bgm.addEventListener('error', function () {
  bgmAvailable = false;
});

let usingSynth = false;

// 🎵 버튼: 누를 때마다 켜기/끄기 (musicOn 을 true/false 로 뒤집음)
musicBtn.addEventListener('click', function () {
  musicOn = !musicOn;
  if (musicOn) {
    musicBtn.classList.add('on');   // 버튼 밝게 (켜짐 표시)
    playMusic();                    // 음악 시작
  } else {
    musicBtn.classList.remove('on');
    pauseMusic();                   // 음악 정지
  }
});

function playMusic() {
  if (bgmAvailable) {
    const p = bgm.play();
    if (p && p.catch) {
      p.then(function () { usingSynth = false; })
       .catch(function () { usingSynth = true; startMusic(); });
    }
  } else {
    usingSynth = true;
    startMusic();
  }
}

function pauseMusic() {
  bgm.pause();
  if (usingSynth) stopMusic();
}

function startMusic() {
  const ctx = getCtx();

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.connect(master);
  master.connect(ctx.destination);

  const oscs = CHORDS[0].map(function (f) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    o.connect(g); g.connect(filter);
    o.start();
    return o;
  });

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain); lfoGain.connect(master.gain);
  lfo.start();

  master.gain.setTargetAtTime(0.14, ctx.currentTime, 1.5);

  let ci = 0;
  const chordTimer = setInterval(function () {
    ci = (ci + 1) % CHORDS.length;
    const c = CHORDS[ci];
    oscs.forEach(function (o, i) {
      o.frequency.setTargetAtTime(c[i], getCtx().currentTime, 2.5);
    });
  }, 9000);

  music = { master, oscs, lfo, chordTimer };
}

function stopMusic() {
  if (!music) return;
  const ctx = getCtx();
  clearInterval(music.chordTimer);
  music.master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);  // 페이드 아웃
  const parts = music;
  setTimeout(function () {
    parts.oscs.forEach(function (o) { try { o.stop(); } catch (e) {} });
    try { parts.lfo.stop(); } catch (e) {}
  }, 700);
  music = null;
}


/* C. 맛 바꾸기 */

controls.addEventListener('click', function (e) {
  const btn = e.target.closest('.flavor');
  if (!btn) return;
  document.documentElement.style.setProperty('--liquid', btn.dataset.color);
  label.textContent = btn.dataset.name;
  document.querySelector('.flavor.active').classList.remove('active');
  btn.classList.add('active');
});


/* D. Supabase 연결 */

let supabaseClient = null;
let channel = null;     // 현재 방 채널 (없으면 오프라인)

if (isConfigured) {
  const { createClient } = window.supabase;
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  joinRoom('free');     // 초기 방은 'free'로
} else {
  setStatus(false, '오프라인 (나 혼자)');
}

// 방 입장~~~~
function joinRoom(room) {
  if (channel) { supabaseClient.removeChannel(channel); channel = null; }
  clearMessages();
  setStatus(false, '연결 중…');

  // presence(접속자) 기능을 쓰려면 key 를 지정해두기
  channel = supabaseClient.channel('cyber-soymilk:' + room, {
    config: { presence: { key: myId } }
  });

  // 1) 다른 사람의 한마디 받기
  channel.on('broadcast', { event: 'chat' }, function (p) {
    const d = p.payload;
    showMessageRandom(d.text, d.name, d.color);
  });

  // 이모지 리액션 받기
  channel.on('broadcast', { event: 'react' }, function (p) {
    const d = p.payload;
    spawnEmojiPop(d.emoji, d.x, d.y);
  });

  // 2) 다른 사람의 한 모금 받기 → 내 병 살짝 흔들기
  channel.on('broadcast', { event: 'sip' }, function () {
    wobbleBottle();
  });

  // 3) 접속자 수 변화 감지
  channel.on('presence', { event: 'sync' }, function () {
    const state = channel.presenceState();
    const count = Object.keys(state).length;
    setStatus(true, count + '명이 함께 🥛');
    updateUserList(state);
  });

  // 4) 접속 시작
  channel.subscribe(function (status) {
    if (status === 'SUBSCRIBED') {
      channel.track({ name: myName, color: myColor });   // 나 여기 있다고 등록
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
      setStatus(false, '연결 끊김');
    }
  });
}

// 방 선택 버튼
roomsBox.addEventListener('click', function (e) {
  const btn = e.target.closest('.room');
  if (!btn) return;
  document.querySelector('.room.active').classList.remove('active');
  btn.classList.add('active');
  if (supabaseClient) joinRoom(btn.dataset.room);
});

// 한 모금 냠냠...
function sendSip() {
  if (!channel) return;
  channel.send({ type: 'broadcast', event: 'sip', payload: {} });
}

function setStatus(online, text) {
  statusBox.classList.toggle('online', online);
  statusText.textContent = text;
}


/* ===== E. 메시지 보내기 (필터 + 도배 방지) ============== */

// 아주 간단한 비속어 필터 (목록은 자유롭게 늘리세요)
const BAD_WORDS = ['시발', '씨발', '병신', '존나', '지랄'];
function cleanText(text) {
  let out = text;
  for (const w of BAD_WORDS) {
    out = out.split(w).join('•'.repeat(w.length));  // 금지어를 •로 가림
  }
  return out;
}

let lastSent = 0;   // 마지막으로 보낸 시각 (도배 방지용)
function trySend(text) {
  text = cleanText(text.trim());
  if (!text) return;

  const now = Date.now();
  if (now - lastSent < 1500) {            // 1.5초 안에 또 보내면 막기
    setHint('조금 천천히 보내요 🥛');
    return;
  }
  lastSent = now;

  showMessageRandom(text, myName, myColor);   // 내 화면에 띄우고

  if (channel) {
    channel.send({                        // 다른 사람들에게도 전송
      type: 'broadcast',
      event: 'chat',
      payload: { text: text, name: myName, color: myColor }
    });
  }
}

// 빠른 한마디 버튼
quickBox.addEventListener('click', function (e) {
  const btn = e.target.closest('.qbtn');
  if (!btn) return;
  trySend(btn.textContent);
});

// 배경 탭해서 직접 입력
scene.addEventListener('click', function (e) {
  if (e.target.closest('#bottle')) return;
  if (e.target.closest('#controls')) return;
  if (e.target.closest('#quick')) return;
  if (e.target.closest('.talk-box')) return;
  if (e.target.closest('.msg')) return;       // ← 메시지/리액션 클릭은 무시
  openTalkInput(e.clientX, e.clientY);
});

function openTalkInput(x, y) {
  const old = document.querySelector('.talk-box');
  if (old) old.remove();

  // 입력칸 + 보내기 버튼을 담는 상자
  const box = document.createElement('div');
  box.className = 'talk-box';
  box.style.left = x + 'px';
  box.style.top  = y + 'px';

  const input = document.createElement('input');
  input.className = 'talk-input';
  input.placeholder = '한마디…';
  input.maxLength = 60;

  const send = document.createElement('button');
  send.className = 'talk-send';
  send.textContent = '보내기';

  box.appendChild(input);
  box.appendChild(send);
  scene.appendChild(box);
  input.focus();

  function submit() {
    const text = input.value;
    box.remove();
    trySend(text);
  }

  // Enter 로 보내기.
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      box.remove();
    }
  });

  // 보내기 버튼으로도 전송
  send.addEventListener('click', function (e) {
    e.preventDefault();
    submit();
  });

  // 빈 칸인 채로 다른 곳을 누르면 닫기.
  input.addEventListener('blur', function () {
    if (!input.value.trim()) box.remove();
  });
}

/* F. 메시지/효과 화면에 띄우기 */

function showMessage(text, x, y, name, color) {
  const msg = document.createElement('div');
  msg.className = 'msg';
  if (name) {
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = name;
    if (color) who.style.color = color;
    msg.appendChild(who);
  }
  msg.appendChild(document.createTextNode(text));
  msg.style.left = x + 'px';
  msg.style.top  = y + 'px';

  addReactBar(msg, x, y);   // ← 이모지 리액션 바 붙이기

  scene.appendChild(msg);
  msg.addEventListener('animationend', function () { msg.remove(); });
}

function showMessageRandom(text, name, color) {
  const x = 80 + Math.random() * (window.innerWidth - 160);
  const y = window.innerHeight * 0.55 + Math.random() * (window.innerHeight * 0.25);
  showMessage(text, x, y, name, color);
}

function showReaction(text) {
  const r = document.createElement('div');
  r.className = 'reaction';
  r.textContent = text;
  r.style.left = '50%';
  r.style.top = '42%';
  scene.appendChild(r);
  r.addEventListener('animationend', function () { r.remove(); });
}

function clearMessages() {
  document.querySelectorAll('.msg').forEach(function (m) { m.remove(); });
}

function wobbleBottle() {
  bottle.classList.remove('wobble');
  void bottle.offsetWidth;   // 애니메이션을 다시 시작
  bottle.classList.add('wobble');
}

// 안내 글을 잠깐 바꿨다가 되돌리기
let hintTimer = null;
function setHint(text) {
  hint.textContent = text;
  clearTimeout(hintTimer);
  if (text !== DEFAULT_HINT) {
    hintTimer = setTimeout(function () { hint.textContent = DEFAULT_HINT; }, 1600);
  }
}


/* 도우미: 랜덤 닉네임 / 색 */

function randomNickname() {
  const colors  = ['노란', '파란', '초록', '분홍', '보라', '하얀', '까만', '주황', '심연의', '12살에 곰을 잡은', '푸른 정원의 기억', '흰 바람이 맺힌',
    '새벽을 비추는 별', '눈부신 역광', '환생한'
  ];
  const animals = ['너구리', '고양이', '수달', '오리', '햄버거', '멧돼지', '두더지', '펭귄', '곰', '늑대', '제비', '두루미', '기니피그', '고릴라', '주황버섯', '밀레시안', '여행자', '에이언즈', '방랑자', '모험가'];
  return pick(colors) + ' ' + pick(animals);
}
function randomColor() {
  const list = ['#c98a3a', '#3a7bc9', '#3aa55a', '#d36f97', '#8a6fd3', '#c95a4a'];
  return pick(list);
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* 접속자 목록 업데이트 */
function updateUserList(state) {
  userList.innerHTML = '';
  Object.entries(state).forEach(function ([id, presences]) {
    const p = presences[0];
    const item = document.createElement('div');
    item.className = 'user-item';

    const dot = document.createElement('span');
    dot.className = 'user-dot';
    dot.style.background = p.color || '#c98a3a';

    const name = document.createElement('span');
    name.className = 'user-name';
    name.textContent = p.name || '두유친구';

    item.appendChild(dot);
    item.appendChild(name);

    if (id === myId) {
      const me = document.createElement('span');
      me.className = 'user-me';
      me.textContent = '(나)';
      item.appendChild(me);
    }
    userList.appendChild(item);
  });
}

/* 이모지 리액션 */
const REACT_EMOJIS = ['👍', '❤️', '😂', '🥛', '🔥', '😭'];

let activeReactBar = null;  // 현재 열린 리액션 바

function addReactBar(msgEl, x, y) {
  // 메시지 클릭 시 리액션 바 토글
  msgEl.addEventListener('click', function (e) {
    e.stopPropagation();

    // 이미 이 메시지의 리액션 바가 열려있으면 닫기
    if (activeReactBar && activeReactBar._owner === msgEl) {
      activeReactBar.remove();
      activeReactBar = null;
      return;
    }
    // 다른 리액션 바 닫기
    if (activeReactBar) { activeReactBar.remove(); activeReactBar = null; }

    // 리액션 바를 scene에 직접 붙이기 (overflow/animation 문제 회피)
    const bar = document.createElement('div');
    bar.className = 'msg-react open';
    bar._owner = msgEl;

    // 메시지 위치 기준으로 배치
    const rect = msgEl.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    bar.style.left = (rect.left - sceneRect.left + rect.width / 2) + 'px';
    bar.style.top  = (rect.top  - sceneRect.top  - 8) + 'px';

    REACT_EMOJIS.forEach(function (emoji) {
      const btn = document.createElement('button');
      btn.className = 'react-btn';
      btn.textContent = emoji;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const ex = rect.left - sceneRect.left + rect.width / 2;
        const ey = rect.top  - sceneRect.top;
        spawnEmojiPop(emoji, ex, ey);
        if (channel) {
          channel.send({ type: 'broadcast', event: 'react', payload: { emoji, x: ex, y: ey } });
        }
        bar.remove();
        activeReactBar = null;
      });
      bar.appendChild(btn);
    });

    scene.appendChild(bar);
    activeReactBar = bar;
  });
}

function spawnEmojiPop(emoji, x, y) {
  const el = document.createElement('div');
  el.className = 'emoji-pop';
  el.textContent = emoji;
  el.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
  el.style.top  = y + 'px';
  scene.appendChild(el);
  el.addEventListener('animationend', function () { el.remove(); });
}