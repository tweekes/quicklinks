function MilestonesMgr() {
  this.refsection;
  this.milestones;
  this.baseline;

  this.init = function(refsection) {
    this.refsection = refsection;
    if (this.refsection.hasOwnProperty("milestones")) {
      this.milestones = cloneObject(this.refsection.milestones);
    } else {
      this.instantiate();
    }
    this.baseline = cloneObject(this.milestones);
  };

  this.save = function() {
    this.baseline = cloneObject(this.milestones);
    this.refsection.milestones = cloneObject(this.milestones);
  };

  this.delete = function() {
    delete this.refsection.milestones;
  };

  this.clear = function() {
    this.instantiate();
  };

  this.instantiate = function() {
    this.milestones = [];
    // Status can be: "reqd", "not-required" or "done".
    this.milestones.push({title:"Start", date:null,status:"reqd"});
    this.milestones.push({title:"TDGRB", date:null,status:"reqd"});
    this.milestones.push({title:"TRIAGE", date:null,status:"reqd"});
    this.milestones.push({title:"ALC", date:null,status:"reqd"});
    this.milestones.push({title:"ETRB", date:null,status:"reqd"});
    this.milestones.push({title:"Release", date:null,status:"reqd"});
  };

  this.isDirty = function() {
    return(!angular.equals(this.baseline,this.milestones));
  }
}
