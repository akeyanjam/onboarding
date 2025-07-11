<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import { marked } from 'marked'
import type { Message } from '@/stores/chatStore'
import { Button } from '@/components/ui/button'

import PaymentForm from './PaymentForm.vue'
import FileUpload from './FileUpload.vue'
import ImageDisplay from './ImageDisplay.vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Building2 } from 'lucide-vue-next'

const props = defineProps({
  message: {
    type: Object as PropType<Message>,
    required: true,
  },
})

const emit = defineEmits(['submit-payment', 'file-upload', 'send-message'])

const fileUploadRef = ref<InstanceType<typeof FileUpload> | null>(null)

const parsedContent = computed(() => {
  return marked.parse(props.message.content);
});

const bubbleClass = computed(() => ({
  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg': true,
  'bg-blue-500 text-white': props.message.isUser,
  'bg-gray-200 text-gray-800': !props.message.isUser,
  'bg-red-100 border border-red-400 text-red-700': props.message.isError,
}))

const selectOption = async (option: string) => {
    // Use the existing sendMessage function which handles everything properly
    // We need to import and use it from the parent component
    emit('send-message', option)
}

// Expose methods to control FileUpload component
const setFileProcessingComplete = (data: any) => {
  fileUploadRef.value?.setProcessingComplete(data)
}

const setFileProcessingError = (message: string) => {
  fileUploadRef.value?.setError(message)
}

// Expose methods to parent
defineExpose({
  setFileProcessingComplete,
  setFileProcessingError
})
</script>

<template>
  <div class="flex items-start gap-4" :class="{ 'flex-row-reverse': message.isUser }">
    <Avatar>
      <AvatarImage v-if="!message.isUser" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Bank_of_America_logo.svg/2560px-Bank_of_America_logo.svg.png" alt="Bank of America" />
      <AvatarFallback>
        <User v-if="message.isUser" class="w-5 h-5" />
        <Building2 v-else class="w-5 h-5" />
      </AvatarFallback>
    </Avatar>
    <div :class="bubbleClass">
      <div v-html="parsedContent" class="prose dark:prose-invert max-w-none"></div>
      
      <!-- Button Actions -->
      <div v-if="message.uiAction?.type === 'buttons'" class="mt-4 mb-2 space-y-2">
        <Button 
          v-for="option in message.uiAction.data.options"
          :key="option"
          @click="selectOption(option)"
          type="button"
          variant="outline"
          class="w-full justify-start"
        >
          {{ option }}
        </Button>
      </div>



      <!-- Payment Form -->
      <PaymentForm 
        v-if="message.uiAction?.type === 'showPaymentForm'"
        @submit="(paymentInfo) => emit('submit-payment', paymentInfo)"
      />

      <!-- File Upload -->
      <FileUpload 
        v-if="message.uiAction?.type === 'fileRequest'"
        ref="fileUploadRef"
        @upload="(file) => emit('file-upload', file)"
      />
      
      <!-- Image Display -->
      <ImageDisplay
        v-if="message.uiAction?.type === 'showImage'"
        :src="message.uiAction.data"
      />

    </div>
  </div>
</template> 