const WebSocket = require('ws');

function startWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', ws => {
    console.log('Client connected');

    // Send initial data or updates periodically
    const interval = setInterval(() => {
      ws.send(JSON.stringify({ message: 'Update from server' }));
    }, 5000);

    ws.on('close', () => {
      console.log('Client disconnected');
      clearInterval(interval);
    });

    ws.on('message', message => {
      console.log('Received:', message);
      // Handle incoming messages from clients
    });
  });

  console.log('WebSocket server started');
}

module.exports = startWebSocketServer;
