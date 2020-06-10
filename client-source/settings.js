import {setSettings} from "./music-player";

document.getElementById('name-input').onchange = (e) => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", 'https://jazzt-pong.herokuapp.com/changeName', true);
    // xmlHttp.open("POST", 'http://localhost:80/changeName', true);
    xmlHttp.onreadystatechange = () => {
        let res = JSON.parse(xmlHttp.responseText);
        if (res.name) { localStorage.setItem('name', res.name); }
        if (res._id) { localStorage.setItem('id', JSON.stringify(res._id)); }
        if (res.err) {
            document.getElementById('name-input').value = localStorage.getItem('name');
            document.getElementById('settings-error').querySelector('span').innerText = res.err;
        } else {
            document.getElementById('settings-error').querySelector('span').innerText = '';
        }
    }
    if (localStorage.getItem('id')) {
        xmlHttp.send(JSON.stringify({_id: JSON.parse(localStorage.getItem('id')),name: e.target.value}));
    } else {
        xmlHttp.send(JSON.stringify({name: e.target.value}));
    }
}

function handleControlsChange() {
    let elements = document.getElementsByClassName('controls');
    for (let i=0 ; i < elements.length ; i++) {
        elements[i].onchange = (e) => {
            if (e.target.checked) {
                localStorage.setItem('controls', e.target.getAttribute('class').substr(0,1));
            }
        }
    }
}
function handleSettingsChange() {
    document.getElementById('difficulty-slide').onchange = () => {
        localStorage.setItem('difficulty', JSON.stringify(document.getElementById('difficulty-slide').value));
    }
}
function loadControlsSettings() {
    if (localStorage.getItem('controls')) {
        document.getElementsByClassName('controls')[JSON.parse(localStorage.getItem('controls'))].checked = true;
    } else {
        localStorage.setItem('controls', '1'); loadControlsSettings();
    }
}
handleControlsChange(); handleSettingsChange();

function loadSettings() {
    if (localStorage.getItem('name')) {document.getElementById('name-input').value = localStorage.getItem('name');}
    document.getElementById('difficulty-slide').value = JSON.parse(localStorage.getItem('difficulty')) || 3;
    if (localStorage.getItem('musicVolume') && localStorage.getItem('soundVolume')) {
        setSettings(JSON.parse(localStorage.getItem('musicVolume')), JSON.parse(localStorage.getItem('soundVolume')));
    }
    loadControlsSettings();
}

export {loadSettings}
