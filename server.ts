import fastify from 'fastify';
import { apiMonitorPlugin } from './src/index'; // Import your plugin
// import { apiMonitorPlugin } from 'my-fastify-plugin'; // Import your plugin

const app = fastify();


app.register(apiMonitorPlugin, {
  mongoUrl: 'MONGO_DB_URL',
  organizationName: 'o1',
  projectName: 'p1',
  microserviceName: 'm1',
  logLevel: 'error'
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
