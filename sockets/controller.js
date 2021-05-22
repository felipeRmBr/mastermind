const { Socket } = require("socket.io");
const GameSession = require("../models/game-session");
const BotPlayer = require("../models/bot_player");

let sessionIds = [];
let gameSessions = {};

const getNewSessionPin = () => {
  let newSessionPin = 0;
  do {
    newSessionPin = Math.floor(Math.random() * 9000) + 1000;
  } while (sessionIds.includes(newSessionPin));

  return newSessionPin;
};

const botPlayer = new BotPlayer();

const socketController = (socket, io) => {
  console.log("new connection");
  // Cuando un cliente se conecta
  // socket.emit("ultimo-ticket", ticketControl.ultimo);
  // socket.emit("estado-actual", ticketControl.ultimos4);
  // socket.emit("tickets-pendientes", ticketControl.tickets.length);

  /*-----------------------------------------------------------------*/
  /* ------------------   MULTIPLAYER CONTROL   -------------------- */
  /*-----------------------------------------------------------------*/
  socket.on("code-request", ({ username }, callback) => {
    const newSessionPin = getNewSessionPin();
    sessionIds.push(newSessionPin);
    gameSessions[newSessionPin] = {
      players: [username, null],
    };

    console.log(
      `Session code request by: ${username}. Session pin: ${newSessionPin}`
    );

    socket.join(newSessionPin);
    callback({ ok: true, newCode: newSessionPin });
  });

  socket.on("code-verification", ({ pin, username }, callback) => {
    //console.log("verifying:", code);
    //console.log(sessionIds);
    pin = Number(pin);
    if (sessionIds.includes(pin)) {
      gameSession = gameSessions[pin];
      gameSession.players[1] = username;

      io.to(pin).emit("partner-ready", null);
      callback({ ok: true });
    } else {
      callback({ ok: false });
    }
  });

  socket.on("join-request", ({ sessionId }, callback) => {
    if (sessionId == 1111) {
      // debugging
      socket.join(sessionId);
      callback({ players: ["Felipe", "Jacob"] });
    } else {
      socket.join(sessionId);
      const gameSession = gameSessions[sessionId];
      console.log(gameSessions);

      callback({ players: gameSession.players });
    }
  });

  socket.on("secret-ready", ({ sessionId, secret }) => {
    socket.broadcast.to(sessionId).emit("secret-ready", { sessionId, secret });
    //socket.to(sessionId).emit("secret-ready", { sessionId, secret });
    console.log("secret arrived: ", secret);
  });

  socket.on("peg-hole-update", (payload) => {
    socket.broadcast.to(payload.sessionId).emit("peg-hole-update", payload);
    //socket.to(payload.sessionId).emit("peg-hole-update", payload);
  });

  socket.on("feedback-request", (payload) => {
    console.log("feedback request arrived");
    socket.broadcast.to(payload.sessionId).emit("feedback-request", payload);
    //socket.to(payload.sessionId).emit("feedback-response", payload);
  });

  socket.on("feedback-response", (payload) => {
    socket.broadcast.to(payload.sessionId).emit("feedback-response", payload);
    //socket.to(payload.sessionId).emit("feedback-response", payload);
  });

  /*-----------------------------------------------------------------*/
  /* -----------------   SINGLE PLAYER CONTROL   ------------------- */
  /*-----------------------------------------------------------------*/

  const getCurrentGameData = (sessionId) => {
    const game = gameSessions[sessionId].game;
    return [game, game.secret];
  };

  const computeFeedback = (secret, guess) => {
    const feedback = botPlayer.giveFeedback(secret, guess);
    const feedbackSum = feedback.reduce((total, marble_value) => {
      return total + (marble_value == -1 ? 0 : marble_value);
    }, 0);

    return [feedback, feedbackSum];
  };

  const updateGameData = (game, guess, feedback) => {
    game.addGuess(guess);
    game.addFeedback(feedback);
  };

  const resetGame = (sessionId) => {
    // Reset game
    gameSession = gameSessions[sessionId];
    gameSession.resetGame();

    const newSecret = botPlayer.generateSecret();
    gameSession.game.setSecret(newSecret);

    console.log("Game reset, new secret:", newSecret);
  };

  socket.on(
    "new-single-game",
    ({ username, allowDuplicates, allowBlanks }, callback) => {
      console.log(username, allowDuplicates, allowBlanks);
      const newSessionPin = getNewSessionPin();
      sessionIds.push(newSessionPin);

      const gameSession = new GameSession({
        sessionPin: newSessionPin,
        players: [username],
        nGames: 0,
        allowDuplicates: allowDuplicates,
        allowBlanks: allowBlanks,
      });

      gameSession.game.setSecret(
        botPlayer.generateSecret(allowDuplicates, allowBlanks)
      );

      gameSessions[newSessionPin] = gameSession;

      console.log(
        `New single player game. Username: ${username}; 
      Session pin: ${newSessionPin}; 
      secret ${gameSession.game.secret};
      nGames ${gameSession.nGames}`
      );

      callback({ ok: true, newCode: newSessionPin });
    }
  );

  socket.on("first-contact", ({ sessionId }, callback) => {
    if (!sessionIds.includes(sessionId)) {
      console.log("session not found");
      callback({ ok: false });
      return;
    }

    const gameSession = gameSessions[sessionId];
    if (gameSession) {
      callback({
        ok: true,
        allowDuplicates: gameSession.allowDuplicates,
        allowBlanks: gameSession.allowBlanks,
      });
    }
  });

  socket.on("check-secret-ready", ({ sessionId }, callback) => {
    if (!sessionIds.includes(sessionId)) {
      console.log("session not found");
      callback({ ok: false });
      return;
    }

    const gameSecret = gameSessions[sessionId].game.secret;
    if (gameSecret) {
      console.log("Secret ready:", gameSecret);
      socket.emit("secret-ready", { sessionId });
      callback({ ok: true });
    } else {
      console.log("Secret undefined");
      callback({ ok: false });
    }
  });

  socket.on("peg-hole-update-single", (payload, callback) => {
    const { sessionId, pegHoleIdx, activeColorIdx } = payload;

    //gameSecret = gameSessions[sessionId].game.secret;

    callback({ ok: true });
  });

  socket.on("feedback-request-single", (payload) => {
    console.log("feedback request arrived");
    const { sessionId, guess, activeColumnIdx } = payload;

    const [game, gameSecret] = getCurrentGameData(sessionId);
    const [feedback, feedbackSum] = computeFeedback(gameSecret, guess);
    updateGameData(game, guess, feedback);

    const codeBroken = feedbackSum == 4;

    if (codeBroken) {
      // send feedback
      console.log("code boroken");
      socket.emit("feedback-response", {
        feedback,
        secret: gameSecret,
        score: 5 - Math.max(0, activeColumnIdx - 5),
      });

      resetGame(sessionId);
    } else {
      if (activeColumnIdx < 9) {
        // there are more guesses
        socket.emit("feedback-response", {
          feedback,
          secret: [],
          score: 0,
        });
      } else {
        // 10 guesses were used
        console.log("10 guesees were used");
        socket.emit("feedback-response", {
          feedback,
          secret: gameSecret,
          score: 0,
        });

        resetGame(sessionId);
      }
    }
  });
};

module.exports = {
  socketController,
};
