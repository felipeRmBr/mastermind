class Game {
  constructor(multiplayer, players) {
    this.secret = [0, 0, 0, 0];
    this.guesses = []; // array of arrays
    this.feedbacks = []; // for multiplayer mode
    this.timeLeft = 300; // second left
  }

  setSecret(secret) {
    this.secret = secret;
  }

  addGuess(guess) {
    this.guesses.push(guess);
  }

  addFeedBack(feedback) {
    this.feedbacks.push(feedback);
  }

  updateTimeLeft(seconds) {
    this.timeLeft = seconds;
  }
}

class GameSession {
  constructor(id, players, mode) {
    /*
        id -> str, session id;
        players -> array[str] of users ids;
        mode -> str, "race" (against the clock), "chill" (unlimited time)
        */

    this.id = id;
    this.players = players;
    this.codeMaker = -1;
    this.codeCracker = -1;

    // All the games will be played on the same mode
    this.mode = mode;
    this.multiplayer = players.length > 1 ? true : false;

    this.record = initRecord(players);
    this.game = new Game();
  }

  initRecord(players) {
    let record = {};
    players.forEach((player) => {
      record[player] = 0;
    });

    return record;
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

  updateRecord(winner) {
    // we only want to track the number of cracked codes
    if (winner == "code-cracker") {
      this.record[this.codeCracker++];
    }
  }

  saveGame() {
    // save routine
  }
}

module.exports = GameSession;
