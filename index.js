const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const app = express()
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
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

app.use(express.static('public'))
const port = 3000
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})