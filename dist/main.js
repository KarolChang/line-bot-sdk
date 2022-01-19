"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_sdk_1 = require("@line/bot-sdk");
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const crypto = __importStar(require("crypto"));
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// import utils
const handleReply_1 = require("./utils/handleReply");
const murmur_1 = require("./utils/murmur");
// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};
// create LINE SDK client
const client = new bot_sdk_1.Client(config);
// express app
const app = (0, express_1.default)();
// webhook
app.post('/callback', (0, bot_sdk_1.middleware)(config), async (req, res) => {
    console.log('req.body.events', req.body.events);
    // 給 LINE 的 body 要是 string
    const body = JSON.stringify(req.body);
    // 取得 LINE 的簽名
    const signature = crypto
        .createHmac('SHA256', process.env.CHANNEL_SECRET)
        .update(body)
        .digest('base64');
    // 取得 headers 中的 X-Line-Signature
    const headerX = req.get('X-Line-Signature');
    // 比對 signature, headers ，二者相等時才代表是由 LINE server 發來的訊息
    if (signature === headerX) {
        try {
            await (0, handleReply_1.handleReply)(client, req.body.events[0]);
        }
        catch (err) {
            console.log('[ERROR]', err);
            res.status(500).end();
        }
    }
});
// app use
// app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// push message
app.post('/push', async (req, res) => {
    const { to, messages } = req.body;
    if (typeof to === 'string') {
        await client.pushMessage(to, messages);
        (0, murmur_1.murmur)(client, messages);
        return res.json({ status: 'success push one', to, messages });
    }
    else if (typeof to === 'object' && to.length) {
        await client.multicast(to, messages);
        (0, murmur_1.murmur)(client, messages);
        return res.json({ status: 'success push many', to, messages });
    }
    else {
        return res.json({ status: 'error', message: 'wrong input!!!' });
    }
});
// reply function
// function handleReply(event: WebhookEvent) {
//   if (event.type !== 'message' || event.message.type !== 'text') {
//     // ignore non-text-message event
//     return Promise.resolve(null)
//   }
//   // create a echoing text message
//   const echo: TextMessage = { type: 'text', text: `促咪卡比說：${event.message.text}` }
//   // use reply API
//   client.replyMessage(event.replyToken, echo)
// }
// error handling
app.use((err, req, res, next) => {
    if (err instanceof bot_sdk_1.SignatureValidationFailed) {
        res.status(401).send(err.signature);
        return;
    }
    else if (err instanceof bot_sdk_1.JSONParseError) {
        res.status(400).send(err.raw);
        return;
    }
    next(err); // will throw default 500
});
// listen on port
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`line bot is listening on http://localhost:${port}`);
});
