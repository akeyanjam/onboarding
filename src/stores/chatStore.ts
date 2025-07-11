import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  content: string
  isUser: boolean
  uiAction?: any // to be defined later
  extractedData?: any // to be defined later
  isError?: boolean
  fullResponse?: string // Store the complete JSON response from model
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as Message[],
    isProcessing: false,
    currentPhase: 'discovery', // discovery|package|location|documents|confirmation|payment
    conversationId: uuidv4(),
  }),
  actions: {
    addMessage(message: Omit<Message, 'id'>) {
      this.messages.push({ ...message, id: uuidv4() })
    },
    addModelResponse(fullJsonResponse: string) {
      try {
        const parsed = JSON.parse(fullJsonResponse)
        this.messages.push({
          id: uuidv4(),
          content: parsed.message || '',
          isUser: false,
          uiAction: parsed.uiAction,
          extractedData: parsed.extractedData,
          fullResponse: fullJsonResponse
        })
        
        // Update phase if provided
        if (parsed.nextPhase) {
          this.currentPhase = parsed.nextPhase
        }
      } catch (error) {
        console.error('Failed to parse model response:', error)
        this.messages.push({
          id: uuidv4(),
          content: 'Error: Invalid response format',
          isUser: false,
          isError: true
        })
      }
    },
    setProcessing(isProcessing: boolean) {
      this.isProcessing = isProcessing
    },
    setPhase(phase: string) {
      this.currentPhase = phase
    },
    reset() {
      this.messages = []
      this.isProcessing = false
      this.currentPhase = 'discovery'
      this.conversationId = uuidv4()
    },
  },
}) 