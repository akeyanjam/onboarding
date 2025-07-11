<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore';
import { useChatStore } from '@/stores/chatStore';
import { usePanelStore } from '@/stores/panelStore';
import { computed } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Package, FileText, CheckCircle, CircleDollarSign, Sparkles, X } from 'lucide-vue-next';

const applicationStore = useApplicationStore();
const chatStore = useChatStore();
const panelStore = usePanelStore();

const onboardingSteps = [
  { id: 'discovery', name: 'Business Discovery', icon: Briefcase },
  { id: 'package', name: 'Package Selection', icon: Package },
  { id: 'documents', name: 'Document Upload', icon: FileText },
  { id: 'confirmation', name: 'Data Confirmation', icon: CheckCircle },
  { id: 'payment', name: 'Finalize Application', icon: CircleDollarSign },
];

const isCompleted = computed(() => chatStore.currentPhase === 'complete')

const getStepStatus = (index: number) => {
  if (isCompleted.value) {
    return 'completed'
  }
  
  const currentStepIndex = onboardingSteps.findIndex(step => step.id === chatStore.currentPhase)
  
  if (index <= currentStepIndex) {
    return index === currentStepIndex ? 'current' : 'completed'
  }
  
  return 'pending'
}

const formatBusinessType = (type: string | null) => {
  if (!type) return null;
  
  const typeMap: { [key: string]: string } = {
    'retail': 'Retail Store',
    'restaurant': 'Restaurant',
    'online': 'E-commerce/Online',
    'personal_services': 'Personal Services',
    'on_the_go': 'On-The-Go Business'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const formatSolutionType = (type: string) => {
  const typeMap: { [key: string]: string } = {
    'basic': 'Basic Payment Solution',
    'mobile': 'Mobile Point of Sale Solution',
    'essentials_light': 'Essentials Light Solution',
    'essentials': 'Essentials Solution',
    'restaurant': 'Restaurant Solution',
    'retail': 'Retail Solution',
    'virtual_terminal': 'Virtual Terminal Solution',
    'ecommerce': 'E-commerce Solution'
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

const formattedBusinessType = computed(() => formatBusinessType(applicationStore.businessType));

const formatFieldName = (fieldName: string) => {
  // Convert camelCase or snake_case to readable format
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/[_-]/g, ' ')      // Replace underscores and dashes with spaces
    .trim()
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Mobile header with close button -->
    <div class="flex items-center justify-between p-4 border-b md:hidden">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Application Summary</h2>
      <Button 
        variant="ghost" 
        size="icon" 
        @click="panelStore.closePanel"
        class="h-8 w-8"
      >
        <X class="h-4 w-4" />
      </Button>
    </div>
    
    <!-- Desktop header -->
    <div class="hidden md:block p-6 pb-0">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Application Summary</h2>
    </div>
    
    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto p-4 md:p-6 md:pt-0">
    <div class="space-y-6">
      <Card :class="{ 'ring-2 ring-green-500 ring-opacity-50 shadow-lg': isCompleted }">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            Onboarding Progress
            <CheckCircle v-if="isCompleted" class="w-5 h-5 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-4">
            <li 
              v-for="(step, index) in onboardingSteps" 
              :key="step.id" 
              class="flex items-center space-x-3 transition-all duration-500"
            >
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-500"
                :class="{
                  // Completed state (green) - either all completed or individual step completed
                  'bg-green-600 text-white': getStepStatus(index) === 'completed' || isCompleted,
                  // Current state (blue) - only if not in completed mode
                  'bg-blue-600 text-white': getStepStatus(index) === 'current' && !isCompleted,
                  // Pending state (gray)
                  'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300': getStepStatus(index) === 'pending' && !isCompleted
                }"
              >
                <CheckCircle 
                  v-if="getStepStatus(index) === 'completed' || isCompleted" 
                  class="w-5 h-5" 
                />
                <component 
                  v-else 
                  :is="step.icon" 
                  class="w-5 h-5" 
                />
              </div>
              <span 
                class="text-sm font-medium transition-colors duration-500"
                :class="{
                  'text-green-600 dark:text-green-400 font-semibold': getStepStatus(index) === 'completed' || isCompleted,
                  'text-blue-600 dark:text-blue-400': getStepStatus(index) === 'current' && !isCompleted,
                  'text-gray-600 dark:text-gray-400': getStepStatus(index) === 'pending' && !isCompleted
                }"
              >
                {{ step.name }}
                <span v-if="getStepStatus(index) === 'completed' || isCompleted" class="ml-1">✓</span>
              </span>
            </li>
          </ul>
          
          <!-- Success Message -->
          <div v-if="isCompleted" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center gap-2 text-green-800">
              <Sparkles class="w-5 h-5" />
              <span class="font-semibold">All steps completed successfully!</span>
            </div>
            <p class="text-sm text-green-700 mt-1">
              Your application is now being processed by our team.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card :class="{ 'border-green-200 shadow-md': isCompleted }">
        <CardHeader>
          <CardTitle>
            Collected Information
          </CardTitle>
        </CardHeader>
        <CardContent class="text-sm space-y-3">
          <div v-if="formattedBusinessType">
            <strong>Business Type:</strong> {{ formattedBusinessType }}
          </div>
          <div v-if="applicationStore.businessInfo.name">
            <strong>Business Name:</strong> {{ applicationStore.businessInfo.name }}
          </div>
          <div v-if="applicationStore.businessInfo.industry">
            <strong>Industry:</strong> {{ applicationStore.businessInfo.industry }}
          </div>
          <div v-if="applicationStore.businessInfo.volume">
            <strong>Est. Annual Volume:</strong> ${{ applicationStore.businessInfo.volume.toLocaleString() }}
          </div>
          <div v-if="applicationStore.businessInfo.description">
            <strong>Description:</strong> {{ applicationStore.businessInfo.description }}
          </div>
          <div v-if="applicationStore.selectedPackage">
            <strong class="block mb-1">Selected Solution:</strong>
            <div class="pl-2 space-y-1">
              <div>{{ formatSolutionType(applicationStore.selectedPackage.type) }}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ applicationStore.selectedPackage.description }}
              </div>
              <div v-if="applicationStore.selectedPackage.totalCost" class="text-sm font-medium text-green-600">
                Total Cost: ${{ applicationStore.selectedPackage.totalCost.toLocaleString() }}
              </div>
            </div>
          </div>
          <div v-if="applicationStore.locations.length > 0">
            <strong class="block mb-1">Locations:</strong>
            <ul class="pl-2 space-y-1">
              <li v-for="location in applicationStore.locations" :key="location.name" class="flex items-center gap-2">
                <Briefcase class="w-4 h-4 text-gray-500" />
                <span>{{ location.name }}</span>
              </li>
            </ul>
          </div>
          <div v-if="applicationStore.documents.length > 0">
            <strong class="block mb-1">Documents:</strong>
            <ul class="pl-2 space-y-1">
              <li v-for="doc in applicationStore.documents" :key="doc.file" class="flex items-center gap-2">
                <FileText class="w-4 h-4 text-gray-500" />
                <span>{{ doc.file }} ({{ doc.type }})</span>
              </li>
            </ul>
          </div>
          <div v-if="Object.keys(applicationStore.extractedData).length > 0">
            <strong class="block mb-1">Additional Information:</strong>
            <div class="pl-2 space-y-1">
              <div v-for="(value, key) in applicationStore.extractedData" :key="key" class="flex flex-col gap-1">
                <div class="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">{{ formatFieldName(key) }}:</div>
                <div class="text-sm">{{ value }}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for celebration */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Staggered animations for checkmarks */
@keyframes checkmark-appear {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.7;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

.animate-checkmark {
  animation: checkmark-appear 0.6s ease-out forwards;
}
</style> 