const d3 = require('d3');
const {setUpJSDOM} = require('../setup-jsdom');
const chartFrame = require('g-chartframe');

const { colourSelector, nameCleaner, coalitionNamer } = require('../helpers.js');
const stackedChart = require('./stacked.js').makeStackedChart;
const stackedAxes = require('./axes.js').makeStackedAxes;

const timeStamp = d3.timeFormat('%d-%m-%Y')(new Date());
const timeUpdated = d3.timeFormat('%B %e %Y')(new Date());

// --------------------- MAKE STACKED CHART OF COALITIONS ------------------------- //

function makeStackedChart(coalitionData, coalitionCombinations){
  const chartContainer = setUpJSDOM();

  const frame = chartFrame.webFrameM({
    margin: {top:125, left: 20, right: 30, bottom: 30},
    title: 'Potential coalition combinations',
    subtitle: 'Estimated % share of 2017 Bundestag seats based on latest polls',
    source: `Source: Wahlrecht.de, last updated ${timeUpdated}|` +
    'Graphic: Anna Leach, ©FT',
    sourceY: 475,
  });

  chartContainer.select('svg')
    .attr('width', stackedWidth)
    .attr('height', stackedHeight)
    .attr('viewBox', `0 0 ${stackedWidth} ${stackedHeight}`)
    .call(frame);

  const chartHeight = frame.dimension().height;
  const chartWidth = frame.dimension().width;

  frame.autoPosition(false);
  frame.subtitleLineHeight(25);

  const yScale = d3.scaleLinear()
    .range([0, chartHeight])
    .domain([0, coalitionCombinations.length]);

  const xScale = d3.scaleLinear()
    .range([0, chartWidth])
    .domain([0, 75]);

  const plot = chartContainer.select('.chart-plot');
  plot.attr('class', 'coalition-chart');

  const coalitionChart = stackedChart(plot);
  coalitionChart.setYScale(yScale);
  coalitionChart.setXScale(xScale);
  coalitionChart.setColourSelector(colourSelector);
  coalitionChart.setNameCleaner(nameCleaner);
  coalitionChart.setCoalitionNamer(coalitionNamer);

  const coalitionAxes = stackedAxes(plot);
  coalitionAxes.setYScale(yScale);
  coalitionAxes.setXScale(xScale);
  coalitionAxes.setChartHeight(chartHeight);

  frame.plot()
    .datum(coalitionData)
    .call(coalitionChart)
    .call(coalitionAxes);

  return chartContainer;
}

module.exports = {makeStackedChart};
