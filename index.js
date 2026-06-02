const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const playersData = {};

io.on('connection', (socket) => {
    console.log('Un jucător s-a conectat:', socket.id);

    socket.on('player_login', (data) => {
        if (!playersData[data.username]) {
            playersData[data.username] = {
                robux: 0,
                hp: 100,
                x: 0, y: 0, z: 0
            };
        }
        socket.emit('sync_data', playersData[data.username]);
    });

    socket.on('move', (data) => {
        const player = playersData[data.username];
        if (!player) return;

        player.x = data.x;
        player.y = data.y;
        player.z = data.z;

        socket.broadcast.emit('player_moved', { username: data.username, x: data.x, y: data.y, z: data.z });
    });

    socket.on('round_won', (data) => {
        const player = playersData[data.username];
        if (player) {
            player.robux += 50; 
            console.log(`${data.username} a câștigat runda. Robux: ${player.robux}`);
            socket.emit('update_robux', { robux: player.robux });
        }
    });

    socket.on('disconnect', () => {
        console.log('Jucător deconectat:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serverul autoritar rulează pe portul ${PORT}`);
});
