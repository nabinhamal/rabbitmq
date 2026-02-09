//this will exchange the data with the consumer

const amqplib = require("amqplib");

async function sendMail() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "mail_exchange";
    const routingKeyforSubscribeUser = "send_mail_to_subscribe_user";
    const routingKeyforNormalUser = "send_mail_to_normal_user";
    const message = {
      to: "test@test.com",
      from: "test@testad.com",
      subject: "Test",
      body: "Test",
    };
    await channel.assertExchange(exchange, "direct", { durable: false });
    await channel.assertQueue("subscribed_user_queue", { durable: false });
    await channel.assertQueue("normal_user_queue", { durable: false });

    await channel.bindQueue(
      "subscribed_user_queue",
      exchange,
      routingKeyforSubscribeUser,
    );
    await channel.bindQueue(
      "normal_user_queue",
      exchange,
      routingKeyforNormalUser,
    );

    channel.publish(
      exchange,
      routingKeyforNormalUser,
      Buffer.from(JSON.stringify(message)),
    );
    console.log("Message sent", message);

    setTimeout(() => {
      connection.close();
    }, 1000);
  } catch (error) {
    console.log(error);
  }
}
sendMail();
