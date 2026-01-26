import { generateText } from 'ai'

export async function POST(req: Request) {
  const { text, targetLanguage } = await req.json()

  if (!text || !targetLanguage) {
    return Response.json({ error: 'Missing text or targetLanguage' }, { status: 400 })
  }

  // Si el texto esta vacio o es muy corto, devolverlo como esta
  if (text.trim().length < 3) {
    return Response.json({ translatedText: text })
  }

  try {
    const languageName = targetLanguage === 'es' ? 'Spanish' : 'English'
    
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are a translator. Translate the following text to ${languageName}. 
Only return the translated text, nothing else. 
If the text is already in ${languageName}, return it as is.
Preserve any special characters, numbers, and formatting.`,
      prompt: text,
    })

    return Response.json({ translatedText: result.text })
  } catch (error) {
    console.error('Translation error:', error)
    return Response.json({ translatedText: text })
  }
}
