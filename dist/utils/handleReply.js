"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReply = void 0;
const handleReply = (client, event) => {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    // create a echoing text message
    const echo = { type: 'text', text: `促咪卡比說：${event.message.text}` };
    // use reply API
    client.replyMessage(event.replyToken, echo);
};
exports.handleReply = handleReply;
