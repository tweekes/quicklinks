angular.module('app').service('DataMigrationMgr', function(RefDA) {
    this.appliedMigrations = null;
    // this.applyTodoField = null;

    function log (s) {
        console.log("DATA MIGRATION - " + s);
    }

    function getAppliedMigrations(callback) {
        var select = {select:{ dtype: "migration-history"}};
        var migrationHistory;
        RefDA.query(select,function(r){
            if (r && r.length > 0) {
                migrationHistory = r[0];
            } else {
                migrationHistory = new RefDA;
                migrationHistory.dtype = "migration-history";
                migrationHistory.created = Date();
                migrationHistory.updated = Date();
                migrationHistory.migrations = [];
            }

            migrationHistory.migrations =
                migrationHistory.migrations.sort(function(a,b) {return a.sequence - b.sequence});
            callback(migrationHistory);
        });
    }

    function getRefSections (callback) {
        var select = {select:{ dtype: "ref-section"}};
        RefDA.query(select,function(r){
            callback(r);
        });
    }

    function getNextMigration(migrationHist,availableMigrations ) {
        for (var i in availableMigrations) {
            var current = availableMigrations[i];
            var match = _.find(migrationHist,function(mh) {
                return mh.sequence === current.sequence;
            })
            if (match === undefined) {
                return current;
            }
        }
        return null;
    }

    function applyTodoField() {
        log("Start: applyTodoField()");
        var count = 0;
        getRefSections(function(sections){
            _.each(sections,function(section){
                if (section.linkItems !== undefined && section.linkItems.length > 0) {
                    _.each(section.linkItems,function(item){
                        item.todo = false;
                        count++;
                        log("processing " + item.title + " count " + count);
                    });
                    section.$save();
                }
            });
            log("End: applyTodoField() " + count + " records updated!" );
        });

    }

    var availableMigrations =
        [
            {name:"TodoField",sequence:0,method:applyTodoField,description:"Adds field todo to ref-section linkItems"}
        ];

    this.applyNextMigration = function() {
        // var availableMigrations = this.availableMigrations;
        getAppliedMigrations(function(migrationHist){
            log("Migration Read");
            var migration = getNextMigration(migrationHist,availableMigrations);

            if (migration === null) {
                log("No pending migrations");
            } else {
                log("Starting migraton of " + migration.name);
                migration.method();
            }
        });
    }

});


