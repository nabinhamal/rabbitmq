const amqplib = require("amqplib");

async function receiveSMS() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "notification_fanout_exchange";

    await channel.assertExchange(exchange, "fanout", { durable: true });

    const queue = await channel.assertQueue("", {
      exclusive: true,
    });
    await channel.bindQueue(queue.queue, exchange, "");

    console.log(" [*] Waiting for SMS messages in %s.", queue.queue);

    channel.consume(
      queue.queue,
      (msg) => {
        if (msg.content) {
          console.log(" [x] RECEIVED SMS:", JSON.parse(msg.content.toString()));
          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

receiveSMS();
