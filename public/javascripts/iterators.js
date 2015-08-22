function Iterators(d) {
    this.data = d;


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
    };

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

        var changedList = [];
        var l = r.length;
        var order = 1;
        var last  = r[l-1];
        if (refSection === last ) {
            // If last one is updated then update the order on all the elements.
            for (var k in r) {
                r[k].sectionOrder = order++;
                changedList.push(r[k]);
            }
            console.log("refSection === last so total reorder");
        } else {
            for (var k = 0; k < l; k++) {
                var current = r[k];
                var previous = null;
                if (k - 1 >= 0) {
                    previous = r[k - 1];
                }
                var next = null;
                if (k + 1 < l - 1) {
                    next = r[k + 1];
                }

                if (current === refSection) {
                    if (previous && current.sectionOrder === previous.sectionOrder) {
                        previous.sectionOrder = order++;
                        changedList.push(previous);
                    } else if (next && current.sectionOrder === next.sectionOrder) {
                        next.sectionOrder = order++;
                        changedList.push(next);
                    } else {
                        // Nothing to do.
                    }
                } else {
                    order++;
                }
            }
        }
        return changedList;
    };

    this.display = function(a) {
        for (var i in a) {
            console.log(a[i].key + " " + a[i].sectionType + " " + a[i].createDate + " " + a[i].sectionOrder);
        }
    };
}
