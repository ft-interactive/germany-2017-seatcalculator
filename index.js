// GET and transform the data
const fs = require('fs');
const d3 = require('d3');

const cleanVotes = require('./lib/data/calculate-total').cleanVotes;
const calculateCoalitionNumbers = require('./lib/data/calculate-coalition.js').calculateCoalitionNumbers;
const getSortedData = require('./lib/data/sort-data.js').sortData;
const getAverage = require('./lib/data/average-data.js').averageData;

const makeStackedChart = require('./lib/coalition/index.js').makeStackedChart;
const makeBarChart = require('./lib/total/index.js').makeBarChart;

const medChartConfigStacked = {
	frameMaker: chartFrame.webFrameM,
	width: 700,
	height: 550,
	chartPadding: {bottom: 30, top: 30},
	chartMargin: {top:125, left: 20, right: 30, bottom: 30},
	sourceSizing: {sourcePos: 20},
};

const smallChartConfigStacked = {
	frameMaker: chartFrame.webFrameS,
	width: 300,
	height: 500,
	chartPadding: {bottom: 0, top: 0},
	chartMargin: {bottom: -30, top: 180, left: 20, right: 28},
	sourceSizing: {sourcePos: 25},
};

// DATA CHOICES
const dataUrl = process.env.DATA_URL;
const coalitionCombinations = [
  ['CDU/CSU', 'SPD'],
  ['SPD', 'LINKE', 'GRÜNE'],
  ['SPD', 'FDP', 'GRÜNE'],
  ['CDU/CSU', 'FDP'],
  ['CDU/CSU', 'GRÜNE'],
  ['CDU/CSU', 'FDP', 'GRÜNE']
];

const outputDir = '/dist';
const s3Dir = 'https://s3-eu-west-1.amazonaws.com/ft-ig-content-prod/v2/ft-interactive/germany-2017-seatcalculator/master/';
const timeStamp = d3.timeFormat('%d-%m-%Y')(new Date());
const timeUpdated = d3.timeFormat('%B %e %Y')(new Date());


loadData(dataUrl).then(data => {
  try {
    const sortedData = getSortedData(data);
    const averageDataLatest = getAverage(sortedData)[0];
    const cleanVoteNumbers = cleanVotes(averageDataLatest);
    const coalitionNumbers = calculateCoalition(cleanVoteNumbers);
  } catch(err){ `Error with data parsing:`, err }

  const totalChartM = makeBarChart(cleanVoteNumbers);
  const totalChartS = makeBarChart(cleanVoteNumbers);

  const coalitionsChartM = makeStackedChart(coalitionNumbers, coalitionCombinations, medChartConfigStacked );
  const coalitionsChartS = makeStackedChart(coalitionNumbers, coalitionCombinations, smallChartConfigStacked );

  writeChartToFile(totalChart, "seat-barchart");
  writeChartToFile(coalitionsChart, "coalition-stackedchart");
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
