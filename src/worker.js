require('dotenv').config();
const amqplib = require('amqplib');
const AccessListService = require('./services/access-list');

const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost';
const QUEUE = 'add-account-to-access-list';

const db = require('./db')();
const service = AccessListService(db);

async function main() {
  const client = await amqplib.connect(AMQP_URL);
  const channel = await client.createChannel();
  
  // Asserts queue exists
  await channel.assertQueue(QUEUE);
  // Consume message from queue
  channel.consume(QUEUE, async (message) => {
    if (!message) return channel.nack(message);
    const { id, email } = JSON.parse(message.content);
    channel.ack(message);
    
    // Check if user exists
    const account = await service.validateAccount(email);
    if (!account) {
      console.log(`Account with email '${email}' does not exist`);
      return;
    }
    
    // Update Access List for TodoList
    const todoList = await service.addAccountToAccessList({ id, account });
    console.log(`TodoList Access List updated: [${todoList.access_list}]`);
  })
}

main().catch(err => console.log(err));