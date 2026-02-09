const amqplib = require("amqplib");

async function receiveOrders() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "notification_exchange";
    const queue = "order_queue";

    await channel.assertExchange(exchange, "topic", { durable: true });
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, "order.*");

    console.log("Waiting for order messages...");

    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          console.log("Received order:", JSON.parse(msg.content.toString()));
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      },
    );
  } catch (error) {
    console.log(error);
  }
}

receiveOrders();
