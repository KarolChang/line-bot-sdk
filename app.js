const line = require('@line/bot-sdk')
// import { Client, JSONParseError, SignatureValidationFailed, middleware } from '@line/bot-sdk'
const express = require('express')
const crypto = require('crypto')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
}

// create LINE SDK client
const client = new line.Client(config)

// create Express app
// about Express itself: https://expressjs.com/
const app = express()
app.use(line.middleware(config))

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', async (req, res) => {
  console.log('req.body.events', req.body.events)
  // 給 LINE 的 body 要是 string
  const body = JSON.stringify(req.body)

  // 取得 LINE 的簽名
  const signature = crypto.createHmac('SHA256', process.env.CHANNEL_SECRET).update(body).digest('base64')

  // 取得 headers 中的 X-Line-Signature
  const headerX = req.get('X-Line-Signature')

  // 比對 signature, headers ，二者相等時才代表是由 LINE server 發來的訊息
  if (signature === headerX) {
    try {
      // await handleReply(req.body.events[0])
      await handlePush()
      await client.pushMessage(process.env.KAROL_USERID, { type: 'text', text: '促咪卡比1' })
    } catch (err) {
      console.log('[ERROR]', err)
      res.status(500).end()
    }
    // Promise.all(req.body.events.map(handleEvent))
    //   .then((result) => res.json(result))
    //   .catch((err) => {
    //     console.error(err)
    //     res.status(500).end()
    //   })
  }
})

// event handler
function handleReply(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null)
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text }
  console.log('event.message', event.message)
  // use reply API
  client.replyMessage(event.replyToken, echo)
}

function handlePush() {
  client.pushMessage(process.env.KAROL_USERID, { type: 'text', text: '促咪卡比' })
  return Promise.resolve(null)
}

// error handling
// app.use((err, req, res, next) => {
//   if (err instanceof line.SignatureValidationFailed) {
//     res.status(401).send(err.signature)
//     return
//   } else if (err instanceof line.JSONParseError) {
//     res.status(400).send(err.raw)
//     return
//   }
//   next(err) // will throw default 500
// })

// listen on port
const port = process.env.PORT
app.listen(port, () => {
  console.log(`line bot is listening on http://localhost:${port}`)
})
