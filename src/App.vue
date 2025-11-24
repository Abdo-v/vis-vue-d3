<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 text-center mt-3 mb-3">
          <h1>US-States: Personal Income vs. Educational Attainment (2006 - 2019)</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <YearSlider/>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-md-6">
          <Scatterplot />
        </div>
        <div class="col-md-6">
          <ChoroplethMap/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from '@/stores/store.js';

const store = useStore();

import Scatterplot from '@/components/Scatterplot.vue';
import YearSlider from '@/components/YearSlider.vue';
import ChoroplethMap from '@/components/ChoroplethMap.vue';

onMounted(() => {
  store.loadData();
});
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
}
</style>
