const menu = document.getElementById("menu");
const gameSection = document.getElementById("game");
const gameTitle = document.getElementById("game-title");
const gameArea = document.getElementById("game-area");
const scoreEl = document.getElementById("score");
const backBtn = document.getElementById("back-btn");

let score = 0;

const words = ["CAT", "SUN", "BALL", "TREE", "FISH", "MOON"];

menu.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  const game = e.target.dataset.game;
  startGame(game);
});

backBtn.addEventListener("click", () => {
  gameSection.classList.add("hidden");
  menu.classList.remove("hidden");
  gameArea.innerHTML = "";
});

function setScore(value) {
  score = value;
  scoreEl.textContent = score;
}

function addScore(points) {
  setScore(score + points);
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
  const items = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F"]
    .sort(() => Math.random() - 0.5);

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
        addScore(2);
        matched += 2;
        if (matched === items.length) {
          msg.textContent = "Great job! All pairs matched.";
        }
        first = null;
      } else {
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
          if (built === current) {
            status.textContent = "Correct!";
            addScore(3);
            nextBtn.classList.remove("hidden");
          }
        } else {
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

    const a = rand(1, 6);
    const b = rand(1, 6);
    const answer = a + b;
    question.textContent = `${a} + ${b} = ?`;

    const opts = [answer, answer + rand(1, 3), Math.max(0, answer - rand(1, 3))]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort(() => Math.random() - 0.5);

    while (opts.length < 3) {
      const extra = rand(0, 12);
      if (!opts.includes(extra)) opts.push(extra);
    }

    opts.sort(() => Math.random() - 0.5).forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "bubble";
      btn.textContent = String(opt);
      btn.addEventListener("click", () => {
        if (opt === answer) {
          status.textContent = "Nice!";
          addScore(2);
          setTimeout(round, 500);
        } else {
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
