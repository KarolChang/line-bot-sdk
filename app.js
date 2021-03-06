const line = require('@line/bot-sdk')
const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')
// const cors = require('cors')
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
// express app
const app = express()

// webhook
app.post('/callback', line.middleware(config), async (req, res) => {
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
      await handleReply(req.body.events[0])
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
  console.log('req.body', req.body)
  const { to, messages } = req.body
  if (typeof to === 'string') {
    await client.pushMessage(to, messages)
    return res.json({ status: 'success push one', to, messages })
  } else if (typeof to === 'object' && to.length) {
    await client.multicast(to, messages)
    return res.json({ status: 'success push many', to, messages })
  } else {
    return res.json({ status: 'error', message: 'wrong input!!!' })
  }
})

// event handler
function handleReply(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null)
  }
  // create a echoing text message
  const echo = { type: 'text', text: `促咪卡比說：${event.message.text}` }
  // use reply API
  client.replyMessage(event.replyToken, echo)
}

// error handling
app.use((err, req, res, next) => {
  if (err instanceof line.SignatureValidationFailed) {
    res.status(401).send(err.signature)
    return
  } else if (err instanceof line.JSONParseError) {
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

// 文件
// https://line.github.io/line-bot-sdk-nodejs/guide/client.html#create-a-client
