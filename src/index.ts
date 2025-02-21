import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { payloadDTO } from './dto';
import cors from 'cors';

dotenv.config(); // load env vars.

const app = express();

const corsOption = {
    origin: 'https://telex.im',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOption));

app.use(express.json()); 

const telexChannelWebhook = <string>process.env.Telex_Webhook_Url;

// Listens for POST requests and makes a POST request to the webhook URL.
app.post('/monitor-service', async (req: Request, res: Response) => {
    const { event_name, message, status, username } = req.body;

    if (!event_name || !username || !status || !message) {
        res.status(400).json({ error: 'Status and Message data are required.' });
    };

    try {
        const data: payloadDTO = {
            event_name,
            message,
            status,
            username
        };

        const response = await axios.post(telexChannelWebhook, data); 
        // const newWebhook = `${telexChannelWebhook}?event_name=${event_name}&message=${message}&status=${status}&username=${username}`;
        // const resp = await axios.get(newWebhook);
         res.status(200).json({status: 'Alert sent to Telex Channel', payload: response.data});
    } catch (e: any) {
        res.status(500).send('Failed to send alert to Telex channel.');
        console.log(e.message);
    };
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));