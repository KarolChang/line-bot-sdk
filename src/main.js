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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var bot_sdk_1 = require("@line/bot-sdk");
var express = require("express");
var bodyParser = require("body-parser");
var crypto = require("crypto");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// create LINE SDK config from env variables
var config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};
// create LINE SDK client
var client = new bot_sdk_1.Client(config);
// express app
var app = express();
// webhook
app.post('/callback', (0, bot_sdk_1.middleware)(config), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var body, signature, headerX, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('req.body.events', req.body.events);
                body = JSON.stringify(req.body);
                signature = crypto
                    .createHmac('SHA256', process.env.CHANNEL_SECRET)
                    .update(body)
                    .digest('base64');
                headerX = req.get('X-Line-Signature');
                if (!(signature === headerX)) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, handleReply(req.body.events[0])];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log('[ERROR]', err_1);
                res.status(500).end();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// app use
// app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// push message
app.post('/push', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, to, messages;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, to = _a.to, messages = _a.messages;
                if (!(typeof to === 'string')) return [3 /*break*/, 2];
                return [4 /*yield*/, client.pushMessage(to, messages)];
            case 1:
                _b.sent();
                return [2 /*return*/, res.json({ status: 'success push one', to: to, messages: messages })];
            case 2:
                if (!(typeof to === 'object' && to.length)) return [3 /*break*/, 4];
                return [4 /*yield*/, client.multicast(to, messages)];
            case 3:
                _b.sent();
                return [2 /*return*/, res.json({ status: 'success push many', to: to, messages: messages })];
            case 4: return [2 /*return*/, res.json({ status: 'error', message: 'wrong input!!!' })];
        }
    });
}); });
// reply function
function handleReply(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }
    // create a echoing text message
    var echo = { type: 'text', text: "\u4FC3\u54AA\u5361\u6BD4\u8AAA\uFF1A".concat(event.message.text) };
    // use reply API
    client.replyMessage(event.replyToken, echo);
}
// error handling
app.use(function (err, req, res, next) {
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
var port = process.env.PORT;
app.listen(port, function () {
    console.log("line bot is listening on http://localhost:".concat(port));
});
