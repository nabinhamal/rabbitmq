const amqplib = require("amqplib");

const processedQueue = "processed_queue";

async function consumeDelayedMessages() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // We only need to check the destination queue
    await channel.assertQueue(processedQueue, { durable: false });

    console.log(`[*] Waiting for processed messages in ${processedQueue}...`);

    channel.consume(
      processedQueue,
      (msg) => {
        if (msg !== null) {
          console.log(
            `[x] Received at ${new Date().toLocaleTimeString()}: ${msg.content.toString()}`,
          );
          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error("Error in delayed consumer:", error);
  }
}

consumeDelayedMessages();
