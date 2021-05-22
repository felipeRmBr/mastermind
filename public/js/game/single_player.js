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
let duplicatesAllowed = undefined;
let blanksAllowed = undefined;

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
  click: new Audio("../assets/audio/click.mp3"),
  select: new Audio("../assets/audio/select.mp3"),
  bell: new Audio("../assets/audio/new-ticket.mp3"),
  error: new Audio("../assets/audio/error.mp3"),
};

/*-----------------------------------------------------------------*/
/*--------------------- GENERAL GAME CONTROL ----------------------*/
/*-----------------------------------------------------------------*/
const mainContainer = document.querySelector("#main-container");

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

const soundControl = document.querySelector("#sound-control");
const helpButton = document.querySelector("#help-button");
const homeButton = document.querySelector("#home-button");

/*------------- MAIN FUNCTIONS --------------*/
const initializeElements = () => {
  homeButton.addEventListener("click", () => {
    window.location = `main-options.html`;
  });

  helpButton.addEventListener("click", () => {
    openModal();
  });

  soundControl.addEventListener("click", () => {
    soundActive = !soundActive;
    if (soundActive) sounds.select.play();

    soundControl.classList.remove("fa-volume-up", "fa-volume-off");
    soundControl.classList.add(soundActive ? "fa-volume-up" : "fa-volume-off");
  });

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
  document.querySelector("#buttons-container").classList.remove("hidden");
  mainContainer.classList.remove("hidden");
  gameSpan.innerHTML = `GAME: ${gameIdx + 1}`;

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
  showBigBanner(`GAME ${gameIdx + 1}`, `Your current score: ${scores[0]}`);

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

  waitIndicatorContainer.className = "hidden";
  nextGameCountdown.className = "next-game-countdown hidden";
  buttoncontainer.className = "hidden";
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

const setColumnFocus = (columnIdx) => {
  boardColumns[columnIdx].classList.add("on-focus");
};

const removeColumnFocus = (columnIdx) => {
  boardColumns[columnIdx].classList.remove("on-focus");
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
  if (!duplicatesAllowed && guess.includes(activeColorIdx)) {
    showErrormessage("Remember that duplicates are not allowed.");
    return;
  }

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

const showSecretColum = () => {
  secretCodeCover.classList.add("hidden");
  secretCodeColumn.classList.remove("hidden");
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
    node.classList.add("animate__animated", animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove("animate__animated", animationName);
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

/* Overlay */
const overlay = document.querySelector(".overlay");

/* Modal Screen */
const modal = document.querySelector(".modal");
const btnCloseModal = document.querySelector(".close-modal");

const helpContainers = document.querySelectorAll(".help");
const helpArrowLeft = document.querySelector("#help-arrow-left");
const helpArrowRight = document.querySelector("#help-arrow-right");

/* Big Banner */
const bigBanner = document.querySelector("#big-banner");
const bbMainTitle = document.querySelector("#big-banner-main-title");
const bbSecondaryTitle = document.querySelector("#big-banner-secondary-title");
const bbSpinner = document.querySelector("#wait-spinner");

/* Loading page indicator */
const loadingPageIndicator = document.querySelector("#loading-page-indicator");

/* Error banner */
const errorBanner = document.querySelector("#error-banner");
const errorMessage = document.querySelector("#error-message");

let activeHelp = 0;
let leftActive = false;
let rightACtive = true;

const updateHelpArrowsState = (activeHelp) => {
  helpArrowLeft.className = "fa fa-chevron-left active";
  helpArrowRight.className = "fa fa-chevron-right active";

  leftActive = true;
  rightACtive = true;

  if (activeHelp == 0) {
    helpArrowLeft.classList.remove("active");
    leftActive = false;
    return;
  }

  if (activeHelp == helpContainers.length - 1) {
    helpArrowRight.classList.remove("active");
    rightACtive = false;
    return;
  }
};

const helpLeft = () => {
  if (leftActive) {
    console.log("running helpLeft");
    animateCSS(helpContainers[activeHelp], "fadeOut").then((_) => {
      helpContainers[activeHelp].classList.add("hidden");
      activeHelp--;
      updateHelpArrowsState(activeHelp);

      helpContainers[activeHelp].classList.remove("hidden");
      animateCSS(helpContainers[activeHelp], "fadeIn");
    });
  }
};

const helpRight = () => {
  if (rightACtive) {
    console.log("running helpRight");
    animateCSS(helpContainers[activeHelp], "fadeOut").then((_) => {
      helpContainers[activeHelp].classList.add("hidden");
      activeHelp++;
      updateHelpArrowsState(activeHelp);

      helpContainers[activeHelp].classList.remove("hidden");
      animateCSS(helpContainers[activeHelp], "fadeIn");
    });
  }
};

helpArrowLeft.addEventListener("click", helpLeft);
helpArrowRight.addEventListener("click", helpRight);

const showBigBanner = function (mainTitle, secondaryTitle) {
  return new Promise((resolve, reject) => {
    bbMainTitle.innerHTML = mainTitle;
    bbSecondaryTitle.innerHTML = secondaryTitle;

    overlay.classList.remove("hidden");
    bigBanner.classList.remove("hidden");

    animateCSS(bigBanner, "fadeIn").then((_) => {
      setTimeout(() => {
        animateCSS(overlay, "fadeOut");
        animateCSS(bigBanner, "fadeOut").then((_) => {
          bigBanner.classList.add("hidden");
          overlay.classList.add("hidden");
          resolve("BIG BANNER HIDDEN");
        });
      }, 2500);
    });
  });
};

const showLoadingBanner = function () {
  return new Promise((resolve, reject) => {
    overlay.classList.add("solid");
    overlay.classList.remove("hidden");

    animateCSS(overlay, "fadeIn").then((message) => {
      loadingPageIndicator.classList.remove("hidden");
      animateCSS(loadingPageIndicator, "fadeIn").then((message) => {
        setTimeout(() => {
          resolve("LOADING banner on place!!!");
        }, 5000);
      });
    });
  });
};

const hideLoadingBanner = function (mainTitle, secondaryTitle, style) {
  return new Promise((resolve, reject) => {
    animateCSS(loadingPageIndicator, "fadeOut").then((_) => {
      loadingPageIndicator.classList.add("hidden");
      animateCSS(overlay, "fadeOut").then((_) => {
        overlay.classList.add("hidden");
        overlay.classList.remove("solid");
        resolve("Loading Banner is hidden.");
      });
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

  resetGuess();
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

      removeColumnFocus(lastActiveColumnIdx);
      setColumnFocus(activeColumnIdx);

      activatePegHoles(activeColumnIdx);

      mainButton.addEventListener("click", requestFeedback);
      showButtonContainer();
    } else {
      // The ten guesses were used
      console.log(score);
      scores[0] += score;

      score1.innerHTML = scores[0] > 9 ? scores[0] : "0" + String(scores[0]);

      mainButton.removeEventListener("click", requestFeedback);
      hideButtonContainer();

      // show the secret code
      paintSecret(secret);
      secretCodeCover.classList.add("hidden");
      secretCodeColumn.classList.remove("hidden");

      showBigBanner(
        `You used your ten guesses =(`,
        `Launching next game...`
      ).then((message) => {
        startNextGameCountdown();
      });

      // are there more games to play?
      /* if (gameIdx < nGames - 1) {
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
      } */
    }
  } else if (feedBackSum === 4) {
    // the code is broken
    console.log(score);
    scores[0] += score;

    score1.innerHTML = scores[0] > 9 ? scores[0] : "0" + String(scores[0]);

    paintSecret(secret);
    showSecretColum();

    showBigBanner(
      `WELL DONE!!! YOU BROKE THE CODE.`,
      `Launching next game...`
    ).then((message) => startNextGameCountdown());
  }
});

const makeFirstContact = () => {
  return new Promise((resolve, reject) => {
    socket.emit(
      "first-contact",
      { sessionId },
      ({ ok, allowDuplicates, allowBlanks }) => {
        if (ok) {
          duplicatesAllowed = allowDuplicates;
          blanksAllowed = allowBlanks;
          resolve("First contact succesfull");
        } else {
          resolve("First contact error!!");
        }
      }
    );
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
  const guessWithDuplicates = (guess) => {
    let colorsCount = [0, 0, 0, 0, 0, 0];
    guess.forEach((value) => {
      colorsCount[value]++;
    });

    if (Math.max(colorsCount) > 1) return true;
    else return false;
  };

  if (!duplicatesAllowed && guessWithDuplicates(guess)) {
    if (soundActive) sounds.error.play();
    showErrormessage(
      "Remember that duplicates are not allowed. Fix your guess."
    );
    return;
  }

  if (!blanksAllowed && guess.includes(-1)) {
    if (soundActive) sounds.error.play();
    showErrormessage(
      "Your guess shuldn't have blanks. Fill up the four peg holes."
    );
    return;
  }

  switchActiveIndicator();

  if (soundActive) sounds.click.play();

  deactivatePegHoles(activeColumnIdx);
  socket.emit("feedback-request-single", { sessionId, guess, activeColumnIdx });

  // reset mainButton (remove eventListener should be last)
  mainButton.removeEventListener("click", requestFeedback);
  hideButtonContainer();
};

/*-----------------------------------------------------------------*/
/* ---------------------   INITIAL SETTINGS  --------------------- */
/*-----------------------------------------------------------------*/

(async () => {
  /* let showLoadingResponse = await showLoadingBanner();
  console.log(showLoadingResponse); */

  initializeElements();

  let firstContactResponse = await makeFirstContact();
  console.log(firstContactResponse);

  prepareBoard();

  /* let hideLoadingResponse = await hideLoadingBanner();
  console.log(hideLoadingResponse); */

  overlay.classList.remove("solid");
  let bannerResponse = showBigBanner(
    `GAME ${gameIdx + 1}`,
    `You play ${"CODEBRAKER"}. START YOUR GUESSING.`
  );

  console.log(bannerResponse);

  checkSecretReady();
})();

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
