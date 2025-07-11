import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePanelStore = defineStore('panel', () => {
  const isOpen = ref(false)

  const openPanel = () => {
    isOpen.value = true
  }

  const closePanel = () => {
    isOpen.value = false
  }

  const togglePanel = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    openPanel,
    closePanel,
    togglePanel
  }
}) 