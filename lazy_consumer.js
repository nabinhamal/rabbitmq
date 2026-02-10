const amqplib = require("amqplib");

const queueName = "lazy_queue_test";

async function consumeLazyMessages() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // Assert the same LAZY queue
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-queue-mode": "lazy",
      },
    });

    // Use prefetch to control memory usage on consumer side too
    channel.prefetch(20);

    console.log(
      `[*] Waiting for messages in ${queueName}. To exit press CTRL+C`,
    );

    channel.consume(
      queueName,
      (msg) => {
        if (msg !== null) {
          // Just acknowledge to clear the queue
          // In a real app, we'd process it.
          // console.log(`[x] Received ${msg.content.toString()}`);
          channel.ack(msg);
        }
      },
      { noAck: false },
    );

    // Log progress periodically instead of every message to avoid console spam
    setInterval(async () => {
      const { messageCount } = await channel.checkQueue(queueName);
      console.log(`[*] Remaining messages in queue: ${messageCount}`);
      if (messageCount === 0) {
        console.log("[*] Queue empty.");
        // connection.close(); process.exit(0); // keep running to show it clearing
      }
    }, 1000);
  } catch (error) {
    console.error("Error in lazy consumer:", error);
  }
}

consumeLazyMessages();
