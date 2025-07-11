<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, Shield, CheckCircle, AlertCircle, X } from 'lucide-vue-next'

const emit = defineEmits(['upload'])

interface ExtractedData {
  documentType: string
  extractedData: Record<string, string>
  confidence: number
}

const fileInput = ref<HTMLInputElement | null>(null)
const uploadState = ref<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
const uploadProgress = ref(0)
const uploadedFile = ref<File | null>(null)
const extractedData = ref<ExtractedData | null>(null)
const showTooltip = ref(false)
const errorMessage = ref('')

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    uploadFile(target.files[0])
  }
}

const openFileDialog = () => {
  if (uploadState.value === 'completed') {
    // Reset to allow new upload
    resetUpload()
  }
  fileInput.value?.click()
}

const uploadFile = (file: File) => {
  uploadedFile.value = file
  uploadState.value = 'uploading'
  uploadProgress.value = 0

  // Simulate upload progress
  const interval = setInterval(() => {
    uploadProgress.value += 20
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      uploadState.value = 'processing'
      // Emit the file for processing
      emit('upload', file)
    }
  }, 150)
}

const resetUpload = () => {
  uploadState.value = 'idle'
  uploadProgress.value = 0
  uploadedFile.value = null
  extractedData.value = null
  errorMessage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// These methods will be called by the parent component
const setProcessingComplete = (data: ExtractedData) => {
  extractedData.value = data
  uploadState.value = 'completed'
}

const setError = (message: string) => {
  errorMessage.value = message
  uploadState.value = 'error'
}

// Expose methods to parent
defineExpose({
  setProcessingComplete,
  setError
})

const formatDocumentType = (type: string) => {
  const typeMap: Record<string, string> = {
    businessLicense: 'Business License',
    taxID: 'Tax ID Document',
    bankInfo: 'Bank Information',
    ownerID: 'Owner ID Document'
  }
  return typeMap[type] || type
}
</script>

<template>
  <div class="space-y-3 mt-4">
    <!-- Upload Button/Status -->
    <div class="flex items-center gap-3">
      <!-- Upload Button -->
      <Button
        v-if="uploadState === 'idle'"
        @click="openFileDialog"
        variant="outline"
        size="sm"
        class="flex items-center gap-2 hover:bg-blue-50 border-blue-200"
      >
        <Upload class="w-4 h-4" />
        Upload Document
      </Button>

      <!-- Upload Progress -->
      <div v-else-if="uploadState === 'uploading'" class="flex-1 max-w-xs">
        <div class="flex items-center gap-2 mb-1">
          <Upload class="w-4 h-4 text-blue-600 animate-pulse" />
          <span class="text-sm text-gray-600">Uploading...</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            class="bg-blue-600 h-1.5 rounded-full transition-all duration-200" 
            :style="`width: ${uploadProgress}%`"
          ></div>
        </div>
      </div>

      <!-- Processing State -->
      <div v-else-if="uploadState === 'processing'" class="flex items-center gap-2">
        <Shield class="w-4 h-4 text-amber-600 animate-spin" />
        <span class="text-sm text-amber-700 font-medium">Document is being processed securely...</span>
        <div class="flex space-x-1">
          <div class="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div class="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div class="w-1 h-1 bg-amber-500 rounded-full animate-bounce"></div>
        </div>
      </div>

      <!-- Completed State -->
      <div v-else-if="uploadState === 'completed'" class="flex items-center gap-2">
        <div 
          class="relative"
          @mouseenter="showTooltip = true"
          @mouseleave="showTooltip = false"
        >
          <div class="flex items-center gap-2 cursor-pointer">
            <CheckCircle class="w-4 h-4 text-green-600" />
            <span class="text-sm text-green-700 font-medium">{{ uploadedFile?.name }}</span>
            <FileText class="w-4 h-4 text-gray-400" />
          </div>
          
          <!-- Hover Tooltip with Extracted Data -->
          <div 
            v-if="showTooltip && extractedData"
            class="absolute bottom-full left-0 mb-2 z-50"
          >
            <Card class="w-80 shadow-lg border-gray-200">
              <CardContent class="p-4">
                <div class="space-y-3">
                  <div class="flex items-center gap-2 pb-2 border-b">
                    <FileText class="w-4 h-4 text-blue-600" />
                    <span class="font-semibold text-sm">
                      {{ formatDocumentType(extractedData.documentType) }}
                    </span>
                    <span class="text-xs text-gray-500 ml-auto">
                      {{ Math.round(extractedData.confidence * 100) }}% confidence
                    </span>
                  </div>
                  <div class="space-y-2">
                    <div 
                      v-for="(value, key) in extractedData.extractedData" 
                      :key="key"
                      class="flex flex-col gap-1"
                    >
                      <dt class="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {{ key.replace(/([A-Z])/g, ' $1').trim() }}
                      </dt>
                      <dd class="text-sm text-gray-900">{{ value }}</dd>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Button
          @click="openFileDialog"
          variant="ghost"
          size="sm"
          class="ml-2 text-xs text-gray-500 hover:text-gray-700"
        >
          Upload New
        </Button>
      </div>

      <!-- Error State -->
      <div v-else-if="uploadState === 'error'" class="flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-red-600" />
        <span class="text-sm text-red-700">{{ errorMessage }}</span>
        <Button
          @click="resetUpload"
          variant="ghost"
          size="sm"
          class="ml-2"
        >
          <X class="w-3 h-3" />
        </Button>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input 
      type="file" 
      @change="handleFileSelect" 
      class="hidden" 
      ref="fileInput" 
      accept=".pdf,.jpg,.jpeg,.png" 
    />
  </div>
</template> 