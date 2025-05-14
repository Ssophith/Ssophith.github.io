const words = [
  { hint: "Амьтан", answer: "муур" },
  { hint: "Амьтан", answer: "нохой" },
  { hint: "Амьтан", answer: "туулай" },
  { hint: "Амьтан", answer: "чоно" },
  { hint: "Амьтан", answer: "загас" },
  { hint: "Амьтан", answer: "баавгай" },
  { hint: "Жимс", answer: "алим" },
  { hint: "Жимс", answer: "банана" },
  { hint: "Жимс", answer: "киви" },
  { hint: "Жимс", answer: "тоор" },
  { hint: "Жимс", answer: "мойл" },
  { hint: "Жимс", answer: "нэрс" },
  { hint: "Жимс", answer: "жүрж" },
  { hint: "Хоол", answer: "бууз" },
  { hint: "Хоол", answer: "хуушуур" },
  { hint: "Хоол", answer: "цуйван" },
  { hint: "Өнгө", answer: "улаан" },
  { hint: "Өнгө", answer: "ногоон" },
  { hint: "Өнгө", answer: "шар" },
  { hint: "Өнгө", answer: "цэнхэр" },
];


const mongolKeyboard = "АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ".toLowerCase().split("");

let selectedWord = "";
let displayedWord = [];
let score = 0;
let lives = 4;
let timer = 60;
let interval;

function startGame() {
  const nickname = document.getElementById("nickname").value.trim();
  if (!nickname) return alert("Нэрээ оруулна уу");
  document.cookie = `nickname=${nickname}; max-age=3600`;

  document.getElementById("login-screen").style.display = "none";
  document.querySelector(".wrap").style.display = "flex";
  document.getElementById("game-container").style.display = "block";

  updateUserHighscore(nickname); 
  buildKeyboard();
  nextWord();

  interval = setInterval(() => {
    timer--;
    document.getElementById("timer").innerText = timer;
    if (timer <= 0) endGame();
  }, 1000);

  updateScoreboard();
}

function updateUserHighscore(nickname) {
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const user = leaderboard.find(e => e.nickname === nickname);
  const highscore = user ? user.score : 0;
  document.getElementById("user-highscore").innerText = highscore;
}


function nextWord() {
  const word = words[Math.floor(Math.random() * words.length)];
  selectedWord = word.answer;
  displayedWord = Array(selectedWord.length).fill("");

  drawHangman(4 - lives);

  document.getElementById("hint").innerText = "Асуулт: " + word.hint;
  document.getElementById("word-container").innerHTML = displayedWord
    .map((_, i) => `<span id="char${i}">_</span>`)
    .join("");
  document.getElementById("lives").innerText = lives;
}


function buildKeyboard() {
  const container = document.getElementById("keyboard");
  container.innerHTML = "";
  mongolKeyboard.forEach((letter) => {
    const btn = document.createElement("button");
    btn.textContent = letter;
    btn.onclick = () => handleKey(letter);
    container.appendChild(btn);
  });
}

function handleKey(key) {
  let found = false;
  for (let i = 0; i < selectedWord.length; i++) {
    if (selectedWord[i] === key && displayedWord[i] === "") {
      displayedWord[i] = key;
      document.getElementById(`char${i}`).innerText = key;
      score++;
      found = true;
    }
  }

  document.getElementById("score").innerText = score;

  if (!found) {
    lives--;
    drawHangman(4 - lives);
    document.getElementById("lives").innerText = lives;

    if (lives <= 0) {
      drawHangman(4);
      setTimeout(() => {
        endGame();
      }, 1000);
      return; 
    }
  }

  if (displayedWord.join("") === selectedWord) {
    setTimeout(() => {
      nextWord();
    }, 600);
  }
}

function endGame() {
  clearInterval(interval);
  const nickname = getCookie("nickname");

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const existing = leaderboard.find(e => e.nickname === nickname);

  if (existing) {
    if (score > existing.score) {
      existing.score = score;
    }
  } else {
    leaderboard.push({ nickname, score });
  }

  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  const tempLeaderboard = [...leaderboard];
  const currentEntry = { nickname, score };
  const existingIndex = tempLeaderboard.findIndex(e => e.nickname === nickname);
  if (existingIndex >= 0) {
    tempLeaderboard[existingIndex] = currentEntry;
  } else {
    tempLeaderboard.push(currentEntry);
  }
  tempLeaderboard.sort((a, b) => b.score - a.score);
  const top5 = tempLeaderboard.slice(0, 5);
  const inTop5 = top5.some(e => e.nickname === nickname);

  let message = `Таны авсан оноо: ${score}`;
  if (inTop5) {
    message += "\n Та эхний 5-д орлоо. Баяр хүргэе!";
  }
  document.querySelector(".wrap").style.display = "none";
  document.getElementById("game-container").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  document.getElementById("final-score-msg").innerText = message;

  updateScoreboard();
  updateUserHighscore(nickname);
}



function restartGame() {
  document.getElementById("end-screen").style.display = "none";
    document.querySelector(".wrap").style.display = "flex";
  document.getElementById("game-container").style.display = "block";

  score = 0;
  lives = 4;
  timer = 60;
  document.getElementById("score").innerText = score;
  document.getElementById("timer").innerText = timer;

  buildKeyboard();
  nextWord();

  interval = setInterval(() => {
    timer--;
    document.getElementById("timer").innerText = timer;
    if (timer <= 0) endGame();
  }, 1000);
}

function exitGame() {
  document.cookie = "nickname=; max-age=0";
  location.reload(); 
}


function drawHangman(stage) {
  const canvas = document.getElementById("hangman-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(10, 190); ctx.lineTo(140, 190);
  ctx.moveTo(40, 190); ctx.lineTo(40, 20);
  ctx.lineTo(100, 20);
  ctx.lineTo(100, 40); 
  ctx.stroke();

  if (stage >= 1) {
    ctx.beginPath();
    ctx.arc(100, 50, 10, 0, Math.PI * 2);
    ctx.stroke();

    if (stage < 4) {
      ctx.beginPath();
      ctx.arc(95, 47, 2, 0, Math.PI * 2); 
      ctx.fill();
      ctx.beginPath();
      ctx.arc(105, 47, 2, 0, Math.PI * 2); 
      ctx.fill();
    } else {
      // ✗✗ нүд
      ctx.beginPath();
      ctx.moveTo(93, 45); ctx.lineTo(97, 49); // Зүүн ✗
      ctx.moveTo(97, 45); ctx.lineTo(93, 49);

      ctx.moveTo(103, 45); ctx.lineTo(107, 49); // Баруун ✗
      ctx.moveTo(107, 45); ctx.lineTo(103, 49);
      ctx.stroke();
    }

    // Ам
    if (stage === 1) {
      // Инээмсэглэл
      ctx.beginPath();
      ctx.moveTo(95, 53);
      ctx.quadraticCurveTo(100, 58, 105, 53);
      ctx.stroke();
    } else if (stage === 2) {
      // Шулуун ам
      ctx.beginPath();
      ctx.moveTo(95, 55);
      ctx.lineTo(105, 55);
      ctx.stroke();
    } else if (stage >= 3) {
      // Уруудах муруй ам
      ctx.beginPath();
      ctx.moveTo(95, 54);
      ctx.quadraticCurveTo(100, 50, 105, 54);
      ctx.stroke();
    }
  }

  if (stage >= 2) {
    // Бие
    ctx.beginPath();
    ctx.moveTo(100, 60); ctx.lineTo(100, 100);
    ctx.stroke();
  }

  if (stage >= 3) {
    // Гар
    ctx.beginPath();
    ctx.moveTo(100, 70); ctx.lineTo(85, 90); // зүүн гар
    ctx.moveTo(100, 70); ctx.lineTo(115, 90); // баруун гар
    ctx.stroke();
  }

  if (stage >= 4) {
    // Хөл
    ctx.beginPath();
    ctx.moveTo(100, 100); ctx.lineTo(85, 130); // зүүн хөл
    ctx.moveTo(100, 100); ctx.lineTo(115, 130); // баруун хөл
    ctx.stroke();

    // Олсыг дахин зурна (толгойн дээгүүр)
    ctx.beginPath();
    ctx.moveTo(100, 20);
    ctx.lineTo(100, 40);
    ctx.stroke();
  }
}


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function updateScoreboard() {
  const list = document.getElementById("leaderboard-list");
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  list.innerHTML = leaderboard
    .map((e, i) => `<li>${i + 1}. ${e.nickname} — ${e.score} оноо</li>`)
    .join("");
}
