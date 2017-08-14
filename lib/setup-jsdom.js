const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const d3 = require('d3');

function setUpJSDOM(){
  const virtualConsole = new jsdom.VirtualConsole();
  virtualConsole.sendTo(console);
  const dom = new JSDOM( fs.readFileSync('./scaffold.html'), {virtualConsole});
  const chartContainer = d3.select(dom.window.document.querySelector('div.chart'));
  return chartContainer;
}

module.exports = {setUpJSDOM};
