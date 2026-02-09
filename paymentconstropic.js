const amqplib = require("amqplib");

async function receivePayments() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "notification_exchange";
    const queue = "payment_queue";

    await channel.assertExchange(exchange, "topic", { durable: true });
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, "payment.*");

    console.log("Waiting for payment messages...");

    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          console.log("Received payment:", JSON.parse(msg.content.toString()));
          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.log(error);
  }
}

receivePayments();
