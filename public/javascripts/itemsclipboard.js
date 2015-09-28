angular.module('app').service('ItemClipboard', function() {
    this.clipboard = null;
    // {sourceSection, itemType, item, targetSection, pasted}

    this.cut = function(itemDetails) {
        this.clipboard = itemDetails;
        this.clipboard.pasted = false;
    }

    this.paste = function(targetSection) {
        if (this.clipboard !== null && this.clipboard.pasted === false) {
          this.clipboard.pasted = true;
          this.clipboard.targetSection = targetSection; // use this later
          return this.clipboard;
        } else {
          return null;
        }
    }

    // Intent of commit is to remove the cut item from the source section.
    this.pasteCommit = function(currentSection) {
      if(this.clipboard !== null && this.clipboard.pasted) {
          if (currentSection._id !== this.clipboard.targetSection._id) {
            throw "ERROR: pasteCommit - current and target sections are not the same!"
          }
          var sourceSection = this.clipboard.sourceSection;
          var listFieldName = (this.clipboad.itemType === "ITEM_JUMP") ? "jumpItems" : "linkItems";
          var deleteIndex = _.indexOf(sourceSection[listFieldName],this.clipboad.item);
          if (deleteIndex === -1) {
            throw "ERROR: pasteCommit - source item not found for delete!"
          }
          sourceSection[listFieldName].splice(deleteIndex,1);
          sourceSection.$save(function(response){
              this.clipboard = null;
          },
          function(err) {

          });
      }
    }

    this.pasteRollback = function(currentSection) {


    }

    this.status = function() {
        return this.clipboard;
    }
});
