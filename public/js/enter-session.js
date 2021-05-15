const usernameInput = document.querySelector("#username-input");
const sessionPinInput = document.querySelector("#session-pin-input");
const enterSessionButton = document.querySelector("#enter-session-button");

const errorBanner = document.querySelector("#error-banner");
const errorMessage = document.querySelector("#error-message");

const usernameAndPinContainer = document.querySelector(
  "#enter-session-container"
);

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
      showErrormessage("Your username must be at least 5 characters long.");
    } else {
      sessionPinInput.focus();
    }
  }
};

const catchPinEnter = (e) => {
  if (e.which == 13) {
    if (sessionPinInput.value.length < 4) {
      showErrormessage(
        "You need to enter a valid session PIN (four digits int)."
      );
    } else {
      sentSessionPin();
    }
  }
};

const sentSessionPin = () => {
  const pin = sessionPinInput.value;
  const username = usernameInput.value;
  socket.emit("code-verification", { pin, username }, ({ ok }) => {
    if (!ok) {
      /* console.log("No se encontró la sesíon"); */

      showErrormessage(
        "Session not found. Please check your PIN and try again."
      );

      sessionPinInput.value = "";
      return;
    }

    window.location = `game.html?session=${pin}&player=2`;
  });
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

usernameInput.addEventListener("keypress", catchUsernameEnter);
sessionPinInput.addEventListener("keypress", catchPinEnter);
enterSessionButton.addEventListener("click", sentSessionPin);
