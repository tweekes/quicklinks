function RollBackFileActionsMgr(http, errorPlaceHolder) {
    this.actions = [];
    this.errorPlaceHolder = errorPlaceHolder;
    this.http = http;

    // action ::=   UNDO_ADD  - user has cancelled so the file just added needs to be removed.
    //              COMMIT_DELETE - user has deleted one or more

    this.addRollBackAction = function(action,image, item) {
        var a  = {action:action,image:image,item:item, status:"PENDING"};
        this.actions.push(a);
    };

    this.processUndoAddForItem = function(item) {
        for (var i in this.actions) {
            var cur = this.actions[i];
            if (cur.action === "UNDO_ADD" && cur.item === item &&  cur.status !== "DONE") {
                deleteImageFile(this.http, this.errorPlaceHolder,cur.image.fileName);
                cur.status = "DONE";
            }
        }
    };

    this.processUndoAddsForRefSection = function() {
        for (var i in this.actions) {
            var cur = this.actions[i];
            if (cur.action === "UNDO_ADD" && cur.status !== "DONE") {
                deleteImageFile(this.http, this.errorPlaceHolder,cur.image.fileName);
                cur.status = "DONE";
            }
        }
    };

    this.processCommitDeletes = function() {
        for (var i in this.actions) {
            var cur = this.actions[i];
            if (cur.action === "COMMIT_DELETE" && cur.status !== "DONE") {
                deleteImageFile(this.http, this.errorPlaceHolder,cur.image.fileName);
                cur.status = "DONE";
            }
        }
    };
};

var deleteImageFile = function(http,errorPlaceHolder,fileName){
    http.delete('/local/deleteimage/' + fileName).
        then(function(response){
        },
        function(response){
            errorPlaceHolder = response.data;
        });
};
