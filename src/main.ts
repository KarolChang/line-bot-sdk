import {
  Client,
  middleware,
  JSONParseError,
  SignatureValidationFailed,
  ClientConfig,
  MiddlewareConfig
} from '@line/bot-sdk'
import express from 'express'
import { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import * as bodyParser from 'body-parser'
import * as crypto from 'crypto'
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// import utils
import { handleReply } from './utils/handleReply'
import { murmur } from './utils/murmur'

// create LINE SDK config from env variables
const config: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.CHANNEL_SECRET
}

// create LINE SDK client
const client: Client = new Client(config)
// express app
const app: Express = express()

// webhook
app.post('/callback', middleware(config as MiddlewareConfig), async (req: Request, res: Response) => {
  console.log('req.body.events', req.body.events)
  // 給 LINE 的 body 要是 string
  const body = JSON.stringify(req.body)
  // 取得 LINE 的簽名
  const signature = crypto
    .createHmac('SHA256', process.env.CHANNEL_SECRET as string)
    .update(body)
    .digest('base64')
  // 取得 headers 中的 X-Line-Signature
  const headerX = req.get('X-Line-Signature')
  // 比對 signature, headers ，二者相等時才代表是由 LINE server 發來的訊息
  if (signature === headerX) {
    try {
      await handleReply(client, req.body.events[0])
    } catch (err) {
      console.log('[ERROR]', err)
      res.status(500).end()
    }
  }
})

// app use
// app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// push message
app.post('/push', async (req, res) => {
  const { to, messages } = req.body
  if (typeof to === 'string') {
    await client.pushMessage(to, messages)
    murmur(client, messages)
    return res.json({ status: 'success push one', to, messages })
  } else if (typeof to === 'object' && to.length) {
    await client.multicast(to, messages)
    murmur(client, messages)
    return res.json({ status: 'success push many', to, messages })
  } else {
    return res.json({ status: 'error', message: 'wrong input!!!' })
  }
})

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
app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).send(err.signature)
    return
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw)
    return
  }
  next(err) // will throw default 500
})

// listen on port
const port = process.env.PORT
app.listen(port, () => {
  console.log(`line bot is listening on http://localhost:${port}`)
})
