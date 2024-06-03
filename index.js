const { Hono } = require('hono');
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import pg from 'pg'
const { Client } = pg
const app = new Hono();

Bun.serve({
    fetch: app.fetch,
    port: process.env.PORT || 3000,
})

app.use('*',cors())
app.use('*', logger())




const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'todo',
    password: '123',
    port: 5432,  // Default PostgreSQL port
});

client.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database', err);
    } else {
        console.log('Connected to the database');
    }
});
app.get('/',(c) => {
    return c.text("fdsfds")
})
app.post('/login', async (c) => {
    try {
        const { username, password } = await c.req.json();
        console.log(username)
        console.log(password)
        //
        const query = {
            text: 'SELECT user_password FROM public."user" WHERE user_name = $1',
            values: [username],
        };

        const res = await client.query(query);
        if (res.rowCount === 0) {
            return c.json({ state: false });
        }

        const storedPasswordHash = res.rows[0].user_password;
        // Compare the hashed password with the provided password
        const isMatch = password ===  storedPasswordHash
        if (isMatch) {
            return c.json({ state: true });
        } else {
            return c.json({ state: false });
        }
    } catch (error) {
        console.error('Error:', error);
        return c.json({ state: false, error: 'An error occurred' }, 500);
    }
});