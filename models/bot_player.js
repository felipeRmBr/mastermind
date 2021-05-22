class BotPlayer {
  generateSecret(allowDuplicates, allowBlanks) {
    let secret = [];
    if (allowDuplicates) {
      for (let i = 0; i < 4; i++) {
        const randomPick = allowBlanks
          ? Math.floor(Math.random() * 7) - 1
          : Math.floor(Math.random() * 6);
        secret.push(randomPick);
      }
      return secret;
    } else {
      //duplicates not allowed
      let available = allowBlanks ? [-1, 0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5];

      for (let i = 0; i < 4; i++) {
        const nOptions = available.length;
        const randomIdx = Math.floor(Math.random() * available.length);
        secret.push(available.splice(randomIdx, 1)[0]);
      }
      return secret;
    }
  }

  giveFeedback(secret, guess) {
    // check for exact matches
    let exactMatchesCount = 0;

    // we use secretLeft and guessLeft to
    // track the entries that dont have a exact match
    let secretLeft = [];
    let guessLeft = [];
    for (let idx = 0; idx < secret.length; idx++) {
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
      let marbleToCheck = guessLeft.shift();

      if (secretLeft.includes(marbleToCheck)) {
        partialMatchesCount++;
        secretLeft.splice(secretLeft.indexOf(marbleToCheck), 1);
      }
    }

    let feedbackArray = [];
    for (let i = 0; i < exactMatchesCount; i++) {
      feedbackArray.unshift(1);
    }

    for (let i = 0; i < partialMatchesCount; i++) {
      feedbackArray.unshift(0);
    }
    return feedbackArray;
  }
}

module.exports = BotPlayer;
