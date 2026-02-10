const amqplib = require("amqplib");

const exchangeName = "video_exchange";
const queueName = "interaction_queue";
const bindingKeys = ["video.comment", "video.like"];

async function consumeInteractions() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, "topic", { durable: false });
    const q = await channel.assertQueue(queueName, { durable: false });

    // Bind queue to exchange with multiple binding keys
    for (const key of bindingKeys) {
      await channel.bindQueue(q.queue, exchangeName, key);
    }

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
          if (msg.fields.routingKey === "video.comment") {
            console.log(
              `[+] New Comment on ${content.videoId}: ${content.comment}`,
            );
          } else if (msg.fields.routingKey === "video.like") {
            console.log(
              `[<3] New Like on ${content.videoId} by ${content.user}`,
            );
          }
        }
      },
      { noAck: true },
    );
  } catch (error) {
    console.error("Error in interaction consumer:", error);
  }
}

consumeInteractions();
