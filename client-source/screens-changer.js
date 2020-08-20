import {gameEnd, gameStart} from './pong-game';
import {playHit, playMainMenuMusic} from './music-player';
import splashes from "./splashes.json";
import {gameStartSingle, gameEndSingle} from "./pong-game-single";
import {loadScores} from "./score";

// document.getElementById('screen-game').style.display = 'none';
document.getElementById('play-single').onclick = () => {
    document.getElementById('screen-menu').style.display = 'none';
    document.getElementById('screen-game').style.display = 'flex';
    document.getElementsByClassName('to-main-menu')[1].onclick = gameEndSingle;
    gameStartSingle();
}

document.getElementById('play-online').onclick = () => {
    document.getElementById('screen-menu').style.display = 'none';
    document.getElementById('screen-game').style.display = 'flex';
    document.getElementsByClassName('to-main-menu')[1].onclick = gameEnd;
    gameStart('https://jazzt-pong.herokuapp.com/');
}

// document.getElementById('play-lan').onclick = () => {
//     document.getElementById('screen-menu').style.display = 'none';
//     document.getElementById('screen-game').style.display = 'flex';
//     document.getElementsByClassName('to-main-menu')[1].onclick = gameEnd;
//     gameStart('localhost:80');
// }

document.getElementById('play-online-private').onclick = () => {
    document.getElementById('screen-menu').style.display = 'none';
    document.getElementById('screen-enter-game-seed').style.display = 'flex';
}

document.getElementById('settings').onclick = () => {
    document.getElementById('settings-error').querySelector('span').innerText = '';
    document.getElementById('screen-menu').style.display = 'none';
    document.getElementById('screen-setting').style.display = 'flex';
}

document.getElementsByClassName('to-main-menu')[2].onclick = () => {goToMainMenu(false)}
document.getElementById('scores-table').onclick = () => {

}

document.getElementById('game-fullscreen-button').onclick = changeGameScreenMode;

function changeGameScreenMode() {
    document.getElementById('canvas').requestFullscreen();
    document.getElementById('canvas').style.borderBottom = '4px solid white';
}

document.getElementById('scores-table').onclick = () => {
    document.getElementById('screen-menu').style.display = 'none';
    document.getElementById('screen-setting').style.display = 'none';
    document.getElementById('screen-score').style.display = 'flex';
    loadScores();
}

document.onfullscreenchange = (e) => {
    if (!document.fullscreen) {
        document.getElementById('canvas').style.borderBottom = 'none';
    }
}

function loadSplashes() {
    let num = Math.round(Math.random() * splashes.splashes.length);
    if (num > splashes.splashes.length - 1) {
        document.getElementById('title').innerText = 'KINGPONG';
        document.getElementById('splash').innerText = '';
    } else {
        document.getElementById('splash').innerText = splashes.splashes[num];
    }
}

function goToMainMenu(changeMusic) {
    document.title = 'Jazzt Pong';
    document.getElementById('title').className = 'animate__animated animate__backInUp'; hits = 0;
    document.getElementById('splash').className = 'animate__animated animate__backInDown';
    loadSplashes();
    if (changeMusic) {
        playMainMenuMusic();
    }
    document.getElementById('screen-menu').style.display = 'flex';
    document.getElementById('screen-game').style.display = 'none';
    document.getElementById('screen-setting').style.display = 'none';
    document.getElementById('screen-score').style.display = 'none';
    document.getElementById('screen-enter-game-seed').style.display = 'none';
}

document.getElementsByClassName('to-main-menu')[0].onclick = () => {
    goToMainMenu(false)
};
document.getElementsByClassName('to-main-menu')[3].onclick = () => {
    goToMainMenu(false)
};

document.getElementsByClassName('ok-button')[0].onclick = () => {
    if (document.getElementById('seed-input').value) {
        document.getElementById('screen-enter-game-seed').style.display = 'none';
        document.getElementById('screen-game').style.display = 'flex';
        document.getElementsByClassName('to-main-menu')[1].onclick = gameEnd;
        gameStart('https://jazzt-pong.herokuapp.com/', document.getElementById('seed-input').value);
        document.getElementById('seed-input').value = '';
    }
}

let hits = 0;
document.getElementById('title').onmouseenter = () => {
    if (hits > 6) {
        playHit();
        document.getElementById('title').className = 'animate__animated animate__hinge';
        document.title = 'The game with no name'
    } else {
        playHit();
        document.getElementById('title').className = 'animate__animated animate__headShake';
        hits++;
    }
}
document.getElementById('title').onmouseleave = () => {
    if (hits <= 6) {
        document.getElementById('title').className = 'animate__animated';
    }
}
document.getElementById('splash').onmouseenter = () => {
    document.getElementById('splash').className = 'animate__animated animate__tada';
}

export {goToMainMenu, changeGameScreenMode}
