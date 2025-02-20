import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // load env vars.

const app = express();

app.use(express.json()); 

const telexChannelWebhook = <string>process.env.Telex_Webhook_Url;

// Listens for POST requests and makes a POST request to the webhook URL.
app.post('/monitor-service', async (req: Request, res: Response) => {
    const { pipeline_process, status, message } = req.body;

    if (!status || !message) {
        res.status(400).json({ error: 'Status and Message data are required.' });
    };

    try {
        // message to be sent to the channel/external service.
        const payload = {
            info: `
                PROCESS: ${pipeline_process}
                STATUS: ${status}
                MESSAGE: ${message}
            `
        };

         await axios.post(telexChannelWebhook, payload);
         res.status(200).send('Alert sent to Telex channel successfully.');
    } catch (e: any) {
        res.status(500).send('Failed to send alert to Telex channel.');
        console.log(e.message);
    };
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));