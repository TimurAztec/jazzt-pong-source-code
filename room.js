module.exports = class Room {

    room;
    sockets = []

    score = {
        score1: 0,
        score2: 0,
        timeOut: false
    }
    pause;
    chatStory = [];
    theBall;
    player1; player2;
    canvas = {
        width: 650,
        height: 400,
    }

    constructor(io, room, roomId) {
        console.log(`Room ${room.name} has been created! Players: ${Object.keys(room.sockets)[0]} and ${Object.keys(room.sockets)[1]}`);
        this.io = io;
        this.room = room;
        this.roomId = roomId;
        this.sockets[0] = io.sockets.sockets[Object.keys(room.sockets)[0]];
        this.sockets[1] = io.sockets.sockets[Object.keys(room.sockets)[1]];

        this.definePositions();
        this.createPlayers();
        this.createTheBall();
        this.socketsEvents();
    }

    process() {
        if (!this.pause) {
            this.ballBounce();
            this.scoreCheck();
            this.io.in(this.roomId).emit('server_cords', {
                theBall: this.theBall,
                player1: this.player1,
                player2: this.player2,
            });
        } else {
            if (this.pause) {

            }
        }
    }

    definePositions() {
        if (Math.round(Math.random() * 1) == 0) {
            this.sockets[0].emit('start_position', 'left');
            this.sockets[1].emit('start_position', 'right');
        } else {
            this.sockets[0].emit('start_position', 'right');
            this.sockets[1].emit('start_position', 'left');
        }
    }

    createTheBall() {
        this.theBall = {
            x: (this.canvas.width / 2),
            y: (this.canvas.height / 2),
            width: 15,
            height: 15,
            color: '#FFFFFF',
            speed: 1,
            speedUp: 1,
            gravity: 1
        }
    }

    createPlayers() {
        this.player1 = {
            x: 10,
            y: 200,
            width: 15,
            height: 80,
            color: '#FFFFFF',
            gravity: 2
        }
        this.player2 = {
            x: 625,
            y: 100,
            width: 15,
            height: 80,
            color: '#FFFFFF',
            gravity: 2
        }
    }

    ballBounce() {
        if (((this.theBall.y + this.theBall.gravity) <= 0) || ((this.theBall.y + this.theBall.gravity + this.theBall.height) >= this.canvas.height)) {
            this.theBall.gravity = this.theBall.gravity * -1;
            this.theBall.y += this.theBall.gravity;
            this.theBall.x += this.theBall.speed;
        } else {
            this.theBall.x += this.theBall.speed;
            this.theBall.y += this.theBall.gravity
        }
        this.ballCollision();
    }

    ballCollision() {
        if (((this.theBall.x + this.theBall.speed <= this.player1.x + this.player1.width) && (this.theBall.y + this.theBall.gravity > this.player1.y) && (this.theBall.y + this.theBall.gravity <= this.player1.y + this.player1.height))
            || ((this.theBall.x + this.theBall.width + this.theBall.speed >= this.player2.x) && (this.theBall.y + this.theBall.gravity > this.player2.y) && (this.theBall.y + this.theBall.gravity <= this.player2.y + this.player2.height))) {
            this.theBall.speed = this.theBall.speed * -1;
            this.theBall.speed = this.theBall.speed * this.theBall.speedUp;
            if (this.theBall.speedUp < 3) { this.theBall.speedUp = this.theBall.speedUp + 0.10; }
        } else if (this.theBall.x + this.theBall.speed < this.player1.x) {
            this.score.score2 ++;
            // this.theBall.speed = this.theBall.speed * -1;
            this.theBall.speed = 1; this.theBall.speedUp = 1;
            this.theBall.x = 100 + this.theBall.speed;
            this.theBall.y += this.theBall.gravity;
        } else if (this.theBall.x + this.theBall.speed > this.player2.x + this.player2.width) {
            this.score.score1 ++;
            // this.theBall.speed = this.theBall.speed * -1;
            this.theBall.speed = -1; this.theBall.speedUp = 1;
            this.theBall.x = 500 + this.theBall.speed;
            this.theBall.y += this.theBall.gravity;
        } else {
            this.theBall.x += this.theBall.speed;
            this.theBall.y += this.theBall.gravity;
        }
    }

    scoreCheck() {
        if (this.score.score1 >= 10) {
            this.io.in(this.roomId).emit('end_game', 'Player 1 won the game!');
        } else if (this.score.score2 >= 10) {
            this.io.in(this.roomId).emit('end_game', 'Player 2 won the game!');
        }
    }

    socketsEvents() {
        this.sockets.forEach((socket) => {

            socket.emit('start');

            socket.on('chat_message', (data) => {
                if (data) {
                    this.chatStory.push(data);
                    this.io.in(this.roomId).emit('chat_update', data);
                }
            })

            socket.on('pause', () => {
                socket.to(this.roomId).emit('pause');
                this.pause = true;
            })

            socket.on('continue', () => {
                socket.to(this.roomId).emit('continue');
                this.pause = false;
            })

            socket.on('cords', (data) => {
                if (data.player1) { this.player1 = data.player1; } else if (data.player2) { this.player2 = data.player2; }
                socket.emit('pong');
                socket.emit('score', { score1: this.score.score1, score2: this.score.score2 });
            })

            socket.on('disconnect', () => {
                socket.to(this.roomId).emit('player_left_game');
            });

        })
    }
}
