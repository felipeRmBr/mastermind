const newSessionButton = document.querySelector("#new-session-button");
const existingSessionButton = document.querySelector("#enter-code-button");

const landingContainer = document.querySelector("#landing-options-container");

const buttonsContainer = document.querySelector("#buttons-container");
const showButtonsContainer = () => {
  buttonsContainer.classList.remove("invisible");
  buttonsContainer.classList.add("animate__fadeIn");
};

newSessionButton.addEventListener("click", () => {
  window.location = `new-session.html`;
});

existingSessionButton.addEventListener("click", () => {
  window.location = `enter-session.html`;
});

showButtonsContainer();
