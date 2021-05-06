const { Socket } = require("socket.io");
const GameSession = require("../models/game-session");

let sessionCodes = [];
let gameSessions = [];

const socketController = (socket, io) => {
  console.log("new connection");
  // Cuando un cliente se conecta
  // socket.emit("ultimo-ticket", ticketControl.ultimo);
  // socket.emit("estado-actual", ticketControl.ultimos4);
  // socket.emit("tickets-pendientes", ticketControl.tickets.length);

  socket.on("code-request", ({ name }, callback) => {
    const newSessionCode = Math.floor(Math.random() * 9000) + 1000;

    sessionCodes.push(newSessionCode);
    console.log(
      `Session code request by: ${name}
       New session code: ${newSessionCode}`
    );

    socket.join(newSessionCode);
    callback({ ok: true, newCode: newSessionCode });
  });

  socket.on("code-verification", ({ code }, callback) => {
    //console.log("verifying:", code);
    //console.log(sessionCodes);
    code = Number(code);
    if (sessionCodes.includes(code)) {
      // prepare the game-session
      //gameSessions.push({ code: new GameSession() });
      io.to(code).emit("partner-ready", null);
      callback({ ok: true });
    } else {
      callback({ ok: false });
    }
  });

  socket.on("join-request", ({ sessionId }, callback) => {
    socket.join(sessionId);
    callback({ ok: true });
    setTimeout(() => {
      console.log("sending test to: ", sessionId);
      io.to(sessionId).emit("test-emit", null);
    }, 5000);
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

  // socket.on(
  //   "peg-hole-update",
  //   ({ sessionId, pegHoleIdx, activeColorIdx }, callback) => {
  //     io.to(sessionId).emit("guess-move-notification", {
  //       type: "peg hole update",
  //       pegHoleIdx,
  //       activeColorIdx,
  //     });
  //     callback({ ok: true });
  //   }
  // );

  socket.on(
    "new-feedback-move",
    ({ sessionId, marbleSpaceIdx, activeMarble }, callback) => {
      io.to(sessionId).emit("feedback-move-notification", {
        type: "marble-movement",
        marbleSpaceIdx,
        activeMarble,
      });
      callback({ ok: true });
    }
  );

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
