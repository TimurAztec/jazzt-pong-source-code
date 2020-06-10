function loadScores() {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", 'https://jazzt-pong.herokuapp.com/getScores', true);
    // xmlHttp.open("POST", 'http://localhost:80/getScores', true);
    xmlHttp.onreadystatechange = () => {
        const res = JSON.parse(xmlHttp.responseText);
        drawTable(res);
    }
    if (localStorage.getItem('id')) {
        xmlHttp.send(JSON.stringify({_id: JSON.parse(localStorage.getItem('id'))}));
    } else {
        xmlHttp.send(JSON.stringify({}));
    }
}

function drawTable(data) {
    document.getElementById('score-table').innerHTML = '';
    data.topPlayers.forEach((player) => {
        let playerString = document.createElement('span');
        playerString.className = 'playerString';
        playerString.innerHTML = `<span>&#160;Name: ${player.name}</span><label>&#160;Score: ${player.score}</label>`
        document.getElementById('score-table').appendChild(playerString);
    });
    if (data.ownScore) {
        document.getElementById('own-score').style.border = 'border: 4px solid white'
        document.getElementById('own-score').innerHTML = `<span><span>&#160;You: ${data.ownScore.name}</span><label>&#160;Score: ${data.ownScore.score}</label></span>`
    } else {
        document.getElementById('own-score').style.border = 'none'
        document.getElementById('own-score').innerText = `Please enter your name in settings to start gaining score points!`
    }
}

export {loadScores}
