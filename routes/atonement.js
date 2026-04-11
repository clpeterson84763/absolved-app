import Anthropic from '@anthropic-ai/sdk'

const FREE_SYSTEM_PROMPT = `You are a compassionate atonement guide. Based on the user's sin, provide:
1. A reflection question (help them understand why they did this)
2. A suggested atonement action (practical, doable)
3. A short affirmation or meditation (50 words max)
Keep tone non-judgmental, supportive, and spiritual but secular.`

const PREMIUM_SYSTEM_PROMPT = `You are a deeply compassionate atonement guide and spiritual counselor. Based on the user's sin, provide rich, thoughtful guidance:
1. A deep reflection question (help them understand root causes, patterns, and emotions behind their action)
2. A specific, multi-step atonement action (practical steps they can take today, this week, and ongoing)
3. A meaningful affirmation or meditation (75 words max, poetic and personal)
4. A gentle insight about what this sin might be revealing about their deeper needs or unresolved feelings
Keep tone deeply non-judgmental, warm, therapeutic, and spiritually resonant but secular.`

export async function generateAtonement(sinDescription, category = 'general', isPremium = false) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const systemPrompt = isPremium ? PREMIUM_SYSTEM_PROMPT : FREE_SYSTEM_PROMPT

  const format = isPremium
    ? `{
  "reflection": "Your deep reflection question here",
  "action": "Your specific multi-step atonement action here",
  "affirmation": "Your meaningful affirmation here (75 words max)",
  "insight": "Your gentle insight about deeper needs or patterns here"
}`
    : `{
  "reflection": "Your reflection question here",
  "action": "Your suggested atonement action here",
  "affirmation": "Your short affirmation or meditation here (50 words max)"
}`

  const userMessage = `Sin category: ${category}\nSin description: ${sinDescription}\n\nPlease provide atonement guidance in this exact JSON format:\n${format}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: isPremium ? 1024 : 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse atonement guidance from AI response')

  const parsed = JSON.parse(jsonMatch[0])
  if (!parsed.reflection || !parsed.action || !parsed.affirmation) {
    throw new Error('Incomplete atonement guidance from AI')
  }

  return {
    reflection: parsed.reflection,
    action: parsed.action,
    affirmation: parsed.affirmation,
    insight: parsed.insight || null,
  }
}
