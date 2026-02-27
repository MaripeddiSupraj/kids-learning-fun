const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const difficultyEl = document.getElementById("difficulty");
const soundToggle = document.getElementById("sound-toggle");
const musicToggle = document.getElementById("music-toggle");
const bestScoreEl = document.getElementById("best-score");

const progressKey = "kidsLearningProgress";
const progressGameKey = "number-train";

let score = 0;
let soundOn = true;
let musicOn = false;
let musicTimer = null;
let audioCtx = null;

difficultyEl.addEventListener("change", () => round());

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
  if (soundOn) beep(500, 0.08);
});

musicToggle.addEventListener("click", () => {
  musicOn = !musicOn;
  musicToggle.textContent = `Music: ${musicOn ? "On" : "Off"}`;
  if (musicOn) startMusic();
  else stopMusic();
});

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round() {
  choicesEl.innerHTML = "";
  statusEl.textContent = "";

  const difficulty = difficultyEl.value;
  const seqLength = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const stepMax = difficulty === "hard" ? 3 : 2;

  const start = rand(1, 10);
  const step = rand(1, stepMax);
  const seq = Array.from({ length: seqLength }, (_, i) => start + step * i);
  const missingIndex = rand(0, seqLength - 1);
  const answer = seq[missingIndex];
  const shown = seq.map((n, i) => (i === missingIndex ? "?" : n));
  questionEl.textContent = shown.join(" - ");

  const options = [answer];
  const optCount = difficulty === "easy" ? 3 : 4;
  while (options.length < optCount) {
    const extra = answer + rand(-4, 4);
    if (extra >= 0 && !options.includes(extra)) options.push(extra);
  }

  options.sort(() => Math.random() - 0.5).forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = String(opt);
    btn.addEventListener("click", () => {
      if (opt === answer) {
        playCorrect();
        score += difficulty === "hard" ? 3 : 2;
        scoreEl.textContent = score;
        saveProgress(score);
        statusEl.textContent = "Correct!";
        setTimeout(round, 500);
      } else {
        playWrong();
        statusEl.textContent = "Try again.";
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
  beep(700, 0.08, "triangle", 0.04);
}

function playWrong() {
  beep(200, 0.1, "square", 0.03);
}

function startMusic() {
  if (musicTimer) return;
  const notes = [247, 262, 294, 330];
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
round();
