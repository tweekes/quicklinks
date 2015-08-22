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
    this.milestones.push({title:"Start", date:null,done:false});
    this.milestones.push({title:"TDGRB", date:null,done:false});
    this.milestones.push({title:"TRIAGE", date:null,done:false});
    this.milestones.push({title:"ALC", date:null,done:false});
    this.milestones.push({title:"ETRB", date:null,done:false});
    this.milestones.push({title:"Release", date:null,done:false});
  };

  /*
   this.clone = function(source) {
   var o = JSON.parse(JSON.stringify(source));
   for (var i in o) {
   if (o[i].hasOwnProperty("date") && _.isString(o[i].date)) {
   o[i].date = new Date(o[i].date);
   }
   }
   return o;
   };

   this.instantiate = function() {
   this.milestones = {};
   this.milestones.start = {date:null,done:false};
   this.milestones.tdgrb = {date:null,done:false};
   this.milestones.triage = {date:null,done:false};
   this.milestones.alc = {date:null,done:false};
   this.milestones.etrb = {date:null,done:false};
   this.milestones.release = {date:null,done:false};
   };

   */



}
