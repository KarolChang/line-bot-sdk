import { Client, TextMessage, WebhookEvent } from '@line/bot-sdk'

export const handleReply = (client: Client, event: WebhookEvent) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }
  // create a echoing text message
  const echo: TextMessage = { type: 'text', text: `促咪卡比說：${event.message.text}` }
  // use reply API
  client.replyMessage(event.replyToken, echo)
}
