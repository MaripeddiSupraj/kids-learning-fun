const promptEl = document.getElementById("prompt");
const choicesEl = document.getElementById("choices");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const difficultyEl = document.getElementById("difficulty");
const soundToggle = document.getElementById("sound-toggle");
const musicToggle = document.getElementById("music-toggle");
const bestScoreEl = document.getElementById("best-score");

const progressKey = "kidsLearningProgress";
const progressGameKey = "color-match";

const colors = [
  { name: "RED", code: "#ef476f" },
  { name: "BLUE", code: "#118ab2" },
  { name: "GREEN", code: "#06d6a0" },
  { name: "ORANGE", code: "#f77f00" },
  { name: "PURPLE", code: "#9b5de5" },
  { name: "YELLOW", code: "#ffd166" },
  { name: "PINK", code: "#ff70a6" },
  { name: "BROWN", code: "#8d6e63" }
];

let score = 0;
let soundOn = true;
let musicOn = false;
let musicTimer = null;
let audioCtx = null;

difficultyEl.addEventListener("change", () => nextRound());

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
  if (soundOn) beep(540, 0.08);
});

musicToggle.addEventListener("click", () => {
  musicOn = !musicOn;
  musicToggle.textContent = `Music: ${musicOn ? "On" : "Off"}`;
  if (musicOn) startMusic();
  else stopMusic();
});

function nextRound() {
  statusEl.textContent = "";
  choicesEl.innerHTML = "";

  const difficulty = difficultyEl.value;
  const pool = difficulty === "easy" ? colors.slice(0, 4) : difficulty === "medium" ? colors.slice(0, 6) : colors;
  const choiceCount = difficulty === "easy" ? 3 : 4;

  const answer = pool[Math.floor(Math.random() * pool.length)];
  promptEl.textContent = `Find: ${answer.name}`;

  const options = [answer];
  while (options.length < choiceCount) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!options.includes(pick)) options.push(pick);
  }

  options.sort(() => Math.random() - 0.5).forEach((opt) => {
    const btn = document.createElement("button");
    btn.style.background = opt.code;
    btn.style.color = opt.name === "YELLOW" ? "#222" : "#fff";
    btn.textContent = opt.name;
    btn.addEventListener("click", () => {
      if (opt.name === answer.name) {
        playCorrect();
        score += difficulty === "hard" ? 3 : 2;
        scoreEl.textContent = score;
        saveProgress(score);
        statusEl.textContent = "Great!";
        setTimeout(nextRound, 500);
      } else {
        playWrong();
        statusEl.textContent = "Try again!";
      }
    });
    choicesEl.appendChild(btn);
  });
}

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(progressKey) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(currentScore) {
  const store = getProgress();
  const previous = store[progressGameKey] || { best: 0, last: 0, plays: 0 };
  const next = {
    best: Math.max(previous.best || 0, currentScore),
    last: currentScore,
    plays: previous.plays + 1
  };
  store[progressGameKey] = next;
  localStorage.setItem(progressKey, JSON.stringify(store));
  bestScoreEl.textContent = String(next.best);
}

function loadBest() {
  const store = getProgress();
  bestScoreEl.textContent = String(store[progressGameKey]?.best || 0);
}

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function beep(freq, duration, type = "sine", volume = 0.03) {
  if (!soundOn) return;
  const ctx = ensureAudio();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function playCorrect() {
  beep(680, 0.08, "triangle", 0.04);
}

function playWrong() {
  beep(230, 0.1, "square", 0.03);
}

function startMusic() {
  if (musicTimer) return;
  const notes = [262, 294, 330, 392];
  let i = 0;
  ensureAudio();
  musicTimer = setInterval(() => {
    if (!musicOn) return;
    beep(notes[i % notes.length], 0.11, "sine", 0.02);
    i += 1;
  }, 320);
}

function stopMusic() {
  if (!musicTimer) return;
  clearInterval(musicTimer);
  musicTimer = null;
}

loadBest();
nextRound();
