const arrayEqual = require('array-equal');

// Colour setter
function colourSelector(name, use = 'bar') {
  if (name.toString().includes('CDU') && use === 'bar') {
    return '#33302E';
  } else if(name.toString().includes('CDU') && use === 'text'){
    return '#FFFFFF';
  } else if (name.toString().includes('SPD') && use === 'bar') {
    return '#F34D5B';
  } else if (name.toString().includes('SPD') && use === 'text') {
    return '#FFFFFF';
  } else if(name.toString().includes('FDP') && use === 'text'){
    return '#000000';
  } else if (name.toString().includes('FDP') && use === 'bar') {
    return '#fcc83c';
  } else if (name.toString().includes('LINKE') && use === 'bar') {
    return '#B3325D';
  } else if (name.toString().includes('LINKE') && use === 'text') {
    return '#FFFFFF';
  } else if (name.toString().includes('AfD') && use === 'bar') {
    return '#1E8FCC';
  } else if (name.toString().includes('AfD') && use === 'text') {
    return '#FFFFFF';
  } else if (name.toString().includes('GRÜNE') && use === 'bar') {
    return '#AECC70';
  } else if (name.toString().includes('GRÜNE') && use === 'text') {
    return '#000000';
  }
  return 'gray';
}

function nameCleaner(name) {
  if (name.toString().includes('CDU')) {
    return `CDU/CSU`;
  } else if (name.toString().includes('GRÜNE')) {
    return `Grüne`;
  } else if (name.toString().includes('LINKE')) {
    return `Linke`;
  }
  return name;
}

function coalitionNamer(coalition) {
  const coalitionPartners = coalition.map(party => party.party);
  if(arrayEqual(coalitionPartners, ['CDU/CSU', 'SPD'])){
    return `Grand Coalition`;
  } else if(arrayEqual(coalitionPartners, ['SPD', 'LINKE', 'GRÜNE'])){
    return `Red-Red-Green`;
  } else if(arrayEqual(coalitionPartners, ['SPD', 'FDP', 'GRÜNE'])){
    return `Traffic Light`;
  } else if(arrayEqual(coalitionPartners, ['CDU/CSU', 'FDP'])){
    return `Black-Yellow`;
  } else if(arrayEqual(coalitionPartners, ['CDU/CSU', 'GRÜNE'])){
    return `Black-Green`;
  } else if(arrayEqual(coalitionPartners, ['CDU/CSU', 'FDP', 'GRÜNE'])){
    return `Jamaica`;
  }
}

module.exports = { colourSelector, nameCleaner, coalitionNamer };
