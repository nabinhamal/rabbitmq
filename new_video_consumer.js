const amqplib = require("amqplib");

const exchangeName = "video_exchange";
const queueName = "new_video_queue";
const bindingKey = "video.uploaded";

const consumeNewVideos = async () => {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();
    const exchangeName = "header_exchange";
    const exchangeType = "headers";

    await channel.assertExchange(exchangeName, exchangeType, { durable: true });
    const q = await channel.assertQueue("", { exclusive: true });

    // Bind queue to exchange with specific routing key for uploads
    await channel.bindQueue(q.queue, exchangeName, "", {
      "x-match": "all",
      "notification-type": "new_video",
      content_type: "video",
    });

    console.log(
      `[*] Waiting for messages in ${queueName}. To exit press CTRL+C`,
    );

    channel.consume(
      q.queue,
      (msg) => {
        if (msg.content) {
          const content = JSON.parse(msg.content.toString());
          console.log(
            `[x] Received '${msg.fields.routingKey}': Check content below`,
          );
          console.log(content);
          // Simulate processing time
          console.log(`[x] Processing video ${content.id}...`);
        }
      },
      { noAck: true },
    );
  } catch (error) {
    console.error("Error in new video consumer:", error);
  }
};

consumeNewVideos();
