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

app.get('/test', async (c) => {
    try {
        // Perform a simple query to verify the connection
        const res = await client.query({text:'SELECT * FROM public."user"'});
        return c.text( res.rows[0].user_name)
    } catch (err) {
        console.error('Error executing query', err);
        return c.json({ status: 'error', message: 'Failed to execute query' });
    }
});