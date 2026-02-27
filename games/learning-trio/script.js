const menu = document.getElementById("menu");
const gameSection = document.getElementById("game");
const gameTitle = document.getElementById("game-title");
const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const backBtn = document.getElementById("back-btn");
const difficultyEl = document.getElementById("difficulty");
const soundToggle = document.getElementById("sound-toggle");
const musicToggle = document.getElementById("music-toggle");
const bestScoreEl = document.getElementById("best-score");

const progressKey = "kidsLearningProgress";
const progressGameKey = "learning-trio";
let score = 0;
let soundOn = true;
let musicOn = false;
let musicTimer = null;
let audioCtx = null;

const wordSets = {
  easy: ["CAT", "SUN", "DOG", "BALL"],
  medium: ["TREE", "FISH", "MOON", "APPLE"],
  hard: ["PLANET", "GARDEN", "SCHOOL", "ORANGE"]
};

menu.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  const game = e.target.dataset.game;
  startGame(game);
});

backBtn.addEventListener("click", () => {
  gameSection.classList.add("hidden");
  menu.classList.remove("hidden");
  gameArea.innerHTML = "";
  saveProgress(score);
});

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

function setScore(value) {
  score = value;
  scoreEl.textContent = score;
}

function addScore(points) {
  setScore(score + points);
  saveProgress(score);
}

function startGame(game) {
  setScore(0);
  menu.classList.add("hidden");
  gameSection.classList.remove("hidden");

  if (game === "memory") {
    gameTitle.textContent = "Memory Match";
    launchMemory();
  }
  if (game === "spelling") {
    gameTitle.textContent = "Spelling Builder";
    launchSpelling();
  }
  if (game === "math") {
    gameTitle.textContent = "Math Bubbles";
    launchMath();
  }
}

function launchMemory() {
  const pairCount = difficultyEl.value === "easy" ? 4 : difficultyEl.value === "medium" ? 6 : 8;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const items = [];
  for (let i = 0; i < pairCount; i += 1) {
    items.push(alphabet[i], alphabet[i]);
  }
  items.sort(() => Math.random() - 0.5);

  gameArea.innerHTML = '<div class="memory-grid"></div><div id="msg"></div>';
  const grid = gameArea.querySelector(".memory-grid");
  const msg = gameArea.querySelector("#msg");

  let first = null;
  let lock = false;
  let matched = 0;

  items.forEach((letter, i) => {
    const btn = document.createElement("button");
    btn.className = "tile";
    btn.dataset.value = letter;
    btn.dataset.index = i;
    btn.textContent = "?";

    btn.addEventListener("click", () => {
      if (lock || btn.classList.contains("matched") || btn === first) return;
      btn.textContent = letter;
      btn.classList.add("revealed");

      if (!first) {
        first = btn;
        return;
      }

      if (first.dataset.value === btn.dataset.value) {
        first.classList.add("matched");
        btn.classList.add("matched");
        playCorrect();
        addScore(2);
        matched += 2;
        if (matched === items.length) {
          msg.textContent = "Great job! All pairs matched.";
        }
        first = null;
      } else {
        playWrong();
        lock = true;
        setTimeout(() => {
          first.textContent = "?";
          btn.textContent = "?";
          first.classList.remove("revealed");
          btn.classList.remove("revealed");
          first = null;
          lock = false;
        }, 700);
      }
    });

    grid.appendChild(btn);
  });
}

function launchSpelling() {
  gameArea.innerHTML = "";
  const words = wordSets[difficultyEl.value];
  let current = pick(words);

  const word = document.createElement("div");
  word.className = "spelling-word";

  const prompt = document.createElement("div");
  prompt.textContent = "Tap letters in order to build the word:";

  const bank = document.createElement("div");
  bank.className = "letter-bank";

  const status = document.createElement("div");

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next Word";
  nextBtn.className = "hidden";

  let built = "";

  function renderWord() {
    word.textContent = current
      .split("")
      .map((ch, idx) => (idx < built.length ? ch : "_"))
      .join(" ");
  }

  function fillLetters() {
    bank.innerHTML = "";
    const letters = current.split("").sort(() => Math.random() - 0.5);
    letters.forEach((letter) => {
      const btn = document.createElement("button");
      btn.textContent = letter;
      btn.addEventListener("click", () => {
        if (letter === current[built.length]) {
          built += letter;
          btn.disabled = true;
          renderWord();
          playCorrect();
          if (built === current) {
            status.textContent = "Correct!";
            addScore(difficultyEl.value === "hard" ? 4 : 3);
            nextBtn.classList.remove("hidden");
          }
        } else {
          playWrong();
          status.textContent = "Try again";
        }
      });
      bank.appendChild(btn);
    });
  }

  nextBtn.addEventListener("click", () => {
    current = pick(words);
    built = "";
    status.textContent = "";
    nextBtn.classList.add("hidden");
    renderWord();
    fillLetters();
  });

  renderWord();
  fillLetters();

  gameArea.append(prompt, word, bank, status, nextBtn);
}

function launchMath() {
  gameArea.innerHTML = "";

  const question = document.createElement("h3");
  const choices = document.createElement("div");
  choices.className = "choices";
  const status = document.createElement("div");

  function round() {
    choices.innerHTML = "";
    status.textContent = "";

    const maxValue = difficultyEl.value === "easy" ? 5 : difficultyEl.value === "medium" ? 8 : 12;
    const a = rand(1, maxValue);
    const b = rand(1, maxValue);
    const answer = a + b;
    question.textContent = `${a} + ${b} = ?`;

    const opts = [answer, answer + rand(1, 3), Math.max(0, answer - rand(1, 3))]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort(() => Math.random() - 0.5);

    while (opts.length < 3) {
      const extra = rand(0, maxValue * 2);
      if (!opts.includes(extra)) opts.push(extra);
    }

    opts.sort(() => Math.random() - 0.5).forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "bubble";
      btn.textContent = String(opt);
      btn.addEventListener("click", () => {
        if (opt === answer) {
          playCorrect();
          status.textContent = "Nice!";
          addScore(2);
          setTimeout(round, 500);
        } else {
          playWrong();
          status.textContent = "Oops, try another bubble.";
        }
      });
      choices.appendChild(btn);
    });
  }

  round();
  gameArea.append(question, choices, status);
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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
  const best = store[progressGameKey]?.best || 0;
  bestScoreEl.textContent = String(best);
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
  beep(660, 0.09, "triangle", 0.04);
}

function playWrong() {
  beep(220, 0.11, "sawtooth", 0.03);
}

function startMusic() {
  if (musicTimer) return;
  const notes = [262, 330, 392, 330];
  let i = 0;
  ensureAudio();
  musicTimer = setInterval(() => {
    if (!musicOn) return;
    beep(notes[i % notes.length], 0.12, "sine", 0.02);
    i += 1;
  }, 320);
}

function stopMusic() {
  if (!musicTimer) return;
  clearInterval(musicTimer);
  musicTimer = null;
}

loadBest();
