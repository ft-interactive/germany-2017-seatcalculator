const d3 = require('d3');

function sortData(data){
  const sortedData = data.map(poll => {
    // election results have fewer data fields than polls
    const additionalFields = (poll["respondents"] === 'Bundestagswahl') ? 3 : 5;

    const partyList = removeSmallParties(Object.keys(poll).slice(0, -additionalFields));
    const surveyInfo = Object.keys(poll).slice(-additionalFields);
    const dateInfo = Object.keys(poll).filter( key => key.includes('survey'));
    let newPoll = breakOutParties(poll, partyList, surveyInfo);
    let newPollDates = convertDates(newPoll, dateInfo);
    let newPollNumbers = convertNumbers(newPollDates);
    return newPollNumbers;
  });

  function breakOutParties(poll, partyList, surveyInfo){
    return [poll].reduce((acc, curr)=>{
      acc['parties'] = {};
      partyList.forEach(party => acc['parties'][party] = curr[party], acc );
      surveyInfo.forEach(info => acc[info] = curr[info], acc );
      return acc;
    }, {});
  };

  function removeSmallParties(partyList){
    return partyList.filter(party => {
      return !party.toLowerCase().includes('sonstige') &&
      !party.toLowerCase().includes('nicht') &&
      !party.toLowerCase().includes('pirat') &&
      !party.toLowerCase().includes('fw')
    })
  }

  function convertDates(poll, dateInfo){
    return [poll].reduce((acc, curr)=>{
      dateInfo.forEach(dateKey => {
        const eurDate = curr[dateKey];
        const usDate = eurDate.split('.').reverse().join('-');
        const newDate = new Date(usDate);
        acc[dateKey] = newDate;
        return acc;
      });
      return acc;
    }, poll);
  };

  function convertNumbers(poll){
    return [poll].reduce((acc, curr) => {
      const allParties = Object.keys(acc['parties']);
      allParties.forEach( party => {
        let partyResult = acc['parties'][party];
        let partyResultNumber = partyResult.split("").filter(char => char !== "%").join("");
        acc['parties'][party] = parseFloat(partyResultNumber);
      });
      return acc;
    }, poll)
  };

  function sortByEndDate(data){
    data.sort((a,b) => {
      return b.surveyPublished - a.surveyPublished;
    })
    return data;
  };

  return sortByEndDate(sortedData);
};

module.exports = { sortData };
