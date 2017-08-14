const d3 = require('d3');
const {setUpJSDOM} = require('../setup-jsdom');

const { colourSelector, nameCleaner, coalitionNamer } = require('../helpers.js');
const barChart = require('./barchart.js').seatBarChart;
const barAxes = require('./axes.js').seatAxes;

const timeStamp = d3.timeFormat('%d-%m-%Y')(new Date());
const timeUpdated = d3.timeFormat('%B %e %Y')(new Date());

function makeBarChart(chartConfig, data){
  const chartContainer = setUpJSDOM();
  const {frameMaker, title, subtitle, width, height, chartPadding, chartMargin, barWidth} = chartConfig;

  const frame = frameMaker({
		title,
    subtitle,
		source: `Source: Wahlrecht.de, updated ${timeUpdated} |` +
      'Graphic: Anna Leach, © FT',
    margin: chartMargin
	});

  const margin = {top:120, left: 0, right: 30, bottom: 90};

  frame.autoPosition(false);
  frame.subtitleLineHeight(25);

  chartContainer.select('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .call(frame);

  const chartHeight = frame.dimension().height;
  const chartWidth = frame.dimension().width;

  const xScale = d3.scaleBand()
                  .range([0, chartWidth])
                  .padding(0);

  const yScale = d3.scaleLinear()
                  .range([chartHeight, 0])
                  .domain([0, 45]);

  const plot = chartContainer.select('.chart-plot');
  plot.attr('class', 'seat-chart');

  const seatChart = barChart(plot);
  seatChart.setYScale(yScale);
  seatChart.setXScale(xScale);
  seatChart.setChartHeight(chartHeight);
  seatChart.setColourSelector(colourSelector);
  seatChart.setBarWidth(barWidth);

  const seatAxes = barAxes(plot);
  seatAxes.setXScale(xScale);
  seatAxes.setYScale(yScale);
  seatAxes.setChartHeight(chartHeight);
  seatAxes.setChartWidth(chartWidth);
  seatAxes.setNameCleaner(nameCleaner);
  seatAxes.setMargin(margin);

  frame.plot()
    .datum(data)
    .call(seatChart)
    .call(seatAxes);

  return chartContainer;
}

module.exports = {makeBarChart};
