const d3 = require('d3');
const {setUpJSDOM} = require('../setup-jsdom');
const chartFrame = require('g-chartframe');

const { colourSelector, nameCleaner, coalitionNamer } = require('../helpers.js');
const stackedChart = require('./stacked.js').makeStackedChart;
const stackedAxes = require('./axes.js').makeStackedAxes;

const timeStamp = d3.timeFormat('%d-%m-%Y')(new Date());
const timeUpdated = d3.timeFormat('%B %e %Y')(new Date());

const maxPercentage = 75;

// --------------------- MAKE STACKED CHART OF COALITIONS ------------------------- //

function makeStackedChart(chartConfig, coalitionData, coalitionCombinations){
  const chartContainer = setUpJSDOM();
  const {frameMaker, title, subtitle, width, height, chartPadding, chartMargin, sourceY, sizeVersion} = chartConfig;

  const frame = frameMaker({
    title,
    subtitle,
    source: `Source: Wahlrecht.de, updated ${timeUpdated} |` +
      'Graphic: Anna Leach, © FT',
    margin: chartMargin,
    autoPosition: false,
    sourceY,
  })

  chartContainer.select('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
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
    .domain([0, maxPercentage]);

  const plot = chartContainer.select('.chart-plot');
  plot.attr('class', 'coalition-chart');

  const coalitionChart = stackedChart(plot);
  coalitionChart.setYScale(yScale);
  coalitionChart.setXScale(xScale);
  coalitionChart.setColourSelector(colourSelector);
  coalitionChart.setNameCleaner(nameCleaner);
  coalitionChart.setCoalitionNamer(coalitionNamer);
  coalitionChart.setSizeVersion(sizeVersion);

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
