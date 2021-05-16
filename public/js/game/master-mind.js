// SessionId and role
const getInitialParams = (queryString) => {
  const sessionParams = new URLSearchParams(queryString);

  const sessionId = Number(sessionParams.get("session"));
  const role = Number(sessionParams.get("player"));

  return { sessionId, role };
};

const queryString = window.location.search;
let { sessionId, role } = getInitialParams(queryString);

const colors = ["blue", "yello", "green", "red", "white", "black"];
const marbleColors = ["white", "red"];

let gameIdx = 0;
let activeColorIdx = 0;
let activeMarbleIdx = 0;
let activeColumnIdx = 0;
let secret = [-1, -1, -1, -1];
let guess = [-1, -1, -1, -1];
let feedback = [-1, -1, -1, -1];
let scores = [0, 0];

/* Top container elements */
const gameSpan = document.querySelector("#game-span");

const username1 = document.querySelector("#username-1");
const username2 = document.querySelector("#username-2");
const activeSpan1 = document.querySelector("#active-span-1");
const activeSpan2 = document.querySelector("#active-span-2");
const roleSpan1 = document.querySelector("#role-user-1");
const roleSpan2 = document.querySelector("#role-user-2");
const score1 = document.querySelector("#score-1");
const score2 = document.querySelector("#score-2");

/* Board Elements */

const colorPickers = document.querySelectorAll(".color-picker");
const marblePickers = document.querySelectorAll(".marble-picker");

const boardColumns = document.querySelectorAll(".board-column");
const pegHoles = Array.from(document.querySelectorAll(".hole"));
const marbleHoles = Array.from(document.querySelectorAll(".marble-hole"));

const secretCodeColumn = document.querySelector("#secret-code");
const secretCodeCover = document.querySelector("#secret-cover");

/* Bottom container elements */
const mainButton = document.querySelector("#main-button");
const buttonFront = document.querySelector("#button-front");

const waitMessageDiv = document.querySelector("#wait-message-div");
const waitSpinner = document.querySelector("#wait-spinner");
const waitMessageContainer = document.querySelector("#wait-message-container");

/* Error banner */
const errorBanner = document.querySelector("#error-banner");
const errorMessage = document.querySelector("#error-message");

/* const wait_messages = {
  wait_secret: `${username2} is gettign the secret code ready.`,
  wait_feedback: `${username2} is preparing your feedback.`,
  wait_guess: `Wait for ${username1}'s guess to be ready.`,
};
 */
const wait_messages = {
  wait_secret: ``,
  wait_feedback: ``,
  wait_guess: ``,
};

// HELPERS ---------------------------------
const initializeElements = () => {
  // initialize the idx of the colorPicker elements
  colorPickers.forEach((colorPicker, idx) => {
    colorPicker["color_idx"] = idx;
  });

  // initialize the idx of the marblePicker elements
  marblePickers.forEach((marblePicker, idx) => {
    marblePicker["marble_idx"] = idx;
  });

  // initialize the idx and column_idx of the pegHole elements
  pegHoles.forEach((pegHole, idx) => {
    pegHole["idx"] = idx;
    pegHole["column_idx"] = Math.floor(idx / 4);
  });

  // initialize the idx and column_idx of the marbleHole elements
  marbleHoles.forEach((marbleHole, idx) => {
    marbleHole["idx"] = idx;
    marbleHole["column_idx"] = Math.floor(idx / 4);
  });
};

initializeElements();

const resetBoard = () => {
  activeColorIdx = 0;
  activeMarbleIdx = 0;
  activeColumnIdx = 0;
  secret = [-1, -1, -1, -1];
  guess = [-1, -1, -1, -1];
  feedback = [-1, -1, -1, -1];
  scores = [0, 0];

  boardColumns.forEach((column, idx) => {
    column.className = "board-column";
  });

  pegHoles.forEach((pegHole, idx) => {
    pegHole.className = "hole shade2";
  });

  marbleHoles.forEach((marbleHole, idx) => {
    marbleHole.classList.remove(`red`);
    marbleHole.classList.remove(`white`);
  });

  secretCodeColumn.className = "board-column secret hide";
  secretCodeCover.className = "board-column secret hide";
};

const resetFeedback = () => (feedback = [-1, -1, -1, -1]);
const resetGuess = () => (guess = [-1, -1, -1, -1]);

const changeActiveColor = (e) => {
  const audio = new Audio("../audio/click.mp3");
  audio.play();

  colorPickers[activeColorIdx].classList.remove("active-color");
  colorPicker = e.target;
  activeColorIdx = colorPicker.color_idx;
  console.log(`Selected color: ${colors[activeColorIdx]}`);
  colorPicker.classList.add("active-color");
};

const activateColorPickers = () => {
  colorPickers.forEach((colorPicker) => {
    colorPicker.classList.remove("inactive");
  });

  colorPickers[activeColorIdx].classList.add("active-color");

  colorPickers.forEach((colorPicker) => {
    colorPicker.addEventListener("click", changeActiveColor);
  });
};

const deactivateColorPickers = () => {
  colorPickers.forEach((colorPicker) => {
    colorPicker.classList.add("inactive");
  });

  colorPickers[activeColorIdx].classList.remove("active-color");

  colorPickers.forEach((colorPicker) => {
    colorPicker.removeEventListener("click", changeActiveColor);
  });
};

const changeActiveMarble = (e) => {
  const audio = new Audio("../audio/click.mp3");
  audio.play();

  marblePickers[activeMarbleIdx].classList.remove("active-marble-picker");
  activeMarble = e.target;
  activeMarbleIdx = activeMarble.marble_idx;

  activeMarble.classList.add("active-marble-picker");
};

const activateMarblePickers = () => {
  marblePickers.forEach((marblePicker) => {
    marblePicker.classList.remove("inactive");
  });

  marblePickers[activeMarbleIdx].classList.add("active-marble-picker");

  marblePickers.forEach((marblePicker) => {
    marblePicker.addEventListener("click", changeActiveMarble);
  });
};

const deactivateMarblePickers = () => {
  marblePickers.forEach((marblePicker) => {
    marblePicker.classList.add("inactive");
  });

  marblePickers[activeMarbleIdx].classList.remove("active-marble-picker");

  marblePickers.forEach((marblePicker) => {
    marblePicker.removeEventListener("click", changeActiveMarble);
  });
};

const updatePegHole = (e) => {
  const audio = new Audio("../audio/select.mp3");
  audio.play();

  let pegHole = e.target;
  pegHole.className = `ball b${activeColorIdx}`;
  sendPegHoleUpdate(pegHole.idx, activeColorIdx);

  // update the guess array
  guess[pegHole.idx % 4] = activeColorIdx;
};

const updateMarbleHole = (e) => {
  const audio = new Audio("../audio/select.mp3");
  audio.play();

  marbleHole = e.target;
  marbleHole.classList.remove(`red`);
  marbleHole.classList.remove(`white`);
  marbleHole.classList.add(`${marbleColors[activeMarbleIdx]}`);

  // update the feedback array
  feedback[marbleHole.idx % 4] = activeMarbleIdx;
};

const clearMarbleHole = (e) => {
  marbleHole = e.target;

  marbleHole.classList.remove(`red`);
  marbleHole.classList.remove(`white`);

  // update the feedback array
  feedback[marbleHole.idx % 4] = -1;
};

const activatePegHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.add(`active-column-r${role}`);

  const columnHoles = pegHoles.filter(
    (pegHole) => pegHole.column_idx === columnIdx
  );

  columnHoles.forEach((pegHole) => {
    pegHole.addEventListener("click", updatePegHole);
  });
};

const deactivatePegHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.remove(`active-column-r${role}`);

  const columnHoles = pegHoles.filter(
    (pegHole) => pegHole.column_idx === columnIdx
  );

  columnHoles.forEach((pegHole) => {
    pegHole.removeEventListener("click", updatePegHole);
  });
};

const activateMarbleHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.add(`active-column-r${role}`);

  const columnMarbleHoles = marbleHoles.filter(
    (marbleHole) => marbleHole.column_idx === columnIdx
  );

  columnMarbleHoles.forEach((marbleHole) => {
    marbleHole.addEventListener("click", updateMarbleHole);
    marbleHole.addEventListener("dblclick", clearMarbleHole);
  });
};

const deactivateMarbleHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.remove(`active-column-r${role}`);

  const columnMarbleHoles = marbleHoles.filter(
    (marbleHole) => marbleHole.column_idx === columnIdx
  );

  columnMarbleHoles.forEach((marbleHole) => {
    marbleHole.removeEventListener("click", updateMarbleHole);
    marbleHole.removeEventListener("dblclick", clearMarbleHole);
  });
};

const activateSecretColumn = () => {
  boardColumns[10].classList.add(`secret-active`);

  // get the pegHoles in the secert column
  const columnHoles = pegHoles.filter((pegHole) => pegHole.column_idx === 10);

  columnHoles.forEach((pegHole) => {
    pegHole.addEventListener("click", updateSecret);
  });
};

const deactivateSecretColumn = () => {
  boardColumns[10].classList.remove(`secret-active`);

  // get the pegHoles in the secert column
  const columnHoles = pegHoles.filter((pegHole) => pegHole.column_idx === 10);

  columnHoles.forEach((pegHole) => {
    pegHole.removeEventListener("click", updateSecret);
  });
};

const paintFeedback = (feedback) => {
  // feedback is a 4 elements int array (example: [1,2,0,5])
  feedback.forEach((marbleColor, idx) => {
    marbleHoleIdx = activeColumnIdx * 4 + idx;
    marbleHoles[marbleHoleIdx].classList.add(marbleColors[marbleColor]);
  });
};

const showErrormessage = (message) => {
  errorMessage.innerHTML = message;
  errorBanner.classList.remove("hide");
  errorBanner.classList.remove("animate__fadeOut");
  errorBanner.classList.add("animate__fadeIn");

  setTimeout(() => {
    errorBanner.classList.remove("animate__fadeIn");
    errorBanner.classList.add("animate__fadeOut");
  }, 2500);
};

const switchActiveIndicator = () => {
  activeSpan1.innerHTML.length == 0
    ? (activeSpan1.innerHTML = "*")
    : (activeSpan1.innerHTML = "");
  activeSpan2.innerHTML.length == 0
    ? (activeSpan2.innerHTML = "*")
    : (activeSpan2.innerHTML = "");
};

const addOneToScore = () => {
  if (gameIdx % 2 == 0) {
    scores[1]++;
    let CM_score = scores[1];
    const scoreStr = CM_score < 10 ? "0" + String(CM_score) : String(CM_score);
    score2.innerHTML = scoreStr;
  } else {
    scores[0]++;
    let CM_score = scores[0];
    const scoreStr = CM_score < 10 ? "0" + String(CM_score) : String(CM_score);
    score1.innerHTML = scoreStr;
  }
};

const prepareBoard = () => {
  secret = [-1, -1, -1, -1];
  guess = [-1, -1, -1, -1];
  feedback = [-1, -1, -1, -1];

  gameSpan.innerHTML = String(gameIdx + 1);

  if (role == 2) {
    // CODE MAKER
    activateColorPickers();
    activateSecretColumn();
    secretCodeColumn.classList.remove("hide");

    buttonFront.innerHTML = "Secret Ready";
    mainButton.addEventListener("click", notifySecretReady);

    hideWaitMessage();
  }

  if (role == 1) {
    // CODE BRAKER
    secretCodeCover.classList.remove("hide");
    mainButton.classList.add("hide");

    showWaitMessage("wait_secret");
  }

  roleSpan1.innerHTML = gameIdx % 2 == 0 ? "(CB)" : "(CM)";
  roleSpan2.innerHTML = gameIdx % 2 == 0 ? "(CM)" : "(CB)";

  activeSpan1.innerHTML = gameIdx % 2 == 0 ? "" : "*";
  activeSpan2.innerHTML = gameIdx % 2 == 0 ? "*" : "";
};

const nextGame = () => {
  resetBoard();
  gameIdx++;
  // switch roles
  role = role == 1 ? 2 : 1;

  mainButton.removeEventListener("click", nextGame);
  prepareBoard();
};

// SOCKET CONFIGURATIONS
const socket = io();

// GENERAL CONFIGURATIONS (BOTH SIDES)
socket.on("connect", () => {
  console.log("Connected to server!!");
  // connectionLabel.innerText = "Connected!!";
});

socket.on("disconnect", () => {
  console.log("Server disconnected =(");
  // connectionLabel.innerText = "Disconnected!!";
});

socket.emit("join-request", { sessionId }, ({ players }) => {
  if (!players) {
    console.log("problems joining the game-session");
    return;
  }

  const [player1, player2] = players;
  username1.innerHTML = player1;
  username2.innerHTML = player2;
  score1.innerHTML = "00";
  score2.innerHTML = "00";

  console.log("joined to game-session");
});

socket.on("test-emit", (payload) => {
  console.log("test arrived!!!");
});

// CODE-MAKER SIDE CONTROL

socket.on("peg-hole-update", (payload) => {
  const { pegHoleIdx, activeColorIdx } = payload;
  pegHoles[pegHoleIdx].className = `ball b${activeColorIdx}`;
  console.log(payload);
});

socket.on("feedback-request", ({ sessionId, activeColumnIdx }) => {
  switchActiveIndicator();

  const audio = new Audio("../audio/new-ticket.mp3");
  audio.play();

  console.log("request arrived...");
  activateMarblePickers();
  activateMarbleHoles(activeColumnIdx);

  buttonFront.innerHTML = "Send Feedback";

  hideWaitMessage();

  mainButton.classList.remove("hide");
  mainButton.addEventListener("click", sendFeedback);

  resetFeedback();
});

const updateSecret = (e) => {
  // what position we need to update??
  const audio = new Audio("../audio/select.mp3");
  audio.play();

  let positionIdx = e.target.idx % 4;
  secret[positionIdx] = activeColorIdx;
  e.target.className = `ball b${activeColorIdx}`;
};

const notifySecretReady = (e) => {
  if (secret.includes(-1)) {
    const audio = new Audio("../audio/error.mp3");
    audio.play();

    showErrormessage(
      "Your secret code is incomplete. Fill up the four peg holes."
    );

    return;
  }

  switchActiveIndicator();

  const audio = new Audio("../audio/click.mp3");
  audio.play();

  /* console.log(secret); */
  deactivateSecretColumn();
  deactivateColorPickers();

  socket.emit("secret-ready", { sessionId, secret });

  setTimeout(() => {
    // reset mainButton
    mainButton.classList.add("hide");
    mainButton.removeEventListener("click", notifySecretReady);

    showWaitMessage("wait_guess");
  }, 100);

  activeColumnIdx = 0;
  activateMarbleHoles(activeColumnIdx);
};

const sendFeedback = () => {
  const feedBackSum = feedback.reduce((total, marble_value) => {
    return total + (marble_value == -1 ? 0 : marble_value);
  }, 0);

  switchActiveIndicator();

  const audio = new Audio("../audio/click.mp3");
  audio.play();

  console.log(feedBackSum);
  console.log("sending feedback: ", feedback);
  socket.emit("feedback-response", { sessionId, feedback });

  const lastActiveColumnIdx = activeColumnIdx;
  activeColumnIdx++;

  deactivateMarblePickers();
  deactivateMarbleHoles(lastActiveColumnIdx);
  activateMarbleHoles(activeColumnIdx);

  if (feedBackSum < 4) {
    addOneToScore();
    setTimeout(() => {
      mainButton.removeEventListener("click", sendFeedback);
      mainButton.classList.add("hide");

      showWaitMessage("wait_guess");
    }, 100);
  } else if (feedBackSum === 4) {
    showErrormessage("Urray!!! You brake the secret code...");

    mainButton.removeEventListener("click", sendFeedback);
    buttonFront.innerHTML = "Start next game.";
    mainButton.addEventListener("click", nextGame);
    mainButton.classList.remove("hide");
  }
};

// CODE-BRAKER SIDE CONTROL
socket.on("secret-ready", (payload) => {
  switchActiveIndicator();

  const audio = new Audio("../audio/new-ticket.mp3");
  audio.play();

  console.log("secret ready");
  console.log(payload);

  activeColumnIdx = 0;

  activateColorPickers();
  activatePegHoles(0);

  hideWaitMessage();

  buttonFront.innerHTML = "Request Feedback";
  mainButton.classList.remove("hide");
  mainButton.addEventListener("click", requestFeedback);
});

socket.on("feedback-response", ({ sessionId, feedback }) => {
  switchActiveIndicator();

  const audio = new Audio("../audio/new-ticket.mp3");
  audio.play();

  console.log("feedback response ready:");
  console.log({ sessionId, feedback });

  const feedBackSum = feedback.reduce((total, marble_value) => {
    return total + (marble_value == -1 ? 0 : marble_value);
  }, 0);

  console.log("fs:", feedBackSum);

  paintFeedback(feedback);
  hideWaitMessage();

  if (feedBackSum < 4) {
    addOneToScore();
    const lastActiveColumnIdx = activeColumnIdx;
    activeColumnIdx++;

    deactivatePegHoles(lastActiveColumnIdx);
    activatePegHoles(activeColumnIdx);

    mainButton.classList.remove("hide");
    mainButton.addEventListener("click", requestFeedback);
  } else {
    showErrormessage("Code broken... Get ready for a new game.");

    secretCodeCover.classList.add("hide");
    secretCodeColumn.classList.remove("hide");

    buttonFront.innerHTML = "Start next game.";
    mainButton.addEventListener("click", nextGame);
    mainButton.classList.remove("hide");
  }
});

const sendPegHoleUpdate = (pegHoleIdx, activeColorIdx) => {
  socket.emit(
    "peg-hole-update",
    { sessionId, pegHoleIdx, activeColorIdx },
    ({ ok }) => {
      if (!ok) {
        console.log("problem sending update");
        return;
      }
      console.log("update sent");
    }
  );
};

const requestFeedback = () => {
  if (guess.includes(-1)) {
    const audio = new Audio("../audio/error.mp3");
    audio.play();

    showErrormessage("Your guess is incomplete. Fill up the four peg holes.");

    return;
  }

  switchActiveIndicator();

  const audio = new Audio("../audio/click.mp3");
  audio.play();

  socket.emit("feedback-request", { sessionId, activeColumnIdx });

  resetGuess();

  // reset mainButton (remove eventListener should be last)
  mainButton.classList.add("hide");
  mainButton.removeEventListener("click", requestFeedback);

  showWaitMessage("wait_feedback");
};

const showWaitMessage = (messageType) => {
  //waitMessageDiv.innerHTML = wait_messages[messageType];
  waitMessageContainer.classList.remove("hide");
};

const hideWaitMessage = () => {
  waitMessageContainer.classList.add("hide");
};

/* MODAL CONTROL */
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".close-modal");
const firstGameLegend = document.querySelector("#first-game-legend");

const legendPlayer1 =
  "On the first game you play CODEBRAKER and your friend plays CODEMAKER.";
const legendPlayer2 =
  "On the first game you play CODEMAKER and your friend plays CODEBRAKER.";
firstGameLegend.innerHTML = role == 1 ? legendPlayer1 : legendPlayer2;

const openModal = function () {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const closeModal = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

btnCloseModal.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  // console.log(e.key);
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

/* Initial settings */
prepareBoard();
openModal();
