<template>
  <div class="year-slider-container">
    <label for="range-year" class="form-label">Year Selection</label>
    <input 
      id="range-year" 
      v-model="selectedYear" 
      type="range" 
      class="form-range" 
      min="2006" 
      max="2019" 
    />
    <div class="mt-2 text-center"><strong>Selected Year: {{ selectedYear }}</strong></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from '@/stores/store.js';

// Access the Pinia store
const store = useStore();

// Computed property for selectedYear, linked to Pinia state
const selectedYear = computed({
  get: () => store.selectedYear,
  set: (val) => store.changeSelectedYear(val),
});
</script>

<style scoped>
.year-slider-container {
  padding: 10px 20px;
}

.form-label {
  font-weight: 500;
  color: #333;
}
</style>
