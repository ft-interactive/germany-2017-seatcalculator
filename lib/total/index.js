const d3 = require('d3');
const {setUpJSDOM} = require('../setup-jsdom');
const chartFrame = require('g-chartframe');

const { colourSelector, nameCleaner, coalitionNamer } = require('../helpers.js');
const barChart = require('./barchart.js').seatBarChart;
const barAxes = require('./axes.js').seatAxes;

const timeStamp = d3.timeFormat('%d-%m-%Y')(new Date());
const timeUpdated = d3.timeFormat('%B %e %Y')(new Date());

const barWidth = 700;
const barHeight = 500;

function makeBarChart(data){
  const chartContainer = setUpJSDOM();

  const margin = {top:120, left: 0, right: 30, bottom: 90};

  const frame = chartFrame.webFrameM({
    margin,
    title: 'Predicted share of Bundestag seats',
    subtitle: 'Based on latest poll predictions for the September 2017 election |',
    source: `Source: Wahlrecht.de, last updated ${timeUpdated}|` +
    'Graphic: Anna Leach',
  });

  frame.autoPosition(false);
  frame.subtitleLineHeight(25);

  chartContainer.select('svg')
    .attr('width', barWidth)
    .attr('height', barHeight)
    .attr('viewBox', `0 0 ${barWidth} ${barHeight}`)
    .call(frame);

  const chartHeight = frame.dimension().height;
  const chartWidth = frame.dimension().width;

  const xScale = d3.scaleBand()
                  .range([0, chartWidth])
                  .padding(0.2);

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
