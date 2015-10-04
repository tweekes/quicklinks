angular.module('app').service('DataMigrationMgr', function(RefDA) {
    this.appliedMigrations = null;
    this.applyTodoField = null;


    var log = function(s) {
        console.log("DATA MIGRATION - " + s);
    }

    this.availableMigrations =
        [
            {name:"TodoField",sequence:0,method:this.applyTodoField,description:"Adds field todo to ref-section linkItems"}
        ];

    this.getAppliedMigrations = function(callback) {
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

    this.getRefSections = function(callback) {
        var select = {select:{ dtype: "ref-section"}};
        RefDA.query(select,function(r){
            callback(r);
        });
    }

    this.getNextMigration = function(migrationHist) {
        for (var i in this.availableMigrations) {
            var current = this.availableMigrations[i];
            var match = _.find(migrationHist,function(mh) {
                return mh.sequence === current.sequence;
            })
            if (match === undefined) {
                return current;
            }
        }
        return null;
    }

    this.applyTodoField = function( ) {
        log("In migration function");
    }

    this.applyNextMigration = function() {

        this.getAppliedMigrations(function(migratioHist){
            log("Migration Read");
            var migration = this.getNextMigration(migrationHist);

            if (migration === null) {
                log("No pending migrations");
            } else {
                log("Starting migraton of " + migration.name);
                migration.method();
            }
        });
    }


});


