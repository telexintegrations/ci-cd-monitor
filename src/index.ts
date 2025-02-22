import express, { Request, Response } from 'express';
import axios from 'axios';
// import dotenv from 'dotenv';
import { payloadDTO } from './dto';
import cors from 'cors';

const app = express();

const corsOption = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

// Enable CORS with specified configuration
app.use(cors(corsOption));

// Parse incoming JSON requests.
app.use(express.json()); 

const telexChannelWebhook = "https://ping.telex.im/v1/webhooks/0195202b-1d79-75d3-b188-b19ff8807259";

/* 
    This is the main service of the integration
    This service will recieve a payload via POST requests from telex.im
    It will then send the data to Telex channel
    The telex channel will then forward the alert to slack (slack integration is setup within telex to recieve payload from telex)
*/
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


/* 
    This is the route that returns the JSON integration
*/
app.get('/integration', (_req: Request, res: Response) => {
    const jsonIntegration = {
        data: {
            date: {
            created_at: Date.now(),
            updated_at: Date.now()
            },
            descriptions: {
            app_description: "This is an Integration that watches your CI-CD pipeline and send alerts to designated Telex channel",
            app_logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHDtKVNBv2E2B0oUnVLEAFWgLETXKW_xo0gw&s",
            app_name: "CI-CD Monitor",
            app_url: "https://ci-cd-monitor.onrender.com/home",
            background_color: "#FF5733"
            },
            integration_category: "DevOps & CI/CD",
            integration_type: "output",
            is_active: true,      
            settings: [
            {
                label: "Telex Channel Webhook URL",
                type: "text",
                description: "The channel notifications from your CI-CD pipeline will route notifications to",
                required: true
            }, 
            {
                label: "Slack Workspace webhook URL",
                type: "text",
                description: "The slack app notifications from your CI-CD pipeline will route notifications to",
                required: true
            }
            ],
            key_features: [
                "Real-time monitoring of CI-CD pipeline",
                "Alerts on pipeline failure",
                "Alers on pipeline build status",
                "Return alerts based on your pipeline usecase",
            ],
            target_url: "https://ci-cd-monitor.onrender.com/monitor-service"
        }
    };
    res.status(200).json(jsonIntegration);
});

/* 
    This is the home route of the integration
*/
app.get('/home', (_req: Request, res: Response) => {
    res.status(200).json({
        status: "active",
        integration_name: "CI-CD Monitor",
        description: "Watches your CI-CD pipeline and sends alerts to your team"
    });
});

const PORT = 8070;

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

export { app };