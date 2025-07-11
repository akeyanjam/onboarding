<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { geminiService } from '@/services/geminiService'
import MessageBubble from './MessageBubble.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const chatStore = useChatStore()
const applicationStore = useApplicationStore()

const messages = computed(() => chatStore.messages)
const userInput = ref('')
const messageBubbleRefs = ref<Record<string, InstanceType<typeof MessageBubble>>>({})
const currentFileUploadMessageId = ref<string | null>(null)

const isLastMessageFromAssistant = computed(() => {
    const last = messages.value[messages.value.length - 1]
    return last && !last.isUser
})

const handleSend = () => {
    sendMessage(userInput.value, true);
}

const sendMessage = async (content: string, isUserMessage: boolean = true) => {
  if (!content.trim()) return

  const text = content
  userInput.value = ''
  
  if (isUserMessage) {
    chatStore.addMessage({ content: text, isUser: true })
  }
  
  chatStore.setProcessing(true)

  try {
    const response = await geminiService.sendMessage(text)

    // Extract and store application data if provided (flat key-value pairs)
    if (response.extractedData && typeof response.extractedData === 'object') {
      console.log('🔍 Processing extracted data:', response.extractedData)
      
      // Store all extracted data as flat key-value pairs
      applicationStore.updateExtractedData(response.extractedData)
      
      console.log('📊 Updated application store extractedData:', applicationStore.extractedData)
      
      // Also handle specific business type if provided
      if (response.extractedData.businessType) {
        applicationStore.setBusinessType(response.extractedData.businessType.toLowerCase())
      }
    }

    // Use the new method to store the full response
    chatStore.addModelResponse(JSON.stringify(response))

  } catch (error) {
    chatStore.addMessage({
      content: 'Sorry, I encountered an error. Please try again.',
      isUser: false,
      isError: true,
    })
  } finally {
    chatStore.setProcessing(false)
  }
}

const handleFileUpload = async (file: File, messageId?: string) => {
  // Track which message bubble initiated the file upload
  if (messageId) {
    currentFileUploadMessageId.value = messageId
  }

  chatStore.setProcessing(true)
  
  try {
    const extractedData = await geminiService.extractDataFromDocument(file)
    
    applicationStore.addDocument({
      file: file.name,
      type: extractedData.documentType,
      data: extractedData.extractedData,
      confidence: extractedData.confidence,
    })

    // Find and update the FileUpload component that initiated this upload
    const messageBubbleRef = findMessageBubbleWithFileUpload()
    if (messageBubbleRef) {
      messageBubbleRef.setFileProcessingComplete(extractedData)
    }

    const summaryForAgent = `The document '${file.name}' has been processed. The extracted data is: ${JSON.stringify(extractedData)}.`
    await sendMessage(summaryForAgent, false) // false means this is not a direct user message

  } catch (error) {
    console.error('File processing error:', error)
    
    // Find and update the FileUpload component with error state
    const messageBubbleRef = findMessageBubbleWithFileUpload()
    if (messageBubbleRef) {
      messageBubbleRef.setFileProcessingError(`Error processing ${file.name}. Please try again.`)
    } else {
      // Fallback: add error message to chat
      chatStore.addMessage({
        content: `Error processing ${file.name}. Please try again.`,
        isUser: false,
        isError: true,
      })
    }
  } finally {
    chatStore.setProcessing(false)
    currentFileUploadMessageId.value = null
  }
}

const findMessageBubbleWithFileUpload = () => {
  // Find the most recent message with fileRequest uiAction
  const reversedMessages = [...messages.value].reverse()
  for (const message of reversedMessages) {
    if (message.uiAction?.type === 'fileRequest') {
      // Return the corresponding MessageBubble ref
      return messageBubbleRefs.value[message.id]
    }
  }
  return null
}

const handlePaymentSubmit = async (message: string) => {
  applicationStore.completeApplication()
  await sendMessage(message, true)
}

onMounted(() => {
  // Don't send a message if there are already messages
  if (messages.value.length === 0) {
    sendMessage("Hello", false)
  }
})
</script>

<template>
  <div class="flex flex-col h-full w-full mx-auto bg-white dark:bg-gray-800">
    <div class="flex-1 flex flex-col-reverse overflow-y-auto p-4 space-y-4 space-y-reverse">
      <div v-if="chatStore.isProcessing" class="flex items-center space-x-2 p-4">
        <div class="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
        <div class="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.2s]"></div>
        <div class="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:0.4s]"></div>
      </div>
      <MessageBubble 
        v-for="message in [...messages].reverse()" 
        :key="message.id"
        :ref="(el) => { if (el && '$el' in el) messageBubbleRefs[message.id] = el as InstanceType<typeof MessageBubble> }"
        :message="message"
        @submit-payment="handlePaymentSubmit"
        @file-upload="(file) => handleFileUpload(file, message.id)"
        @send-message="sendMessage"
      />
    </div>
    <div class="border-t p-4 bg-gray-50 dark:bg-gray-900">
      <div v-if="isLastMessageFromAssistant" class="flex items-center space-x-2">
        <Input 
            v-model="userInput" 
            @keyup.enter="handleSend" 
            :disabled="chatStore.isProcessing"
            placeholder="Type your message..." 
        />
        <Button @click="handleSend" :disabled="chatStore.isProcessing">Send</Button>
      </div>
      <div v-else class="text-center text-gray-500">
        Please respond to the prompt above to continue.
      </div>
    </div>
  </div>
</template>