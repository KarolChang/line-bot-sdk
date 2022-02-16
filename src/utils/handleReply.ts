import { Client, TextMessage, WebhookEvent } from '@line/bot-sdk'
import RecordAPI from '../api/record'

export const handleReply = async (client: Client, event: WebhookEvent) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }
  // create a echoing text message
  const echo: TextMessage = { type: 'text', text: `促咪卡比說：${event.message.text}` }

  try {
    if (event.message.text === '本月未結算金額') {
      const { data } = await RecordAPI.getRecords()
      let amount = 0
      data.data.forEach((record: any) => {
        if (
          record.isClosed === false &&
          new Date(record.date).getFullYear() === new Date().getFullYear() &&
          new Date(record.date).getMonth() === new Date().getMonth()
        ) {
          amount += record.amount
        }
      })
      echo.text = `${new Date().getFullYear()}年${new Date().getMonth() + 1}月 $${amount}`
    }
    // use reply API
    client.replyMessage(event.replyToken, echo)
  } catch (err) {
    console.log('err', err)
  }
}
