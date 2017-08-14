const d3 = require('d3');

function seatBarChart(){

  let xScale;
  let yScale;
  let chartHeight;
  let colourSelector;
  let barWidth;

  function chart(parent){

    const data = parent.datum();

    xScale.domain(data.map(d => d.partyName ));

    // append rectangles
    parent.selectAll('.bar')
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.partyName))
      .attr("y", d => yScale(d.vote))
      .attr("height", d => chartHeight - yScale(d.vote))
      .attr("width", barWidth)
      .attr("fill", d => colourSelector(d.partyName, "bar"));

      const labelContainer = parent.append("g")
      .attr("class", "label-container");

      // append bar labels
      parent.selectAll('.bar-label')
      .data(data)
      .enter()
      .append("text")
      .text(d =>  `${d.vote}%`)
      .attr("class", "bar-label")
      .attr("y", d => yScale(d.vote) - 5)
      .attr("x", d => xScale(d.partyName) + (barWidth/2))
      .attr("text-anchor", "middle")
      .attr("font-family", 'Metric-Semibold')

  };

  chart.setXScale = (x) => {
    xScale = x;
    return chart;
  }
  chart.setYScale = (x) => {
    yScale = x;
    return chart;
  }
  chart.setChartHeight = (x) => {
    chartHeight = x;
    return chart;
  }
  chart.setColourSelector = (x) => {
    colourSelector = x;
    return chart;
  }
  chart.setBarWidth = (x) => {
    barWidth = x;
    return chart;
  }

  return chart;
};

module.exports = { seatBarChart };
