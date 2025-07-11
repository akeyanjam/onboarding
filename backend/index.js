import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// The client gets the API key from the environment variable GEMINI_API_KEY
const genAI = new GoogleGenAI({})

app.post('/api/gemini', async (req, res) => {
  try {
    const { contents, generationConfig, systemInstruction } = req.body

    if (!contents) {
      return res.status(400).json({ error: 'Request body must contain a "contents" property.' })
    }

    const requestPayload = {
      model: 'gemini-2.5-pro',
      contents,
      config: {
        ...generationConfig,
        ...(systemInstruction && { systemInstruction })
      }
    }

    // Debug logging
    console.log('=== GEMINI API REQUEST ===')
    console.log('Contents length:', contents.length)
    console.log('First content:', JSON.stringify(contents[0], null, 2))
    console.log('System instruction provided:', !!systemInstruction)
    if (systemInstruction) {
      console.log('System instruction preview:', systemInstruction.parts[0].text.substring(0, 200) + '...')
    }
    console.log('========================')

    const result = await genAI.models.generateContent(requestPayload)
    
    if (result && result.candidates && result.candidates.length > 0 && 
        result.candidates[0].content && result.candidates[0].content.parts && 
        result.candidates[0].content.parts.length > 0) {
      
      let text = result.candidates[0].content.parts[0].text;
      
      // The model sometimes wraps the JSON in a markdown code block. We need to remove it.
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');

      res.setHeader('Content-Type', 'application/json');
      res.send(text);
    } else {
      // If the expected structure is not there, something went wrong.
      console.error("Gemini API response did not have the expected structure. Full result:", JSON.stringify(result, null, 2));
      res.status(500).json({ 
        error: "Gemini API response was malformed.",
        fullResult: result 
      });
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error)
    res.status(500).json({ error: 'An error occurred while communicating with the Gemini API.' })
  }
})

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`)
}) 