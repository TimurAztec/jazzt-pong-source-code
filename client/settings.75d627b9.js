parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"tf71":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.playMainMenuMusic=u,exports.playGameMusic=t,exports.stopMusic=n,exports.setSettings=o;var e={soundVolume:1,musicVolume:1,currentTrack:void 0};function u(){void 0!==e.currentTrack&&n();var t=Math.round(Math.random()*document.getElementsByClassName("music-menu").length);t>0&&(t-=1),e.currentTrack=document.getElementsByClassName("music-menu")[t],e.currentTrack.onended=function(){u()},e.currentTrack.play()}function t(){void 0!==e.currentTrack&&n();var u=Math.round(Math.random()*document.getElementsByClassName("music-game").length);u>0&&(u-=1),e.currentTrack=document.getElementsByClassName("music-game")[u],e.currentTrack.onended=function(){t()},e.currentTrack.play()}function n(){void 0!==e.currentTrack&&(e.currentTrack.pause(),e.currentTrack.currentTime=0)}function o(u,t){e.musicVolume=u,e.soundVolume=t;for(var n=document.getElementsByClassName("music"),o=0;o<n.length;o++)n[o].volume=e.soundVolume;document.getElementById("music-volume").value=10*e.musicVolume,n=document.getElementsByClassName("sound");for(var m=0;m<n.length;m++)n[m].volume=e.soundVolume;document.getElementById("sound-volume").value=10*e.soundVolume}document.getElementById("music-volume").onchange=function(u){e.musicVolume=.1*u.target.value;for(var t=document.getElementsByClassName("music"),n=0;n<t.length;n++)t[n].volume=e.musicVolume;localStorage.setItem("musicVolume",JSON.stringify(e.musicVolume)),localStorage.setItem("soundVolume",JSON.stringify(e.musicVolume))},document.getElementById("sound-volume").onchange=function(u){e.soundVolume=.1*u.target.value;for(var t=document.getElementsByClassName("sound"),n=0;n<t.length;n++)t[n].volume=e.soundVolume;document.getElementById("audio-hit1").play(),localStorage.setItem("musicVolume",JSON.stringify(e.musicVolume)),localStorage.setItem("soundVolume",JSON.stringify(e.soundVolume))};
},{}],"LXja":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.loadSettings=a;var e=require("./music-player");function t(){for(var e=document.getElementsByClassName("controls"),t=0;t<e.length;t++)e[t].onchange=function(e){e.target.checked&&localStorage.setItem("controls",e.target.getAttribute("class").substr(0,1))}}function o(){localStorage.getItem("controls")?document.getElementsByClassName("controls")[JSON.parse(localStorage.getItem("controls"))].checked=!0:(localStorage.setItem("controls","1"),o())}function a(){localStorage.getItem("name")&&(document.getElementById("name-input").value=localStorage.getItem("name")),localStorage.getItem("musicVolume")&&localStorage.getItem("soundVolume")&&(0,e.setSettings)(JSON.parse(localStorage.getItem("musicVolume")),JSON.parse(localStorage.getItem("soundVolume"))),o()}document.getElementById("name-input").onchange=function(e){var t=new XMLHttpRequest;t.open("POST","https://jazzt-pong.herokuapp.com/changeName",!0),t.onreadystatechange=function(){var e=JSON.parse(t.responseText);e.name&&localStorage.setItem("name",e.name),e._id&&localStorage.setItem("id",JSON.stringify(e._id)),e.err?(document.getElementById("name-input").value=localStorage.getItem("name"),document.getElementById("settings-error").querySelector("span").innerText=e.err):document.getElementById("settings-error").querySelector("span").innerText=""},localStorage.getItem("id")?t.send(JSON.stringify({_id:JSON.parse(localStorage.getItem("id")),name:e.target.value})):t.send(JSON.stringify({name:e.target.value}))},t();
},{"./music-player":"tf71"}]},{},["LXja"], null)
//# sourceMappingURL=/settings.75d627b9.js.map