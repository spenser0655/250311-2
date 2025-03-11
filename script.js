// テーマ・モード切替
const themeToggle = document.getElementById('themeToggle');
const modeToggle = document.getElementById('modeToggle');
const body = document.body;
const clockDisplay = document.getElementById('clockDisplay');
const pomodoroDisplay = document.getElementById('pomodoroDisplay');

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  body.classList.toggle('light');
});

modeToggle.addEventListener('click', () => {
  if (clockDisplay.style.display === "none") {
    clockDisplay.style.display = "block";
    pomodoroDisplay.style.display = "none";
  } else {
    clockDisplay.style.display = "none";
    pomodoroDisplay.style.display = "block";
  }
});

// 現在時刻表示（元号付きの日付を表示 - 令和→R等）
function updateClock() {
  const now = new Date();
  
  // 和暦表示用フォーマッター
  const japaneseDateFormatter = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
    era: 'long',   // "令和", "平成", ...
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  const eraDateStr = japaneseDateFormatter.format(now); // 例: "令和5/4/12"

  // 令和→R, 平成→H, 昭和→S, 大正→T, 明治→M に置き換え
  let shortEra = eraDateStr
    .replace("令和", "R")
    .replace("平成", "H")
    .replace("昭和", "S")
    .replace("大正", "T")
    .replace("明治", "M");
  
  const dateStr = now.getFullYear() + "年" +
                  (now.getMonth() + 1) + "月" +
                  now.getDate() + "日";
  const timeStr = now.toLocaleTimeString('ja-JP', { hour12: false });
  
  document.getElementById('currentDate').textContent = dateStr + " (" + shortEra + ")";
  document.getElementById('currentTime').textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// ポモドーロタイマーの設定と変数
let focusTime = 25 * 60; // 秒
let shortBreak = 5 * 60;
let longBreak = 20 * 60;
let sessionsBeforeLong = 4;
let currentSession = 0;
let isFocus = true;
let timer = null;
let remainingTime = focusTime;

const pomodoroTimerElem = document.getElementById('pomodoroTimer');
const timerLabelElem = document.getElementById('timerLabel');
const startStopBtn = document.getElementById('startStopBtn');
const sessionCountElem = document.getElementById('sessionCount');
// 完全停止ボタン
const resetBtn = document.getElementById('resetBtn');

function updatePomodoroDisplay() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  pomodoroTimerElem.textContent =
    String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
  sessionCountElem.textContent = "Session: " + currentSession;
  timerLabelElem.textContent = isFocus ? "Focus" : "Break";
}

function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    remainingTime--;
    if (remainingTime < 0) {
      clearInterval(timer);
      timer = null;
      // タイマー終了時の処理
      if (isFocus) {
        currentSession++;
        // 次の休憩タイマー（長休憩か短休憩か判定）
        remainingTime = (currentSession % sessionsBeforeLong === 0) ? longBreak : shortBreak;
      } else {
        // 休憩終了後はフォーカスタイマーに戻す
        remainingTime = focusTime;
      }
      isFocus = !isFocus;
      updatePomodoroDisplay();
    } else {
      updatePomodoroDisplay();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

startStopBtn.addEventListener('click', () => {
  if (timer) {
    stopTimer();
    startStopBtn.textContent = "Start";
  } else {
    startTimer();
    startStopBtn.textContent = "Stop";
  }
});

// 完全停止ボタンの挙動
resetBtn.addEventListener('click', () => {
  // タイマーを停止
  stopTimer();
  // 全て初期化
  currentSession = 0;
  isFocus = true;
  remainingTime = focusTime;
  startStopBtn.textContent = "Start";
  updatePomodoroDisplay();
});

// 設定モーダル
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const settingsForm = document.getElementById('settingsForm');

settingsBtn.addEventListener('click', () => {
  settingsModal.style.display = "flex";
});
closeSettings.addEventListener('click', () => {
  settingsModal.style.display = "none";
});
window.addEventListener('click', (e) => {
  if(e.target === settingsModal) {
    settingsModal.style.display = "none";
  }
});

settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // 新しい設定値を取得（分→秒へ変換）
  focusTime = parseInt(document.getElementById('focusTime').value, 10) * 60;
  shortBreak = parseInt(document.getElementById('shortBreak').value, 10) * 60;
  sessionsBeforeLong = parseInt(document.getElementById('sessionsBeforeLong').value, 10);
  longBreak = parseInt(document.getElementById('longBreak').value, 10) * 60;
  
  // 現在がフォーカス状態なら残り時間を更新、休憩中ならそのまま
  if(isFocus) {
    remainingTime = focusTime;
  }
  updatePomodoroDisplay();
  settingsModal.style.display = "none";
});

// 初期表示更新
updatePomodoroDisplay();
