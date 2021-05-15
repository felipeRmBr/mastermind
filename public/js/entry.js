const newSessionButton = document.querySelector("#new-session-button");
const existingSessionButton = document.querySelector("#enter-code-button");

const landingContainer = document.querySelector("#landing-options-container");

newSessionButton.addEventListener("click", () => {
  window.location = `new-session.html`;
});

existingSessionButton.addEventListener("click", () => {
  window.location = `enter-session.html`;
});
