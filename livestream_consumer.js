const amqplib = require("amqplib");

const exchangeName = "video_exchange";
const queueName = "livestream_queue";
const bindingKey = "video.livestream";

async function consumeLivestreams() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, "topic", { durable: false });
    const q = await channel.assertQueue(queueName, { durable: false });

    // Bind queue to exchange with specific routing key for livestreams
    await channel.bindQueue(q.queue, exchangeName, bindingKey);

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
          console.log(
            `[!] ALARAM: ${content.streamer} is LIVE with ${content.viewers} viewers!`,
          );
        }
      },
      { noAck: true },
    );
  } catch (error) {
    console.error("Error in livestream consumer:", error);
  }
}

consumeLivestreams();
