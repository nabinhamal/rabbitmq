const amqplib = require("amqplib");

const queueName = "lazy_queue_test";

async function sendLazyMessages() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // Assert a LAZY queue
    // 'x-queue-mode': 'lazy' tells RabbitMQ to store messages on disk as much as possible
    await channel.assertQueue(queueName, {
      durable: true, // Typically lazy queues are also durable
      arguments: {
        "x-queue-mode": "lazy",
      },
    });

    console.log(`[x] Sending 1000 messages to lazy queue...`);

    // Send a bulk of messages
    for (let i = 0; i < 1000; i++) {
      const msg = JSON.stringify({
        id: i,
        content: "Bulk message",
        timestamp: Date.now(),
      });
      channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });
    }

    console.log("[x] Sent 1000 messages. They should be stored on disk.");

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("Error in lazy producer:", error);
  }
}

sendLazyMessages();
