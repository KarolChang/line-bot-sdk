"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReply = void 0;
const record_1 = __importDefault(require("../api/record"));
const handleReply = async (client, event) => {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    // create a echoing text message
    const echo = { type: 'text', text: `促咪卡比說：${event.message.text}` };
    try {
        if (event.message.text === '本月未結算金額') {
            const { data } = await record_1.default.getRecords();
            let amount = 0;
            data.data.forEach((record) => {
                if (record.isClosed === false &&
                    new Date(record.date).getFullYear() === new Date().getFullYear() &&
                    new Date(record.date).getMonth() === new Date().getMonth()) {
                    amount += record.amount;
                }
            });
            echo.text = `${new Date().getFullYear()}年${new Date().getMonth() + 1}月 $${amount}`;
        }
        // use reply API
        client.replyMessage(event.replyToken, echo);
    }
    catch (err) {
        console.log('err', err);
    }
};
exports.handleReply = handleReply;
