const d3 = require("d3");

function makeStackedAxes(){

  let yScale;
  let xScale;
  let chartHeight;
  let amountNeededMajority = 50;

  function axes(parent){

    const xAxis = d3.axisBottom(xScale)
      .tickValues([amountNeededMajority])
      .tickSize(chartHeight);

    const yAxis = d3.axisLeft(yScale)
      .tickSize(0);

    parent.append("g")
      .attr("class", "axes")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, -10)`)
      .call(xAxis);

    parent.append("g")
      .attr("class", "axes")
      .attr("id", "y-axis")
      .attr("transform", `translate(15, 0)`)
      .call(yAxis);

    //add highlight class to majority tick
    parent.selectAll('#x-axis .tick')
      .classed("highlight", d => d === amountNeededMajority )

    parent.selectAll('#x-axis .tick.highlight text')
      .attr("transform", `translate(0, ${- chartHeight - 20})`)
      .attr("text-anchor", "start")
      .text(`Majority government - ${amountNeededMajority}%`)

    parent.select('#x-axis .tick.highlight')
      .append("image")
      .attr("xlink:href", "https://www.ft.com/__origami/service/image/v2/images/raw/fticon-v1:arrow-down%3Fcache-bust%3D2504672?width=200&source=origami-registry")
      .attr("x", -15)
      .attr("y", -15)
      .attr("width", "30px");

    // show highlight, hide other axes
    parent.selectAll('#x-axis .tick.highlight text')
      .attr("visibility", "visible");

    parent.selectAll('#y-axis .tick text')
      .attr("visibility", "hidden");

    parent.selectAll('#x-axis .tick')
      .attr("visibility", "hidden");

    parent.selectAll('#x-axis .tick.highlight')
      .attr("visibility", "visible");


  }
  axes.setYScale = (x) => {
    yScale = x;
    return axes;
  }
  axes.setXScale = (x) => {
    xScale = x;
    return axes;
  }
  axes.setChartHeight = (x) => {
    chartHeight = x;
    return axes;
  }

  return axes;
}

module.exports = {makeStackedAxes};
