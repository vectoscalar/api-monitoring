import fastify from 'fastify';
import { mongoDBPlugin } from './src/index'; // Import your plugin

const app = fastify();


app.register(mongoDBPlugin, {
  mongoUrl: 'INSERT DB URL',
  organizationName: 'o2',
  projectName: 'p1',
  microserviceName: 'm1',
});
// Server's own onRequest hook
app.addHook('onRequest', async (request, reply) => {
  console.log('Server onRequest hook triggered');
});

// Server's own onResponse hook
app.addHook('onResponse', async (request, reply) => {
  console.log('Server onResponse hook triggered');
});

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await app.listen(3000, '0.0.0.0');
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
