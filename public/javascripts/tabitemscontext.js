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
		scope.activeLinkItemDetailsTab='NOTE';
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
			this.selectedItem = cloneObject(newItem);
			this.baseline = cloneObject(newItem);
			scope.activeLinkItemDetailsTab='NOTE';
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

	// If due date is edited and the startBy is stil 2050 date then apply a default.
	this.defaultToDoStartByDate = function() {
		if (this.selectedItem.hasTodo) {
			if (moment(this.selectedItem.todoInfo.startBy).isSame(appGlobals.never)) {
				var due = moment(this.selectedItem.todoInfo.due);
				var startBy = due.subtract(appGlobals.startByBeforeDue, 'days');
				var now = moment();
				if (now.isAfter(startBy)) {
					startBy = now;
				}
				this.selectedItem.todoInfo.startBy = startBy.toDate();
			}
		}
	};

	this.checkTodoDates = function() {
		result = null;
		if (this.selectedItem.hasTodo) {
			var startBy = moment(this.selectedItem.todoInfo.startBy);
			var due = moment(this.selectedItem.todoInfo.due);
			if (startBy.isAfter(due)) {
				result = "ERROR: Todo startby date must be the same or before the due date."
			}
		}
		return result;
	};


	// items can be $scope.currentRefSection.jumpItems or $scope.currentRefSection.linkItems.
	this.itemAddOrSave = function() {
		this.defaultToDoStartByDate();
		var msg;
		if ((msg = this.checkTodoDates()) != null) {
			bootbox.alert({
				size: 'small',
				message: msg,
				callback: function () {
				}
			});
		} else {
			var updateIndex;
			if (this.verb === "Add") {
				updateIndex = this.itemList.length;
			} else {
				updateIndex = this.selectedRow;
			}
			this.itemList[updateIndex] = this.selectedItem;
			reorderItems(this.itemList, this.itemList[updateIndex]);
			this.reset();
		}
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
		reorderItems(this.itemList);

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

	this.itemHasTodoStatusChanged = function(hasTodoStatus) {
		var baseTodoInfo = {done:false, startBy:appGlobals.never,
																		due:appGlobals.never,
																		created:new Date(),
																	  completed:null};

		if (hasTodoStatus === true) {
			this.selectedItem.hasTodo = true,
			this.selectedItem.todoInfo = baseTodoInfo;
			scope.activeLinkItemDetailsTab='TODO';
		} else {
			this.selectedItem.hasTodo = false;
			delete this.selectedItem.todoInfo;
		}
	}

	this.todoStatusChanged = function() {
		if (this.selectedItem.todoInfo.done === true) {
				reorderLinkItemsOnTodoStatusUpdate(this.section,this.selectedRow);
		}
		applyTodoCompletedDate(this.selectedItem);
	}

	this.itemList = itemList.sort(compareItemByOrder);
	this.verb = "Add"; // can be Add or Edit
	this.selectedItem = {}; // title, link, note, images, order
	this.reset();
	this.selectedRow = -1;
	this.pasteAvailable = this.pasteAllowed();
}


function compareItemByOrder(a,b) {
	return a.order - b.order;
};

function reorderItems(itemList,updateTarget) {
	itemList.sort(compareItemByOrder);
	var previous = null;
	var next = null;
	var skip = false;
	for(var i = 0; i < itemList.length ; i++) {
		next = itemList[i+1];
		var order = i+1;
		if(skip) {
			skip =false;
			continue;
		} else if (itemList[i] === updateTarget &&
			previous &&
			itemList[i].order !== order &&
			itemList[i].order === previous.order) {
			previous.order = order;
		} else if(itemList[i] === updateTarget &&
			next &&
			itemList[i].order !== order &&
			itemList[i].order === next.order) {
			next.order = order;
			skip = true;
		} else {
			itemList[i].order = order;
		}
		previous = itemList[i];
	}
	itemList.sort(compareItemByOrder);
};

function applyTodoCompletedDate(item) {
	if (item.todoInfo.done) {
		item.todoInfo.completed = new Date();
	} else {
		item.todoInfo.completed = null;
	}
}
