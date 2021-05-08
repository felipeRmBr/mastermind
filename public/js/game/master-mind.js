const getInitialParams = (queryString) => {
  const sessionParams = new URLSearchParams(queryString);

  const sessionId = Number(sessionParams.get("session"));
  const role = Number(sessionParams.get("player"));

  return { sessionId, role };
};

const buttonClicked = (e) => {
  console.log("Button Clicked!!!");
};

// class MainButton {
//   constructor(document) {
//     const mainButton = document.querySelector("#main-button");
//     mainButton.addEventListener("click", buttonClicked);
//   }
// }

// SessionId and role
const queryString = window.location.search;
let { sessionId, role } = getInitialParams(queryString);

const colors = ["blue", "yello", "green", "red", "white", "black"];
const marbleColors = ["red", "white"];

const [username1, username2] = ["Felipe", "Jacob"];
const wait_messages = {
  wait_secret: `${username2} is gettign the secret code ready.`,
  wait_feedback: `${username2} is preparing your feedback.`,
  wait_guess: `Wait for ${username1}'s guess to be ready.`,
};

let activeColorIdx = 0;
let activeMarbleIdx = 0;
let activeColumnIdx = 0;
let secret = [-1, -1, -1, -1];
let guess = [-1, -1, -1, -1];
let feedback = [-1, -1, -1, -1];

const colorPickers = document.querySelectorAll(".color-picker");
const marblePickers = document.querySelectorAll(".marble-picker");

const boardColumns = document.querySelectorAll(".board-column");
const pegHoles = Array.from(document.querySelectorAll(".hole"));
const marbleHoles = Array.from(document.querySelectorAll(".marble-hole"));

const secretCodeColumn = document.querySelector("#secret-code");
const secretCodeCover = document.querySelector("#secret-cover");

const mainButton = document.querySelector("#main-button");
const buttonFront = document.querySelector("#button-front");
const waitMessageDiv = document.querySelector("#wait-message-div");
const waitSpinner = document.querySelector("#wait-spinner");

const waitMessageContainer = document.querySelector("#wait-message-container");

const errorBanner = document.querySelector("#error-banner");
const errorMessage = document.querySelector("#error-message");

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

// HELPERS ---------------------------------
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

const prepareBoard = () => {
  secret = [-1, -1, -1, -1];
  guess = [-1, -1, -1, -1];
  feedback = [-1, -1, -1, -1];

  if (role == 2) {
    // CODE MAKER
    activateColorPickers();
    activateSecretColumn();
    secretCodeColumn.classList.remove("hide");

    buttonFront.innerHTML = "SECRET READY";
    mainButton.addEventListener("click", notifySecretReady);

    hideWaitMessage();
  }

  if (role == 1) {
    // CODE MAKER
    secretCodeCover.classList.remove("hide");
    mainButton.classList.add("hide");

    showWaitMessage("wait_secret");
  }
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

socket.emit("join-request", { sessionId }, ({ ok }) => {
  if (!ok) {
    console.log("problems joining the game-session");
    return;
  }
  console.log("joined to game-session");
});

socket.on("test-emit", (payload) => {
  console.log("test arrived!!!");
});

// CODE-MAKER SIDE

socket.on("peg-hole-update", (payload) => {
  const { pegHoleIdx, activeColorIdx } = payload;
  pegHoles[pegHoleIdx].className = `ball b${activeColorIdx}`;
  console.log(payload);
});

socket.on("feedback-request", ({ sessionId, activeColumnIdx }) => {
  const audio = new Audio("../audio/new-ticket.mp3");
  audio.play();

  console.log("request arrived...");
  activateMarblePickers();
  activateMarbleHoles(activeColumnIdx);

  buttonFront.innerHTML = "Send Feedback";

  hideWaitMessage();

  mainButton.classList.remove("hide");
  mainButton.addEventListener("click", sendFeedback);
  //mainButton.classList.remove("hide");
});

const updateSecret = (e) => {
  // what position we need to update??
  const audio = new Audio("../audio/clack1.mp3");
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

  const audio = new Audio("../audio/click.mp3");
  audio.play();

  console.log(secret);
  deactivateSecretColumn();
  deactivateColorPickers();

  socket.emit("secret-ready", { sessionId, secret });

  setTimeout(() => {
    // reset mainButton
    mainButton.classList.add("hide");
    mainButton.removeEventListener("click", notifySecretReady);

    showWaitMessage("wait_guess");
  }, 100);
};

const sendFeedback = () => {
  const audio = new Audio("../audio/click.mp3");
  audio.play();

  console.log("sending feedback: ", feedback);
  socket.emit("feedback-response", { sessionId, feedback });

  deactivateMarblePickers();
  deactivateMarbleHoles(activeColumnIdx);
  activeColumnIdx++;

  setTimeout(() => {
    mainButton.removeEventListener("click", sendFeedback);
    mainButton.classList.add("hide");

    showWaitMessage("wait_guess");
  }, 100);
};

// CODE CRACKER SIDE
socket.on("secret-ready", (payload) => {
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
  const audio = new Audio("../audio/new-ticket.mp3");
  audio.play();

  console.log("feedback response ready:");
  console.log({ sessionId, feedback });

  paintFeedback(feedback);

  activeColumnIdx++;
  activatePegHoles(activeColumnIdx);

  hideWaitMessage();

  mainButton.classList.remove("hide");
  mainButton.addEventListener("click", requestFeedback);
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

  const audio = new Audio("../audio/click.mp3");
  audio.play();

  deactivatePegHoles(activeColumnIdx);
  socket.emit("feedback-request", { sessionId, activeColumnIdx });

  resetGuess();

  // reset mainButton (remove eventListener should be last)
  mainButton.classList.add("hide");
  mainButton.removeEventListener("click", requestFeedback);

  showWaitMessage("wait_feedback");
};

const showWaitMessage = (messageType) => {
  waitMessageDiv.innerHTML = wait_messages[messageType];
  waitMessageContainer.classList.remove("hide");
};

const hideWaitMessage = () => {
  waitMessageContainer.classList.add("hide");
};

const resetGuess = () => (guess = [-1, -1, -1, -1]);

prepareBoard();
