const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const difficultyEl = document.getElementById("difficulty");
const soundToggle = document.getElementById("sound-toggle");
const musicToggle = document.getElementById("music-toggle");
const restartBtn = document.getElementById("restart");
const bestScoreEl = document.getElementById("best-score");

const progressKey = "kidsLearningProgress";
const progressGameKey = "animal-memory";

const pool = ["🐶", "🐱", "🐼", "🦊", "🐸", "🐵", "🦁", "🐰", "🐯", "🐨"];

let score = 0;
let soundOn = true;
let musicOn = false;
let musicTimer = null;
let audioCtx = null;

difficultyEl.addEventListener("change", () => setupBoard());
restartBtn.addEventListener("click", () => setupBoard());

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
  if (soundOn) beep(520, 0.08);
});

musicToggle.addEventListener("click", () => {
  musicOn = !musicOn;
  musicToggle.textContent = `Music: ${musicOn ? "On" : "Off"}`;
  if (musicOn) startMusic();
  else stopMusic();
});

function setupBoard() {
  const difficulty = difficultyEl.value;
  const pairCount = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;
  const picks = pool.slice(0, pairCount);
  const cards = [...picks, ...picks].sort(() => Math.random() - 0.5);

  grid.innerHTML = "";
  statusEl.textContent = "";
  score = 0;
  scoreEl.textContent = String(score);

  let first = null;
  let lock = false;
  let matched = 0;

  cards.forEach((animal) => {
    const btn = document.createElement("button");
    btn.className = "tile";
    btn.textContent = "?";

    btn.addEventListener("click", () => {
      if (lock || btn.classList.contains("done") || btn === first) return;
      btn.textContent = animal;
      btn.classList.add("show");

      if (!first) {
        first = btn;
        return;
      }

      if (first.textContent === btn.textContent) {
        playCorrect();
        first.classList.add("done");
        btn.classList.add("done");
        matched += 2;
        score += difficulty === "hard" ? 3 : 2;
        scoreEl.textContent = score;
        saveProgress(score);
        first = null;
        if (matched === cards.length) statusEl.textContent = "You matched all animals!";
      } else {
        playWrong();
        lock = true;
        setTimeout(() => {
          first.textContent = "?";
          btn.textContent = "?";
          first.classList.remove("show");
          btn.classList.remove("show");
          first = null;
          lock = false;
        }, 700);
      }
    });

    grid.appendChild(btn);
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
  beep(650, 0.08, "triangle", 0.04);
}

function playWrong() {
  beep(210, 0.1, "square", 0.03);
}

function startMusic() {
  if (musicTimer) return;
  const notes = [262, 330, 349, 392];
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
setupBoard();
