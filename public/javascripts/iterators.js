function Iterators(d,showArchivedRefSections) {
    this.data = d;
    this.showArchivedRefSections = showArchivedRefSections;
    this.compare = function(x,y) {
        if(x.hasOwnProperty("sectionOrder") && y.hasOwnProperty("sectionOrder")) {
            if (x.sectionOrder === y.sectionOrder) {
                return y.createDate.getTime() - x.createDate.getTime();
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
            return y.createDate.getTime() - x.createDate.getTime();
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
                  rr =  y.createDate.getTime() - x.createDate.getTime();
              } else {
                  rr =  x.sectionOrder - y.sectionOrder;
              }
          } else {
              if (x.hasOwnProperty("sectionOrder")) {
                  rr = -1;
              } else if (y.hasOwnProperty("sectionOrder")) {
                  rr = 1;
              } else {
                  rr =  y.createDate.getTime() - x.createDate.getTime();
              }
          }
      }
      return rr;
    };

    this.sectionsAll = function() {
      return this.data.sort(this.compareA);
    };



    // showArchivedRSections - determines if archived ref sections should be
    // presented on the mainscreen. The follow is table of logic:
    //  showArchivedRefSections  e.archiveIndictor    show
    //  false							        false	       			   yes
    //  true							        false				         yes
    //  false							        true				         no
    //  true							        true				         yes
    function showArchivedRSections(showArchivedRefSections,e) {
      var archiveIndicator = false;

      if (e.hasOwnProperty("archiveIndictor")) {
          archiveIndicator = e.archiveIndictor;
      }

      return (archiveIndicator === false ||
             (archiveIndicator === true && showArchivedRefSections === true));
    }

    this.sectionsHorizontal = function() {
        var showArchivedRefSections = this.showArchivedRefSections;
        return this.data.filter(function (e) {
            return e.sectionType === "Horz" &&
                   showArchivedRSections(showArchivedRefSections,e);
        }).sort(this.compare);
    };

    this.sectionsVertical = function() {
        var showArchivedRefSections = this.showArchivedRefSections;
        return this.data.filter(function (e) {
            return e.sectionType === "Vert" &&
                   showArchivedRSections(showArchivedRefSections,e);
        }).sort(this.compare);
    };

    // mode ::= "UPDATE" or "DELETE"
    // refSectionChangeTarget ::= the refSection to have the sequence applied.
    this.resetOrderSequence = function(mode, refSectionChangeTarget) {
        if (mode === "DELETE") {
            for (var j = 0; j < this.data.length; j++) {
                  if (this.data[j]._id === refSectionChangeTarget._id) {
                    delete this.data[j];
                    break;
                }
            }
        }

        var r = this.data.filter(function (e) {
            return e.sectionType === refSectionChangeTarget.sectionType && e.hasOwnProperty("sectionOrder");
        });

        var changedList = [];
        if (mode === "DELETE") {
            _.each(r,function (e,i) {
                var order = i + 1;
                if (e.sectionOrder !== order) {
                    e.sectionOrder = order;
                    changedList.push(e);
                }
            });
        } else {
            var index = _.indexOf(r,refSectionChangeTarget);
            var existingElemOrder = index + 1;
            // newOrder is the new position, it has to be within the bounds of the data array
            var newOrder = (refSectionChangeTarget.sectionOrder <= r.length) ? refSectionChangeTarget.sectionOrder : r.length;
            var moveIntent = refSectionChangeTarget.sectionOrder - existingElemOrder; // 0 ::= no move, < 0 ::= promotion,  > 0 ::= demotion

            var changedList = [];
            if (moveIntent < 0 || moveIntent > 0) {
                var k = 0;
                _(r.length).times(function (n) {
                    var order = n + 1;
                    if (order === newOrder) {
                        refSectionChangeTarget.sectionOrder = newOrder;
                        changedList.push(refSectionChangeTarget);
                    } else {
                        if (k === index)
                            k++;
                        var e = r[k++];
                        if (e.sectionOrder !== order) {
                            e.sectionOrder = order;
                            changedList.push(e);
                        }
                    }
                });
            } else {
                changedList.push(refSectionChangeTarget);
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
