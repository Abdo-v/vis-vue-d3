<template>
  <div class="vis-component" ref="chartContainer">
    <svg ref="svg" class="main-svg" :width="svgWidth" :height="svgHeight"></svg>
    <div
      v-if="tooltip.visible"
      class="tooltip"
      :style="{
        left: tooltip.x + 'px',
        top: tooltip.y + 'px'
      }"
    >
      <strong>{{ tooltip.state }}</strong><br>
      <span v-if="tooltip.data">
        Education: {{ tooltip.data.education.toFixed(1) }}%<br>
        Income: ${{ formatNumber(tooltip.data.income) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import { useStore } from '@/stores/store.js';

const store = useStore();
const chartContainer = ref(null);
const svg = ref(null);

const svgWidth = ref(700);
const svgHeight = ref(550);

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  state: '',
  data: null
});


const bivariateColors = [
  ['#e8e8e8', '#b8d6be', '#73ae80'], // Low income
  ['#b5c0da', '#90b2b3', '#5a9178'], // Medium income
  ['#6c83b5', '#567994', '#2a5a5b']  // High income
];

const getBivariateColor = (education, income) => {
  const edBin = education < 31.67 ? 0 : education < 48.33 ? 1 : 2;
  const incBin = income < 45000 ? 0 : income < 65000 ? 1 : 2;
  return bivariateColors[incBin][edBin];
};

const formatNumber = (num) => {
  return d3.format(',')(num);
};

const renderMap = () => {
  if (!svg.value || !store.geoData || !store.combinedData || store.combinedData.length === 0) return;

  const svgElement = d3.select(svg.value);
  svgElement.selectAll('*').remove();

  const stateDataMap = new Map();
  store.combinedData.forEach(d => {
    stateDataMap.set(d.state, d);
  });

  const projection = d3.geoAlbersUsa()
    .scale(700)
    .translate([svgWidth.value / 2, svgHeight.value / 2]);

  const pathGenerator = d3.geoPath().projection(projection);

  const paths = svgElement.selectAll('path')
    .data(store.geoData.features)
    .enter()
    .append('path')
    .attr('d', pathGenerator)
    .attr('class', 'state-path')
    .attr('fill', d => {
      const data = stateDataMap.get(d.properties.name);
      return data ? getBivariateColor(data.education, data.income) : '#ccc';
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 1)
    .on('click', function(event, d) {
      event.stopPropagation();
      store.setHighlightedState(d.properties.name);
    })
    .on('mouseover', function(event, d) {
      const containerRect = chartContainer.value.getBoundingClientRect();
      const data = stateDataMap.get(d.properties.name);
      tooltip.value = {
        visible: true,
        x: event.clientX - containerRect.left + 10,
        y: event.clientY - containerRect.top - 10,
        state: d.properties.name,
        data: data
      };
      d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
    })
    .on('mouseout', function() {
      tooltip.value.visible = false;
      d3.select(this).attr('stroke', '#fff').attr('stroke-width', 1);
    });


  svgElement.on('click', () => {
    store.setHighlightedState(null);
  });

  const updateBrush = () => {
    paths.attr('opacity', d => {
      if (store.brushedStates.length === 0) return 1;
      return store.brushedStates.includes(d.properties.name) ? 1 : 0.2;
    });
  };

  watch(() => store.brushedStates, updateBrush, { deep: true });
  updateBrush();
};

onMounted(() => {
  renderMap();
});

watch(() => store.selectedYear, () => {
  renderMap();
});

watch(() => store.combinedData, () => {
  renderMap();
});

watch(() => store.geoData, () => {
  renderMap();
});
</script>

<style scoped>
.vis-component {
  position: relative;
  width: 100%;
}

.main-svg {
  display: block;
  margin: 0 auto;
}

.state-path {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.state-path:hover {
  stroke: #333 !important;
  stroke-width: 2 !important;
}

.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  line-height: 1.5;
}
</style>
