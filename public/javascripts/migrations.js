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
            var match = _.find(migrationHist.migrations,function(m) {
                return m.sequence === current.sequence;
            })
            if (match === undefined) {
                return current;
            }
        }
        return null;
    }

    function applyDeleteTitleDisplayField(callback) {
        function deleteTitleDisplayField(item) {
            if (item.hasOwnProperty("titleDisplay")) {
                delete item.titleDisplay
            }
        }

        log("Start: applyDeleteTitleDisplayField()");
        var count = 0;
        getRefSections(function(sections){
            _.each(sections,function(section){
                if (section.linkItems !== undefined && section.linkItems.length > 0) {
                    _.each(section.linkItems,function(item){
                        deleteTitleDisplayField(item);
                        count++;
                    });
                    _.each(section.jumpItems,function(item){
                        deleteTitleDisplayField(item);
                        count++;
                    });
                    var clonedSection = cloneObject(section);
                    delete clonedSection._id;
                    section.$delete(function (response) {
                            clonedSection.$save();
                        },
                        function (response) {
                            throw "Failed to delete!";
                        }
                    );
                }
            });
            log("End: applyDeleteTitleDisplayField() " + count + " records updated!" );
            callback(true);
        });
    }

    var availableMigrations =
        [
            {name:"DeleteTitleDisplayField",sequence:0,method:applyDeleteTitleDisplayField,description:"Remove section / item.titleDisplay Field on it"}
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
                migration.method(function(){
                    log(migration.name + " completed successfully");
                    var now = new Date();
                    migrationHist.migrations.push(
                        {
                            name:migration.name,
                            sequence:migration.sequence,
                            description:migration.description,
                            completed:now,
                        }
                    );
                    migrationHist.updated = now;
                    migrationHist.$save();
               });
            }
        });
    }

});


