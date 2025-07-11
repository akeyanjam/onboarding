<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

const props = defineProps({
  formFields: {
    type: Array as PropType<FormField[]>,
    required: true,
  },
});

const emit = defineEmits(['submit']);

const formData = ref<Record<string, any>>({});

// Initialize formData when props change
watch(() => props.formFields, (newFields) => {
  const data: Record<string, any> = {};
  newFields.forEach(field => {
    data[field.name] = '';
  });
  formData.value = data;
}, { immediate: true });


const submitForm = () => {
  emit('submit', formData.value);
};
</script>

<template>
  <div class="bg-white rounded-lg border p-6 max-w-md mx-auto">
    <form @submit.prevent="submitForm" class="space-y-4">
      <div v-for="field in formFields" :key="field.name">
        <Label :for="field.name" class="block text-sm font-medium text-gray-700 mb-1">
          {{ field.label }}
        </Label>
        <Input 
          :id="field.name"
          :name="field.name"
          :type="field.type"
          :placeholder="field.placeholder"
          :required="field.required"
          v-model="formData[field.name]"
        />
      </div>
      <Button type="submit" class="w-full">
        Submit
      </Button>
    </form>
  </div>
</template> 