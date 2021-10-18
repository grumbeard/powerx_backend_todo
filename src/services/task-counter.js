const WebSocket = require('ws');

module.exports = ({db, wss}) => {
  const service = {};
  
  service.getCurrCount = async () => await db.countAllCompletedItems() || 0;
  
  service.broadcast = (message) => {
    console.log(`Broadcasting message: ${message}`);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  service.broadcastCount = async () => {
    const currCount = await service.getCurrCount();
    console.log(`Latest count: ${currCount}`);
    service.broadcast(JSON.stringify({ taskCount: currCount }));
  }
  
  service.sendCount = async (ws) => {
    const currCount = await service.getCurrCount();
    if (ws.readyState === WebSocket.OPEN) {
      console.log(`Sending count: ${currCount}`);
      ws.send(JSON.stringify({ taskCount: currCount }));
    }
  }
  
  return service;
};