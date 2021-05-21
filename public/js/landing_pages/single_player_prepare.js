let sessionCode = -1;

const codeReadyContainer = document.querySelector("#code-ready-message");
const mainContainer = document.querySelector("#form-new-session");

const usernameInput = document.querySelector("#username-input");
const numberGamesInput = document.querySelector("#number-games-input");

const codeRequestButton = document.querySelector("#code-request-button");

const codeLabel = document.querySelector("#session-pin");

//const errorBanner = document.querySelector("#error-banner");
//const errorMessage = document.querySelector("#error-message");

//codeLabel.innerText = "No code available";

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

const catchUsernameEnter = (e) => {
  if (e.which == 13) {
    if (usernameInput.value.length < 5) {
      return;
      // showErrormessage("Your username must be at least five characters long.");
    } else {
      return;
      //requestNewCode();
    }
  }
};

const requestNewCode = (e) => {
  //e.preventDefault();
  const username = usernameInput.value;
  const nGames = numberGamesInput.value;

  if (username.length < 5) return true;
  console.log("code requested");
  socket.emit(
    "new-single-game",
    { username: username, nGames: nGames },
    ({ ok, newCode }) => {
      if (!ok) {
        console.log("REQUEST ERROR!!!");
      }

      sessionCode = newCode;
      window.location = `single-player-game.html?session=${sessionCode}&username=${username}`;
    }
  );
  return false;
};

const socket = io();

socket.on("connect", () => {
  console.log("Connected to server!!");
  // connectionLabel.innerText = "Connected!!";
});

socket.on("disconnect", () => {
  console.log("Server disconnected =(");
  // connectionLabel.innerText = "Disconnected!!";
});

/* socket.on("new-code", (code) => {
  codeLabel.innerText = code;
  mainContainer.classList.add("hide");
  codeReadyContainer.classList.remove("hide");
});

socket.on("partner-ready", (payload) => {
  window.location = `game.html?session=${sessionCode}&player=1`;
}); */

//usernameInput.addEventListener("keypress", catchUsernameEnter);
//codeRequestButton.addEventListener("click", requestNewCode);
