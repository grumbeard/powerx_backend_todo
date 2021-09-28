require('dotenv').config();
const amqplib = require('amqplib');

const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost';
const QUEUE = 'add-account-to-access-list';

module.exports = () => {
  const service = {};
  
  service.publishAddToList = async (message) => {
    const client = await amqplib.connect(AMQP_URL);
    const channel = await client.createChannel();
    
    // Asserts queue exists
    await channel.assertQueue(QUEUE);
    // Send message to queue
    channel.sendToQueue(QUEUE, new Buffer.from(JSON.stringify(message)), { 'Content-Type': 'application/json' });
    
    await channel.close();
    await client.close();
  };
  
  return service;
};

