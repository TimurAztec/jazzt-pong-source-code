module.exports = class Room {

    room;
    sockets = []

    beenUsed;
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
        console.log(`Room ${roomId} has been created! Players: ${Object.keys(room.sockets)[0]} and ${Object.keys(room.sockets)[1]}`);
        this.io = io;
        this.room = room;
        this.roomId = roomId;
        this.sockets[0] = io.sockets.sockets[Object.keys(room.sockets)[0]];
        this.sockets[1] = io.sockets.sockets[Object.keys(room.sockets)[1]];
        this.beenUsed = true;

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
        this.checkRoomCondition();
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
        let speed; if (Math.round(Math.random() * 1) == 0) { speed = 2; } else { speed = -2; }
        this.theBall = {
            x: (this.canvas.width / 2),
            y: (this.canvas.height / 2),
            width: 15,
            height: 15,
            color: '#FFFFFF',
            speed: speed || 2,
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
            gravity: 5
        }
        this.player2 = {
            x: 625,
            y: 100,
            width: 15,
            height: 80,
            color: '#FFFFFF',
            gravity: 5
        }
    }

    ballBounce() {
        if (this.theBall.speed > 20) { this.theBall.speed = 20 } else if (this.theBall.speed < -20) { this.theBall.speed = -20 }
        if (((this.theBall.y + this.theBall.gravity + this.theBall.height) >= this.canvas.height)) {
            this.theBall.gravity = this.theBall.gravity * -1;
            this.theBall.y += this.theBall.gravity;
            this.theBall.x += this.theBall.speed;
        } else if (((this.theBall.y + this.theBall.gravity) <= 0)) {
            this.theBall.gravity = this.theBall.gravity * -1;
            this.theBall.y += this.theBall.gravity;
            this.theBall.x += this.theBall.speed;
        }
        this.ballCollision();
    }

    ballCollision() {
        if (((this.theBall.x + this.theBall.speed <= this.player1.x + this.player1.width) && (this.theBall.x > this.player1.x + this.player1.width) && (this.theBall.y + this.theBall.height > this.player1.y) && (this.theBall.y < this.player1.y + this.player1.height))) {
            this.theBall.speed = this.theBall.speed - 0.5;
            this.theBall.speed = this.theBall.speed * -1;
            if (this.theBall.gravity > 0 ) { this.theBall.gravity = (Math.random() * 3) + 0.5; } else { this.theBall.gravity = ((Math.random() * 3) + 0.5) * -1; }
        }
        else if (((this.theBall.y + this.theBall.height) > this.player1.y) && (this.theBall.y < this.player1.y + this.player1.height) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) < this.player1.x + this.player1.width) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) > this.player1.x)) {
            this.theBall.gravity = this.theBall.gravity * -1;
            this.theBall.y += this.theBall.gravity;
            this.theBall.x += this.theBall.speed;
        }
        else if ((this.theBall.y < this.player1.y + this.player1.height) && (this.theBall.y > this.player1.y) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) < this.player1.x + this.player1.width) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) > this.player1.x)) {
            this.theBall.gravity = this.theBall.gravity * -1;
            this.theBall.y += this.theBall.gravity;
            this.theBall.x += this.theBall.speed;
        }
        else if (((this.theBall.x + this.theBall.width + this.theBall.speed/2 >= this.player2.x) && (this.theBall.x < this.player2.x) && (this.theBall.y + this.theBall.height > this.player2.y) && (this.theBall.y < this.player2.y + this.player2.height))) {
            this.theBall.speed = this.theBall.speed + 0.5;
            this.theBall.speed = this.theBall.speed * -1;
            if (this.theBall.gravity > 0 ) { this.theBall.gravity = (Math.random() * 3) + 0.5; } else { this.theBall.gravity = ((Math.random() * 3) + 0.5) * -1; }
        }
        else if (((this.theBall.y + this.theBall.height) > this.player2.y) && (this.theBall.y < this.player2.y + this.player2.height) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) < this.player2.x + this.player2.width) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) > this.player2.x)) {
            this.theBall.gravity = this.theBall.gravity * -1;
            this.theBall.y += this.theBall.gravity;
            this.theBall.x += this.theBall.speed;
        }
        else if ((this.theBall.y < this.player2.y + this.player2.height) && (this.theBall.y > this.player2.y) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) < this.player2.x + this.player2.width) && (((this.theBall.x + this.theBall.width/2) || (this.theBall.x)) > this.player2.x)) {
            this.theBall.gravity = this.theBall.gravity * -1;
            this.theBall.y += this.theBall.gravity;
            this.theBall.x += this.theBall.speed;
        }
        else if (this.theBall.x + this.theBall.width < 0) {
            this.score.score2 ++;
            // this.this.theBall.speed = this.this.theBall.speed * -1;
            this.theBall.speed = 2;
            this.theBall.x = 50 + this.theBall.speed;
            this.theBall.y += this.theBall.gravity;
        } else if (this.theBall.x > this.canvas.width) {
            this.score.score1 ++;
            // this.this.theBall.speed = this.this.theBall.speed * -1;
            this.theBall.speed = -2;
            this.theBall.x = 550 + this.theBall.speed;
            this.theBall.y += this.theBall.gravity;
        } else {
            this.theBall.x += this.theBall.speed;
            this.theBall.y += this.theBall.gravity;
        }
    }

    checkRoomCondition() {
        if (this.beenUsed && this.sockets.length < 2) {
            this.sockets.forEach((socket) => {
                socket.disconnect();
            })
        }
    }

    scoreCheck() {
        if (this.score.score1 >= 10) {
            if (this.player1.name) {
                this.io.in(this.roomId).emit('end_game', `${this.player1.name} won the game!`);
            } else {
                this.io.in(this.roomId).emit('end_game', 'Player 1 won the game!');
            }
        } else if (this.score.score2 >= 10) {
            if (this.player1.name) {
                this.io.in(this.roomId).emit('end_game', `${this.player2.name} won the game!`);
            } else {
                this.io.in(this.roomId).emit('end_game', 'Player 2 won the game!');
            }
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
