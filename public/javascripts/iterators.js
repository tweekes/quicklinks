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

    // mode ::= "UPDATE" or "DELETE"
    // refSectionChangeTarget ::= the refSection to have the sequence applied.
    this.resetOrderSequence = function(mode, refSectionChangeTarget) {

        if (mode === "DELETE") {
            for (var j = 0; j < this.data.length; j++) {
                if (this.data[j] === refSectionChangeTarget) {
                    delete this.data[j];
                    break;
                }
            }
        }

        var r = this.data.filter(function (e) {
            return e.sectionType === refSectionChangeTarget.sectionType && e.hasOwnProperty("sectionOrder");
        }).sort(this.compare);

        var changedList = [];
        var previous = null;
        for (var i = 0; i< r.length; i++) {
            var order = i + 1;
            if(r[i] === refSectionChangeTarget && r[i].sectionOrder !== order) {
                // The change target get's priority and keeps the assigned order.
                if (previous) {
                    previous.sectionOrder = order;
                    changedList.push(previous);
                } else {
                    // Has to be the first.
                    throw "Order Sequence Not Consistent."
                }
            } else if (r[i].sectionOrder !== order) {
                r[i].sectionOrder = order;
                changedList.push(r[i]);
            }

            if(r[i] === refSectionChangeTarget) {
                changedList.push(r[i]);
            }
            previous = r[i];
        }
      return changedList;
    };

    this.display = function(a) {
        for (var i in a) {
            console.log(a[i].key + " " + a[i].sectionType + " " + a[i].createDate + " " + a[i].sectionOrder);
        }
    };
}
