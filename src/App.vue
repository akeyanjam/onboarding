<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import ChatInterface from '@/components/ChatInterface.vue'
import SummaryPanel from '@/components/layout/SummaryPanel.vue'
import { usePanelStore } from '@/stores/panelStore'
import { onMounted, onUnmounted } from 'vue'

const panelStore = usePanelStore()

// Close panel when clicking outside on mobile
const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const panel = document.getElementById('summary-panel')
  const hamburger = document.querySelector('[data-hamburger]')
  
  if (panelStore.isOpen && panel && !panel.contains(target) && !hamburger?.contains(target)) {
    panelStore.closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
    <div class="flex flex-col h-full max-w-screen-2xl mx-auto">
      <Header />
      <main class="flex flex-1 overflow-hidden relative">
        <!-- Main chat area -->
        <div class="flex-1 flex flex-col min-w-0">
          <ChatInterface />
        </div>
        
        <!-- Desktop sidebar -->
        <aside class="w-[450px] hidden md:block border-l bg-white dark:bg-gray-800 dark:border-gray-700">
          <SummaryPanel />
        </aside>

        <!-- Mobile overlay background -->
        <div 
          v-if="panelStore.isOpen" 
          class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          @click="panelStore.closePanel"
        ></div>

        <!-- Mobile sliding panel -->
        <aside 
          id="summary-panel"
          class="fixed top-0 right-0 h-full w-[350px] bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden"
          :class="panelStore.isOpen ? 'translate-x-0' : 'translate-x-full'"
        >
          <SummaryPanel />
        </aside>
      </main>
    </div>
  </div>
</template>

<style>
/* Prevent body scroll when panel is open on mobile */
body.panel-open {
  overflow: hidden;
}

/* Ensure the app takes full height */
html, body, #app {
  height: 100%;
  overflow: hidden;
}
</style>
