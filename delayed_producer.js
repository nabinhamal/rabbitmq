const amqplib = require("amqplib");

const dlxExchange = "dlx_exchange";
const mainExchange = "processing_exchange";
const delayedQueue = "delayed_queue";
const processedQueue = "processed_queue";

async function sendDelayedMessage() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // 1. Assert the Exchange for processed messages
    await channel.assertExchange(mainExchange, "direct", { durable: false });

    // 2. Assert the Dead Letter Exchange (optional, can use default, but explicit is better)
    await channel.assertExchange(dlxExchange, "direct", { durable: false });

    // 3. Assert the Delayed Queue (Acting as a buffer)
    // Messages here will sit for 'x-message-ttl' ms, then be forwarded to 'x-dead-letter-exchange' with 'x-dead-letter-routing-key'
    await channel.assertQueue(delayedQueue, {
      durable: false,
      arguments: {
        "x-message-ttl": 5000, // 5 seconds delay
        "x-dead-letter-exchange": mainExchange,
        "x-dead-letter-routing-key": "processed_key",
      },
    });

    // 4. Assert the Processed Queue (Destination)
    await channel.assertQueue(processedQueue, { durable: false });

    // 5. Bind Processed Queue to Main Exchange
    // So when delayed_queue sends to mainExchange with 'processed_key', it goes here.
    await channel.bindQueue(processedQueue, mainExchange, "processed_key");

    const msg = "This message was delayed by 5 seconds!";
    console.log(`[x] Sending message at ${new Date().toLocaleTimeString()}`);

    // Send to delayed queue
    channel.sendToQueue(delayedQueue, Buffer.from(msg));

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("Error in delayed producer:", error);
  }
}

sendDelayedMessage();
