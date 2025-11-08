# US States: Personal Income vs. Educational Attainment Visualization

This interactive visualization displays the relationship between personal income and educational attainment across US states from 2006-2019.

## Features Implemented

### Grade 4 (62%) ✓
- **Choropleth Map**: US map with AlbersUSA projection showing bivariate color encoding
- **Scatterplot**: X-axis shows educational attainment, Y-axis shows personal income
- **3x3 Bivariate Color Scheme**: Applied to both visualizations

### Grade 3 (74.5%) ✓
- **Year Slider**: Interactive slider to change the year (2006-2019)
- **Tooltips**: Hover over data points to see state names

### Grade 2 (87%) ✓
- **Brushing**: Select states on scatterplot with brush selection
- **Linked Views**: Brushed states appear highlighted on map, others are grayed out
- **Clear Brush**: Click empty area on scatterplot to clear selection

### Grade 1 (100%) ✓
- **Map Click Interaction**: Click states on map to highlight them on scatterplot
- **Clear Highlight**: Click empty area on map to clear highlighting
- **Title**: H1 element summarizing the visualization

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open browser to http://localhost:5173

## Technologies Used

- **Vue.js 3**: Reactive UI framework
- **D3.js 7.9.0**: Data visualization library
- **Pinia**: State management for Vue
- **Bootstrap 5**: CSS framework
- **Vite**: Build tool

## Data Files

- `usa_personal-income-by-state_2006-2019.csv`: Personal income data
- `usa_ba-degree-or-higher_2006-2019.csv`: Educational attainment data
- `us-states-geo.json`: GeoJSON file for US states

## Implementation Notes

- Uses D3's `geoAlbersUsa()` projection for the choropleth map
- Bivariate color scheme divides data into 3x3 grid based on education and income thresholds
- All visualizations are linked reactively using Pinia store
- Brush selection uses D3's brush behavior
- State highlighting uses reactive Vue properties
