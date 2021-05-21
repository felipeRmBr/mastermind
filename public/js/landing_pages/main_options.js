const singlePlayerButton = document.querySelector("#single-player-button");
const multiPlayerButton = document.querySelector("#multi-player-button");
const aboutButton = document.querySelector("#about-button");

singlePlayerButton.addEventListener("click", () => {
  window.location = `single-player-prepare.html`;
});

multiPlayerButton.addEventListener("click", () => {
  window.location = `multiplayer-options.html`;
});

aboutButton.addEventListener("click", () => {
  window.open(
    `https://en.wikipedia.org/wiki/Mastermind_(board_game)`,
    "_blank"
  );
  //window.location = `https://en.wikipedia.org/wiki/Mastermind_(board_game)`;
});
