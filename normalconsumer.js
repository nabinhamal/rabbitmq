const amqplib = require("amqplib");

async function receiveMail() {
  const connection = await amqplib.connect("amqp://localhost:5672");
  const channel = await connection.createChannel();

  await channel.assertQueue("normal_user_queue", { durable: false });
  channel.consume("normal_user_queue", (msg) => {
    if (msg !== null) {
      console.log("Received message", JSON.parse(msg.content));
      channel.ack(msg);
    }
  });
}

receiveMail();
