const PORT = process.env.PORT || 80;
const http = require('http');
const server = http.createServer((request, response) => {
    response.write('<h1>Hello world</h1>');
    response.end();
}).listen(PORT);
const EventEmitterCreator = require('events')
const EventEmitter = new EventEmitterCreator();
let io = require('socket.io').listen(server);
io.set('origins', '*:*');

let score = {
    score1: 0,
    score2: 0,
    timeOut: false
}
let pause;
let left;
let chatStory = [];
let theBall;
let player1; let player2;
let canvas = {
    width: 650,
    height: 400,
}
let gameLoop;

io.sockets.on('connection', (socket) => {

    let playerNumber;

    console.log(`${socket.handshake.address.address}:${socket.handshake.address.port} connected!`);
    if (io.engine.clientsCount > 2) {
        socket.emit('full_server');
        socket.disconnect();
    } else {
        socket.emit('connected');
    }

    if (io.engine.clientsCount == 1) {
        playerNumber = 1;
        if (Math.round(Math.random() * 1) == 0) {
            left = true
            socket.emit('start_position', 'left');
        } else {
            left = false;
            socket.emit('start_position', 'right');
        }
    } else {
        playerNumber = 2;
        if (left) {
            socket.emit('start_position', 'right');
        } else {
            socket.emit('start_position', 'left');
        }
    }

    if (io.engine.clientsCount == 2) {
        io.sockets.emit('start');
        EventEmitter.emit('start');
    }

    socket.on('disconnect', () => {
        socket.broadcast.emit('player_left_game');
        gameEnd();
    });

    socket.on('cords', (data) => {
        if (data.player1) { player1 = data.player1; } else if (data.player2) { player2 = data.player2; }
        socket.emit('pong');
        socket.emit('score', { score1: score.score1, score2: score.score2 });
    })

    socket.on('pause', () => {
        socket.broadcast.emit('pause');
        pause = true;
    })

    socket.on('continue', () => {
        socket.broadcast.emit('continue');
        pause = false;
    })

    socket.on('add_score', (data) => {
        if (!score.timeOut) {
            if (data == 1) {
                score.score1 += 1;
            } else if (data == 2) {
                score.score2 += 1;
            }
            score.timeOut = true; setTimeout(() => { score.timeOut = false; }, 350);
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

EventEmitter.on('start', () => {
    createTheBall();
    createPlayers();
    setTimeout(() => {
        gameLoop = setInterval(() => {
            if (!pause) {
                ballBounce();
                scoreCheck();
                io.sockets.emit('server_cords', {
                    theBall: theBall,
                    player1: player1,
                    player2: player2,
                });
            } else {
                if (pause) {

                }
            }
            this.close
        }, 1000/60);
    }, 3000);
});

function clearScore() {
    score = { score1: 0, score2: 0, timeOut: false }
    left = false;
}

function createTheBall() {
    theBall = {
        x: (canvas.width / 2),
        y: (canvas.height / 2),
        width: 15,
        height: 15,
        color: '#FFFFFF',
        speed: 1,
        speedAddition: 1,
        gravity: 1
    }
}

function createPlayers() {
    player1 = {
        x: 10,
        y: 200,
        width: 15,
        height: 80,
        color: '#FFFFFF',
        gravity: 2
    }
    player2 = {
        x: 625,
        y: 100,
        width: 15,
        height: 80,
        color: '#FFFFFF',
        gravity: 2
    }
}

function ballBounce() {
    if (((theBall.y + theBall.gravity) <= 0) || ((theBall.y + theBall.gravity + theBall.height) >= canvas.height)) {
        theBall.gravity = theBall.gravity * -1;
        theBall.y += theBall.gravity;
        theBall.x += theBall.speed;
    } else {
        theBall.x += theBall.speed;
        theBall.y += theBall.gravity
    }
    ballCollision();
}

function ballCollision() {
    if (((theBall.x + theBall.speed <= player1.x + player1.width) && (theBall.y + theBall.gravity > player1.y) && (theBall.y + theBall.gravity <= player1.y + player1.height))
        || ((theBall.x + theBall.width + theBall.speed >= player2.x) && (theBall.y + theBall.gravity > player2.y) && (theBall.y + theBall.gravity <= player2.y + player2.height))) {
        theBall.speed = theBall.speed * -1;
        theBall.speed = theBall.speed * theBall.speedAddition;
        theBall.speedAddition = theBall.speedAddition + 0.10;
    } else if (theBall.x + theBall.speed < player1.x) {
        score.score2 ++;
        // theBall.speed = theBall.speed * -1;
        theBall.speed = 1;
        theBall.x = 100 + theBall.speed;
        theBall.y += theBall.gravity;
    } else if (theBall.x + theBall.speed > player2.x + player2.width) {
        score.score1 ++;
        // theBall.speed = theBall.speed * -1;
        theBall.speed = -1;
        theBall.x = 500 + theBall.speed;
        theBall.y += theBall.gravity;
    } else {
        theBall.x += theBall.speed;
        theBall.y += theBall.gravity;
    }
}

function scoreCheck() {
    if (score.score1 >= 10) {
        io.sockets.emit('end_game', 'Player 1 won the game!'); gameEnd();
    } else if (score.score2 >= 10) {
        io.sockets.emit('end_game', 'Player 2 won the game!'); gameEnd();
    }
}

function gameEnd() {
    clearScore(); clearInterval(gameLoop);
}
