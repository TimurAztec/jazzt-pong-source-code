let io = require('socket.io').listen(3253);
let score = {
    score1: 0,
    score2: 0,
    timeOut: false
}
let left;
let chatStory = [];

io.sockets.on('connection', (socket) => {

    console.log(`${socket.handshake.address.address}:${socket.handshake.address.port} connected!`);
    if (io.engine.clientsCount > 2) {
        socket.disconnect();
    } else {
        socket.emit('connected');
    }

    if (io.engine.clientsCount == 1) {
        if (Math.round(Math.random() * 1) == 0) {
            left = true
            socket.emit('start_position', 'left');
        } else {
            left = false;
            socket.emit('start_position', 'right');
        }
    } else {
        if (left) {
            socket.emit('start_position', 'right');
        } else {
            socket.emit('start_position', 'left');
        }
    }

    if (io.engine.clientsCount == 2) {
        io.sockets.emit('start');
    }

    socket.on('disconnect', () => {
        socket.broadcast.emit('player_left_game');
        clearScore();
    });

    socket.on('cords', (data) => {
        socket.broadcast.emit('server_cords', data);
        socket.emit('pong');
        socket.emit('score', { score1: score.score1, score2: score.score2 });
    })

    socket.on('pause', () => {
        socket.broadcast.emit('pause');
    })

    socket.on('continue', () => {
        socket.broadcast.emit('continue');
    })

    socket.on('add_score', (data) => {
        if (!score.timeOut) {
            if (data == 1) {
                score.score1 += 1;
            } else if (data == 2) {
                score.score2 += 1;
            }
            score.timeOut = true; setTimeout(() => { score.timeOut = false; }, 500);
        }
        if (score.score1 >= 10) {
            io.sockets.emit('end_game', 'Player 1 won the game!'); clearScore();
        } else if (score.score2 >= 10) {
            io.sockets.emit('end_game', 'Player 2 won the game!'); clearScore();
        }
    })

    socket.on('chat_message', (data) => {
        if (data) {
            chatStory.push(data);
            io.sockets.emit('chat_update', data);
        }
    })

})

function clearScore() {
    score = { score1: 0, score2: 0, timeOut: false }
    left = false;
}
