const PORT = process.env.PORT || 80;
const http = require('http');
const fs = require('fs');
const server = http.createServer((request, response) => {
    if (request.url == '/') {
        fs.readFile('../client/index.html', (err, data) => {
            response.write(data);
            response.end();
        });
    }
}).listen(PORT);
const EventEmitterCreator = require('events')
const EventEmitter = new EventEmitterCreator();
let io = require('socket.io').listen(server); io.set('origins', '*:*');

//##### INNER SERVER LOGIC #####
const Room = require('./room');
setInterval(() => {
    getRoomsIds().forEach((id) => {
        let room = getRoom(id);
        if (!room.roomData && room.length == 2) { room.roomData = new Room(io, room, id) }
        if (room.roomData) { room.roomData.process(); }
    });
}, 1000/60);

function getRoomsIds() {
    return Object.keys(io.sockets.adapter.rooms).filter((item) => { return item.match(/^\d+$/g) });
}

function getRoom(id) {
    return io.sockets.adapter.rooms[id];
}
//##### Io sockets logic #####

io.sockets.on('connection', (socket) => {

    let roomId = 0;
    function tryToJoin() {
        socket.join(roomId.toString());
        if (socket.adapter.rooms[roomId.toString()].length > 2) {
            socket.leaveAll();
            roomId += 1;
            tryToJoin();
        } else {
            console.log(`${socket.request.connection.remoteAddress} connected as ${socket.id} to room number ${roomId}`);
            socket.emit('connected');
        }
    }
    tryToJoin();

})

