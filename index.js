const PORT = process.env.PORT || 80;
const http = require('http');
const server = http.createServer((request, response) => {
    response.write('<h1>Hello world</h1>');
    response.end();
}).listen(PORT);
console.log('connect localhost:80');
const EventEmitterCreator = require('events')
const EventEmitter = new EventEmitterCreator();
let io = require('socket.io').listen(server);
io.set('origins', '*:*');

const Rooms = io.sockets.adapter.rooms;
const intervals = new Array();

io.sockets.on('connection', (socket) => {

    let roomId = 1;
    function tryToJoin() {
        socket.join(roomId.toString());
        if (Rooms[roomId.toString()].length > 2) {
            socket.leaveAll();
            roomId += 1;
            tryToJoin();
        }
    }
    tryToJoin();

    if (Rooms[roomId.toString()].length > 2) {
        socket.emit('full_server');
        socket.disconnect();
    } else {
        console.log(`${socket.request.connection.remoteAddress} connected as ${socket.id} to room number ${roomId}`);
        socket.emit('connected');
    }

    if (Rooms[roomId.toString()].length == 1) {
        createRoom();
        if (Math.round(Math.random() * 1) == 0) {
            Rooms[roomId.toString()].vars.left = true
            socket.emit('start_position', 'left');
        } else {
            Rooms[roomId.toString()].vars.left = false;
            socket.emit('start_position', 'right');
        }
    } else {
        if (Rooms[roomId.toString()].vars.left) {
            socket.emit('start_position', 'right');
        } else {
            socket.emit('start_position', 'left');
        }
    }

    if (Rooms[roomId.toString()].length == 2) {
        io.in(roomId.toString()).emit('start');
        EventEmitter.emit('start');
    }

    socket.on('disconnect', () => {
        socket.broadcast.in(roomId.toString()).emit('player_left_game');
        EventEmitter.emit('clear_rooms_intervals');
    });

    socket.on('cords', (data) => {
        if (data.player1) { Rooms[roomId.toString()].vars.player1 = data.player1; } else if (data.player2) { Rooms[roomId.toString()].vars.player2 = data.player2; }
        socket.emit('pong');
        socket.emit('score', { score1: Rooms[roomId.toString()].vars.score.score1, score2: Rooms[roomId.toString()].vars.score.score2 });
    })

    socket.on('pause', () => {
        socket.broadcast.in(roomId.toString()).emit('pause');
        Rooms[roomId.toString()].vars.pause = true;
    })

    socket.on('continue', () => {
        socket.broadcast.in(roomId.toString()).emit('continue');
        Rooms[roomId.toString()].vars.pause = false;
    })

    socket.on('chat_message', (data) => {
        if (data) {
            Rooms[roomId.toString()].vars.chatStory.push(data);
            io.in(roomId.toString()).emit('chat_update', data);
        }
    })

    EventEmitter.on('start', () => {
        createTheBall();
        createPlayers();
        setTimeout(() => {
            Rooms[roomId.toString()].vars.gameLoop = setInterval(() => {
                if (Rooms[roomId.toString()]) {
                if (!Rooms[roomId.toString()].vars.pause) {
                    ballBounce();
                    scoreCheck();
                    io.in(roomId.toString()).emit('server_cords', {
                        theBall: Rooms[roomId.toString()].vars.theBall,
                        player1: Rooms[roomId.toString()].vars.player1,
                        player2: Rooms[roomId.toString()].vars.player2,
                    });
                } else {
                    if (Rooms[roomId.toString()].vars.pause) {

                    }
                }
                }
                // console.log(new Date());
            }, 1000/60);
        }, 3000);
    });

    function createTheBall() {
        Rooms[roomId.toString()].vars.theBall = {
            x: (Rooms[roomId.toString()].vars.canvas.width / 2),
            y: (Rooms[roomId.toString()].vars.canvas.height / 2),
            width: 15,
            height: 15,
            color: '#FFFFFF',
            speed: 1,
            speedUp: 1,
            gravity: 1
        }
    }

    function createPlayers() {
        Rooms[roomId.toString()].vars.player1 = {
            x: 10,
            y: 200,
            width: 15,
            height: 80,
            color: '#FFFFFF',
            gravity: 2
        }
        Rooms[roomId.toString()].vars.player2 = {
            x: 625,
            y: 100,
            width: 15,
            height: 80,
            color: '#FFFFFF',
            gravity: 2
        }
    }

    function ballBounce() {
        if (((Rooms[roomId.toString()].vars.theBall.y + Rooms[roomId.toString()].vars.theBall.gravity) <= 0) || ((Rooms[roomId.toString()].vars.theBall.y + Rooms[roomId.toString()].vars.theBall.gravity + Rooms[roomId.toString()].vars.theBall.height) >= Rooms[roomId.toString()].vars.canvas.height)) {
            Rooms[roomId.toString()].vars.theBall.gravity = Rooms[roomId.toString()].vars.theBall.gravity * -1;
            Rooms[roomId.toString()].vars.theBall.y += Rooms[roomId.toString()].vars.theBall.gravity;
            Rooms[roomId.toString()].vars.theBall.x += Rooms[roomId.toString()].vars.theBall.speed;
        } else {
            Rooms[roomId.toString()].vars.theBall.x += Rooms[roomId.toString()].vars.theBall.speed;
            Rooms[roomId.toString()].vars.theBall.y += Rooms[roomId.toString()].vars.theBall.gravity
        }
        ballCollision();
    }

    function ballCollision() {
        if (((Rooms[roomId.toString()].vars.theBall.x + Rooms[roomId.toString()].vars.theBall.speed <= Rooms[roomId.toString()].vars.player1.x + Rooms[roomId.toString()].vars.player1.width) && (Rooms[roomId.toString()].vars.theBall.y + Rooms[roomId.toString()].vars.theBall.gravity > Rooms[roomId.toString()].vars.player1.y) && (Rooms[roomId.toString()].vars.theBall.y + Rooms[roomId.toString()].vars.theBall.gravity <= Rooms[roomId.toString()].vars.player1.y + Rooms[roomId.toString()].vars.player1.height))
            || ((Rooms[roomId.toString()].vars.theBall.x + Rooms[roomId.toString()].vars.theBall.width + Rooms[roomId.toString()].vars.theBall.speed >= Rooms[roomId.toString()].vars.player2.x) && (Rooms[roomId.toString()].vars.theBall.y + Rooms[roomId.toString()].vars.theBall.gravity > Rooms[roomId.toString()].vars.player2.y) && (Rooms[roomId.toString()].vars.theBall.y + Rooms[roomId.toString()].vars.theBall.gravity <= Rooms[roomId.toString()].vars.player2.y + Rooms[roomId.toString()].vars.player2.height))) {
            Rooms[roomId.toString()].vars.theBall.speed = Rooms[roomId.toString()].vars.theBall.speed * -1;
            Rooms[roomId.toString()].vars.theBall.speed = Rooms[roomId.toString()].vars.theBall.speed * Rooms[roomId.toString()].vars.theBall.speedUp;
            if (Rooms[roomId.toString()].vars.theBall.speedUp < 3) { Rooms[roomId.toString()].vars.theBall.speedUp = Rooms[roomId.toString()].vars.theBall.speedUp + 0.10; }
        } else if (Rooms[roomId.toString()].vars.theBall.x + Rooms[roomId.toString()].vars.theBall.speed < Rooms[roomId.toString()].vars.player1.x) {
            Rooms[roomId.toString()].vars.score.score2 ++;
            // theBall.speed = theBall.speed * -1;
            Rooms[roomId.toString()].vars.theBall.speed = 1; Rooms[roomId.toString()].vars.theBall.speedUp = 1;
            Rooms[roomId.toString()].vars.theBall.x = 100 + Rooms[roomId.toString()].vars.theBall.speed;
            Rooms[roomId.toString()].vars.theBall.y += Rooms[roomId.toString()].vars.theBall.gravity;
        } else if (Rooms[roomId.toString()].vars.theBall.x + Rooms[roomId.toString()].vars.theBall.speed > Rooms[roomId.toString()].vars.player2.x + Rooms[roomId.toString()].vars.player2.width) {
            Rooms[roomId.toString()].vars.score.score1 ++;
            // theBall.speed = theBall.speed * -1;
            Rooms[roomId.toString()].vars.theBall.speed = -1; Rooms[roomId.toString()].vars.theBall.speedUp = 1;
            Rooms[roomId.toString()].vars.theBall.x = 500 + Rooms[roomId.toString()].vars.theBall.speed;
            Rooms[roomId.toString()].vars.theBall.y += Rooms[roomId.toString()].vars.theBall.gravity;
        } else {
            Rooms[roomId.toString()].vars.theBall.x += Rooms[roomId.toString()].vars.theBall.speed;
            Rooms[roomId.toString()].vars.theBall.y += Rooms[roomId.toString()].vars.theBall.gravity;
        }
    }

    function scoreCheck() {
        if (Rooms[roomId.toString()].vars.score.score1 >= 10) {
            EventEmitter.emit('clear_rooms_intervals');
            io.in(roomId.toString()).emit('end_game', 'Player 1 won the game!');
        } else if (Rooms[roomId.toString()].vars.score.score2 >= 10) {
            EventEmitter.emit('clear_rooms_intervals');
            io.in(roomId.toString()).emit('end_game', 'Player 2 won the game!');
        }
    }

    function createRoom() {
        Rooms[roomId.toString()].vars = {
            score: {
                score1: 0,
                score2: 0,
                timeOut: false
            },
            pause: false,
            left: false,
            chatStory: [],
            theBall: {},
            player1: {}, player2: {},
            canvas: {
                width: 650,
                height: 400,
            },
        }
    }

})

EventEmitter.on('clear_rooms_intervals', () => {
    findCleanRoom();
})

function findCleanRoom() {
    const RoomsKeysUnfiltered = Object.keys(Rooms);
    const RoomsKeys = new Array();
    // RoomsKeys.filter((key) => { return new RegExp('[0-255]').test(key); });
    RoomsKeysUnfiltered.forEach(key => {
        if (new RegExp('[0-255]').test(key)) { RoomsKeys.push(key); }
    });
    for (let i=0 ; i < RoomsKeys.length ; i++) {
        if (Rooms[RoomsKeys[i]].length <= 1) {
            // console.log(Rooms[RoomsKeys[i]].vars);
            if (Rooms[RoomsKeys[i]] && Rooms[RoomsKeys[i]].vars) { clearInterval(Rooms[RoomsKeys[i]].vars.gameLoop); }
            // console.log(Rooms[RoomsKeys[i]]);
        }
    }
}
