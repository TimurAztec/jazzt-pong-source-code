parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"tf71":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.playMainMenuMusic=t,exports.playGameMusic=n,exports.stopMusic=u,exports.setSettings=o,exports.playBeeps=m,exports.playHit=a;var e={soundVolume:1,musicVolume:1,currentTrack:void 0};function t(){void 0!==e.currentTrack&&u();var n=Math.round(Math.random()*document.getElementsByClassName("music-menu").length);n>0&&(n-=1),e.currentTrack=document.getElementsByClassName("music-menu")[n],e.currentTrack.onended=function(){t()},e.currentTrack.play()}function n(){void 0!==e.currentTrack&&u();var t=Math.round(Math.random()*document.getElementsByClassName("music-game").length);t>0&&(t-=1),e.currentTrack=document.getElementsByClassName("music-game")[t],e.currentTrack.onended=function(){n()},e.currentTrack.play()}function u(){void 0!==e.currentTrack&&(e.currentTrack.pause(),e.currentTrack.currentTime=0)}function o(t,n){e.musicVolume=t,e.soundVolume=n;for(var u=document.getElementsByClassName("music"),o=0;o<u.length;o++)u[o].volume=e.soundVolume;document.getElementById("music-volume").value=10*e.musicVolume,u=document.getElementsByClassName("sound");for(var m=0;m<u.length;m++)u[m].volume=e.soundVolume;document.getElementById("sound-volume").value=10*e.soundVolume}function m(){0==Math.round(1*Math.random())?document.getElementsByTagName("audio")[0].play().then(function(){}):document.getElementsByTagName("audio")[1].play().then(function(){})}function a(){0==Math.round(1*Math.random())?document.getElementById("audio-hit1").play().then(function(){}):document.getElementById("audio-hit2").play().then(function(){})}document.getElementById("music-volume").onchange=function(t){e.musicVolume=.1*t.target.value;for(var n=document.getElementsByClassName("music"),u=0;u<n.length;u++)n[u].volume=e.musicVolume;localStorage.setItem("musicVolume",JSON.stringify(e.musicVolume))},document.getElementById("sound-volume").onchange=function(t){e.soundVolume=.1*t.target.value;for(var n=document.getElementsByClassName("sound"),u=0;u<n.length;u++)n[u].volume=e.soundVolume;document.getElementById("audio-hit1").play(),localStorage.setItem("soundVolume",JSON.stringify(e.soundVolume))};
},{}],"LXja":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.loadSettings=a;var e=require("./music-player");function t(){for(var e=document.getElementsByClassName("controls"),t=0;t<e.length;t++)e[t].onchange=function(e){e.target.checked&&localStorage.setItem("controls",e.target.getAttribute("class").substr(0,1))}}function n(){document.getElementById("difficulty-slide").onchange=function(){localStorage.setItem("difficulty",JSON.stringify(document.getElementById("difficulty-slide").value))}}function o(){localStorage.getItem("controls")?document.getElementsByClassName("controls")[JSON.parse(localStorage.getItem("controls"))].checked=!0:(localStorage.setItem("controls","1"),o())}function a(){localStorage.getItem("name")&&(document.getElementById("name-input").value=localStorage.getItem("name")),document.getElementById("difficulty-slide").value=JSON.parse(localStorage.getItem("difficulty"))||3,localStorage.getItem("musicVolume")&&localStorage.getItem("soundVolume")&&(0,e.setSettings)(JSON.parse(localStorage.getItem("musicVolume")),JSON.parse(localStorage.getItem("soundVolume"))),o()}document.getElementById("name-input").onchange=function(e){var t=new XMLHttpRequest;t.open("POST","https://jazzt-pong.herokuapp.com/changeName",!0),t.onreadystatechange=function(){var e=JSON.parse(t.responseText);e.name&&localStorage.setItem("name",e.name),e._id&&localStorage.setItem("id",JSON.stringify(e._id)),e.err?(document.getElementById("name-input").value=localStorage.getItem("name"),document.getElementById("settings-error").querySelector("span").innerText=e.err):document.getElementById("settings-error").querySelector("span").innerText=""},localStorage.getItem("id")?t.send(JSON.stringify({_id:JSON.parse(localStorage.getItem("id")),name:e.target.value})):t.send(JSON.stringify({name:e.target.value}))},t(),n();
},{"./music-player":"tf71"}]},{},["LXja"], null)
//# sourceMappingURL=/settings.30d9060c.js.map