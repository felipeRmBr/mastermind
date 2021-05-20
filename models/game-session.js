class Game {
  constructor(multiplayer, players) {
    this.secret = [0, 0, 0, 0];
    this.guesses = []; // array of arrays
    this.feedbacks = []; // for multiplayer mode
  }

  setSecret(secret) {
    this.secret = secret;
  }

  addGuess(guess) {
    this.guesses.push(guess);
  }

  addFeedback(feedback) {
    this.feedbacks.push(feedback);
  }
}

class GameSession {
  constructor(sessionPin, players, nGames) {
    /*
        id -> str, session id;
        players -> array[str] of users ids;
        mode -> str, "single-player" (against the clock), "multi-player" (unlimited time)
    */

    this.sessionPin = sessionPin;
    this.players = players;
    this.nGames = nGames;
    this.scores = [0, 0];
    this.codeMaker = -1;
    this.codeCracker = -1;

    this.game = new Game();
  }

  updateScore(palyerIdx, points) {
    // we only want to track the number of cracked codes
    this.scores[palyerIdx] += points;
  }

  resetGame() {
    this.game = new Game();
  }

  setRoles({ codeMaker, codeCracker }) {
    this.codeMaker = this.players[codeMaker];
    this.codeCracker = this.players[codeCracker];
  }

  switchRoles() {
    [this.codeMaker, this.codeCracker] = [this.codeCracker, this.codeMaker];
  }

  saveGame() {
    // save routine
  }
}

module.exports = GameSession;
