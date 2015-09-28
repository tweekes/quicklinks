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
          var listFieldName = (this.clipboard.itemType === "ITEM_JUMP") ? "jumpItems" : "linkItems";

          var deleteIndex = -1;
          var item = this.clipboard.item;
          _.each(sourceSection[listFieldName],function(e,index) {
              if( _.isEqual(e.title,item.title) &&
                  _.isEqual(e.link,item.link) &&
                  _.isEqual(e.note,item.note)) {
                  deleteIndex = index;
              }
          });

          if (deleteIndex === -1) {
            throw "ERROR: pasteCommit - source item not found for delete!"
          }
          sourceSection[listFieldName].splice(deleteIndex,1);
          sourceSection.$save(function(section, responseHeaders){
              console.log("promise returned for $save in clipboard.");
              this.clipboard = null;
          });
      }
    }

    this.pasteRollback = function() {
        if(this.clipboard !== null && this.clipboard.pasted) {
            this.clipboard.pasted = false;
            this.clipboard.targetSection = null;
        }
    }

    this.status = function() {
        return this.clipboard;
    }
});
