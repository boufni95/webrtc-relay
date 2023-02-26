const express = require('express')
const WebSocket = require('ws')

const wss = new WebSocket.WebSocketServer({ port: 8080 });
const conns = []
wss.on('connection', function connection(conn) {
    conn.on('error', console.error);

    conn.on('message', function message(data, isBinary) {
        wss.clients.forEach(function each(client) {
            if (client !== conn && client.readyState === WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });
});


const app = express()
const port = 3000

app.use(express.static('public'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})