function candidates(refsections,target) {
  var results = shortlistByToken(target, refsections, lavenshteinDistanceWithStemmingWithPlain);
  return results.sort(function(x,y) {return x.score - y.score });
}


function shortlistByToken(target,candidates,fuzzySearch) {
  var results = [];
  var targetTokens = tokenize(target);
  _.each(candidates, function(candidate) {
     var candidateTotalScore = 0;
     var sb = scoreboard(targetTokens);
     _.each(targetTokens, function (ttoken) {
        var lowestTokenScore = 100000000;
        _.each(tokenize(candidate.title),function(ctoken) {
            var d = fuzzySearch(ttoken.toLowerCase(), ctoken.toLowerCase());
            if ((d < lowestTokenScore)) {
              lowestTokenScore = d;
              sb[ttoken] = {term:ctoken,score:lowestTokenScore};
            }
        });
        candidateTotalScore += lowestTokenScore;
      });
      var r = {};
      r.title = candidate.title;
      r.key = candidate.key;
      r.score = candidateTotalScore;
      r.scoreboard = sb;
      results.push(r);
  });
  return results;
}

function tokenize(tokenset) {
    return tokenset.split(/\s(?=(?:[^"]|"[^"]*")*$)/);
}

function scoreboard(ttokens) {
  var sboard = {};
  _.each(ttokens, function(t) {
      sboard[t] = {term:"",score:-1};
  });
  return sboard;
}

function scoreboadToString(result) {
  var s ="";
  if (result.hasOwnProperty("scoreboard")) {
     _.each(_.values(result.scoreboard),function(v) {
      s += " " + v.term + ":" + v.score;
    });
  }
  return s;
}




function lavenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];

  // increment along the first column of each row
  var i;
  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) == a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};

function lavenshteinDistanceWithStemmingWithPlain(a,b) {
  var i = b.indexOf(a);
  if (i === 0) {
    return -3;
  } else if (i > -1) {
    return -1;
  } else {
    return lavenshteinDistance(a, b);
  }
}
