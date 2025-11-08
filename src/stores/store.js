import { defineStore } from 'pinia';
import * as d3 from 'd3';

export const useStore = defineStore({
  id: 'main',
  state: () => ({
    selectedYear: 2006,
    selectedStates: [],
    brushedStates: [], // States selected by brush in scatterplot
    highlightedState: null, // State highlighted from map click
    personaleIncome: [],
    baDegreeOrHigher: [],
    geoData: null, // Store the map GeoJSON data
  }),
  actions: {
    async loadData() {
      console.log('Loading data...');
      const incomeData = await d3.csv('./usa_personal-income-by-state_2006-2019.csv');
      const educationData = await d3.csv('./usa_ba-degree-or-higher_2006-2019.csv');
      const geoData = await d3.json('./us-states-geo.json');
      
      console.log('Income data loaded:', incomeData.length, 'rows');
      console.log('Education data loaded:', educationData.length, 'rows');
      console.log('GeoData loaded:', geoData ? 'Yes' : 'No');
      
      // Assign data to state after loading
      this.personaleIncome = incomeData;
      this.baDegreeOrHigher = educationData;
      this.geoData = geoData;
      
      console.log('Combined data:', this.combinedData.length, 'states');
    },
    changeSelectedYear(year) {
      this.selectedYear = parseInt(year);
    },
    changeSelectedState(state) {
      this.selectedStates.push(state);
    },
    setBrushedStates(states) {
      this.brushedStates = states;
    },
    setHighlightedState(state) {
      this.highlightedState = state;
    },
  },
  getters: {
    filteredPersonaleIncome(state) {
      if (!state.personaleIncome) return [];
      return state.personaleIncome
        .filter(d => state.selectedYear in d)
        .map(d => ({
          state: d.State,
          value: +d[state.selectedYear],
        }));
    },
    filteredBaDegreeOrHigher(state) {
      if (!state.baDegreeOrHigher) return [];
      return state.baDegreeOrHigher
        .filter(d => state.selectedYear in d)
        .map(d => ({
          state: d.State,
          value: +d[state.selectedYear],
        }));
    },
    // Combined data for scatterplot and choropleth
    combinedData(state) {
      if (!state.personaleIncome || !state.baDegreeOrHigher) return [];
      
      const incomeMap = new Map();
      state.personaleIncome.forEach(d => {
        if (state.selectedYear in d) {
          incomeMap.set(d.State, +d[state.selectedYear]);
        }
      });
      
      const combined = [];
      state.baDegreeOrHigher.forEach(d => {
        if (state.selectedYear in d && incomeMap.has(d.State)) {
          combined.push({
            state: d.State,
            income: incomeMap.get(d.State),
            education: +d[state.selectedYear],
          });
        }
      });
      
      return combined;
    },
  },
});
