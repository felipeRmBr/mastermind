const launchNewButton = document.querySelector("#launch-new-button");
const enterSessionButton = document.querySelector("#enter-session-button");

launchNewButton.addEventListener("click", () => {
  window.location = `multiplayer-session-prepare.html`;
});

enterSessionButton.addEventListener("click", () => {
  window.location = `multiplayer-session-enter.html`;
});
