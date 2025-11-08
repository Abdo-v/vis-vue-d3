<template>
  <div class="vis-component" ref="chartContainer">
    <svg ref="svg" class="main-svg" :width="svgWidth" :height="svgHeight"></svg>
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
const margin = { top: 20, right: 20, bottom: 70, left: 70 };

const width = computed(() => svgWidth.value - margin.left - margin.right);
const height = computed(() => svgHeight.value - margin.top - margin.bottom);

// 3x3 Bivariate color scheme
const bivariateColors = [
  ['#e8e8e8', '#b8d6be', '#73ae80'], // Low income
  ['#b5c0da', '#90b2b3', '#5a9178'], // Medium income
  ['#6c83b5', '#567994', '#2a5a5b']  // High income
];

let brush = null;
let xScale, yScale;
let circlesSelection = null;

const renderChart = () => {
  if (!svg.value || !store.combinedData || store.combinedData.length === 0) return;

  const svgElement = d3.select(svg.value);
  svgElement.selectAll('*').remove();

  // Create tooltip
  const tooltip = d3.select('body')
    .selectAll('.scatter-tooltip')
    .data([null])
    .join('div')
    .attr('class', 'scatter-tooltip')
    .style('position', 'fixed')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.9)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('font-weight', '500')
    .style('pointer-events', 'none')
    .style('z-index', '10000')
    .style('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.3)');

  const g = svgElement.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  xScale = d3.scaleLinear()
    .domain([15, 65])
    .range([0, width.value]);

  yScale = d3.scaleLinear()
    .domain([25000, 85000])
    .range([height.value, 0]);

  // Draw bivariate color grid background (equal bins)
  const edBins = [15, 31.67, 48.33, 65];
  const incBins = [25000, 45000, 65000, 85000];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      g.append('rect')
        .attr('x', xScale(edBins[j]))
        .attr('y', yScale(incBins[i + 1]))
        .attr('width', xScale(edBins[j + 1]) - xScale(edBins[j]))
        .attr('height', yScale(incBins[i]) - yScale(incBins[i + 1]))
        .attr('fill', bivariateColors[i][j])
        .attr('opacity', 0.3);
    }
  }

  // X axis
  g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${height.value})`)
    .call(d3.axisBottom(xScale).ticks(10));

  // Y axis
  g.append('g')
    .attr('class', 'axis axis-y')
    .call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `$${d3.format(',')(d)}`));

  // X axis label
  g.append('text')
    .attr('class', 'axis-label')
    .attr('x', width.value / 2)
    .attr('y', height.value + 50)
    .attr('text-anchor', 'middle')
    .text('Educational Attainment: Bachelor\'s Degree or Higher (%)');

  // Y axis label
  g.append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height.value / 2)
    .attr('y', -50)
    .attr('text-anchor', 'middle')
    .text('Average Yearly Personal Income (in $)');

  // Brush
  const brushG = g.append('g')
    .attr('class', 'brush');

  brush = d3.brush()
    .extent([[0, 0], [width.value, height.value]])
    .on('start brush', (event) => {
      if (!event.selection) {
        store.setBrushedStates([]);
        return;
      }
      const [[x0, y0], [x1, y1]] = event.selection;
      const brushedStates = store.combinedData
        .filter(d => {
          const x = xScale(d.education);
          const y = yScale(d.income);
          return x >= x0 && x <= x1 && y >= y0 && y <= y1;
        })
        .map(d => d.state);
      store.setBrushedStates(brushedStates);
    })
    .on('end', (event) => {
      if (!event.selection) {
        store.setBrushedStates([]);
      }
    });

  brushG.call(brush);

  // Data points
  circlesSelection = g.selectAll('.data-point')
    .data(store.combinedData)
    .enter()
    .append('circle')
    .attr('class', 'data-point')
    .attr('cx', d => xScale(d.education))
    .attr('cy', d => yScale(d.income))
    .attr('r', d => d.state === store.highlightedState ? 8 : 5)
    .attr('fill', d => d.state === store.highlightedState ? '#ff6b6b' : '#4a90e2')
    .attr('stroke', d => d.state === store.highlightedState ? '#c92a2a' : '#2c5aa0')
    .attr('stroke-width', d => d.state === store.highlightedState ? 3 : 1.5)
    .on('mouseover', function(event, d) {
      d3.select(this).raise().attr('stroke-width', 3);
      tooltip
        .style('visibility', 'visible')
        .text(d.state)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function(event, d) {
      const strokeWidth = d.state === store.highlightedState ? 3 : 1.5;
      d3.select(this).attr('stroke-width', strokeWidth);
      tooltip.style('visibility', 'hidden');
    });

  // Update highlighting function
  updateHighlight();
};

const updateHighlight = () => {
  if (!circlesSelection) return;
  
  circlesSelection
    .attr('r', d => d.state === store.highlightedState ? 8 : 5)
    .attr('fill', d => d.state === store.highlightedState ? '#ff6b6b' : '#4a90e2')
    .attr('stroke', d => d.state === store.highlightedState ? '#c92a2a' : '#2c5aa0')
    .attr('stroke-width', d => d.state === store.highlightedState ? 3 : 1.5);
};

onMounted(() => {
  renderChart();
});

watch(() => store.selectedYear, () => {
  renderChart();
});

watch(() => store.combinedData, () => {
  renderChart();
});

watch(() => store.highlightedState, () => {
  updateHighlight();
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

.axis path,
.axis line {
  stroke: #666;
}

.axis text {
  fill: #666;
  font-size: 11px;
}

.axis-label {
  fill: #333;
  font-size: 13px;
  font-weight: 500;
}

.data-point {
  cursor: pointer;
  transition: all 0.2s ease;
}

.data-point:hover {
  stroke-width: 2.5 !important;
}

:deep(.selection) {
  fill: rgba(74, 144, 226, 0.2);
  stroke: #4a90e2;
  stroke-width: 2;
}
</style>
