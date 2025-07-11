<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CreditCard, Lock, Shield, CheckCircle } from 'lucide-vue-next'

const emit = defineEmits(['submit'])

const paymentInfo = ref({
  cardNumber: '',
  expiry: '',
  cvv: '',
  name: '',
})

const errors = ref({
  cardNumber: '',
  expiry: '',
  cvv: '',
  name: '',
})

const isProcessing = ref(false)
const isSubmitted = ref(false)

// Card number formatting
const formatCardNumber = (value: string) => {
  // Remove all non-digits
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  
  // Add spaces every 4 digits
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  
  if (parts.length) {
    return parts.join(' ')
  } else {
    return v
  }
}

// Expiry formatting
const formatExpiry = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4)
  }
  return v
}

// Card type detection
const cardType = computed(() => {
  const number = paymentInfo.value.cardNumber.replace(/\s/g, '')
  if (/^4/.test(number)) return 'visa'
  if (/^5[1-5]/.test(number)) return 'mastercard'
  if (/^3[47]/.test(number)) return 'amex'
  if (/^6/.test(number)) return 'discover'
  return 'unknown'
})

const cardIcon = computed(() => {
  switch (cardType.value) {
    case 'visa':
      return '💳'
    case 'mastercard':
      return '💳'
    case 'amex':
      return '💳'
    case 'discover':
      return '💳'
    default:
      return '💳'
  }
})

// Watchers for real-time formatting
watch(() => paymentInfo.value.cardNumber, (newVal) => {
  const formatted = formatCardNumber(newVal)
  if (formatted !== newVal) {
    paymentInfo.value.cardNumber = formatted
  }
  // Clear error when user starts typing
  if (errors.value.cardNumber) {
    errors.value.cardNumber = ''
  }
})

watch(() => paymentInfo.value.expiry, (newVal) => {
  const formatted = formatExpiry(newVal)
  if (formatted !== newVal) {
    paymentInfo.value.expiry = formatted
  }
  if (errors.value.expiry) {
    errors.value.expiry = ''
  }
})

watch(() => paymentInfo.value.cvv, () => {
  if (errors.value.cvv) {
    errors.value.cvv = ''
  }
})

watch(() => paymentInfo.value.name, () => {
  if (errors.value.name) {
    errors.value.name = ''
  }
})

// Validation
const validateForm = () => {
  let isValid = true
  errors.value = { cardNumber: '', expiry: '', cvv: '', name: '' }

  // Card number validation
  const cardNumber = paymentInfo.value.cardNumber.replace(/\s/g, '')
  if (!cardNumber) {
    errors.value.cardNumber = 'Card number is required'
    isValid = false
  } else if (cardNumber.length < 13 || cardNumber.length > 19) {
    errors.value.cardNumber = 'Invalid card number'
    isValid = false
  }

  // Expiry validation
  if (!paymentInfo.value.expiry) {
    errors.value.expiry = 'Expiry date is required'
    isValid = false
  } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.value.expiry)) {
    errors.value.expiry = 'Invalid expiry date'
    isValid = false
  }

  // CVV validation
  if (!paymentInfo.value.cvv) {
    errors.value.cvv = 'CVV is required'
    isValid = false
  } else if (paymentInfo.value.cvv.length < 3 || paymentInfo.value.cvv.length > 4) {
    errors.value.cvv = 'Invalid CVV'
    isValid = false
  }

  // Name validation
  if (!paymentInfo.value.name.trim()) {
    errors.value.name = 'Cardholder name is required'
    isValid = false
  }

  return isValid
}

const submitApplication = async () => {
  if (!validateForm()) return

  isProcessing.value = true
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Set submitted state
  isSubmitted.value = true
  isProcessing.value = false
  
  // Emit simple success message
  emit('submit', 'Payment successfully submitted')
}

const handleKeyPress = (event: KeyboardEvent, field: string) => {
  if (field === 'cardNumber' || field === 'cvv') {
    // Only allow numbers
    if (!/[0-9]/.test(event.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()
    }
  }
  
  if (field === 'cvv' && paymentInfo.value.cvv.length >= 4) {
    if (!['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault()
    }
  }
}
</script>

<template>
  <Card class="max-w-md mx-auto shadow-lg border-0 bg-white my-4">
    <!-- Success State -->
    <div v-if="isSubmitted" class="p-12 text-center">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle class="w-12 h-12 text-green-600" />
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Payment Submitted</h3>
      <p class="text-gray-600">Your payment information has been successfully processed.</p>
    </div>

    <!-- Payment Form -->
    <div v-else>
      <CardHeader class="pb-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 rounded-lg">
            <CreditCard class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle class="text-lg font-semibold text-gray-900">Payment Information</CardTitle>
            <p class="text-sm text-gray-500 mt-1">Complete your application securely</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent class="space-y-4">
        <form @submit.prevent="submitApplication">
          <!-- Card Number -->
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Card Number</label>
            <div class="relative">
              <Input 
                v-model="paymentInfo.cardNumber"
                placeholder="1234 1234 1234 1234"
                maxlength="19"
                @keypress="handleKeyPress($event, 'cardNumber')"
                :class="[
                  'pl-10 pr-10 h-12 text-base',
                  errors.cardNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                ]"
              />
              <CreditCard class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg">{{ cardIcon }}</span>
            </div>
            <p v-if="errors.cardNumber" class="text-xs text-red-600">{{ errors.cardNumber }}</p>
          </div>

          <!-- Cardholder Name -->
          <div class="space-y-1">
            <label class="text-sm font-medium text-gray-700">Cardholder Name</label>
            <Input 
              v-model="paymentInfo.name"
              placeholder="John Smith"
              :class="[
                'h-12 text-base',
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              ]"
            />
            <p v-if="errors.name" class="text-xs text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Expiry and CVV -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">Expiry</label>
              <Input 
                v-model="paymentInfo.expiry"
                placeholder="MM/YY"
                maxlength="5"
                @keypress="handleKeyPress($event, 'expiry')"
                :class="[
                  'h-12 text-base',
                  errors.expiry ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                ]"
              />
              <p v-if="errors.expiry" class="text-xs text-red-600">{{ errors.expiry }}</p>
            </div>
            
            <div class="space-y-1">
              <label class="text-sm font-medium text-gray-700">CVV</label>
              <div class="relative">
                <Input 
                  v-model="paymentInfo.cvv"
                  placeholder="123"
                  maxlength="4"
                  type="password"
                  @keypress="handleKeyPress($event, 'cvv')"
                  :class="[
                    'pr-8 h-12 text-base',
                    errors.cvv ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  ]"
                />
                <Shield class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <p v-if="errors.cvv" class="text-xs text-red-600">{{ errors.cvv }}</p>
            </div>
          </div>

          <!-- Security Notice -->
          <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Lock class="w-4 h-4 text-gray-500" />
            <span class="text-xs text-gray-600">Your payment information is encrypted and secure</span>
          </div>

          <!-- Submit Button -->
          <Button 
            type="submit" 
            :disabled="isProcessing"
            class="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base mt-6 relative"
          >
            <span v-if="!isProcessing" class="flex items-center justify-center gap-2">
              Complete Application
              <CreditCard class="w-4 h-4" />
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          </Button>

          <!-- Bank of America Notice -->
          <div class="text-center mt-4">
            <p class="text-xs text-gray-500">
              Powered by Bank of America Merchant Services
            </p>
          </div>
        </form>
      </CardContent>
    </div>
  </Card>
</template>

<style scoped>
/* Enhanced focus states */
.relative input:focus + .absolute {
  color: #3b82f6;
}

/* Smooth transitions */
input {
  transition: all 0.2s ease-in-out;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Card number spacing animation */
input[placeholder*="1234"] {
  letter-spacing: 0.5px;
}
</style> 