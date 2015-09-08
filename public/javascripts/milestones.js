function MilestonesMgr() {
  this.refsection;
  this.milestones;

  this.init = function(refsection) {
    this.refsection = refsection;
    if (this.refsection.hasOwnProperty("milestones")) {
      this.milestones = this.clone(this.refsection.milestones);
    } else {
      this.instantiate2();
    }
  };

  this.save = function() {
    this.refsection.milestones = this.clone(this.milestones);
  };

  this.delete = function() {
    delete this.refsection.milestones;
  };

  this.clear = function() {
    this.instantiate2();
  };

  this.clone = function(source) {
      var o = JSON.parse(JSON.stringify(source));
    for (var i in o) {
      if (o[i].hasOwnProperty("date") && _.isString(o[i].date)) {
        o[i].date = new Date(o[i].date);
      }
    }
    return o;
  };

  this.instantiate2 = function() {
    this.milestones = [];
    // Status can be: "reqd", "not-required" or "done".
    this.milestones.push({title:"Start", date:null,status:"reqd"});
    this.milestones.push({title:"TDGRB", date:null,status:"reqd"});
    this.milestones.push({title:"TRIAGE", date:null,status:"reqd"});
    this.milestones.push({title:"ALC", date:null,status:"reqd"});
    this.milestones.push({title:"ETRB", date:null,status:"reqd"});
    this.milestones.push({title:"Release", date:null,status:"reqd"});
  };

}
