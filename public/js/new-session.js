let sessionCode = 0;

const codeReadyContainer = document.querySelector("#code-ready-container");
const mainContainer = document.querySelector("#new-session-container");

const usernameInput = document.querySelector("#username");
const codeRequestButton = document.querySelector("#code-request-button");
const codeLabel = document.querySelector("#code-label");

const errorBanner = document.querySelector("#error-banner");
const errorMessage = document.querySelector("#error-message");

codeLabel.innerText = "No code available";

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
      showErrormessage("Your username must be at least five characters long.");
    } else {
      requestNewCode();
    }
  }
};

const requestNewCode = () => {
  socket.emit(
    "code-request",
    { name: usernameInput.value },
    ({ ok, newCode }) => {
      if (!ok) {
        return (codeLable.innerText = "REQUEST ERROR!!!");
      }

      sessionCode = newCode;
      mainContainer.classList.add("hide");
      codeReadyContainer.classList.remove("hide");

      return (codeLabel.innerText = newCode);
    }
  );
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

socket.on("new-code", (code) => {
  codeLabel.innerText = code;
  mainContainer.classList.add("hide");
  codeReadyContainer.classList.remove("hide");
});

socket.on("partner-ready", (payload) => {
  window.location = `game.html?session=${sessionCode}&player=1`;
});

usernameInput.addEventListener("keypress", catchUsernameEnter);
codeRequestButton.addEventListener("click", requestNewCode);
