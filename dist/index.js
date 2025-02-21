"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // load env vars.
const app = (0, express_1.default)();
app.use(express_1.default.json());
const telexChannelWebhook = process.env.Telex_Webhook_Url;
// Listens for POST requests and makes a POST request to the webhook URL.
app.post('/monitor-service', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pipeline_process, status, message } = req.body;
    if (!status || !message) {
        res.status(400).json({ error: 'Status and Message data are required.' });
    }
    ;
    try {
        // message to be sent to the channel/external service.
        const payload = {
            info: `
                PROCESS: ${pipeline_process}
                STATUS: ${status}
                MESSAGE: ${message}
            `
        };
        yield axios_1.default.post(telexChannelWebhook, payload);
        res.status(200).send('Alert sent to Telex channel successfully.');
    }
    catch (e) {
        res.status(500).send('Failed to send alert to Telex channel.');
        console.log(e.message);
    }
    ;
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
