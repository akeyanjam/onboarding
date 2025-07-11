<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { usePanelStore } from '@/stores/panelStore'
import { Menu, RotateCcw } from 'lucide-vue-next'

const panelStore = usePanelStore()

const resetConversation = () => {
  window.location.reload();
}
</script>

<template>
  <header class="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
    <div class="flex items-center space-x-4">
      <img src="/logo.svg" alt="Bank of America" class="h-6 mb-1 md:h-8 md:mb-2">
    </div>
    
    <div class="flex items-center space-x-2">
      <!-- Desktop: Full text button -->
      <Button variant="outline" @click="resetConversation" class="hidden md:flex">
        New Application
      </Button>
      
      <!-- Mobile: Icon only button -->
      <Button variant="outline" size="icon" @click="resetConversation" class="md:hidden">
        <RotateCcw class="h-4 w-4" />
      </Button>
      
      <!-- Mobile: Hamburger menu -->
      <Button 
        variant="outline" 
        size="icon" 
        @click="panelStore.togglePanel" 
        class="md:hidden"
        data-hamburger
      >
        <Menu class="h-4 w-4" />
      </Button>
    </div>
  </header>
</template> 