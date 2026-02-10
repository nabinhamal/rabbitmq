const amqplib = require("amqplib");

const queueName = "priority_queue";

async function sendPriorityMessages() {
  try {
    const connection = await amqplib.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    // Define a queue with max priority 10
    await channel.assertQueue(queueName, {
      durable: false,
      maxPriority: 10, // Must match consumer
    });

    const messages = [
      { text: "Low priority message (1)", priority: 1 },
      { text: "Medium priority message (5)", priority: 5 },
      { text: "High priority message (10)", priority: 10 },
      { text: "Very Low priority message (0)", priority: 0 },
      { text: "Critical priority message (9)", priority: 9 },
    ];

    // Send messages in random order or standard order
    // To see priority in action, the consumer should be slow or offline initially.
    // Here we send them all at once.
    for (const msg of messages) {
      channel.sendToQueue(queueName, Buffer.from(msg.text), {
        priority: msg.priority,
      });
      console.log(`[x] Sent '${msg.text}' with priority ${msg.priority}`);
    }

    console.log(
      "[x] All messages sent. Start the consumer now to see priority handling.",
    );

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error("Error in priority producer:", error);
  }
}

sendPriorityMessages();
