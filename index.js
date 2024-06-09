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

app.use('*', cors())
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
app.get('/', (c) => {
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
        const isMatch = password === storedPasswordHash
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
app.post('/pull', async (c) => {
    console.log("pulling")
    const { username } = await c.req.json();
    console.log(username)
    const query = {
        text: 'SELECT * FROM public."item" WHERE user_name = $1',
        values: [username],
    };
    const res = await client.query(query);
    console.log(res.rows)
    return c.json({ list: res.rows })

})
app.post('/push', async (c) => {
    console.log("pushing")
    const { list, username } = await c.req.json();
    console.log(username)
    list.forEach(async (element) => {
        console.log(element)
        console.log(element.type)
        if (element.type === 'add') {
            let query = {
                text: 'INSERT INTO public.item (label, user_name, state) VALUES ($1, $2, $3) ',
                values: [element.label, username, element.info.state],
            };
            const res = await client.query(query);
        }
        else if (element.type === 'edit') {
            if (element.info.collum === 'state') {
                let query = {
                    text: 'UPDATE public.item SET state = $1 WHERE label = $2 AND user_name = $3 ',
                    values: [element.info.value,element.label,username],
                };
                const res = await client.query(query);
            }
            // edit on the label to be implemented !!! 🤓

        }
        else if (element.type === 'remove') {
            let query = {
                text: 'DELETE FROM public.item WHERE label = $1 AND user_name = $2;',
                values: [element.label, username],
            }
            const res = await client.query(query);
        }
    });
    return c.json({ message: true })
})



app.post('/hardpush', async (c) => {
    const { list, username } = await c.req.json();
    list.forEach( async (element) => {
        let query = {
            text: 'INSERT INTO public.item(label, user_name, state) VALUES ($1, $2, $3) ON CONFLICT (user_name,label) DO UPDATE SET state = $3',
            values: [element.label, username,element.state],
        }
        const res = await client.query(query);
    });
    return c.json({ message: true })
})