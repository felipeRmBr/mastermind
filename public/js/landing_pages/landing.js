const singlePlayerButton = document.querySelector("#single-player-button");
const multiPlayerButton = document.querySelector("#multi-player-button");

const landingContainer = document.querySelector("#landing-options-container");

const buttonsContainer = document.querySelector("#buttons-container");
const showButtonsContainer = () => {
  buttonsContainer.classList.remove("invisible");
  buttonsContainer.classList.add("animate__fadeIn");
};

singlePlayerButton.addEventListener("click", () => {
  window.location = `index.html`;
});

multiPlayerButton.addEventListener("click", () => {
  window.location = `index.html`;
});

showButtonsContainer();
