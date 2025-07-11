# Simplified Merchant Onboarding POC - Technical Requirements

## Architecture Overview

**Frontend-Only Business Logic**
- Vue.js + Shadcn-vue components (install shadcn components like: npx shadcn-vue@latest add button)
- Direct Gemini API integration via simple proxy
- Client-side state management and document processing
- No complex backend systems

**Backend: Minimal Proxy**
- Single endpoint that forwards requests to Gemini
- Injects API key and handles CORS
- Payload agnostic - no business logic
- google gen ai library: npm install @google/genai
- model : gemini-2.5-flash

## Core Flow

1. **Welcome & Discovery** → Business type classification
2. **Package Recommendation** → Show product options with images
3. **Location Collection** → Multi-location support
4. **Document Upload** → Real-time processing and extraction
5. **Data Confirmation** → Show extracted information
6. **Payment Simulation** → Simple form completion

## Frontend Architecture

### Technology Stack
- **Vue.js 3** with Composition API
- **Shadcn-vue** for UI components
- **Tailwind CSS** for styling
- **Pinia** for state management
- **Vite** for build tooling

### Core Components
```
src/
├── components/
│   ├── ChatInterface.vue      # Main chat container
│   ├── MessageBubble.vue      # Chat messages
│   ├── FileUpload.vue         # Document upload
│   ├── DataExtraction.vue     # Show extracted data
│   ├── PackageSelector.vue    # Product selection
│   └── PaymentForm.vue        # Final payment simulation
├── stores/
│   ├── chatStore.js           # Conversation state
│   └── applicationStore.js    # Collected data
└── services/
    └── geminiService.js       # API integration
```

### State Management

**Chat Store**
```javascript
{
  messages: [],
  isProcessing: false,
  currentPhase: 'discovery',
  conversationId: uuid()
}
```

**Application Store**
```javascript
{
  businessType: null,        // 'retail'|'restaurant'|'online'
  businessInfo: {},          // Name, industry, volume
  selectedPackage: null,     // Package selection
  locations: [],             // Location data
  documents: [],             // Uploaded docs with extracted data
  applicationComplete: false
}
```

## Gemini Integration

### API Service Architecture

**Simple Proxy Backend**
```javascript
// Single endpoint: POST /api/gemini
app.post('/api/gemini', (req, res) => {
  const payload = {
    ...req.body,
    headers: { 'Authorization': `Bearer ${GEMINI_API_KEY}` }
  }
  // Forward to Gemini API
  fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', payload)
    .then(response => response.json())
    .then(data => res.json(data))
})
```

**Frontend Service**
```javascript
// geminiService.js
class GeminiService {
  async sendMessage(prompt, files = []) {
    const payload = {
      contents: [{ parts: [{ text: prompt }, ...files] }],
      generationConfig: {
        temperature: 0.7,
        candidateCount: 1,
        maxOutputTokens: 2048
      }
    }
    return fetch('/api/gemini', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }
}
```

### Prompting Strategy

**System Prompt Template**
```
You are a friendly merchant onboarding assistant. Guide businesses through selecting payment processing solutions.

CURRENT PHASE: {currentPhase}
COLLECTED DATA: {structuredData}

AVAILABLE PACKAGES:
- Retail: POS terminals, card readers, receipt printers
- Restaurant: POS terminals, kitchen displays, customer displays  
- Online: Virtual terminal, payment gateway, mobile readers

RESPOND WITH:
1. Conversational message to user
2. JSON structure for UI actions:
{
  "message": "Your response text",
  "uiAction": {
    "type": "buttons|fileRequest|showPackages|showForm|complete",
    "data": {...}
  },
  "extractedData": {...},
  "nextPhase": "discovery|package|location|documents|confirmation|payment"
}

Rules:
- Ask ONE question at a time
- Use buttons for common responses
- Process documents immediately when uploaded
- Extract structured data from documents
- Confirm all data before proceeding
- Keep responses conversational and helpful
```

**Phase-Specific Prompts**

**Discovery Phase:**
```
Ask about their business type, current payment setup, and transaction volume. 
Classify as: retail, restaurant, or online business.
Use buttons for business type selection.
```

**Package Phase:**
```
Based on business type: {businessType}, recommend appropriate package.
Show package options with images and specifications.
Allow customization of terminal quantities.
```

**Location Phase:**
```
Collect location information. Support multiple locations.
For each location gather: business name, address, contact info.
Ask if they have additional locations.
```

**Document Phase:**
```
Request documents: business license, tax ID, bank verification, owner ID.
Process each document and extract key information.
Show extracted data for confirmation.
```

### Document Processing

**File Upload Integration**
```javascript
async uploadDocument(file) {
  // Convert file to base64
  const base64 = await this.fileToBase64(file)
  
  const prompt = `
  Extract key information from this ${file.type} document.
  Return structured JSON with:
  - documentType: businessLicense|taxID|bankInfo|ownerID
  - extractedData: relevant fields
  - confidence: 0-1 score
  `
  
  const response = await geminiService.sendMessage(prompt, [{
    inlineData: { mimeType: file.type, data: base64 }
  }])
  
  return response.extractedData
}
```

**Expected Extraction Format**
```json
{
  "documentType": "businessLicense",
  "extractedData": {
    "businessName": "ABC Restaurant",
    "licenseNumber": "BL-123456",
    "issueDate": "2024-01-15",
    "expirationDate": "2025-01-15",
    "address": "123 Main St, City, State"
  },
  "confidence": 0.92
}
```

## UI Components Implementation

### ChatInterface.vue
```vue
<template>
  <div class="flex flex-col h-screen max-w-4xl mx-auto">
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <MessageBubble 
        v-for="message in messages" 
        :key="message.id"
        :message="message"
      />
    </div>
    <div class="border-t p-4">
      <FileUpload v-if="showFileUpload" @upload="handleFileUpload" />
      <input v-else v-model="userInput" @keyup.enter="sendMessage" 
             class="w-full border rounded-lg p-3" placeholder="Type your message..." />
    </div>
  </div>
</template>
```

### MessageBubble.vue
```vue
<template>
  <div :class="messageClass">
    <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
      <p>{{ message.content }}</p>
      
      <!-- Button Actions -->
      <div v-if="message.uiAction?.type === 'buttons'" class="mt-3 space-y-2">
        <button v-for="option in message.uiAction.data.options"
                @click="selectOption(option)"
                class="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded">
          {{ option }}
        </button>
      </div>
      
      <!-- Package Display -->
      <PackageSelector v-if="message.uiAction?.type === 'showPackages'" 
                       :packages="message.uiAction.data" />
      
      <!-- Extracted Data Display -->
      <DataExtraction v-if="message.extractedData" 
                      :data="message.extractedData" />
    </div>
  </div>
</template>
```

### FileUpload.vue
```vue
<template>
  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
              hover:border-gray-400 transition-colors cursor-pointer"
       @drop="handleDrop" @dragover.prevent>
    <input type="file" @change="handleFileSelect" class="hidden" ref="fileInput" 
           accept=".pdf,.jpg,.jpeg,.png" />
    <p class="text-gray-600">Drop document here or <span class="text-blue-600">click to browse</span></p>
    <div v-if="isUploading" class="mt-4">
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
             :style="`width: ${uploadProgress}%`"></div>
      </div>
    </div>
  </div>
</template>
```

### PaymentForm.vue
```vue
<template>
  <div class="bg-white rounded-lg border p-6 max-w-md mx-auto">
    <h3 class="text-lg font-semibold mb-4">Complete Your Application</h3>
    <form @submit.prevent="submitApplication">
      <div class="space-y-4">
        <input v-model="paymentInfo.cardNumber" placeholder="Card Number" 
               class="w-full border rounded px-3 py-2" />
        <div class="grid grid-cols-2 gap-4">
          <input v-model="paymentInfo.expiry" placeholder="MM/YY" 
                 class="border rounded px-3 py-2" />
          <input v-model="paymentInfo.cvv" placeholder="CVV" 
                 class="border rounded px-3 py-2" />
        </div>
        <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold">
          Complete Application
        </button>
      </div>
    </form>
  </div>
</template>
```

## Conversation Flow Implementation

### Main Chat Logic
```javascript
// In ChatInterface.vue
async sendMessage(content, type = 'text') {
  // Add user message
  this.addMessage({ content, isUser: true })
  
  // Prepare context
  const context = {
    currentPhase: this.currentPhase,
    collectedData: this.applicationStore.getData(),
    conversationHistory: this.getRecentMessages()
  }
  
  // Send to Gemini
  const response = await geminiService.sendMessage(
    this.buildPrompt(content, context)
  )
  
  // Process response
  this.addMessage({
    content: response.message,
    isUser: false,
    uiAction: response.uiAction,
    extractedData: response.extractedData
  })
  
  // Update phase if needed
  if (response.nextPhase) {
    this.currentPhase = response.nextPhase
  }
}
```

### Document Processing Flow
```javascript
async handleFileUpload(file) {
  this.isProcessing = true
  
  try {
    // Upload and process
    const extractedData = await this.uploadDocument(file)
    
    // Add to application store
    this.applicationStore.addDocument({
      file: file.name,
      type: extractedData.documentType,
      data: extractedData.extractedData,
      confidence: extractedData.confidence
    })
    
    // Continue conversation
    await this.sendMessage(`Document processed: ${file.name}`, 'system')
    
  } catch (error) {
    this.addMessage({
      content: `Error processing ${file.name}. Please try again.`,
      isUser: false,
      isError: true
    })
  }
  
  this.isProcessing = false
}
```

## Deployment

### Frontend Build
```bash
npm run build
# Deploy dist/ to static hosting (Vercel, Netlify)
```

### Backend Proxy
```javascript
// Simple Express server
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.post('/api/gemini', async (req, res) => {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify(req.body)
  })
  
  const data = await response.json()
  res.json(data)
})

app.listen(3001)
```

## Success Criteria

1. **Smooth conversation flow** from discovery to payment
2. **Real-time document processing** with data extraction
3. **Clean, modern UI** that works on mobile
4. **Error handling** for failed uploads or API issues
5. **Data persistence** throughout the session
6. **Professional appearance** suitable for demos

This simplified architecture delivers a compelling POC while being implementable in days rather than weeks.