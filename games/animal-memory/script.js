const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");

const base = ["🐶", "🐱", "🐼", "🦊", "🐸", "🐵"];
const cards = [...base, ...base].sort(() => Math.random() - 0.5);

let first = null;
let lock = false;
let matched = 0;
let score = 0;

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
      first.classList.add("done");
      btn.classList.add("done");
      matched += 2;
      score += 2;
      scoreEl.textContent = score;
      first = null;
      if (matched === cards.length) statusEl.textContent = "You matched all animals!";
    } else {
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
