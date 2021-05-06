class BotPlayer {
  generateSecret() {
    let secret = [];
    for (let i = 0; i < 4; i++) {
      const randomPick = Math.floor(Math.random() * 6);
      secret.push(randomPick);
    }

    return secret;
  }

  giveFeedback(secret, guess) {
    // check for exact matches
    exactMatchesCount = 0;

    // we use secretLeft and guessLeft to
    // track the entries that dont have a exact match
    secretLeft = [];
    guessLeft = [];
    for (idx = 0; idx < secret.length; idx++) {
      if (secret[idx] === guess[idx]) {
        exactMatchesCount++;
      } else {
        secretLeft.push(secret[idx]);
        guessLeft.push(guess[idx]);
      }
    }

    //check for partial matchess
    let partialMatchesCount = 0;

    while (guessLeft.length) {
      let guessToCheck = guessLeft.shift();

      if (secretLeft.includes(guessToCheck)) {
        partialMatchesCount++;
        secretLeft.splice(secretLeft.indexOf(guessToCheck), 1);
      }
    }

    return [exactMatchesCount, partialMatchesCount];
  }
}

module.exports = BotPlayer;
