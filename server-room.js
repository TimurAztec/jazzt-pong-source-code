const MongoClient = require("mongodb").MongoClient;
const {ObjectId} = require("mongodb");
const mongoUrl = 'mongodb://heroku_wqpvrkdq:2158u4v61nvofoho05bapiv1k3@ds029798.mlab.com:29798/heroku_wqpvrkdq';
const dbName = 'heroku_wqpvrkdq';
const SceneDynamicObject = require('./SceneDynamicObject');
const Ball = require('./ball');
// const dbName = 'pong-users';
// const mongoUrl = 'mongodb://localhost:27017/';

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
    end;
    chatStory = [];
    gameObjects;
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
        this.createObjects();
        this.socketsEvents();
    }

    process() {
        if (!this.pause) {
            this.collisionDetection();
            this.gameObjects.active[2].collideBounds(this.canvas, this.score, new Array([
                this.gameObjects.active[0],
                this.gameObjects.active[1]
            ]));
            this.gameObjects.active[2].process(new Array([
                this.gameObjects.active[0],
                this.gameObjects.active[1]
            ]));
            this.scoreCheck();
            this.io.in(this.roomId).emit('server_cords', {
                player1: this.gameObjects.active[0],
                player2: this.gameObjects.active[1],
                ball: this.gameObjects.active[2],
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

    createObjects() {
        this.gameObjects = {
            static: new Array(),
            active: new Array()
        }
        this.gameObjects.active.push(new SceneDynamicObject({
            x: 10,
            y: (this.canvas.height / 2) - 40,
            width: 15,
            height: 80,
            color: '#FFFFFF',
            nameId: 'paddle1',
            sy: 10,
        }));
        this.gameObjects.active.push(new SceneDynamicObject({
            x: 625,
            y: (this.canvas.height / 2) - 40,
            width: 15,
            height: 80,
            color: '#FFFFFF',
            nameId: 'paddle2',
            sy: 10,
        }));
        this.gameObjects.active.push(new Ball({
            x: (this.canvas.width / 2) - 8,
            y: (this.canvas.height / 2) - 8,
            width: 16,
            height: 16,
            color: '#FFFFFF',
            name: 'mainBall',
            sy: (Math.random() * 2 + -1) * 2,
            sx: (Math.random() * 2 + -1) * 2,
            rotation: 0.05,
        }));
    }

    collisionDetection() {
        Object.values(this.gameObjects).forEach(array => array.forEach(mainItem => {
            Object.values(this.gameObjects).forEach(array => array.forEach(secondItem => {
                if (mainItem != secondItem) {
                    this.checkCollision(mainItem, secondItem);
                }
            }));
        }));
    }

    checkCollision(obj1, obj2) {
        if (!(
            obj1.x + obj1.sx > obj2.x + obj2.width ||
            obj1.x + obj1.width + obj1.sx < obj2.x ||
            obj1.y + obj1.sy > obj2.y + obj2.height ||
            obj1.y + obj1.height + obj1.sy < obj2.y
        )) {
            if (obj1.collide) {
                if (!(obj1.y + obj1.sy > obj2.y + obj2.height) && (obj1.x < obj2.x + obj2.width) && (obj1.x + obj1.width > obj2.x)) {
                    obj1.collide(3);
                } else if (!(obj1.y + obj1.height + obj1.sy < obj2.y) && (obj1.x < obj2.x + obj2.width) && (obj1.x + obj1.width > obj2.x)) {
                    obj1.collide(4);
                } else if (!(obj1.x + obj1.width > obj2.x)) {
                    obj1.collide(1);
                } else if (!(obj1.x < obj2.x + obj2.width)) {
                    obj1.collide(2);
                } else {
                    obj1.collide(0);
                }
            }
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
        if (!this.end) {
            if (this.score.score1 >= 10) {
                let dif = this.score.score1 - this.score.score2;
                if (this.gameObjects.active[0].name) {
                    this.io.in(this.roomId).emit('end_game', `${this.gameObjects.active[0].name} won the game!`);
                } else {
                    this.io.in(this.roomId).emit('end_game', 'Player 1 won the game!');
                }
                if (this.gameObjects.active[0].id) {
                    this.addPlayerScore(this.gameObjects.active[0].id, dif);
                }
                if (this.gameObjects.active[0].id) {
                    this.addPlayerScore(this.gameObjects.active[0].id, -dif);
                }
                this.end = true;
            } else if (this.score.score2 >= 10) {
                let dif = this.score.score2 - this.score.score1;
                if (this.gameObjects.active[1].name) {
                    this.io.in(this.roomId).emit('end_game', `${this.gameObjects.active[1].name} won the game!`);
                } else {
                    this.io.in(this.roomId).emit('end_game', 'Player 2 won the game!');
                }
                if (this.gameObjects.active[1].id) {
                    this.addPlayerScore(this.gameObjects.active[1].id, -dif);
                }
                if (this.gameObjects.active[1].id) {
                    this.addPlayerScore(this.gameObjects.active[1].id, dif);
                }
                this.end = true;
            }
        }
    }

    addPlayerScore(id, score) {
        let idFix = id.substr(1, 24);
        const mongoClient = new MongoClient(mongoUrl, {useNewUrlParser: true});
        mongoClient.connect((err, client) => {
            if (err) throw err;
            const collection = client.db(dbName).collection('users');
            collection.findOne({_id: ObjectId(idFix)}).then(res => {
                if (res.score) {
                    collection.updateOne({_id: ObjectId(idFix)}, {$inc: {score: score}});
                } else {
                    collection.updateOne({_id: ObjectId(idFix)}, {$set: {score: score}});
                }
            });
        });
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
                if (data.player1) {
                    this.gameObjects.active[0] = data.player1;
                    this.gameObjects.active[0].nameId = 'paddle1';
                } else if (data.player2) {
                    this.gameObjects.active[1] = data.player2;
                    this.gameObjects.active[1].nameId = 'paddle2';
                }
                socket.emit('pong');
                socket.emit('score', {score1: this.score.score1, score2: this.score.score2});
            })

            socket.on('disconnect', () => {
                socket.to(this.roomId).emit('player_left_game');
            });

            socket.on('release', (data) => {
                if (this.gameObjects.active[2]) {
                    this.gameObjects.active[2].release(data.side, this.score);
                }
            });

        })
    }
}
