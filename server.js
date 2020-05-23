const PORT = process.env.PORT || 80;
const http = require('http');
const fs = require('fs');
const MongoClient = require("mongodb").MongoClient; const {ObjectId} = require("mongodb");
const mongoUrl = 'mongodb://heroku_wqpvrkdq:2158u4v61nvofoho05bapiv1k3@ds029798.mlab.com:29798/heroku_wqpvrkdq';
const dbName = 'heroku_wqpvrkdq';
// const dbName = 'pong-users';
// const mongoUrl = 'mongodb://localhost:27017/';
const server = http.createServer((request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    if (request.url === '/') {
        fs.readFile('client/index.html', (err, data) => {
            response.write(data);
            response.end();
        });
    }
    else if (request.url === '/changeName') {
        changeName(request, response);
    }
    else if (request.url === '/getScores') {
        getScores(request, response);
    }
    else {
        fs.readFile(`${__dirname}/client${request.url}`, function (err,data) {
            if (err) {
                response.writeHead(404);
                response.end(JSON.stringify(err));
                return;
            }
            response.writeHead(200);
            response.end(data);
        });
    }
}).listen(PORT);
const EventEmitterCreator = require('events')
const EventEmitter = new EventEmitterCreator();
let io = require('socket.io').listen(server); io.set('origins', '*:*');

//##### INNER SERVER LOGIC #####
const Room = require('./server-room');
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

//##### Usual requests #####

function changeName(request, response) {
    let dataJSONString = '';
    request.on('data', (data) => {
        dataJSONString += data;
    });
    request.on('end', () => {
        const data = JSON.parse(dataJSONString);
        const mongoClient = new MongoClient(mongoUrl, { useNewUrlParser: true });
        mongoClient.connect((err, client) => { if (err) throw err;
            const collection = client.db(dbName).collection('users');
            collection.findOne(data, (err, res) => { if (err) throw err;
                if (data._id) {
                    console.log(data._id);
                    collection.findOne({_id: ObjectId(data._id)}, (err, res) => { if (err) throw err;
                        if (res) {
                            collection.findOne({name: data.name}, (err, res) => { if (err) throw err;
                                if (!res || res._id == ObjectId(data._id)) {
                                    collection.updateOne({_id: ObjectId(data._id)}, {$set:{name:data.name}}, (err, res) => { if (err) throw err;
                                        response.write(JSON.stringify({name: data.name})); response.end();
                                    });
                                } else { response.write(JSON.stringify({err: 'Name is already taken!'})); response.end(); }
                            });
                        } else {
                            response.write(JSON.stringify({err: 'No user with such id!'})); response.end();
                        }
                    });
                } else {
                    collection.findOne(data, (err, res) => { if (err) throw err;
                        if (res) {
                            response.write(JSON.stringify({err: 'Name is already taken!'})); response.end();
                        } else {
                            collection.insertOne({name: data.name}, (err, res) => { if (err) throw err;
                                response.write(JSON.stringify(res.ops[0])); response.end();
                            });
                        }
                    });
                }
            });
        });
    });
}

function getScores(request, response) {
    let dataJSONString = '';
    request.on('data', (data) => {
        dataJSONString += data;
    });
    request.on('end', () => {
        let data;
        if (dataJSONString) {
            data = JSON.parse(dataJSONString);
        }
        const mongoClient = new MongoClient(mongoUrl, { useNewUrlParser: true });
        mongoClient.connect((err, client) => {
            if (err) throw err;
            const collection = client.db(dbName).collection('users');
            let returnData = {
                topPlayers: new Array(),
                ownScore: undefined
            }
            collection.find().sort({score: -1}).limit(10).forEach((item) => {
                returnData.topPlayers.push({name: item.name, score: item.score || 0});
            }).then(() => {
                if (data._id) {
                    collection.findOne({_id: ObjectId(data._id)}).then((res) => {
                        if (res) {
                            returnData.ownScore = {name: res.name, score: res.score};
                        }
                        response.write(JSON.stringify(returnData)); response.end();
                    })
                } else {
                    response.write(JSON.stringify(returnData)); response.end();
                }
            });
        });
    });
}
