let playerState = {
    soundVolume: 1,
    musicVolume: 1,
    currentTrack: undefined,
}

function playMainMenuMusic() {
    if (playerState.currentTrack !== undefined) { stopMusic(); }
        let trackNumber = Math.round(Math.random() * document.getElementsByClassName('music-menu').length);
        if (trackNumber > 0) { trackNumber -= 1; }
        playerState.currentTrack = document.getElementsByClassName('music-menu')[trackNumber];
        playerState.currentTrack.onended = () => { playMainMenuMusic(); }
        playerState.currentTrack.play();
}

function playGameMusic() {
    if (playerState.currentTrack !== undefined) { stopMusic(); }
        let trackNumber = Math.round(Math.random() * document.getElementsByClassName('music-game').length);
        if (trackNumber > 0) { trackNumber -= 1; }
        playerState.currentTrack = document.getElementsByClassName('music-game')[trackNumber];
        playerState.currentTrack.onended = () => { playGameMusic(); }
        playerState.currentTrack.play();
}

function stopMusic() {
    if (playerState.currentTrack !== undefined) { playerState.currentTrack.pause(); playerState.currentTrack.currentTime = 0; }
}

document.getElementById('music-volume').onchange = (e) => {
    playerState.musicVolume = e.target.value * 0.1;
    let elements = document.getElementsByClassName('music');
    for (let i=0 ; i < elements.length ; i++) {
        elements[i].volume = playerState.musicVolume;
    }
    localStorage.setItem('musicVolume', JSON.stringify(playerState.musicVolume));
}

document.getElementById('sound-volume').onchange = (e) => {
    playerState.soundVolume = e.target.value * 0.1;
    let elements = document.getElementsByClassName('sound');
    for (let i=0 ; i < elements.length ; i++) {
        elements[i].volume = playerState.soundVolume;
    }
    document.getElementById('audio-hit1').play();
    localStorage.setItem('soundVolume', JSON.stringify(playerState.soundVolume));
}

function setSettings(musicVolume, soundVolume) {
    playerState.musicVolume = musicVolume;
    playerState.soundVolume = soundVolume;
    let elements = document.getElementsByClassName('music');
    for (let i=0 ; i < elements.length ; i++) {
        elements[i].volume = playerState.soundVolume;
    }
    document.getElementById('music-volume').value = playerState.musicVolume * 10;
    elements = document.getElementsByClassName('sound');
    for (let i=0 ; i < elements.length ; i++) {
        elements[i].volume = playerState.soundVolume;
    }
    document.getElementById('sound-volume').value = playerState.soundVolume * 10;
}

function playBeeps() {
    if (Math.round(Math.random() * 1) == 0) {
        document.getElementsByTagName('audio')[0].play().then(() => {
        });
    } else {
        document.getElementsByTagName('audio')[1].play().then(() => {
        });
    }
}

function playHit() {
    if (Math.round(Math.random() * 1) == 0) {
        document.getElementById('audio-hit1').play().then(() => {
        });
    } else {
        document.getElementById('audio-hit2').play().then(() => {
        });
    }
}

export {playMainMenuMusic, playGameMusic, stopMusic, setSettings, playBeeps, playHit}
