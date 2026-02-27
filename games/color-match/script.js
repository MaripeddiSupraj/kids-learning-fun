const promptEl = document.getElementById("prompt");
const choicesEl = document.getElementById("choices");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");

const colors = [
  { name: "RED", code: "#ef476f" },
  { name: "BLUE", code: "#118ab2" },
  { name: "GREEN", code: "#06d6a0" },
  { name: "ORANGE", code: "#f77f00" },
  { name: "PURPLE", code: "#9b5de5" },
  { name: "YELLOW", code: "#ffd166" }
];

let score = 0;

function nextRound() {
  statusEl.textContent = "";
  choicesEl.innerHTML = "";
  const answer = colors[Math.floor(Math.random() * colors.length)];
  promptEl.textContent = `Find: ${answer.name}`;

  const options = [answer];
  while (options.length < 4) {
    const pick = colors[Math.floor(Math.random() * colors.length)];
    if (!options.includes(pick)) options.push(pick);
  }

  options.sort(() => Math.random() - 0.5).forEach((opt) => {
    const btn = document.createElement("button");
    btn.style.background = opt.code;
    btn.textContent = opt.name;
    btn.addEventListener("click", () => {
      if (opt.name === answer.name) {
        score += 2;
        scoreEl.textContent = score;
        statusEl.textContent = "Great!";
        setTimeout(nextRound, 500);
      } else {
        statusEl.textContent = "Try again!";
      }
    });
    choicesEl.appendChild(btn);
  });
}

nextRound();
