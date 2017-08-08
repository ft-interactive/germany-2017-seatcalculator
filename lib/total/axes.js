const d3 = require('d3');

function seatAxes(){

  let xScale;
  let yScale;
  let chartHeight;
  let chartWidth;
  let nameCleaner;
  let seatsNeededMajority = 316;
  let margin;

  function axes(parent){

    const xAxis = d3.axisBottom(xScale)
      .tickFormat( d => nameCleaner(d))
      .tickSize(0);

    const yAxis = d3.axisRight(yScale)
      .tickValues([50, 100, 150, 200, 250, 300, seatsNeededMajority])
      .tickSize(chartWidth);

    parent.append("g")
      .attr("class", "axes")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis);

    parent.append("g")
      .attr("class", "axes")
      .attr("id", "y-axis")
      .call(yAxis);

    parent.selectAll('#y-axis .tick text')
      .attr("visibility", "hidden");

    parent.selectAll('#y-axis .tick line')
      .attr("visibility", "hidden");

      //add highlight class to 315 tick
    parent.selectAll('#y-axis .tick')
        .classed("highlight", d => d === seatsNeededMajority );

    // append yaxis highlight note on majority seats
    parent.selectAll('#y-axis .tick.highlight')
      .append('text')
      .text("316 seats needed for a majority")
      .attr("y", 3)
      .attr("x", (chartWidth))
      .attr("text-anchor", "end");

    parent.selectAll('#y-axis .tick.highlight')
      .append("line")
      .attr("class", "highlight")
      .attr("y", yScale(seatsNeededMajority))
      .attr("x1", 0)
      .attr("x2", chartWidth - 200)
      .attr("stroke-width", 4);

    // add base line to columns
    // parent.selectAll('#y-axis')
    //   .append("line")
    //   .attr("stroke-width", 10)
    //   .attr("fill", "black")
    //   .attr("class", "baseline")
    //   .attr("y", yScale(0))
    //   .attr("x1", 5)
    //   .attr("x2", chartWidth)
    //   .translate(`transform(0,20)`);

  }

  axes.setYScale = (x) => {
    yScale = x;
    return axes;
  }
  axes.setXScale = (x) => {
    xScale = x;
    return axes;
  }
  axes.setChartHeight = (x) =>{
    chartHeight = x;
    return axes;
  }
  axes.setChartWidth = (x) =>{
    chartWidth = x;
    return axes;
  }
  axes.setNameCleaner = (x) =>{
    nameCleaner = x;
    return axes;
  }
  axes.setMargin = (x) => {
    margin = x;
    return margin;
  }

  return axes;
}

module.exports = { seatAxes };
