const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");

let score = 0;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function round() {
  choicesEl.innerHTML = "";
  statusEl.textContent = "";

  const start = rand(1, 8);
  const step = rand(1, 2);
  const seq = [start, start + step, start + step * 2, start + step * 3];
  const missingIndex = rand(0, 3);
  const answer = seq[missingIndex];
  const shown = seq.map((n, i) => (i === missingIndex ? "?" : n));
  questionEl.textContent = shown.join(" - ");

  const options = [answer];
  while (options.length < 3) {
    const extra = answer + rand(-3, 3);
    if (extra >= 0 && !options.includes(extra)) options.push(extra);
  }

  options.sort(() => Math.random() - 0.5).forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = String(opt);
    btn.addEventListener("click", () => {
      if (opt === answer) {
        score += 2;
        scoreEl.textContent = score;
        statusEl.textContent = "Correct!";
        setTimeout(round, 500);
      } else {
        statusEl.textContent = "Try again.";
      }
    });
    choicesEl.appendChild(btn);
  });
}

round();
