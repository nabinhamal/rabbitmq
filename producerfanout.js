const amqplib = require("amqplib");

async function sendNotification() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchange = "notification_fanout_exchange";

    await channel.assertExchange(exchange, "fanout", { durable: true });

    const message = {
      message: "New alert for all users!",
      timestamp: new Date().toISOString(),
    };

    channel.publish(exchange, "", Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log("[x] Sent message to all queues:", message);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("Error:", error);
  }
}

sendNotification();
