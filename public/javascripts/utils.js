var sentence = function(start, subjects, end) {
	var sentence = start;
	function last(length,current) { return (current === length -1) };
	function prev(length,current) { return (current > 0) };

	var len =  subjects.length;
	for ( var i = 0; i < len; i < i++ ) {
		if (last(len,i) && prev(len,i)) {
			sentence += " and " +  subjects[i];
		} else if (prev(len,i)) {
			sentence += ", " +  subjects[i];
		} else {
			sentence += " " + subjects[i];
		}
	}
	return sentence + " " + end;
}
