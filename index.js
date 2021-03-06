// GET and transform the data
const fs = require('fs');
const d3 = require('d3');
const chartFrame = require('g-chartframe');

const cleanVotes = require('./lib/data/calculate-total').cleanVotes;
const calculateCoalitionNumbers = require('./lib/data/calculate-coalition.js').calculateCoalitionNumbers;
const getSortedData = require('./lib/data/sort-data.js').sortData;
const getAverage = require('./lib/data/average-data.js').averageData;

const makeStackedChart = require('./lib/coalition/index.js').makeStackedChart;
const makeBarChart = require('./lib/total/index.js').makeBarChart;

const outputDir = '/dist';
const s3Dir = 'https://s3-eu-west-1.amazonaws.com/ft-ig-content-prod/v2/ft-interactive/germany-2017-seatcalculator/master/';
const timeStamp = d3.timeFormat('%d-%m-%Y')(new Date());
const timeUpdated = d3.timeFormat('%B %e %Y')(new Date());

// Configuration for stacked coalition chart
const medChartConfigStacked = {
	frameMaker: chartFrame.webFrameM,
	title: 'Potential coalition combinations',
	subtitle: `Estimated % share of 2017 Bundestag seats based on latest polls`,
	width: 700,
	height: 520,
	chartPadding: {bottom: 0, top: 0}, //no effect
	chartMargin: {top:105, left: 20, right: 30, bottom: 30},
	sourceY: 475,
	sizeVersion: "medium",
};

const smallChartConfigStacked = {
	frameMaker: chartFrame.webFrameS,
	title: 'Potential coalitions',
	subtitle: 'Estimated % share of 2017 Bundestag seats',
	width: 300,
	height: 520,
	chartPadding: {bottom: 0, top: 0},
	chartMargin: {bottom: -75, top: 115, left: 10, right: 10},
	sourceY: 490,
	sizeVersion: "small",
};

// Configuration for total seats bar chart
const medChartConfigBar = {
	frameMaker: chartFrame.webFrameM,
	title: 'Predicted share of Bundestag seats',
	subtitle: 'Based on latest poll predictions for the September 2017 election',
	width: 700,
	height: 550,
	chartPadding: {bottom: 30, top: 30},
	chartMargin: {top:100, left: 20, right: 30, bottom: 30},
	sourceY: 510,
	barWidth: 100
};

const smallChartConfigBar = {
	frameMaker: chartFrame.webFrameS,
	title: 'Predicted share of Bundestag |' + 'seats',
	subtitle: 'Based on latest poll predictions for the |' + 'September 2017 election',
	width: 300,
	height: 500,
	chartPadding: {bottom: 0, top: 0},
	chartMargin: {bottom: -30, top: 130, left: 10, right: 10},
	barWidth: 40,
	sourceY: 465,
};

// DATA CHOICES
const dataUrl = process.env.DATA_URL;
const coalitionCombinations = [
  ['CDU/CSU', 'SPD'],
  ['CDU/CSU', 'FDP', 'GRÜNE'],
  ['CDU/CSU', 'FDP'],
  ['CDU/CSU', 'GRÜNE'],
  ['SPD', 'LINKE', 'GRÜNE'],
  ['SPD', 'FDP', 'GRÜNE']
];

loadData(dataUrl).then(data => {
  const sortedData = getSortedData(data);
  const averageDataLatest = getAverage(sortedData)[0];
  const cleanVoteNumbers = cleanVotes(averageDataLatest);
  const coalitionNumbers = calculateCoalition(cleanVoteNumbers);

  const totalChartM = makeBarChart(medChartConfigBar, cleanVoteNumbers);
  const totalChartS = makeBarChart(smallChartConfigBar, cleanVoteNumbers);

  const coalitionsChartM = makeStackedChart(medChartConfigStacked, coalitionNumbers, coalitionCombinations);
  const coalitionsChartS = makeStackedChart(smallChartConfigStacked, coalitionNumbers, coalitionCombinations);

  writeChartToFile(totalChartM, "seat-barchart-medium");
  writeChartToFile(totalChartS, "seat-barchart-small");
  writeChartToFile(coalitionsChartM, "coalition-stackedchart-medium");
  writeChartToFile(coalitionsChartS, "coalition-stackedchart-small");
  writeHoldingPage(outputDir);
})
.catch(err => console.error(`MAKING THE CHART FAILED ${err}`, err));

// load and format data
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

// write outputted svgs to a file
function writeChartToFile(chartContainer, chartName){
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
