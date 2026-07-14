let startedAt = null;
let elapsedTime = 0;
let timerInterval = null;

const problemId = getProblemIdFromUrl();
console.log("[Programmers Timer] Problem ID:", problemId);

createTimer();
loadElapsedTime();
observeCorrectAnswer();

function getProblemIdFromUrl() {
  const match = window.location.pathname.match(/\/lessons\/(\d+)/);

  return match ? match[1] : null;
}

function saveElapsedTime() {
    if(problemId === null){
        return;
    } 

    const storageKey = `problem-${problemId}`;

    chrome.storage.local.set({
        [storageKey] : {
            elapsedTime : elapsedTime,
            startedAt : startedAt,
            isRunning : startedAt !== null
        }
    });
    
}

function createTimer() {
  const timerBox = document.createElement("div");
  timerBox.id = "programmers-timer";

  timerBox.innerHTML = `
    <div id="timer-display">00:00:00</div>

    <div id="timer-buttons">
      <button id="timer-start">시작</button>
      <button id="timer-pause">일시정지</button>
      <button id="timer-reset">초기화</button>
    </div>
  `;

  document.body.appendChild(timerBox);

  document
    .querySelector("#timer-start")
    .addEventListener("click", startTimer);

  document
    .querySelector("#timer-pause")
    .addEventListener("click", pauseTimer);

  document
    .querySelector("#timer-reset")
    .addEventListener("click", resetTimer);
} // createTimer는 여기서 끝남

function startTimer() {
  if (startedAt !== null) {
    return;
  }

  startedAt = Date.now();
  saveElapsedTime();
  timerInterval = setInterval(() => {
    renderTime();
  }, 1000);
}

function pauseTimer() {
  if (startedAt === null) {
    return;
  }

  elapsedTime += Date.now() - startedAt;
  startedAt = null;
  saveElapsedTime();

  clearInterval(timerInterval);
  renderTime();
}

function resetTimer() {
  startedAt = null;
  elapsedTime = 0;
  saveElapsedTime();

  clearInterval(timerInterval);
  renderTime();
}

function getCurrentElapsedTime() {
  if (startedAt === null) {
    return elapsedTime;
  }

  return elapsedTime + (Date.now() - startedAt);
}

function renderTime() {
  const currentElapsedTime = getCurrentElapsedTime();
  const totalSeconds = Math.floor(currentElapsedTime / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime =
    `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  document.querySelector("#timer-display").textContent = formattedTime;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function loadElapsedTime() {
    if(problemId == null) {
        return;
    }

    const storageKey = `problem-${problemId}`;

    chrome.storage.local.get(storageKey, (result) => {
        const savedData = result[storageKey];

        if(!savedData) {
            return;
        }

        elapsedTime = savedData.elapsedTime;
        if(savedData.isRunning && savedData.startedAt !== null) {
            startedAt = savedData.startedAt;
            timerInterval = setInterval(() => {
            renderTime();
        }, 1000);
        }

        renderTime();
    })
}

function isCorrectAnswerDisplayed() {
    const modalTitles = document.querySelectorAll(".modal-title");

    return Array.from(modalTitles).some((title) => {
        return title.textContent.trim() === "정답입니다!";
    });
}

function observeCorrectAnswer() {
    let correctAnswerDetected = false;

    const observer = new MutationObserver(() => {
        if(correctAnswerDetected || !isCorrectAnswerDisplayed()) {
            return;
        }

        correctAnswerDetected = true;
        pauseTimer();
        console.log("[Programmers Timer] Correct answer detected");
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
