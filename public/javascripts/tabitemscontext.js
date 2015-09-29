function TabItemsContext(scope,section,itemType,itemList,itemClipboard,fileActionRollbackMgr) {
	this.fileActionRollbackMgr = fileActionRollbackMgr;
	this.baseline = {};
	this.section = section;
	this.itemType = itemType; // ITEM_JUMP or ITEM_LINK
	this.itemClipboard = itemClipboard;
	this.itemSelections;

	this.reset = function() {
		this.itemSelections = _(itemList.length).times(function(){return false});
		this.verb = "Add";
		this.selectedItem = {};
		this.baseline = {};
		this.selectedRow = -1;
	};

	this.itemCancel = function() {
		if (this.fileActionRollbackMgr) {
			this.fileActionRollbackMgr.processUndoAddForItem(this.selectedItem);
		}
		this.reset();
	};

	this.changeSelectedItem = function(rowIndex,newItem) {
		if(this.selectedRow !== rowIndex) {
			this.selectedRow = rowIndex;
			this.selectedItem = JSON.parse(JSON.stringify(newItem));
			this.baseline = JSON.parse(JSON.stringify(newItem));
			this.verb = "Save";
		} else {
			// User has selected the checkbox that is already selected - therefore deselecting.
			// result: there is no current selection.
			this.reset();
		}
	}


	this.selectItem = function(rowIndex,newItem) {
		// Check if changes have been made.
		var that = this;
		this.itemSelections = _.invoke(this.itemSelections, function() {return false})
		if (!_.isEmpty(this.baseline) && this.isDirty()) {
			bootbox.confirm({
					size: 'small',
					message: "Current item has edits, do you which to proceed without saving? ",
					callback: function(confirmed){
						scope.$apply(function() {
							if (confirmed) {
								that.changeSelectedItem(rowIndex,newItem);
							}
							that.itemSelections[that.selectedRow] = true;
						});
					}
			});
		} else {
			this.changeSelectedItem(rowIndex,newItem);
			this.itemSelections[this.selectedRow] = true;
		}
	};

	this.isDirty = function() {
		return(!angular.equals(this.baseline,this.selectedItem));
	};

	this.compare = function(a,b) {
		return a.order - b.order;
	};

	this.reorder = function(updateTarget) {
		this.itemList.sort(this.compare);
		var previous = null;
    	var next = null;
		var skip = false;
		for(var i = 0; i < this.itemList.length ; i++) {
			next = this.itemList[i+1];
			var order = i+1;
			if(skip) {
        		skip =false;
        		continue;
      		} else if (this.itemList[i] === updateTarget &&
         		previous &&
         		this.itemList[i].order !== order &&
         		this.itemList[i].order === previous.order) {
				previous.order = order;
      		} else if(this.itemList[i] === updateTarget &&
                 next &&
                 this.itemList[i].order !== order &&
                 this.itemList[i].order === next.order) {
        		 next.order = order;
        		 skip = true;
      		} else {
				this.itemList[i].order = order;
			}
			previous = this.itemList[i];
		}
    	this.itemList.sort(this.compare);
	};

	// items can be $scope.currentRefSection.jumpItems or $scope.currentRefSection.linkItems.
	this.itemAddOrSave = function() {
		var updateIndex;
		if (this.verb === "Add") {
			updateIndex = this.itemList.length;
		} else {
			updateIndex = this.selectedRow;
		}
		this.itemList[updateIndex] = this.selectedItem;
		this.reorder(this.itemList[updateIndex]);
		this.reset();
	};

	// items can be $scope.currentRefSection.jumpItems or $scope.currentRefSection.linkItems.
	this.itemDelete = function() {
		if (this.selectedRow !== -1) { // Only attempt delete if a row is selected.
			// If images are attached to the item then queue those for file delete.
			if (this.fileActionRollbackMgr && this.selectedItem.images) {
					for (var i in this.selectedItem.images) {
						var cur = this.selectedItem.images[i];
						this.fileActionRollbackMgr.addRollBackAction("COMMIT_DELETE",cur, this.selectedItem);
					}
			}

			this.itemList.splice(this.selectedRow, 1);
			this.reset();
		}
	};

	this.pasteAllowed = function() {
		var clipboard = this.itemClipboard.clipboard;
		return (clipboard !== null && !clipboard.pasted &&
		        clipboard.sourceSection._id !== this.section._id);
	};

	this.itemPaste = function() {
		// Step 1 - add to current section
		var target;
		if (this.itemType == "ITEM_JUMP") {
			target = this.section.jumpItems;
		} else {
			target = this.section.linkItems;
		}
		// Array.unshift(puts e at pos 1.
		// maybe i need to clone.
		target.unshift(itemClipboard.clipboard.item);
		this.reorder()

		// Step 2 - Update the clipboard.
		this.itemClipboard.paste(this.section);
		this.pasteAvailable = this.pasteAllowed();


		// Step 3 - pasteCommit will be invoked by section.save().

	};

	this.itemCut = function() {
		this.itemClipboard.cut(
			{
				sourceSection:this.section,
				itemType:this.itemType,
				item: this.selectedItem
			}
		);
		this.pasteAvailable = this.pasteAllowed();
	};


	this.itemList = itemList.sort(this.compare);
	this.verb = "Add"; // can be Add or Edit
	this.selectedItem = {}; // title, link, note, images, order
	this.reset();
	this.selectedRow = -1;
	this.pasteAvailable = this.pasteAllowed();
}
