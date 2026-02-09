const amqplib = require("amqplib");

async function receivePush() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "notification_fanout_exchange";

    await channel.assertExchange(exchange, "fanout", { durable: true });

    // Ensure queue exists and bind to exchange. Fanout ignores routing key.
    const q = await channel.assertQueue("", {
      exclusive: true,
    });
    await channel.bindQueue(q.queue, exchange, "");

    console.log(" [*] Waiting for PUSH NOTIFICATION messages in %s.", q.queue);

    channel.consume(
      q.queue,
      (msg) => {
        if (msg.content) {
          console.log(
            " [x] RECEIVED PUSH:",
            JSON.parse(msg.content.toString()),
          );
          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

receivePush();
