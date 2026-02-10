const amqplib = require("amqplib");

const sendNewVideoEvents = async (headers, message) => {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchangeName = "header_exchange";
    const exchangeType = "headers";

    await channel.assertExchange(exchangeName, exchangeType, { durable: true });

    channel.publish(exchangeName, "", Buffer.from(JSON.stringify(message)), {
      persistent: true,
      headers,
    });

    console.log(`[x] Sent notification with message and header `);
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error in producer:", error);
  }
};

sendNewVideoEvents(
  { "x-match": "all", "notification-type": "new_video", content_type: "video" },
  "New video uploaded",
);
sendNewVideoEvents(
  {
    "x-match": "all",
    "notification-type": "live_stream",
    content_type: "gaming",
  },
  "New live stream uploaded",
);

sendNewVideoEvents(
  {
    "x-match": "any",
    "notification-type-comment": "comment",
    content_type: "vlog",
  },
  "New comment on your video",
);

sendNewVideoEvents(
  {
    "x-match": "any",
    "notification-type-like": "like",
    content_type: "vlog",
  },
  "New like on your video",
);
