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

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];
    return domain;
}


// See: http://aboutcode.net/2013/07/27/json-date-parsing-angularjs.html  - Good approach works by regex for date string format.
var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
function convertDateStringsToDates(input) {
	// Ignore things that aren't objects.
	if (typeof input !== "object") return input;

	for (var key in input) {
		if (!input.hasOwnProperty(key)) continue;

		var value = input[key];
		var match;
		// Check for string properties which look like dates.
		if (typeof value === "string" && (match = value.match(regexIso8601))) {
			// console.log("field: " + key + " is a date")
			var milliseconds = Date.parse(match[0])
			if (!isNaN(milliseconds)) {
				input[key] = new Date(milliseconds);
			}
		} else if (typeof value === "object") {
			// Recurse into object
			convertDateStringsToDates(value);
		}
	}
}

function cloneObject(o) {
	var clone = JSON.parse(JSON.stringify(o));
	convertDateStringsToDates(clone);
	return clone;
}
