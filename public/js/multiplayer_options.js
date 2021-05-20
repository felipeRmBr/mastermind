const launchNewButton = document.querySelector("#launch-new-button");
const enterSessionButton = document.querySelector("#enter-session-button");

launchNewButton.addEventListener("click", () => {
  window.location = `new-session.html`;
});

enterSessionButton.addEventListener("click", () => {
  window.location = `enter-session.html`;
});
