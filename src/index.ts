import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

interface Player {
  x: number;
  y: number;
}

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const players: Record<string, Player> = {};

io.on('connection', (socket: Socket) => {
  console.log(`🟢 Jogador conectado: ${socket.id}`);

  players[socket.id] = { x: 100, y: 100 };

  socket.emit('currentPlayers', players);

  console.log(players)

  socket.broadcast.emit('newPlayer', {
    id: socket.id,
    x: 100,
    y: 100,
  });

  socket.on('playerMove', (pos: Player) => {
    if (players[socket.id]) {
      players[socket.id] = pos;
      socket.broadcast.emit('updatePlayer', {
        id: socket.id,
        pos,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Jogador desconectado: ${socket.id}`);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
