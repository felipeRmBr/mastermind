const newSessionButton = document.querySelector("#new-session-button");
const existingSessionButton = document.querySelector("#enter-code-button");

const landingContainer = document.querySelector("#landing-options-container");

newSessionButton.addEventListener("click", () => {
  window.location = `new-session.html`;
  /*   landingContainer.classList.add("hide");
  usernameContainer.classList.remove("hide"); */
});

existingSessionButton.addEventListener("click", () => {
  window.location = `enter-session.html`;

  /*   landingContainer.classList.add("hide");
  usernameAndPinContainer.classList.remove("hide"); */
});
