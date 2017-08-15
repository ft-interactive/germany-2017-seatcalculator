const d3 = require("d3");

function makeStackedChart() {
  let yScale;
  let xScale;
  let zScale;
  let colourSelector;
  let nameCleaner;
  let coalitionNamer;
  let barHeight = 40;
  let sizeVersion;

  function stackedChart(parent) {

    const data = parent.datum();

    const objectToStack = (o, order) => {
      const list = Object.keys(o);
      if (order !== undefined) { /*sort*/ }

      return list.reduce((acc, current, index) => {
        acc.stack.push({
          party: current,
          x: acc.start,
          votes: o[current]
        })
        acc.start += o[current];
        return acc;
      }, {
        stack: [],
        start: 0
      }).stack;
    }

    const layout = (data) => {
      return data.map(objectToStack);
    }

    const stacks = layout(data);

    parent.selectAll('g.stack')
      .data(stacks)
      .enter()
      .append('g').attr('class', 'stack')
      .each(function(stackData, index) {
        d3.select(this)
          .selectAll('rect')
          .data(stackData)
          .enter()
          .append('rect')
          .attr('x', d => xScale(d.x))
          .attr('y', d => yScale(index))
          .attr('width', d => xScale(d.votes))
          .attr('height', barHeight)
          .attr('fill', d => colourSelector(d.party))
      });

    // add in-bar party name labels
    parent.selectAll('g.stack')
      .append('g').attr('class', 'party-label')
      .each(function(stackData, index) {
        d3.select(this)
          .selectAll('text')
          .data(stackData)
          .enter()
          .append('text')
          .text(d => `${nameCleaner(d.party, sizeVersion)}`)
          .attr('x', d => xScale(d.x))
          .attr('y', d => yScale(index))
          .attr('fill', d => colourSelector(d.party, 'text'))
          .attr('transform', `translate( 5, ${(barHeight / 2) - 4})`)

      });

    // add in-bar party vote share labels
    parent.selectAll('g.stack')
      .append('g').attr('class', 'party-vote-label')
      .each(function(stackData, index) {
        d3.select(this)
          .selectAll('text')
          .data(stackData)
          .enter()
          .append('text')
          .text(d => `${d.votes}%`)
          .attr('x', d => xScale(d.x))
          .attr('y', d => yScale(index))
          .attr('fill', d => colourSelector(d.party, 'text'))
          .attr('transform', `translate( 5, ${(barHeight / 2) + 13})`)
      });

    // add end-of-bar labels
    parent.selectAll('g.stack')
      .append('g').attr('class', 'total-label')
      .each(function(stackData, index) {
        const total = stackData.reduce((acc, curr) => {
          return acc += curr.votes
        }, 0);
        d3.select(this)
          .append('text')
          .text(d => `${total}%`)
          .attr('x', d => {
            return sizeVersion === "small" ? xScale(69) : xScale(total) ;
          })
          .attr('y', d => yScale(index))
          .attr('transform', `translate(5, ${(barHeight / 2) + 3})`)
      });

    // add above-bar labels
    parent.selectAll('g.stack')
      .append('g').attr('class', 'coalition-name-label')
      .each(function(stackData, index) {
        d3.select(this)
          .append('text')
          .text(d => {
            return `${coalitionNamer(d)}`
          })
          .attr('x', 0)
          .attr('y', d => yScale(index))
          .attr('transform', `translate(0, -3)`)
      });

  }
  stackedChart.setYScale = (x) => {
    yScale = x;
    return stackedChart;
  }
  stackedChart.setXScale = (x) => {
    xScale = x;
    return stackedChart;
  }
  stackedChart.setZScale = (x) => {
    zScale = x;
    return stackedChart;
  }
  stackedChart.setColourSelector = (x) => {
    colourSelector = x;
    return stackedChart;
  }
  stackedChart.setNameCleaner = (x) => {
    nameCleaner = x;
    return stackedChart;
  }
  stackedChart.setCoalitionNamer = (x) => {
    coalitionNamer = x;
    return stackedChart;
  }
  stackedChart.setSizeVersion = (x) => {
    sizeVersion = x;
    return stackedChart;
  }

  return stackedChart;
}

module.exports = {
  makeStackedChart
};
