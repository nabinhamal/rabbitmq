const amqplib = require("amqplib");

const sendMessage = async (routingKey, message) => {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "notification_exchange";
    const exchangeType = "topic";

    await channel.assertExchange(exchange, exchangeType, { durable: true });

    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    console.log("[x] Sent '%s':'%s'", routingKey, JSON.stringify(message));
    console.log(`Message was sent as ${routingKey} and message is ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.log("Error", error);
  }
};

sendMessage("order.placed", { orderId: 1, status: "placed" });
sendMessage("payment.processed", { paymentId: 1, status: "processed" });
