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

const changeActiveColor = (e) => {
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
  let pegHole = e.target;
  pegHole.className = `ball b${activeColorIdx}`;
  sendPegHoleUpdate(pegHole.idx, activeColorIdx);

  // update the guess array
  guess[pegHole.idx % 4] = activeColorIdx;
};

const updateMarbleHole = (e) => {
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

const prepareBoard = () => {
  if (role == 2) {
    // CODE MAKER
    activateColorPickers();
    activateSecretColumn();
    secretCodeColumn.classList.remove("hide");

    buttonFront.innerHTML = "SECRET READY";
    mainButton.addEventListener("click", notifySecretReady);
  }

  if (role == 1) {
    // CODE MAKER
    secretCodeCover.classList.remove("hide");
    mainButton.classList.add("hide");
  }
};

// SOCKET CONFIGURATIONS
const socket = io();

// const prepareSocketListeners(socket){

// }
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
  console.log("request arrived...");
  activateMarblePickers();
  activateMarbleHoles(activeColumnIdx);

  buttonFront.innerHTML = "Send Feedback";
  mainButton.classList.remove("hide");
  mainButton.addEventListener("click", sendFeedback);
  //mainButton.classList.remove("hide");
});

const updateSecret = (e) => {
  // what position we need to update??
  let positionIdx = e.target.idx % 4;
  secret[positionIdx] = activeColorIdx;
  e.target.className = `ball b${activeColorIdx}`;
};

const notifySecretReady = (e) => {
  console.log(secret);
  deactivateSecretColumn();
  deactivateColorPickers();

  mainButton.removeEventListener("click", notifySecretReady);
  mainButton.classList.add("hide");
  socket.emit("secret-ready", { sessionId, secret });
};

const sendFeedback = () => {
  console.log("sending feedback: ", feedback);
  socket.emit("feedback-response", { sessionId, feedback });

  deactivateMarblePickers();
  deactivateMarbleHoles(activeColumnIdx);
  activeColumnIdx++;
  mainButton.removeEventListener("click", sendFeedback);
  mainButton.classList.add("hide");
};

// CODE CRACKER SIDE
socket.on("secret-ready", (payload) => {
  console.log("secret ready");
  console.log(payload);

  activeColumnIdx = 0;

  activateColorPickers();
  activatePegHoles(0);

  buttonFront.innerHTML = "Request Feedback";
  mainButton.classList.remove("hide");
  mainButton.addEventListener("click", requestFeedback);
});

socket.on("feedback-response", ({ sessionId, feedback }) => {
  console.log("feedback response ready:");
  console.log({ sessionId, feedback });

  feedback.forEach((marbleColor, idx) => {
    marbleHoleIdx = activeColumnIdx * 4 + idx;
    marbleHoles[marbleHoleIdx].classList.add(marbleColors[marbleColor]);
  });

  activeColumnIdx++;
  activatePegHoles(activeColumnIdx);

  mainButton.classList.remove("hide");
  //mainButton.addEventListener("click", requestFeedback);
  //buttonFront.innerHTML = "Request Feedback";
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
    alert("Your guess is incomplete, fill the the four peg holes.");
    return;
  }

  deactivatePegHoles(activeColumnIdx);
  socket.emit("feedback-request", { sessionId, activeColumnIdx });

  mainButton.classList.add("hide");
  guess = [-1, -1, -1, -1];
  //mainButton.removeEventListener("click", requestFeedback);
};

// SECRET-SETTING LOGIC

// code-cracker side
socket.on("feedback-move-notification", (payload) => {
  // const { marbleHoleIdx, activeMarbleIdx } = payload;
  // marbleHoles[marbleHoleIdx].className = `ball b${activeColorIdx}`;
  console.log(payload);
});

prepareBoard();
