const d3 = require("d3");

function calculateCoalitionNumbers(poll, coalitionCombinations){
  return coalitionCombinations.map(coalition => {
    return coalition.reduce((acc, curr) => {
      acc[curr] = getVoteNumber(curr);
      return acc;
    }, {})
  });

  function getVoteNumber(party){
    const dataset = poll.filter(result => result.partyName == party);
    return dataset[0].vote;
  };
}

module.exports = {calculateCoalitionNumbers};
