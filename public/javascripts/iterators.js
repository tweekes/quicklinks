function Iterators(d) {
    this.data = d;
    this.xdata =
            [
                {"dtype":"ref-section","sectionType":"Horz","sectionOrder":3,"createDate":"2015-08-06T19:20:20.242Z","key":"topAdmin","title":"Top Admin","comment":"This is top level general purpose menu.","_id":"5Oqhjgnwf2oeLqUC"},
                {"dtype":"ref-section","sectionType":"Horz","sectionOrder":1,"createDate":"2015-08-09T19:20:20.242Z","title":"EPay","key":"epay","comment":"Project EPay","_id":"GSf5MyTFL95Gmo7j"},
                {"dtype":"ref-section","sectionType":"Vert","sectionOrder":5,"createDate":"2015-08-10T13:42:55.498Z","title":"Prod Support","key":"prodSupport","comment":"Relevant links and pages from the production support team","_id":"KGlfEXqtzocrZ5TL"},
                {"dtype":"ref-section","sectionType":"Vert","sectionOrder":1,"createDate":"2015-08-04T20:02:45.780Z","title":"My First","key":"myFirst","comment":"This is first throigh the editor.","_id":"MZbNxcfUVeVXfcmp"},
                {"dtype":"ref-section","sectionType":"Horz","createDate":"2015-08-03T20:02:45.780Z","key":"topArchitecture","title":"Top Architecture","comment":"This is the top, non project specific, application architecture menu.","_id":"NrUciN7aegnGl7QJ"},
                {"dtype":"ref-section","sectionType":"Vert","sectionOrder":2,"createDate":"2015-08-11T20:02:45.780Z","key":"partnerSites","title":"Partner Sites","comment":"Menu to hold partner sites.","_id":"VxGPemrKAnmqD8pr"},
                {"dtype":"ref-section","sectionType":"Vert","sectionOrder":4,"createDate":"2015-08-02T20:02:45.780Z","key":"topGoals","title":"Top Goals","comment":"A section containing the top goals.","_id":"X3wzD3gMz4K7mZPZ"},
                {"dtype":"ref-section","sectionType":"Horz","createDate":"2015-08-01T20:02:45.780Z","key":"consoles","title":"Developer Consoles","comment":"Menu for development consoles like, weblogic, websphere, etc","_id":"jhMreVZytC8nf5ea"},
                {"dtype":"ref-section","sectionType":"Vert","createDate":"2015-08-03T12:20:54.334Z","title":"Development Wiki","key":"developmentWiki","comment":"References into the Development Wiki","_id":"mKLYdpQAISoK1Awh"},
                {"dtype":"ref-section","sectionType":"Vert","sectionOrder":3,"createDate":"2015-06-04T20:02:45.780Z","key":"topAdmin","title":"Top Admin","comment":"This is top level general purpose menu.","_id":"5Oqhjgnwf2oeLqUC"}
            ];

    this.compare = function(x,y) {
        if(x.hasOwnProperty("sectionOrder") && y.hasOwnProperty("sectionOrder")) {
            if (x.sectionOrder === y.sectionOrder) {
                return x.createDate.localeCompare(y.createDate)
            } else {
                return x.sectionOrder - y.sectionOrder;
            }
        } else {
            if (x.hasOwnProperty("sectionOrder")) {
                return -1;
            }
            if (y.hasOwnProperty("sectionOrder")) {
                return 1;
            }
            return x.createDate.localeCompare(y.createDate)
        }
        // For reference:  "B".localeCompare("A")  returns: 1  "A".localeCompare("B") returns -1
    };

    this.compareA = function(x,y) {
      var rr;
      if (x.sectionType !== y.sectionType) {
          if (x.sectionType === "Horz") {
              rr = -1;
          } else {
              rr = 1;
          }
      } else {
          if(x.hasOwnProperty("sectionOrder") && y.hasOwnProperty("sectionOrder")) {
              if (x.sectionOrder === y.sectionOrder) {
                  rr =  x.createDate.localeCompare(y.createDate);
              } else {
                  rr =  x.sectionOrder - y.sectionOrder;
              }
          } else {
              if (x.hasOwnProperty("sectionOrder")) {
                  rr = -1;
              } else if (y.hasOwnProperty("sectionOrder")) {
                  rr = 1;
              } else {
                  rr = x.createDate.localeCompare(y.createDate);
              }
          }
      }
      return rr;
    };

    this.sectionsAll = function() {
      return this.data.sort(this.compareA);
    }

    this.sectionsHorizontal = function() {
        return this.data.filter(function (e) {
            return e.sectionType === "Horz";
        }).sort(this.compare);
    };

    this.sectionsVertical = function() {
        return this.data.filter(function (e) {
            return e.sectionType === "Vert";
        }).sort(this.compare);
    };

    // refSection ::= the refSection to have the sequence applied.
    this.resetOrderSequence = function(refSection) {

        var r = this.data.filter(function (e) {
            return e.sectionType === refSection.sectionType && e.hasOwnProperty("sectionOrder");
        }).sort(this.compare);

        var l = r.length;
        for (var k = 0; k < l; k++) {
            var current = r[k];
            var next = null;
            if (k+1 < l-1) {
                next = r[k + 1];
            }

            if (next && current.sectionOrder === next.sectionOrder && next === refSection) {
                next.sectionOrder = k+1;
                current.sectionOrder = k + 2;
            } else {
                current.sectionOrder = k+1;
            }
        }

        return r.sort(this.compare);
    };

    this.display = function(a) {
        for (var i in a) {
            console.log(a[i].key + " " + a[i].sectionType + " " + a[i].createDate + " " + a[i].sectionOrder);
        }
    };
}
