import Ball from "./ball";
import PGenerator from "./particles-generator";
import {changeGameScreenMode, goToMainMenu} from "./screens-changer";
import {playGameMusic, stopMusic} from './music-player';
import SceneDynamicObject from "./SceneDynamicObject";
import RenderObjectRect from "./RenderObjectRect";

let pause;
let stop;
let left;
let right;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ParticlesGenerator = new PGenerator(ctx);
canvas.width = 650;
canvas.height = 400;
let score = {
    score1: 0,
    score2: 0,
};
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
        player = gameObjects.active[0];
        botMovement(gameObjects.active[1]);
    } else if (right) {
        player = gameObjects.active[1];
        botMovement(gameObjects.active[0]);
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
                if (mouseCords.release) {
                    if (left) { gameObjects.active[2].release('left', score); }
                    else if (right) { gameObjects.active[2].release('right', score); }
                    mouseCords.release = false;
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
                if (left) { gameObjects.active[2].release('left', score);}
                else if (right) { gameObjects.active[2].release('right', score); }
                mouseCords.release = false;
            }
            break;
        }
    }
    if (13 in keys) {
        if (left) { gameObjects.active[2].release('left', score); }
        else if (right) { gameObjects.active[2].release('right', score); }
    }
}

function botMovement(player) {
    let ball = gameObjects.active[2];
    let futurePlayerPos;
    let move = Math.random() * (JSON.parse(localStorage.getItem('difficulty'))*0.1 || 0.3);
    if (left) {
        move += ((ball.x*0.001) + (ball.sx*0.01));
    } else {
        move += (((canvas.width-ball.x)*0.001) + (ball.sx*-0.01));
    }
    move = Math.round(move);
    if (gameObjects.active[2].holded.state && gameObjects.active[2].holded.paddle == player) {
        let enemy;
        if (left) {enemy = gameObjects.active[0]} else {enemy = gameObjects.active[1]}
        if (enemy.y+enemy.height/2 > player.y+player.height/2+150 ||
            enemy.y+enemy.height/2 < player.y+player.height/2-150) {
            if (left) {
                gameObjects.active[2].release('right', score);
            } else if (right) {
                gameObjects.active[2].release('left', score);
            }
        } else {
            if (enemy.y+enemy.height/2 > player.y+player.height/2) {
                futurePlayerPos = player.y - (player.sy/2.5);
            } else {
                futurePlayerPos = player.y + (player.sy/2.5);
            }
        }
    } else if (gameObjects.active[2].holded.state) {
        move += 0.15;
    }
    if (move) {
        // let ballSpeed = ball.sx; if (ballSpeed<0) {ballSpeed = -ballSpeed}
        if ((player.y+player.height/2) < (ball.y+ball.height/2)-25) {
            futurePlayerPos = player.y + (player.sy/2);
        } else if ((player.y+player.height/2) > (ball.y+ball.height/2)+25) {
            futurePlayerPos = player.y - (player.sy/2);
        }
    }
    if (futurePlayerPos > 0) {
        if (futurePlayerPos + player.height < canvas.height) {
            player.y = futurePlayerPos;
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
    // if (server_cords) { str = server_cords.score1 } else { str = score1 };
    str = score.score1;
    ctx.fillText(str, (canvas.width / 2) - 50, 30);
    str = score.score2;
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
    gameObjects.active[2].collideBounds(canvas, score, new Array([gameObjects.active[0], gameObjects.active[1]]));
    processActiveObjects();
    scoreCheck();
}

function processActiveObjects() {
    gameObjects.active.forEach(item => item.process() );
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
        let friction = {x:0,y:0}; friction.y = obj2.y - obj2.lasty;
        if (!(obj1.y+obj1.sy > obj2.y+obj2.height) && (obj1.x<obj2.x+obj2.width) && (obj1.x+obj1.width>obj2.x)) {
            obj1.collide(3, friction);
        } else if (!(obj1.y+obj1.height+obj1.sy < obj2.y) && (obj1.x<obj2.x+obj2.width) && (obj1.x+obj1.width>obj2.x)) {
            obj1.collide(4, friction);
        } else if (!(obj1.x+obj1.width > obj2.x)) {
            obj1.collide(1, friction);
        } else if (!(obj1.x < obj2.x+obj2.width)) {
            obj1.collide(2, friction);
        } else {
            obj1.collide(0, friction);
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

function scoreCheck() {
    if (score.score1 >= 10) {
        let message = document.createElement('span');
        if (left) {
            if (localStorage.getItem('name')) {
                message.innerText = `${localStorage.getItem('name')} won this round! Restarting...`;
            } else {
                message.innerText = `Player won this round! Restarting...`;
            }
        } else {
            message.innerText = `PONG_BOT_3000 won this round! Restarting...`;
        }
        document.getElementById('chat').appendChild(message); message.scrollIntoView();
        clearScore();
        createObjects();
    } else if (score.score2 >= 10) {
        let message = document.createElement('span');
        if (left) {
            message.innerText = `PONG_BOT_3000 won this round! Restarting...`;
        } else {
            if (localStorage.getItem('name')) {
                message.innerText = `${localStorage.getItem('name')} won this round! Restarting...`;
            } else {
                message.innerText = `Player won this round! Restarting...`;
            }
        }
        document.getElementById('chat').appendChild(message); message.scrollIntoView();
        clearScore();
        createObjects();
    }
}

function clearScore() {
    score = {
        score1: 0,
        score2: 0,
    }
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
            message.innerText = `Game paused (Press 'P' or 'Continue' to continue)`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
        }
    }
}

document.getElementById('chatSendButton').onclick = sendMessage;

function sendMessage() {
    if (document.getElementById('chatInput').value) {
        if (localStorage.getItem('name')) {
            let message = document.createElement('span');
            message.innerText = `${localStorage.getItem('name')} says: ${document.getElementById('chatInput').value}`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
        } else if (left) {
            let message = document.createElement('span');
            message.innerText = `player 1 says: ${document.getElementById('chatInput').value}`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
        } else if (right) {
            let message = document.createElement('span');
            message.innerText = `player 2 says: ${document.getElementById('chatInput').value}`;
            document.getElementById('chat').appendChild(message); message.scrollIntoView();
        }
        document.getElementById('chatInput').value = '';
    }
}

function gameStartSingle() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            init(); document.getElementById('ping').innerText = '';
            createObjects();
            stop = false;
            stopMusic();
            definePlayerSide();
            setTimeout(() => {
                let beep = document.getElementById('audio-beep3');
                beep.onended = () => { setTimeout(() => playGameMusic(), 250); }; beep.play();
            }, 250);
            loop();
}

function gameEndSingle() {
    pause = false;
    stop = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stopMusic();
    clearChat();
    clearScore();
    goToMainMenu(true);
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
    gameObjects.active.push(new Ball({
        x: (canvas.width / 2) - 8,
        y: (canvas.height / 2) - 8,
        width: 16,
        height: 16,
        color: '#FFFFFF',
        name: 'mainBall',
        sy: (Math.random()*2 + -1)*2,
        sx: (Math.random()*2 + -1)*2,
        rotation: 0.05,
        render: {
            width: 16,
            height: 16,
        }
    }, ParticlesGenerator, ctx));
    if (gameObjects.active[2].sx > -0.5 && gameObjects.active[2].sx < 0) {
        gameObjects.active[2].sx = -0.5;
    } else if (gameObjects.active[2].sx < 0.5 && gameObjects.active[2].sx > 0) {
        gameObjects.active[2].sx = 0.5;
    } else if (gameObjects.active[2].sy > -0.5 && gameObjects.active[2].sy < 0) {
        gameObjects.active[2].sy = -0.5;
    } else if (gameObjects.active[2].sy < 0.5 && gameObjects.active[2].sy > 0) {
        gameObjects.active[2].sy = 0.5;
    }
}

function definePlayerSide() {
    ctx.font = "16px retro";
    ctx.fillStyle = "rgb(255,255,255)";
    if (Math.round(Math.random() * 1) == 0) {
        left = true;
    } else {
        right = true;
    }
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

function init() {
    if (window.orientation == 90) {
        changeGameScreenMode();
    }
    // window.onkeydown = (e) => {
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
                        pause = !pause;
                        if (!pause) { loop(); }
                    }
                    break;
                }
                case 13: {
                    document.getElementById('chatSendButton').click();
                }
            }
        }
    };
    document.getElementById('pause-button').onclick = () => {
        if (!stop) { pause = !pause; if (!pause) { loop(); document.getElementById('pause-button').innerText = 'Pause';}}
    }
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

export {gameStartSingle, gameEndSingle}
