import Ball from "./ball";
import PGenerator from "./particles-generator";
import {changeGameScreenMode, goToMainMenu} from "./screens-changer";
import {playGameMusic, stopMusic} from './music-player';
import SceneDynamicObject from "./SceneDynamicObject";
import RenderObjectRect from "./RenderObjectRect";
import BallNonPhys from "./BallNonPhys";

const io = require('socket.io-client');
let socketAddress;
const EventEmitterCreator = require('events')
const EventEmitter = new EventEmitterCreator();
let server_cords;
let startTime;
let pingTimeout;
let pause;
let stop;
let left;
let right;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ParticlesGenerator = new PGenerator(ctx);
canvas.width = 650;
canvas.height = 400;
let score1 = 0;
let score2 = 0;
let keys = {}; let mouseCords = {y: 0}
let accelerometerGamma;

let midLine = {
    x: (canvas.width / 2) - 2.5,
    y: -1,
    width: 5,
    height: canvas.height + 1,
    color: '#FFFFFF'
};
let gameObjects;

function input() {
    let player;
    if (left) {
        player = player = gameObjects.active[0];
    } else if (right) {
        player = player = gameObjects.active[1];
    }
    switch (localStorage.getItem('controls')) {
        case '0': {
            if (38 in keys) {
                if (player.y - player.sy > 0) {
                    player.y -= player.sy;
                }
            } else if (40 in keys) {
                if (player.y + player.height + player.sy < canvas.height) {
                    player.y += player.sy;
                }
            }
            break;
        }
        case '1': {
            if (mouseCords.y > player.y - player.height/2 && mouseCords.y < player.y + player.height*1.5) {
                const futurePlayerPos = (mouseCords.y - (player.height / 2));
                if (futurePlayerPos > 0) {
                    if (futurePlayerPos + player.height < canvas.height) {
                        player.y = futurePlayerPos;
                    }
                }
            }
            if (mouseCords.release) {
                let friction = {x:0,y:0};
                if (left) {
                    friction.y = gameObjects.active[0].y - gameObjects.active[0].lasty;
                    EventEmitter.emit('release', {side: 'left', friction: friction});
                } else if (right) {
                    friction.y = gameObjects.active[1].y - gameObjects.active[1].lasty;
                    EventEmitter.emit('release', {side: 'right', friction: friction});
                }
            }
            break;
        }
        case '2': {
            const futurePlayerPos = ((canvas.height / 2) - (player.height / 2)) + accelerometerGamma * 5;
            if (futurePlayerPos > 0) {
                if (futurePlayerPos + player.height < canvas.height) {
                    player.y = futurePlayerPos;
                }
            }
            if (mouseCords.release) {
                let friction = {x:0,y:0};
                if (left) {
                    friction.y = gameObjects.active[0].y - gameObjects.active[0].lasty;
                    EventEmitter.emit('release', {side: 'left', friction: friction});
                } else if (right) {
                    friction.y = gameObjects.active[1].y - gameObjects.active[1].lasty;
                    EventEmitter.emit('release', {side: 'right', friction: friction});
                }
            }
            break;
        }
    }
    if (13 in keys) {
        let friction = {x:0,y:0};
        if (left) {
            friction.y = gameObjects.active[0].y - gameObjects.active[0].lasty;
            EventEmitter.emit('release', {side: 'left', friction: friction});
        } else if (right) {
            friction.y = gameObjects.active[1].y - gameObjects.active[1].lasty;
            EventEmitter.emit('release', {side: 'right', friction: friction});
        }
    }
}

function drawBox(box) {
    ctx.fillStyle = box.color;
    ctx.fillRect(box.x, box.y, box.width, box.height);
}

function displayScore() {
    ctx.font = "20px retro";
    ctx.fillStyle = "rgb(255,255,255)";
    let str;
    str = score1;
    ctx.fillText(str, (canvas.width / 2) - 50, 30);
    str = score2;
    ctx.fillText(str, (canvas.width / 2) + 50, 30);
}

function displayInfo(info) {
    ctx.font = "24px retro";
    ctx.fillStyle = "rgb(255,255,255)";
    let str = info;
    ctx.fillText(str, (canvas.width / 2) - 175, (canvas.height / 2));
}

function displayNumbers(info) {
    ctx.font = "34px Arial";
    ctx.fillStyle = "rgb(255,255,255)";
    let str = info;
    ctx.fillText(str, (canvas.width / 2) - 10, (canvas.height / 2));
}

function process() {
    collisionDetection();
    gameObjects.active[2].collideBounds(canvas);
    processActiveObjects();
    sendDataToServer();
    processServerCords();
}

function processActiveObjects() {
    gameObjects.active.forEach(item => item.process() );
}

function processServerCords() {
    if (server_cords) {
        if (left) {
            gameObjects.active[1].y = server_cords.player2.y;
        } else if (right) {
            gameObjects.active[0].y = server_cords.player1.y;
        } else {
            gameObjects.active[0].y = server_cords.player1.y;
            gameObjects.active[1].y = server_cords.player2.y;
        }
        gameObjects.active[2].x = server_cords.ball.x;
        gameObjects.active[2].y = server_cords.ball.y;
        gameObjects.active[2].sx = server_cords.ball.sx;
        gameObjects.active[2].sy = server_cords.ball.sy;
        gameObjects.active[2].changeRotation((server_cords.ball.sx + server_cords.ball.sy) * 0.1);
    }
}

function sendDataToServer() {
    if (left) {
        EventEmitter.emit('sendCords', {player1: gameObjects.active[0]});
    } else if (right) {
        EventEmitter.emit('sendCords', {player2: gameObjects.active[1]});
    }
}

function collisionDetection() {
    Object.values(gameObjects).forEach(array => array.forEach(mainItem => {
        Object.values(gameObjects).forEach(array => array.forEach(secondItem => {
            if (mainItem != secondItem) {
                checkCollision(mainItem, secondItem);
            }
        }));
    }));
}

function checkCollision(obj1, obj2) {
    if(!(
        obj1.x+obj1.sx    > obj2.x+obj2.width  ||
        obj1.x+obj1.width+obj1.sx  < obj2.x           ||
        obj1.y+obj1.sy             > obj2.y+obj2.height ||
        obj1.y+obj1.height+obj1.sy < obj2.y
    )){
        if (!(obj1.y+obj1.sy > obj2.y+obj2.height) && (obj1.x<obj2.x+obj2.width) && (obj1.x+obj1.width>obj2.x)) {
            obj1.collide(3);
        } else if (!(obj1.y+obj1.height+obj1.sy < obj2.y) && (obj1.x<obj2.x+obj2.width) && (obj1.x+obj1.width>obj2.x)) {
            obj1.collide(4);
        } else if (!(obj1.x+obj1.width > obj2.x)) {
            obj1.collide(1);
        } else if (!(obj1.x < obj2.x+obj2.width)) {
            obj1.collide(2);;
        } else {
            obj1.collide(0);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayScore();
    drawBox(midLine);
    gameObjects.static.forEach(obj => obj.renderStatic(ctx));
    gameObjects.active.forEach(obj => obj.renderActive(ctx));
    ParticlesGenerator.render();
}

function loop() {
    if (!pause && !stop) {
        input();
        process();
        draw();
        window.requestAnimationFrame(loop);
    } else {
        if (pause) {
            document.getElementById('pause-button').innerText = 'Continue';
            let message = document.createElement('span');
            message.innerText = `Game paused by one of the players (Press 'P' or 'Continue' to continue)`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
        }
    }
}

document.getElementById('chatSendButton').onclick = sendMessage;

function sendMessage() {
    if (document.getElementById('chatInput').value) {
        if (localStorage.getItem('name')) {
            EventEmitter.emit('sendMessage', `${localStorage.getItem('name')} says: ${document.getElementById('chatInput').value}`);
        } else if (left) {
            EventEmitter.emit('sendMessage', `player 1 says: ${document.getElementById('chatInput').value}`);
        } else if (right) {
            EventEmitter.emit('sendMessage', `player 2 says: ${document.getElementById('chatInput').value}`);
        }
        document.getElementById('chatInput').value = '';
    }
}

function gameStart(address, seed) {
    init();
    socketAddress = address;
    if (socketAddress) {
        connect(socketAddress, seed);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        displayInfo('connect [ipV4]');
    }
    EventEmitter.on('connected', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        createObjects();
        displayInfo('Waiting other player to connect');
        document.title = 'Jazzt Pong | Waiting for player...';
        EventEmitter.on('start', () => {
            document.title = 'Jazzt Pong | Player found!';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stop = false;
            stopMusic();
            setTimeout(() => {
                document.title = 'Jazzt Pong | Playing';
                let beep = document.getElementById('audio-beep3');
                beep.onended = () => { setTimeout(() => playGameMusic(), 250); }; beep.play();
            }, 250);
            loop();
        });
    });
}

function clearChat() {
    document.getElementById('chat').innerHTML = '';
}

function createObjects() {
    gameObjects = {
        static: new Array(),
        active: new Array()
    }
    gameObjects.active.push(new SceneDynamicObject({
        x: 10,
        y: (canvas.height/2)-40,
        width: 15,
        height: 80,
        color: '#FFFFFF',
        name: 'paddle1',
        sy: 10,
        render: {
            width: 15,
            height: 80,
        },
        renderObjects: new Array([
            new RenderObjectRect({
                x: 0,
                y: 0,
                width: 15,
                height: 80
            })
        ])
    }));
    gameObjects.active.push(new SceneDynamicObject({
        x: 625,
        y: (canvas.height/2)-40,
        width: 15,
        height: 80,
        color: '#FFFFFF',
        name: 'paddle2',
        sy: 10,
        render: {
            width: 15,
            height: 80,
        },
        renderObjects: new Array([
            new RenderObjectRect({
                x: 0,
                y: 0,
                width: 15,
                height: 80
            })
        ])
    }));
    gameObjects.active.push(new BallNonPhys({
        x: (canvas.width / 2) - 8,
        y: (canvas.height / 2) - 8,
        width: 16,
        height: 16,
        color: '#FFFFFF',
        name: 'mainBall',
        sy: 0,
        sx: 0,
        rotation: 0,
        render: {
            width: 16,
            height: 16,
        }
    }, ParticlesGenerator, ctx));
}

function definePlayerSide() {
    ctx.font = "16px retro";
    ctx.fillStyle = "rgb(255,255,255)";
    let sideStr;
    if (left) { sideStr = 'LEFT' } else if (right) { sideStr = 'RIGHT' }
    switch (localStorage.getItem('controls')) {
        case '0': {
            let message = document.createElement('span');
            message.innerText = `You are from the ${sideStr} side, use 'up' and 'down' on keyboard to control your paddle. Use 'Enter' to release the ball.`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
            break;
        }
        case '1': {
            let message = document.createElement('span');
            message.innerText = `You are from the ${sideStr} side, use your mouse to control your paddle. Use 'Enter' or move your mouse horizontally to release the ball.`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
            break;
        }
        case '2': {
            let message = document.createElement('span');
            message.innerText = `You are from the ${sideStr} side, use your device rotation to control your paddle. Use horizontal swipe to release the ball.`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
            break;
        }
    }
}

function gameEnd() {
    if (!stop) {
        EventEmitter.emit('end_game', true);
    } else {
        EventEmitter.emit('end_game', false);
    }
}

function pingDisplay(latency) {
    if (!pingTimeout) {
        document.getElementById('ping').innerText = `ping: ${latency}`;
        pingTimeout = true;
        setTimeout(() => pingTimeout = false, 500);
    }
}

function connect(address, seed) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    displayInfo(`Connecting to server`);
    let socket = io.connect(address);

    socket.on('connect', () => {

        socket.emit('connected', seed);

        socket.on('player_left_game', (res) => {
            stop = true; left = false; right = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            displayInfo('Sorry but other player left the game!');
            socket.disconnect();
            socketAddress = undefined;
            stopMusic();
            setTimeout(() => {
                clearChat();
                goToMainMenu(true);
            }, 5000);
        })

        socket.on('connected', (res) => {
            EventEmitter.emit('connected');
        })

        socket.on('full_server', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            displayInfo('Sorry but server is full, try again later!');
            socket.disconnect();
            stopMusic();
            setTimeout(() => {
                clearChat();
                goToMainMenu(true);
            }, 5000);
        });

        socket.on('server_cords', (res) => {
            server_cords = res;
        })

        socket.on('pong', (res) => {
            let latency = Date.now() - startTime;
            pingDisplay(latency);
        })

        socket.on('score', (res) => {
            score1 = res.score1;
            score2 = res.score2;
        })

        socket.on('start_position', (res) => {
            if (res == 'left') {
                left = true;
                if (localStorage.getItem('name')) { gameObjects.active[0].name = localStorage.getItem('name'); }
                if (localStorage.getItem('id')) { gameObjects.active[0].id = localStorage.getItem('id'); }
            } else if (res == 'right') {
                right = true;
                if (localStorage.getItem('name')) { gameObjects.active[1].name = localStorage.getItem('name'); }
                if (localStorage.getItem('id')) { gameObjects.active[1].id = localStorage.getItem('id'); }
            }
            definePlayerSide();
        })

        socket.on('start', () => {
            EventEmitter.emit('start');
            socket.emit('yes');
        })

        socket.on('pause', () => {
            if (!stop) {
                pause = true;
            }
        })

        socket.on('continue', () => {
            if (!stop) {
                pause = false;
                loop();
            }
        })

        socket.on('chat_update', (res) => {
            let message = document.createElement('span');
            message.innerText = res;
            document.getElementById('chat').appendChild(message);
            message.scrollIntoView();
        })

        socket.on('end_game', (res) => {
            stop = true; left = false; right = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            displayInfo(res);
            socket.disconnect();
            socketAddress = undefined;
            stopMusic();
            setTimeout(() => {
                clearChat();
                goToMainMenu(true);
            }, 5000);
        })

        EventEmitter.on('sendCords', (data) => {
            startTime = Date.now();
            socket.emit('cords', data);
        })

        EventEmitter.on('release', (data) => {
            socket.emit('release', data);
        })

        EventEmitter.on('pause', () => {
            if (pause) {
                pause = false;
                document.getElementById('pause-button').innerText = 'Pause'
                loop();
                socket.emit('continue');
            } else {
                pause = true;
                socket.emit('pause');
            }
        })

        EventEmitter.on('add_score', (data) => {
            socket.emit('add_score', data);
        })

        EventEmitter.on('sendMessage', (data) => {
            socket.emit('chat_message', data);
        })

        EventEmitter.on('end_game', (changeMusic) => {
            stop = true; left = false; right = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            socket.disconnect();
            socketAddress = undefined;
            stopMusic();
            clearChat();
            goToMainMenu(changeMusic);
        })
    })
}

function init() {
    if (window.orientation == 90) {
        changeGameScreenMode();
    }
    // window.addEventListener('keydown', function (e) {
    //     keys[e.keyCode] = true;
    //     // e.preventDefault();
    // };
    window.ondeviceorientation = ev => {
        if (ev.gamma) {
            accelerometerGamma = ev.gamma;
        }
    };
    window.onkeyup = (e) => {
        delete keys[e.keyCode];
    };
    window.onkeydown = (e) => {
        if (!stop) {
            switch (e.keyCode) {
                case 80: {
                    if (!stop && document.getElementById('chatInput') != document.activeElement) {
                        EventEmitter.emit('pause');
                    }
                    break;
                }
                case 13: {
                    document.getElementById('chatSendButton').click();
                }
            }
        }
    };
    document.getElementById('pause-button').onclick = () => { if (!stop) {EventEmitter.emit('pause')}}
    document.getElementById('chatSendButton').onclick = sendMessage;
    canvas.onmousemove = (e) => {
        if (mouseCords.x + 25 < e.clientX || mouseCords.x - 25 > e.clientX) {
            mouseCords.release = true;
        } else { mouseCords.release = false; }
        mouseCords.y = e.clientY;
        mouseCords.x = e.clientX;
    }
    canvas.ontouchmove= (e) => {
        if (mouseCords.x + 25 < e.changedTouches[0].clientX || mouseCords.x - 25 > e.changedTouches[0].clientX) {
            mouseCords.release = true;
        } else { mouseCords.release = false; }
        mouseCords.y = e.changedTouches[0].clientY;
        mouseCords.x = e.changedTouches[0].clientX;
    }
    window.onorientationchange = () => {
        if (window.orientation == 90) {
            changeGameScreenMode();
        }
    }
}

export {gameStart, gameEnd}
