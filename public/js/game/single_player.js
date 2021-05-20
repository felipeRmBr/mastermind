// SessionId and role
const getInitialParams = () => {
  const queryString = window.location.search;
  const sessionParams = new URLSearchParams(queryString);

  const sessionId = Number(sessionParams.get("session"));
  const username = sessionParams.get("username");

  return { sessionId, username };
};

const { sessionId, username } = getInitialParams();

const colors = ["blue", "yello", "green", "red", "white", "black"];
const marbleColors = ["white", "red"];

let soundActive = true;

let nGames = -1;
const currentRole = "CB"; // user always plays CB
let gameIdx = 0;
let activeColorIdx = 0;
let activeMarbleIdx = 0;
let activeColumnIdx = 0;
//let secret = [-1, -1, -1, -1];
let guess = [-1, -1, -1, -1];
let lastGuess = [-1, -1, -1, -1];
let feedback = [-1, -1, -1, -1];
let scores = [0, 0];

const sounds = {
  click: new Audio("../audio/click.mp3"),
  select: new Audio("../audio/select.mp3"),
  bell: new Audio("../audio/new-ticket.mp3"),
  error: new Audio("../audio/error.mp3"),
};

/*-----------------------------------------------------------------*/
/*--------------------- GENERAL GAME CONTROL ----------------------*/
/*-----------------------------------------------------------------*/

/* Pickers */
const colorPickers = document.querySelectorAll(".color-picker");
const marblePickers = document.querySelectorAll(".marble-picker");

/* Board Columns */
const boardColumns = document.querySelectorAll(".board-column");
const pegHoles = Array.from(document.querySelectorAll(".hole"));
const marbleHoles = Array.from(document.querySelectorAll(".marble-hole"));

const secretCodeColumn = document.querySelector("#secret-code");
const secretCodeCover = document.querySelector("#secret-cover");

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

/* Bottom elements*/

/* Button */
const buttoncontainer = document.querySelector("#button-container");
const mainButton = document.querySelector("#main-button");
const buttonFront = document.querySelector("#button-front");

/* Wait Indicator */
const waitIndicatorContainer = document.querySelector(
  "#wait-indicator-container"
);
const waitSpinner = document.querySelector("#wait-spinner");

/* Next game countdown */
const nextGameCountdown = document.querySelector("#next-game-countdown");
const countdown = document.querySelector("#countdown");

/*------------- MAIN FUNCTIONS --------------*/
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

const prepareBoard = () => {
  gameSpan.innerHTML = `GAME: ${gameIdx + 1}/${nGames}`;

  if (currentRole == "CB") {
    // CODE BRAKER
    secretCodeCover.classList.remove("hidden");
    showWaitIndicator();
  }

  if (currentRole == "CM") {
    // CODE MAKER
    activateColorPickers();
    activateSecretColumn();
    secretCodeColumn.classList.remove("hidden");

    buttonFront.innerHTML = "Secret Ready";
    mainButton.addEventListener("click", notifySecretReady);
    showButtonContainer();
  }

  roleSpan1.innerHTML = `(CB)`;
  roleSpan2.innerHTML = `(CM)`;
  activeSpan1.innerHTML = "";
  activeSpan2.innerHTML = "*";

  username1.innerHTML = username;
  username2.innerHTML = "MasterBot";
  score1.innerHTML = scores[0] < 9 ? "0" + String(scores[0]) : scores[0];
  score2.innerHTML = "--";

  // playerId=1 plays CB on even gameIdx (0 indexing)
  // playerId=2 plays CB on odd gameIdx (0 indexing)
  /* if (gameIdx % 2 == 0) {
    roleSpan1.innerHTML = `(CB)`;
    roleSpan2.innerHTML = `(CM)`;
    activeSpan1.innerHTML = "";
    activeSpan2.innerHTML = "*";
  } else if (gameIdx % 2 == 1) {
    roleSpan1.innerHTML = `(CM)`;
    roleSpan2.innerHTML = `(CB)`;
    activeSpan1.innerHTML = "*";
    activeSpan2.innerHTML = "";
  } */
};

const nextGame = () => {
  resetBoard();
  gameIdx++;

  prepareBoard();
  showBigBanner(
    `GAME ${gameIdx + 1}/${nGames}`,
    `Your current score: ${scores[0]}`
  );

  checkSecretReady();
};

const resetBoard = () => {
  activeColorIdx = 0;
  activeMarbleIdx = 0;
  activeColumnIdx = 0;
  secret = [-1, -1, -1, -1];
  guess = [-1, -1, -1, -1];
  feedback = [-1, -1, -1, -1];

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

  secretCodeColumn.className = "board-column secret hidden";
  secretCodeCover.className = "board-column secret hidden";

  waitIndicatorContainer.className = "bottom-container hidden";
  nextGameCountdown.className = "bottom-container next-game-countdown hidden";
  buttoncontainer.className = "bottom-container hidden";
};

const showFinalScore = () => {
  showBigBanner(
    `HERE IS THE FINAL SCORE`,
    `PLAYER 1: ${scores[0]} | PLAYER 2: ${scores[1]}"`
  );
};

const activateColorPickers = () => {
  colorPickers.forEach((colorPicker) => {
    colorPicker.classList.remove("inactive");
    colorPicker.classList.remove("active-color");
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

const activateMarblePickers = () => {
  marblePickers.forEach((marblePicker) => {
    marblePicker.classList.remove("inactive");
    marblePicker.classList.remove("active-marble-picker");
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

const changeActiveColor = (e) => {
  if (soundActive) sounds.click.play();

  colorPickers[activeColorIdx].classList.remove("active-color");
  colorPicker = e.target;
  activeColorIdx = colorPicker.color_idx;
  console.log(`Selected color: ${colors[activeColorIdx]}`);
  colorPicker.classList.add("active-color");
};

const changeActiveMarble = (e) => {
  if (soundActive) sounds.click.play();

  marblePickers[activeMarbleIdx].classList.remove("active-marble-picker");
  activeMarble = e.target;
  activeMarbleIdx = activeMarble.marble_idx;

  activeMarble.classList.add("active-marble-picker");
};

const activatePegHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.add(`active-column-r-${currentRole}`);

  const columnHoles = pegHoles.filter(
    (pegHole) => pegHole.column_idx === columnIdx
  );

  columnHoles.forEach((pegHole) => {
    pegHole.addEventListener("click", updatePegHole);
  });
};

const deactivatePegHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.remove(`active-column-r-${currentRole}`);

  const columnHoles = pegHoles.filter(
    (pegHole) => pegHole.column_idx === columnIdx
  );

  columnHoles.forEach((pegHole) => {
    pegHole.removeEventListener("click", updatePegHole);
  });
};

const activateMarbleHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.add(`active-column-r-${currentRole}`);

  const columnMarbleHoles = marbleHoles.filter(
    (marbleHole) => marbleHole.column_idx === columnIdx
  );

  columnMarbleHoles.forEach((marbleHole) => {
    marbleHole.addEventListener("click", updateMarbleHole);
    marbleHole.addEventListener("dblclick", clearMarbleHole);
  });
};

const deactivateMarbleHoles = (columnIdx) => {
  boardColumns[columnIdx].classList.remove(`active-column-r-${currentRole}`);

  const columnMarbleHoles = marbleHoles.filter(
    (marbleHole) => marbleHole.column_idx === columnIdx
  );

  columnMarbleHoles.forEach((marbleHole) => {
    marbleHole.removeEventListener("click", updateMarbleHole);
    marbleHole.removeEventListener("dblclick", clearMarbleHole);
  });
};

const updatePegHole = (e) => {
  if (soundActive) sounds.select.play();
  let pegHole = e.target;
  pegHole.className = `ball b${activeColorIdx}`;
  sendPegHoleUpdate(pegHole.idx, activeColorIdx);

  // update the guess array
  guess[pegHole.idx % 4] = activeColorIdx;
};

const updateMarbleHole = (e) => {
  if (soundActive) sounds.select.play();

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

const paintSecret = (secret) => {
  for (const [idx, colorIdx] of secret.entries()) {
    pegHoles[idx + 40].className = `ball b${colorIdx}`;
  }
};

const showWaitIndicator = () => {
  waitIndicatorContainer.classList.remove("hidden");
};

const hideWaitIndicator = () => {
  waitIndicatorContainer.classList.add("hidden");
};

const showButtonContainer = () => {
  buttoncontainer.classList.remove("hidden");
};

const hideButtonContainer = () => {
  buttoncontainer.classList.add("hidden");
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

const startNextGameCountdown = () => {
  nextGameCountdown.classList.remove("hidden");
  updateCountdown(5);
};

const updateCountdown = (n) => {
  countdown.classList.add("hidden");
  countdown.innerHTML = n;
  countdown.classList.remove("hidden");
  countdown.classList.remove("animate__zoomIn");
  countdown.classList.add("animate__zoomIn");

  if (n >= 2) {
    setTimeout(() => {
      updateCountdown(n - 1);
    }, 1000);
  } else {
    setTimeout(() => {
      nextGame();
    }, 1000);
  }
};

const animateCSS = (node, animation, prefix = "animate__") => {
  // We create a Promise and return it
  return new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;

    node.classList.add("animate__animated", animationName, "animate__faster");

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });
};

const resetFeedback = () => (feedback = [-1, -1, -1, -1]);
const resetGuess = () => (guess = [-1, -1, -1, -1]);

/*-----------------------------------------------------------------*/
/* ----------  MODAL, BIG BANNER & ERR MESSAGE CONTROL  ---------- */
/*-----------------------------------------------------------------*/

/* Modal Screen */
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".close-modal");

/* Big Banner */
const bigBanner = document.querySelector("#big-banner");
const bbGameCounter = document.querySelector("#big-banner-counter");
const bbRoleLegend = document.querySelector("#big-banner-role-legend");

/* Error banner */
const errorBanner = document.querySelector("#error-banner");
const errorMessage = document.querySelector("#error-message");

const showBigBanner = function (mainTitle, secondaryTitle) {
  return new Promise((resolve, reject) => {
    bbGameCounter.innerHTML = mainTitle;
    bbRoleLegend.innerHTML = secondaryTitle;

    overlay.classList.remove("hidden");
    bigBanner.classList.remove("hidden");
    animateCSS(bigBanner, "fadeIn").then((message) => {
      setTimeout(() => {
        animateCSS(bigBanner, "fadeOut").then((message) => {
          bigBanner.classList.add("hidden");
          overlay.classList.add("hidden");
          resolve("BIG BANNER HIDDEN");
        });
      }, 2000);
    });
  });
};

const openModal = function () {
  document.addEventListener("keydown", handleScapePress);
  btnCloseModal.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

const handleScapePress = (e) => {
  // console.log(e.key);
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
};

const closeModal = function () {
  overlay.removeEventListener("click", closeModal);
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const showErrormessage = (message) => {
  errorMessage.innerHTML = message;
  errorBanner.classList.remove("hidden");
  errorBanner.classList.remove("animate__fadeOut");
  errorBanner.classList.add("animate__fadeIn");

  setTimeout(() => {
    errorBanner.classList.remove("animate__fadeIn");
    errorBanner.classList.add("animate__fadeOut");
  }, 2500);
};

/*-----------------------------------------------------------------*/
/* -----------   SOCKET CONFIGURATIONS AND CONTROL   ------------- */
/*-----------------------------------------------------------------*/

const socket = io();

/* General Configurations (BOTH SIDES) */
socket.on("connect", () => {
  console.log("Connected to server!!");
  // connectionLabel.innerText = "Connected!!";
});

socket.on("disconnect", () => {
  console.log("Server disconnected =(");
  // connectionLabel.innerText = "Disconnected!!";
});

/* socket.emit("join-request", { sessionId }, ({ players }) => {
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
 */

socket.on("test-emit", (payload) => {
  console.log("test arrived!!!");
});

// CODE-BRAKER SIDE CONTROL
socket.on("secret-ready", (payload) => {
  switchActiveIndicator();

  if (soundActive) sounds.bell.play();

  console.log("secret ready");
  console.log(payload);

  activeColumnIdx = 0;

  activateColorPickers();
  activatePegHoles(0);

  buttonFront.innerHTML = "Request Feedback";
  mainButton.addEventListener("click", requestFeedback);

  hideWaitIndicator();
  showButtonContainer();
});

socket.on("feedback-response", ({ feedback, secret, score }) => {
  if (soundActive) sounds.bell.play();

  paintFeedback(feedback);
  hideWaitIndicator();

  const feedBackSum = feedback.reduce((total, marble_value) => {
    return total + (marble_value == -1 ? 0 : marble_value);
  }, 0);

  if (feedBackSum < 4) {
    // the code is still unbroken
    // are there more guesses available?
    if (activeColumnIdx < 9) {
      // still have guesses
      switchActiveIndicator();

      const lastActiveColumnIdx = activeColumnIdx;
      activeColumnIdx++;

      deactivatePegHoles(lastActiveColumnIdx);
      activatePegHoles(activeColumnIdx);

      mainButton.addEventListener("click", requestFeedback);
      showButtonContainer();
    } else {
      // The ten guesses were used
      mainButton.removeEventListener("click", sendFeedback);
      hideButtonContainer();

      // show the secret code
      paintSecret(secret);
      secretCodeCover.classList.add("hidden");
      secretCodeColumn.classList.remove("hidden");

      // are there more games to play?
      if (gameIdx < nGames - 1) {
        // there are still games to play
        showBigBanner(
          `You used your ten guesses =(`,
          `Launching next game...`
        ).then((message) => {
          startNextGameCountdown();
        });
      } else if (gameIdx == nGames - 1) {
        // the match is over
        showBigBanner(
          `You used your ten guesses =(`,
          `The match is over, and your final score is ${scores[0]}`
        ).then((message) => showFinalScore());
      }
    }
  } else if (feedBackSum === 4) {
    // the code is broken
    console.log(score);
    scores[0] += score;

    score1.innerHTML = scores[0];

    paintSecret(secret);

    mainButton.removeEventListener("click", sendFeedback);
    hideButtonContainer();

    secretCodeCover.classList.add("hidden");
    secretCodeColumn.classList.remove("hidden");

    // are there more games to play?
    if (gameIdx < nGames - 1) {
      // there are still games to play
      showBigBanner(
        `WELL DONE!!! YOU BROKE THE CODE.`,
        `Launching next game...`
      ).then((message) => startNextGameCountdown());
    } else if (gameIdx == nGames - 1) {
      // the match is over
      showBigBanner(
        `WELL DONE!!! YOU BROKE THE CODE.`,
        `The match is over, and your final score is ${scores[0]}`
      ).then((message) => showFinalScore());
    }
  }
});

const makeFirstContact = () => {
  socket.emit("first-contact", { sessionId }, ({ ok, nGamesResponse }) => {
    if (ok) {
      console.log("session found!!!!");
      nGames = nGamesResponse;
      return;
    } else {
      console.log("session not found");
    }
  });
};

const checkSecretReady = () => {
  socket.emit("check-secret-ready", { sessionId }, ({ ok }) => {
    if (!ok) {
      console.log("check in progress");
      return;
    }
    console.log("problem on check");
  });
};

const sendPegHoleUpdate = (pegHoleIdx, activeColorIdx) => {
  socket.emit(
    "peg-hole-update-single",
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
    if (soundActive) sounds.error.play();

    showErrormessage("Your guess is incomplete. Fill up the four peg holes.");

    return;
  }

  switchActiveIndicator();

  if (soundActive) sounds.click.play();

  socket.emit("feedback-request-single", { sessionId, guess, activeColumnIdx });

  resetGuess();

  // reset mainButton (remove eventListener should be last)
  mainButton.removeEventListener("click", requestFeedback);
  hideButtonContainer();
};

/*-----------------------------------------------------------------*/
/* ---------------------   INITIAL SETTINGS  --------------------- */
/*-----------------------------------------------------------------*/
initializeElements();
makeFirstContact();
prepareBoard();
showBigBanner(`GAME ${gameIdx + 1}/${nGames}`, `You play ${"CODEBRAKER"}`);

checkSecretReady();

// CODE-MAKER SIDE CONTROL
//

// socket.on("peg-hole-update", (payload) => {
//   const { pegHoleIdx, activeColorIdx } = payload;
//   pegHoles[pegHoleIdx].className = `ball b${activeColorIdx}`;
//   console.log(payload);
// });

// socket.on("feedback-request", ({ sessionId, activeColumnIdx }) => {
//   switchActiveIndicator();

//   const audio = new Audio("../audio/new-ticket.mp3");
//   audio.play();

//   console.log("request arrived...");
//   activateMarblePickers();
//   activateMarbleHoles(activeColumnIdx);

//   buttonFront.innerHTML = "Send Feedback";
//   mainButton.classList.remove("hidden");
//   mainButton.addEventListener("click", sendFeedback);

//   resetFeedback();

//   hideWaitIndicator();
//   showButtonContainer();
// });

// const updateSecret = (e) => {
//   // what position we need to update??
//   const audio = new Audio("../audio/select.mp3");
//   audio.play();

//   let positionIdx = e.target.idx % 4;
//   secret[positionIdx] = activeColorIdx;
//   e.target.className = `ball b${activeColorIdx}`;
// };

// const notifySecretReady = (e) => {
//   if (secret.includes(-1)) {
//     const audio = new Audio("../audio/error.mp3");
//     audio.play();

//     showErrormessage(
//       "Your secret code is incomplete. Fill up the four peg holes."
//     );

//     return;
//   }

//   switchActiveIndicator();

//   const audio = new Audio("../audio/click.mp3");
//   audio.play();

//   /* console.log(secret); */
//   deactivateSecretColumn();
//   deactivateColorPickers();

//   socket.emit("secret-ready", { sessionId, secret });

//   setTimeout(() => {
//     // reset mainButton
//     mainButton.classList.add("hidden");
//     mainButton.removeEventListener("click", notifySecretReady);

//     hideButtonContainer();
//     showWaitIndicator();
//   }, 100);

//   activeColumnIdx = 0;
//   activateMarbleHoles(activeColumnIdx);
// };

// const sendFeedback = () => {
//   const feedBackSum = feedback.reduce((total, marble_value) => {
//     return total + (marble_value == -1 ? 0 : marble_value);
//   }, 0);

//   const audio = new Audio("../audio/click.mp3");
//   audio.play();

//   socket.emit("feedback-response", { sessionId, feedback, secret });

//   if (feedBackSum < 4) {
//     addOneToScore();
//     // are there more guesses available?
//     if (activeColumnIdx < 9) {
//       // there are still more guesses
//       switchActiveIndicator();

//       const lastActiveColumnIdx = activeColumnIdx;
//       activeColumnIdx++;

//       setTimeout(() => {
//         deactivateMarblePickers();
//         deactivateMarbleHoles(lastActiveColumnIdx);
//         activateMarbleHoles(activeColumnIdx);

//         mainButton.removeEventListener("click", sendFeedback);
//         hideButtonContainer();

//         showWaitIndicator();
//       }, 100);
//     } else if (activeColumnIdx === 9) {
//       // The ten guesses were used
//       mainButton.removeEventListener("click", sendFeedback);
//       hideButtonContainer();

//       showBigBanner(`CODE BROKEN`, `Launching next game...`).then((message) =>
//         startNextGameCountdown()
//       );
//       // are there more games to play?
//       if (gameIdx < nGames - 1) {
//         // there are still games to play
//         showBigBanner(
//           `GREAT!!! YOUR CODE WENT ALL THE GAME SECRET.`,
//           `Launching next game...`
//         ).then((message) => startNextGameCountdown());
//       } else if (gameIdx == nGames - 1) {
//         // the match is over
//         showBigBanner(
//           `GREAT!!! YOUR CODE WENT ALL THE GAME SECRET.`,
//           `The match is over, and we have a ${
//             scores[0] == scores[1] ? "draw" : "winner."
//           }`
//         ).then((message) => showFinalScore());
//       }
//     }
//   } else if (feedBackSum === 4) {
//     mainButton.removeEventListener("click", sendFeedback);
//     hideButtonContainer();

//     // are there more games to play?
//     if (gameIdx < nGames - 1) {
//       // there are still games to play
//       showBigBanner(
//         `CRAPS!!! YOUR CODE HAS BEEN DISCOVERED`,
//         `Launching next game...`
//       ).then((message) => startNextGameCountdown());
//     } else if (gameIdx == nGames - 1) {
//       // the match is over
//       showBigBanner(
//         `CRAPS!!! YOUR CODE HAS BEEN DISCOVERED`,
//         `The match is over, and we have a ${
//           scores[0] == scores[1] ? "draw" : "winner."
//         }`
//       ).then((message) => showFinalScore());
//     }
//   }
// };
