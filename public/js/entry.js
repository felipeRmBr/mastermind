// Referencias HTML
const queryString = window.location.search;
console.log(queryString);

let sessionCode = 0;

const newSessionButton = document.querySelector("#new-session-button");
const existingSessionButton = document.querySelector("#enter-code-button");
const codeRequestButton = document.querySelector("#code-request-button");
const enterSessionButton = document.querySelector("#enter-session-button");
const sessionCodeInput = document.querySelector("#fpin");

const landingContainer = document.querySelector("#landing-options-container");
const codeReadyContainer = document.querySelector("#code-ready-container");
const usernameContainer = document.querySelector("#username-container");
const usernameAndPinContainer = document.querySelector(
  "#username-pin-container"
);

const errorBanner = document.querySelector("#error-banner");

const codeLabel = document.querySelector("#code-label");
codeLabel.innerText = "No code available";

newSessionButton.addEventListener("click", () => {
  landingContainer.classList.add("hide");
  usernameContainer.classList.remove("hide");
});

existingSessionButton.addEventListener("click", () => {
  landingContainer.classList.add("hide");
  usernameAndPinContainer.classList.remove("hide");
});

codeRequestButton.addEventListener("click", () => {
  socket.emit("code-request", { name: "feliperb" }, ({ ok, newCode }) => {
    if (!ok) {
      return (codeLable.innerText = "REQUEST ERROR!!!");
    }

    sessionCode = newCode;
    usernameContainer.classList.add("hide");
    codeReadyContainer.classList.remove("hide");

    return (codeLabel.innerText = newCode);
  });
});

enterSessionButton.addEventListener("click", () => {
  sessionCode = sessionCodeInput.value;

  socket.emit("code-verification", { code: sessionCode }, ({ ok }) => {
    if (!ok) {
      console.log("No se encontró la sesíon");
      errorBanner.classList.remove("hide");
      errorBanner.classList.remove("animate__fadeOut");
      errorBanner.classList.add("animate__fadeIn");

      setTimeout(() => {
        errorBanner.classList.remove("animate__fadeIn");
        errorBanner.classList.add("animate__fadeOut");
      }, 3500);

      return;
    }

    window.location = `game.html?session=${sessionCode}&player=2`;
  });
});

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
  usernameContainer.classList.add("hide");
  codeReadyContainer.classList.remove("hide");
});

socket.on("partner-ready", (payload) => {
  window.location = `game.html?session=${sessionCode}&player=1`;
});
