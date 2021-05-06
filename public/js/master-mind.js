// SessionId and role
const queryString = window.location.search;
console.log(queryString);
const sessionParams = new URLSearchParams(queryString);

// other variables
const sessionId = Number(sessionParams.get("session"));
const role = Number(sessionParams.get("player"));

const colors = ["blue", "yello", "green", "red", "white", "black"];
let activeColorIdx = 0;

const marbleColors = ["red", "white"];
let activeMarbleColor = 0;

let activeColumnIdx = 0;

const colorPickers = document.querySelectorAll(".color-picker");
const marblePickers = document.querySelectorAll(".marble-picker");

const boardColumns = document.querySelectorAll(".board-column");
const ballSpaces = Array.from(document.querySelectorAll(".hole"));
const marbleSpaces = Array.from(document.querySelectorAll(".marble-hole"));

const secretCode = document.querySelector("#secret-code");
const secretCover = document.querySelector("#secret-cover");

const mainButton = document.querySelector("#main-button");

// controllers
colorPickers.forEach((colorPicker, idx) => {
  // initialize the idx of the colorPicker elements
  colorPicker["color_idx"] = idx;

  if (role == 1) {
    // role 1 -> code bracker
    colorPicker.addEventListener("click", (e) => {
      colorPickers[activeColorIdx].classList.remove("active-color");
      activeColorIdx = e.target.color_idx;
      console.log(`Selected color: ${colors[activeColorIdx]}`);
      colorPicker.classList.add("active-color");
    });
  }
});

marblePickers.forEach((marblePicker, idx) => {
  // initialize the idx of the marblePicker elements
  marblePicker["marble_idx"] = idx;

  if (role == 2) {
    // role 1 -> code maker
    marblePicker.addEventListener("click", (e) => {
      marblePickers[activeMarbleColor].classList.remove("active-marble-picker");
      activeMarbleColor = e.target.marble_idx;
      console.log(`Selected marble: ${activeMarbleColor}`);
      marblePicker.classList.add("active-marble-picker");
    });
  }
});

ballSpaces.forEach((ballSpace, idx) => {
  // initialize the idx and column_idx of the ballSpace elements
  ballSpace["idx"] = idx;
  ballSpace["column_idx"] = Math.floor(idx / 4);
});

marbleSpaces.forEach((marbleSpace, idx) => {
  // initialize the idx and column_idx of the marbleSpace elements
  marbleSpace["idx"] = idx;
  marbleSpace["column_idx"] = Math.floor(idx / 4);
});

const putBallInSpace = (e) => {
  e.target.className = `ball b${activeColorIdx}`;
  sendGuessMove(e.target.idx, activeColorIdx);
};

const putMarbleInSpace = (e) => {
  e.target.classList.remove(`red`);
  e.target.classList.remove(`white`);
  e.target.classList.add(`${marbleColors[activeMarbleColor]}`);
  //sendFeedbackMove(e.target.idx, activeMarbleColor);
};

const clearMarbleSpace = (e) => {
  e.target.classList.remove(`red`);
  e.target.classList.remove(`white`);
};

const activateColumn = (columnIdx) => {
  boardColumns[columnIdx].classList.add(`active-column-r${role}`);

  if (role == 1) {
    //code-cracker
    const columnSpaces = ballSpaces.filter(
      (ballSpace) => ballSpace.column_idx === columnIdx
    );

    columnSpaces.forEach((ballSpace) => {
      ballSpace.addEventListener("click", putBallInSpace);
    });
  } else if (role == 2) {
    // code-maker
    const columnMarbleSpaces = marbleSpaces.filter(
      (marbleSpace) => marbleSpace.column_idx === columnIdx
    );

    columnMarbleSpaces.forEach((marbleSpace) => {
      marbleSpace.addEventListener("click", putMarbleInSpace);
      marbleSpace.addEventListener("dblclick", clearMarbleSpace);
    });
  }
};

const deactivateColumn = (columnIdx) => {
  boardColumns[columnIdx].classList.remove(`active-column-r${role}`);

  if (role == 1) {
    //code-cracker
    const columnSpaces = ballSpaces.filter(
      (ballSpace) => ballSpace.column_idx === columnIdx
    );

    columnSpaces.forEach((ballSpace) => {
      ballSpace.removeEventListener("click", putBallInSpace);
    });
  } else if (role == 2) {
    // code-maker
    const columnMarbleSpaces = marbleSpaces.filter(
      (marbleSpace) => marbleSpace.column_idx === columnIdx
    );

    columnMarbleSpaces.forEach((marbleSpace) => {
      marbleSpace.removeEventListener("click", putMarbleInSpace);
      marbleSpace.removeEventListener("dblclick", clearMarbleSpace);
    });
  }
};

// socket controll
const socket = io();

socket.emit("join-request", { sessionId }, ({ ok }) => {
  if (!ok) {
    console.log("problems joining the room");
    return;
  }
  console.log("joined to room");
});

socket.on("connect", () => {
  console.log("Connected to server!!");
  // connectionLabel.innerText = "Connected!!";
});

socket.on("disconnect", () => {
  console.log("Server disconnected =(");
  // connectionLabel.innerText = "Disconnected!!";
});

// socket.on("new-code", (code) => {
//   codeLabel.innerText = code;
//   usernameContainer.classList.add("hide");
//   codeReadyContainer.classList.remove("hide");
// });

socket.on("guess-move-notification", (payload) => {
  const { SpaceIdx, activeColorIdx } = payload;
  ballSpaces[SpaceIdx].className = `ball b${activeColorIdx}`;
  console.log(payload);
});

socket.on("feedback-move-notification", (payload) => {
  // const { marbleSpaceIdx, activeMarbleColor } = payload;
  // marbleSpaces[marbleSpaceIdx].className = `ball b${activeColorIdx}`;
  console.log(payload);
});

const sendGuessMove = (SpaceIdx, activeColorIdx) => {
  socket.emit(
    "new-guess-move",
    { sessionId, SpaceIdx, activeColorIdx },
    ({ ok }) => {
      if (!ok) {
        console.log("problem sending move");
        return;
      }
      console.log("move sended");
    }
  );
};

const sendFeedbackMove = (marbleSpaceIdx, activeMarbleColor) => {
  socket.emit(
    "new-feedback-move",
    { sessionId, marbleSpaceIdx, activeMarbleColor },
    ({ ok }) => {
      if (!ok) {
        console.log("problem sending move");
        return;
      }
      console.log("move sended");
    }
  );
};

// let the code maker prepare the secret code
const notifySecretReady = (e) => {
  socket.emit("secret-ready", null);
  mainButton.removeEventListener(notifySecretReady);
};

if (role === 2) {
  // activate the secret column
  activateColumn(10);
  secretCode.classList.remove("hide");

  mainButton.addEventListener(notifySecretReady);
} else {
  secretCover.classList.remove("hide");
}
