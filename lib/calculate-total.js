function cleanVotes(poll){

  const partyResults = poll.averages;

  const parliamentClean = Object.keys(partyResults).map((party) => {
    return { partyName: party, vote: partyResults[party] };
  });

  const votesOfAllLargeParties = parliamentClean.reduce((acc,curr) => {
    return acc + curr.vote;
  },0)

  const adjustedVote = parliamentClean.map( party => {
    const oldVote = party.vote;
    party.vote = Math.round((oldVote/votesOfAllLargeParties) * 100);
    return party;
  })

  adjustedVote.sort((a,b) => {
    return b.vote - a.vote;
  });

  return adjustedVote;
}

module.exports = {cleanVotes};
