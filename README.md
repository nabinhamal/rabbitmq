# RabbitMQ Video System & Advanced Patterns

This project demonstrates various RabbitMQ patterns using Node.js, including a video notification system (using Headers Exchange) and advanced queue features like Priority, Delayed, and Lazy queues.

## Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **RabbitMQ**: Ensure a RabbitMQ server is running locally on port `5672`.

## Installation

1.  Clone the repository (if applicable).
2.  Install dependencies:
    ```bash
    npm install amqplib
    ```

---

## Part 1: Video Notification System (Headers Exchange)

The video notification system uses a **Headers Exchange** to route messages based on header attributes rather than routing keys.

### Files

- **Producer**: `video_producer.js`
- **Consumer**: `new_video_consumer.js`

### How It Works

1.  **Producer (`video_producer.js`)**: Sends messages to `header_exchange` with specific headers:
    - `{"x-match": "all", "notification-type": "new_video", "content_type": "video"}`
    - `{"x-match": "all", "notification-type": "live_stream", "content_type": "gaming"}`
    - `{"x-match": "any", "notification-type-comment": "comment", ...}`
    - `{"x-match": "any", "notification-type-like": "like", ...}`

2.  **Consumer (`new_video_consumer.js`)**: Binds a queue to `header_exchange` matching specific headers (e.g., `notification-type: new_video`).

### Running the System

1.  Start the consumer:
    ```bash
    node new_video_consumer.js
    ```
2.  Run the producer:
    ```bash
    node video_producer.js
    ```

> **Note**: `livestream_consumer.js` and `interaction_consumer.js` are configured for a Topic Exchange pattern and may need updates to work with the current `header_exchange` setup.

---

## Part 2: Advanced Queue Features

This section demonstrates specific RabbitMQ capabilities.

### 1. Priority Queues

Messages with higher priority are processed before lower priority ones.

- **Files**: `priority_producer.js`, `priority_consumer.js`
- **Usage**:
  1.  Start Consumer: `node priority_consumer.js`
  2.  Run Producer: `node priority_producer.js`
  3.  _Observation_: High priority messages (priority 10) are logged before lower ones.

### 2. Delayed Queues (Dead Letter Exchange)

Messages are held for a set duration (TTL) before being delivered to the final queue.

- **Files**: `delayed_producer.js`, `delayed_consumer.js`
- **Usage**:
  1.  Start Consumer: `node delayed_consumer.js`
  2.  Run Producer: `node delayed_producer.js`
  3.  _Observation_: The message appears in the consumer output after a 5-second delay.

### 3. Lazy Queues

Queues configured to store messages on disk to reduce RAM usage, suitable for large backlogs.

- **Files**: `lazy_producer.js`, `lazy_consumer.js`
- **Usage**:
  1.  Start Consumer: `node lazy_consumer.js`
  2.  Run Producer: `node lazy_producer.js`
  3.  _Observation_: 1000 messages are sent and processed. In a real scenario, this allows handling millions of messages without crashing memory.

---

## Project Structure

| File                    | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `video_producer.js`     | Main producer using Headers Exchange.          |
| `new_video_consumer.js` | Consumer for video uploads (Headers Exchange). |
| `priority_*.js`         | Priority Queue demonstration.                  |
| `delayed_*.js`          | Delayed Queue implementation using DLX.        |
| `lazy_*.js`             | Lazy Queue implementation.                     |
