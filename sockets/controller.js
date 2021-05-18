const { Socket } = require("socket.io");
const GameSession = require("../models/game-session");

let sessionIds = [];
let gameSessions = {};

const getNewSessionPin = () => {
  let newSessionPin = 0;
  do {
    newSessionPin = Math.floor(Math.random() * 9000) + 1000;
  } while (sessionIds.includes(newSessionPin));

  return newSessionPin;
};

const socketController = (socket, io) => {
  console.log("new connection");
  // Cuando un cliente se conecta
  // socket.emit("ultimo-ticket", ticketControl.ultimo);
  // socket.emit("estado-actual", ticketControl.ultimos4);
  // socket.emit("tickets-pendientes", ticketControl.tickets.length);

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

  // socket.on("siguiente-ticket", (payload, callback) => {
  //   const siguiente = ticketControl.siguiente();
  //   callback(siguiente);
  //   socket.broadcast.emit("tickets-pendientes", ticketControl.tickets.length);
  // });

  // socket.on("siguiente-ticket", (payload, callback) => {
  //   const siguiente = ticketControl.siguiente();
  //   callback(siguiente);
  //   socket.broadcast.emit("tickets-pendientes", ticketControl.tickets.length);
  // });

  // socket.on("atender-ticket", ({ escritorio }, callback) => {
  //   if (!escritorio) {
  //     return callback({
  //       ok: false,
  //       msg: "Es escritorio es obligatorio",
  //     });
  //   }

  //   const ticket = ticketControl.atenderTicket(escritorio);

  //   socket.broadcast.emit("estado-actual", ticketControl.ultimos4);
  //   socket.emit("tickets-pendientes", ticketControl.tickets.length);
  //   socket.broadcast.emit("tickets-pendientes", ticketControl.tickets.length);

  //   if (!ticket) {
  //     callback({
  //       ok: false,
  //       msg: "Ya no hay tickets pendientes",
  //     });
  //   } else {
  //     callback({
  //       ok: true,
  //       ticket,
  //     });
  //   }
  // });
};

module.exports = {
  socketController,
};
