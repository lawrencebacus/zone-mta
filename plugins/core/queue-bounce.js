'use strict';

const amqp = require('amqplib');
const fetch = require('nodemailer/lib/fetch')

module.exports.title = 'HTTP Bounce Notification';
module.exports.init = function(app, done) {
    app.addHook('queue:bounce', (bounce, maildrop, next) => {
        // let retries = 0;
        (async function(amqp){
          const amqpserver = fetch(app.config.amqpServer);

          console.log('AMQPSERVER', 'Connect');
          const conn = await amqp.connect(amqpserver);

          console.log('AMQPSERVER', 'Create Channel');
          const ch = await conn.createChannel();

          const queue = fetch(app.config.queue);

          const body = {
              id: bounce.id,
              to: bounce.to,
              seq: bounce.seq,
              returnPath: bounce.from,
              category: bounce.category,
              time: bounce.time,
              response: bounce.response
          };

          console.log('AMQPSERVER', 'Assert');
          await ch.assertQueue(queue, { durable: true });
          console.log('AMQPSERVER', 'Send');
          await ch.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(body)),
            { persistent: true }
          );

          console.log('AMQPSERVER', 'Done');
        })(amqp);
    });

    done();
};
