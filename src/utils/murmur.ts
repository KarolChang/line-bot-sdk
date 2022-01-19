import { Client } from '@line/bot-sdk'

const to: string[] = [process.env.KAROL_USERID!, process.env.JIANMIAU_USERID!]

export const murmur = async (client: Client, messages: any) => {
  if (messages === 'object' && messages.length) return
  const text = messages.text
  if (text.includes('餐')) {
    await client.multicast(to, { type: 'text', text: '豬涵吃飽飽 好開心🥳' })
  }
  if (text.includes('麵')) {
    await client.multicast(to, { type: 'text', text: '今天吃麵麵' })
  }
  if (text.includes('點心' || '蛋糕' || '蛋塔')) {
    await client.multicast(to, { type: 'text', text: '誰偷吃點心沒給豬涵一口! 臭建喵🥺' })
  }
  if (text.includes('棒球')) {
    await client.multicast(to, { type: 'text', text: '幫豬涵的統一獅加油😆 不准看啦啦隊！' })
  }
  if (text.includes('建喵')) {
    await client.multicast(to, { type: 'text', text: '建喵壞壞 懲罰打屁屁🥺' })
  }
  if (text.includes('豬涵')) {
    await client.multicast(to, { type: 'text', text: '豬涵最喜歡建喵...的屁屁😘' })
  }
  if (text.includes('鯊鯊')) {
    await client.multicast(to, { type: 'text', text: '豬涵最喜歡咬鯊鯊🦈 不要阻止她！' })
  }
  if (text.includes('車車')) {
    await client.multicast(to, { type: 'text', text: '你知道豬涵最喜歡的車車是哪一隻嘛🤔 猜對有獎勵喔！' })
  }
  if (text.includes('電影')) {
    await client.multicast(to, { type: 'text', text: '每天看豬涵就好😌 看什麼電影！' })
  }
  if (text.includes('住宿' || '飯店' || '旅館')) {
    await client.multicast(to, { type: 'text', text: '壞建喵偷偷拐豬涵去哪裡🥲 小心屁屁爛掉！' })
  }
  if (text.includes('車票' || '高鐵' || '台鐵')) {
    await client.multicast(to, { type: 'text', text: '豬涵乖乖上車囉🥰 建喵掰掰~' })
  }
  if (text.includes('衣服' || '褲子')) {
    await client.multicast(to, { type: 'text', text: '豬涵穿新衣~ 但還是最喜歡裸奔😝' })
  }
}
