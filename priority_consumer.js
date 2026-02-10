const amqplib = require("amqplib");

const queueName = "priority_queue";

async function consumePriorityMessages() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // Assert the same queue with maxPriority
    await channel.assertQueue(queueName, {
      durable: false,
      maxPriority: 10,
    });

    // Prefetch(1) ensures the consumer processes one at a time, allowing RabbitMQ
    // to reorder subsequent messages in the queue based on priority before sending the next one.
    // If we prefetch many, we might get a batch of low priority ones first if they arrived first.
    channel.prefetch(1);

    console.log(
      `[*] Waiting for messages in ${queueName}. To exit press CTRL+C`,
    );

    channel.consume(
      queueName,
      (msg) => {
        if (msg !== null) {
          const priority = msg.properties.priority;
          console.log(
            `[x] Received priority [${priority}]: ${msg.content.toString()}`,
          );

          // Simulate work to allow queue to accumulate and reorder
          setTimeout(() => {
            channel.ack(msg);
          }, 1000);
        }
      },
      { noAck: false }, // Manual ack is important for prefetch to work effectively
    );
  } catch (error) {
    console.error("Error in priority consumer:", error);
  }
}

consumePriorityMessages();
