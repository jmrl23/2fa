import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { app as authenticators } from './_routes/authenticators';
import { app as users } from './_routes/users';

const app = new Hono().basePath('/api');

app.route('/users', users);
app.route('/authenticators', authenticators);

const handler = handle(app);
const GET = handler;
const POST = handler;
const PATCH = handler;
const DELETE = handler;

export { DELETE, GET, PATCH, POST };
