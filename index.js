// GET and transform the data
const fs = require('fs');
const d3 = require('d3');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const chartFrame = require('g-chartframe');

const cleanVotes = require('./lib/calculate-total').cleanVotes;
const calculateCoalitionNumbers = require('./lib/calculate-coalition.js').calculateCoalitionNumbers;
const getSortedData = require('./lib/sort-data.js').sortData;
const getAverage = require('./lib/average-data.js').averageData;

const { colourSelector, nameCleaner, coalitionNamer } = require('./lib/helpers.js');
const barChart = require('./lib/total/barchart.js').seatBarChart;
const barAxes = require('./lib/total/axes.js').seatAxes;
const stackedChart = require('./lib/coalition/stacked.js').makeStackedChart;
const stackedAxes = require('./lib/coalition/axes.js').makeStackedAxes;

// DATA CHOICES
const dataUrl = process.env.DATA_URL;
const coalitionCombinations = [
  ['CDU/CSU', 'SPD'],
  ['SPD', 'LINKE', 'GRÜNE'],
  ['CDU/CSU', 'FDP'],
  ['CDU/CSU', 'GRÜNE'],
  ['CDU/CSU', 'FDP', 'GRÜNE']
];

// CHART CONFIG
const outputDir = '/dist';
const s3Dir = 'https://s3-eu-west-1.amazonaws.com/ft-ig-content-prod/v2/ft-interactive/germany-2017-seatcalculator/master/';
const timeStamp = d3.timeFormat('%d-%m-%Y')(new Date());
const timeUpdated = d3.timeFormat('%B %e %Y')(new Date());
const barWidth = 700;
const barHeight = 500;
const stackedWidth = 700;
const stackedHeight = 500;
const stackedPadding = { left: 30, right: 30 };

async function loadData(url){
  return new Promise((res, rej) => {
    d3.json(dataUrl, data => res(data))
  })
}

function sortData(data){
  return data.sort((a,b) => {
    const aDate = a['surveyPublished'].split('.').reverse().join('-');
    const bDate = b['surveyPublished'].split('.').reverse().join('-');
    return new Date(bDate) - new Date(aDate);
  })
}

function calculateSeatNumbers(poll){
    return votesToSeats(poll);
}

function calculateCoalition(poll){
  return calculateCoalitionNumbers(poll, coalitionCombinations);
}

function setUpJSDOM(){
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.sendTo(console);
  const dom = new JSDOM( fs.readFileSync('scaffold.html'), {virtualConsole});
  const chartContainer = d3.select(dom.window.document.querySelector('div.chart'));
  return chartContainer;
}

// --------------------- MAKE BAR CHART OF TOTAL SEATS ------------------------- //

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

// --------------------- MAKE STACKED CHART OF COALITIONS ------------------------- //

function makeStackedChart(coalitionData){
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

function writeChartToFile(chartContainer, chartName){
  //  BUILD the graphic
  const doctype = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`;

  const markup = doctype + chartContainer.html().trim();

  // SAVE it to dist
  const dir = __dirname + outputDir;
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
  fs.writeFileSync(`${dir}/${chartName}-latest.svg`, markup);
  fs.writeFileSync(`${dir}/${chartName}-${timeStamp}.svg`, markup);
}

function writeHoldingPage(outputDir){
  const dir = __dirname + outputDir;
  const htmlStart = fs.readFileSync('display-page-start.html');
  const htmlEnd = `</body></html>`;
  const fileList = fs.readdirSync(dir).reverse().filter(file => !file.includes('index') );
  const pictureMarkup = fileList.map((file) => {
    return `<h2>${file.split('-').splice(2).join(" ")}</h2>
            <a href='${s3Dir}${file}'>${s3Dir}${file}</a>
            <object type='image/svg+xml' data='${file}' style="display:block">
            </object>`;
  })
  const markup = htmlStart + pictureMarkup + htmlEnd;

  fs.writeFileSync(`${dir}/index.html`, markup);
}

loadData(dataUrl).then(data => {
  const sortedData = getSortedData(data);
  const averageDataLatest = getAverage(sortedData)[0];
  const cleanVoteNumbers = cleanVotes(averageDataLatest);
  const totalChart = makeBarChart(cleanVoteNumbers);
  const coalitionNumbers = calculateCoalition(cleanVoteNumbers);
  const coalitionsChart = makeStackedChart(coalitionNumbers);
  writeChartToFile(totalChart, "seat-barchart");
  writeChartToFile(coalitionsChart, "coalition-stackedchart");
  writeHoldingPage(outputDir);
})
.catch(err => console.error(`MAKING THE CHART FAILED ${err}`, err));
