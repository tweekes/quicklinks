function MilestonesMgr() {
  this.refsection;
  this.milestones;

  this.init = function(refsection) {
    this.refsection = refsection;
    if (this.refsection.hasOwnProperty("milestones")) {
      this.milestones = this.clone(this.refsection.milestones);
    } else {
      this.instantiate();
    }
  };

  this.save = function() {
    this.refsection.milestones = this.clone(this.milestones);
  };

  this.delete = function() {
    delete this.refsection.milestones;
  };

  this.clear = function() {
    this.instantiate();
  }

  this.clone = function(source) {
     return JSON.parse(JSON.stringify(source));
  };

  this.instantiate = function() {
    this.milestone = {};
    this.milestone.start = {date:null,done:false};
    this.milestone.tdgrb = {date:null,done:false};
    this.milestone.triage = {date:null,done:false};
    this.milestone.alc = {date:null,done:false};
    this.milestone.etrb = {date:null,done:false};
    this.milestone.release = {date:null,done:false};
  }
}
