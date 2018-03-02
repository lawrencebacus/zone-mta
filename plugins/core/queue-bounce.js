'use strict';

const amqp = require('amqplib');

module.exports.title = 'HTTP Bounce Notification';
module.exports.init = function(app, done) {
    app.addHook('queue:bounce', (bounce, maildrop, next) => {
        (async function(amqp){
          const amqpserver = app.config.amqpServer;
          const conn = await amqp.connect(amqpserver);
          const ch = await conn.createChannel();
          const queue = app.config.queue;
          const body = {
              id: bounce.id,
              to: bounce.to,
              seq: bounce.seq,
              returnPath: bounce.from,
              category: bounce.category,
              time: bounce.time,
              response: bounce.response
          };

          await ch.assertQueue(queue, { durable: true });
          await ch.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(body)),
            { persistent: true }
          );
        })(amqp);
    });

    done();
};
