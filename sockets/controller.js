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
  });

  socket.on(
    "new-guess-move",
    ({ sessionId, holeIdx, activeColorIdx }, callback) => {
      io.to(sessionId).emit("guess-move-notification", {
        type: "ball-movement",
        holeIdx,
        activeColorIdx,
      });
      callback({ ok: true });
    }
  );

  socket.on(
    "new-feedback-move",
    ({ sessionId, marbleHoleIdx, activeMarble }, callback) => {
      io.to(sessionId).emit("feedback-move-notification", {
        type: "marble-movement",
        marbleHoleIdx,
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
