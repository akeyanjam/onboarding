<script setup lang="ts">
defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: 'Onboarding Image',
  },
})
</script>

<template>
  <div class="mt-3 mb-2">
    <img :src="src" :alt="alt" class="rounded-lg w-full" />
  </div>
</template> 