const d3 = require('d3');

function averageData(allData){
  const parties = Object.keys(allData[0]['parties']);

  const uniqueDates = [ ...new Set(allData.map(d => d.surveyPublished))];

  let weightedAverage = [];

  uniqueDates.forEach(date => {
    let pastPolls = allData
      .filter(d => {
        return ((new Date(d.surveyPublished).getTime() <= new Date(date).getTime()));
      })
      .filter(d=>(d != undefined))
      .filter(d => {
        let cduResult = d['parties']['CDU/CSU'];
        return typeof cduResult === 'number' && !Number.isNaN(cduResult);
      });  //remove dud results at this stage by checking CDU result

    let sevenPollsters = [];
    let sevenPolls = [];
    let averages = {};
    let i = 0;

    for(let i=0; sevenPollsters.length<=6 && i<pastPolls.length; i++){
      if(sevenPollsters.indexOf(pastPolls[i]['pollster']) < 0){
        sevenPollsters.push(pastPolls[i]['pollster']);
        sevenPolls.push(pastPolls[i])
      }
    }

    sevenPolls.forEach(s => {
      s.daysSince = (new Date(date) - new Date(s.surveyPublished))/(1000*60*60*24);
      s.weight = Math.max(0,100-Math.pow(s.daysSince,1.354));
    });

    parties.forEach(p => {

      const weightedPartyTotal = sevenPolls
        .filter(s => typeof s['parties'][p] === 'number' && !Number.isNaN(s['parties'][p]))
        .map(s => {
          return s['parties'][p] * s.weight})
        .reduce((acc,curr) => (acc + curr), 0);

      const totalWeight = sevenPolls
        .map(s => s.weight)
        .reduce((acc,curr) => (acc+curr), 0);

        averages[p] = weightedPartyTotal / totalWeight;
    });

    weightedAverage.push({
      date: date,
      averages: averages
    });

    return weightedAverage;
  });

  return weightedAverage;
}
module.exports = { averageData }
