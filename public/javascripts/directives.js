angular.module('app')
    .directive('section', ['modals','$location', function (modals,$location) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'sdata':'=',
                'edit':'=',
                'noteEdit':'=',
                'titleWithNoteIndicator':'='
            },
            templateUrl: 'views-ng/section.html',
            link: function postLink(scope, element, attrs) {
              scope.handleClickOnRef=function(event,item,itemIndex) {
                  dispatchClickRequest(event,item,modals,$location,scope.edit,scope.noteEdit,scope.sdata,"ITEM_JUMP",itemIndex);
              }
            }
        }
    }]);

angular.module('app')
    .directive('sectionv', ['modals','$location', function (modals,$location) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'sdata':'=',
                'edit':'=',
                'noteEdit':'=',
                'drophandler':'=',
                'fold':'=',
                'titleWithNoteIndicator':'='
            },
            templateUrl: 'views-ng/sectionv.html',
            link: function postLink(scope, element, attrs) {
                scope.uuid = _.uniqueId('SECTV_');
                scope.limit = scope.fold;
                scope.moreOrLess = "more...";
                scope.linkItemsLimit = scope.limit;
                scope.uniqueID = null; // Needed for applying ID to input+label/for html tags.

                scope.getRefSectionKey = function() {
                  return scope.sdata.key;
                }

                scope.dropHandlerCbImpl = function(refSectionKeyDragged) {
                  scope.drophandler(scope.getRefSectionKey(), refSectionKeyDragged);
                }

                var el = element[0]; // Extract the native JS object.
                attachDraggableEventHandling(scope,el,"DRAG_DROP_REFSECTION",scope.getRefSectionKey);
                attachDroppableEventHandling(scope,el,"DRAG_DROP_REFSECTION",scope.dropHandlerCbImpl);

                scope.handleClickOnRef=function(event,item,itemIndex,itemType) {
                    dispatchClickRequest(event,item,modals,$location,scope.edit,scope.noteEdit,scope.sdata,itemType,itemIndex);
                };

                scope.toggleDisplayLimit = function() {
                    if (scope.linkItemsLimit === undefined) {
                        scope.linkItemsLimit = scope.limit;
                        scope.moreOrLess = "more...";
                    } else {
                        scope.linkItemsLimit = undefined;
                        scope.moreOrLess = "...less";
                    }
                }

                scope.addListItem = function() {
                    scope.edit(scope.sdata.key,null,true);
                }

                scope.htmlId = function(idx) {
                  return "" + scope.uuid + "_" + idx;
                }

                scope.todoStatusChanged = function(itemTodoStatus,index) {
                  var section = scope.sdata;
                  applyTodoCompletedDate(section.linkItems[index]);
                  // Move the item down the list if it is completed.
                  if (itemTodoStatus === true) {
                      reorderLinkItemsOnTodoStatusUpdate(section, index)
                  }
                  section.$save();
                }

                scope.todoStyle = function(index) {
                    var style = "todoCB";
                    var item = scope.sdata.linkItems[index];
                    if(item.hasTodo !== undefined && !item.todoInfo.done) {
                        var timeInMs = Date.now();
                        var due = new Date(item.todoInfo.due);
                        var startBy = new Date(item.todoInfo.startBy);
                        if (due.getTime() < timeInMs) {
                            style = "todoCbRED";
                        } else if (startBy.getTime() < timeInMs) {
                            style = "todoCbORANGE"
                        }
                    }
                    return style;
                }
            }
        }
    }]);



angular.module('app')
    .directive('draganddrop', function() {
        return {
          scope: {
            'itemType':'=',  // can be LINK or JUMP
            'itemRef':'=',
            'sd':'=' // sdata
          },
          link: function(scope, element) {
              // again we need the native object
              var itemType = scope.itemType;
              var itemRef = scope.itemRef;
              var key = scope.sd.key;
              scope.getItemDetails = function() {
                return  itemType + "::" + key + "::" + itemRef;
              }

              var el = element[0];
              var situation = (itemType === "LINK") ? "DRAG_DROP_LINKITEM" : "DRAG_DROP_JUMPITEM"

              attachDraggableEventHandling(scope,el,situation,scope.getItemDetails);
              scope.dropHandlerCbImpl = function(sourceDetails) {
                var sarray,sourceType, sourceKey,sourceItemRef;
                sarray = sourceDetails.split("::");
                sourceType = sarray[0];
                sourceKey = sarray[1];
                sourceItemRef = parseInt(sarray[2]);

                // Ensure that the source and target are the same ref section, otherwise the corruption will occur.
                if (sourceKey !== scope.sd.key) {
                   console.log("ERROR: Item drag and drop - source and target are not the same reference section.");
                   clearDragDropClasses();
                } else if (sourceType !==scope.itemType) {
                   console.log("ERROR: Item drag and drop - source and target item-type (Jump / Link) are not the same.");
                   clearDragDropClasses();
                } else if (sourceItemRef === scope.itemRef ) { // Now check that the link itms are not the same - not a big deal but this validation for consistency.
                   console.log("ERROR: Item drag and drop - source and target link are the same.");
                   clearDragDropClasses();
                } else {
                    // All conditions checked so must be good.
                    var refSection = scope.sd, itemList;
                    if (scope.itemType === "LINK") {
                        itemList = refSection.linkItems;
                    } else { // Must be JUMP
                        itemList = refSection.jumpItems;
                    }

                    var tmp = itemList[scope.itemRef];
                    itemList[scope.itemRef] = itemList[sourceItemRef];
                    itemList[sourceItemRef] = tmp;
                    refSection.$save();
                }
              }
              attachDroppableEventHandling(scope,el,situation,scope.dropHandlerCbImpl);
          }
        }
});


angular.module('app')
    .directive('todos', ['modals','$location', function (modals,$location) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'todoList':'=',
                'edit':'=',
                'noteEdit':'=',
                'synchronize':'=',
                'showSectionTitle':'='
            },
            templateUrl: 'views-ng/todos.html',
            link: function postLink(scope, element, attrs) {
                scope.uuid = _.uniqueId('TODOS_');
                scope.uniqueID = null; // Needed for applying unique ID to input+label/for html tags.

                scope.handleClickOnRef=function(event,todo) {
                    var item = todo.section.linkItems[todo.linkItemIndex];
                    dispatchClickRequest(event,item,modals,$location,
                                         scope.edit,scope.noteEdit,todo.section,"ITEM_LINK",todo.linkItemIndex);
                };

                scope.htmlId = function(idx) {
                  return "" + scope.uuid + "_" + idx;
                }

                scope.todoStatusChanged = function(todo) {
                  // We need to resolve the selected todo back to the section / item.
                  var section = todo.section;
                  var item = section.linkItems[todo.linkItemIndex];
                  item.todoInfo.done = todo.done;
                  applyTodoCompletedDate(item);

                  // Move the item down the list if it is completed.
                  if (item.todoInfo.done === true) {
                      reorderLinkItemsOnTodoStatusUpdate(section, todo.linkItemIndex);
                  }

                  section.$save(function (response) {
                          scope.synchronize();
                      },
                      function (response) {
                          throw "Failed to save!"
                      }
                  );
                }

                scope.todoStyle = function(index) {
                    var style = "todoCB";
                    var todoItem = scope.todoList[index];

                    if(!todoItem.done) {
                        var timeInMs = Date.now();
                        if (todoItem.due.getTime() < timeInMs) {
                            style = "todoCbRED";
                        } else if (todoItem.startBy.getTime() < timeInMs) {
                            style = "todoCbORANGE"
                        }
                    }
                    return style;
                }
            }
        }
    }]);


angular.module('app')
    .directive('searchresult', ['modals','$location', function (modals,$location) {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'result':'=',
                'noteEdit':'=',
                'edit':'='
            },
            templateUrl: 'views-ng/searchresult.html',
            link: function postLink(scope, element, attrs) {
                scope.handleClickOnRef=function(event,item,section,itemIndex,itemType) {
                    dispatchClickRequest(event,item,modals,$location,scope.edit,scope.noteEdit,section,itemType,itemIndex);
                }
            }
        }
    }]);


var dispatchClickRequest = function(event,item,modals,location,sectionEditFn,itemNoteEditFn,section,itemType,itemIndex)  {
  if(event.shiftKey && angular.isDefined(item.note) && item.note.length > 0) {
      itemNoteEditFn(modals,item,section,itemType);
  } else if (event.ctrlKey) {
      var selectedLinkItem = {itemType:itemType, rowIndex:itemIndex,item:item};
      sectionEditFn(section.key,selectedLinkItem,false);
  } else {
      if (angular.isDefined(item.link) && item.link.length > 0) {
          var link = stripQuotes(item.link); // As convenience allow Windows qouted paths.
          var re = /^([a-zA-Z]:)?(\\[^<>:"/\\|?*]+)+\\?$/;
          if (link.search(re) != -1) {
              var u = "http://"+ location.host()+':'+location.port() + '/local/download?fpath='+ link;
              window.open(u);
          } else {
              window.open(link);
          }
      }
  }
};

var stripQuotes = function(str) {
  var re = /^"(.*)"$/;
  var r,m;
  if ( (m = re.exec(str)) == null) {
    r = str; // No stripping to be done.
  } else {
    r = m[1];
  }
  return r;
}




// See: http://stackoverflow.com/questions/18157305/angularjs-compiling-dynamic-html-strings-from-database
angular.module('app')
    .directive('dynamic', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            link: function (scope, ele, attrs) {
                scope.$watch(attrs.dynamic, function(html) {
                    ele.html(html);
                    $compile(ele.contents())(scope);
                });
            }
        };
});


/*
Exaple Usage:
         <textareaqc qcmodel="currentRefSection.comment"
         qcrows="'6'"
         qcclass="'voffset2'"
         qcstyle="'width:100%'"
         qcplaceholder="'Add comment'"
         qcdisabled="!currentRefSection">
     </textarea>
*/
angular.module('app')
    .directive('textareaqc', [function () {
        return {
            replace: true,
            transclude: false,
            restrict: 'E',
            scope: {
                'qcmodel':'=',
                'qcstyle':'=',
                'qcrows':'=',
                'qcclass':'=',
                'qcplaceholder':'=',
                'qcdisabled':'='
            },
            templateUrl: 'views-ng/textareaqc.html',
            link: function postLink(scope, element, attrs) {
              var quickCodeTodaysDate = [123,116,100,125]; // '{' 't' 'd' '}'
              scope.matchBuffer = {chars:[]};
              scope.keyPressed = function() {
                  var matchLength;
                  if ((matchLength = quickCodeMatch(quickCodeTodaysDate,scope.matchBuffer,event.charCode)) > 0) {
                      var today = moment().format('ll') + " ";
                      scope.qcmodel = scope.qcmodel.replace('{td',today);
                      event.preventDefault(); // Prevent the last character of the sequence to be entered.
                  }
              };
              scope.getStyle = function() {
                  return scope.qcstyle;
              }

            }
        }
    }]);

// Sequence contains an ordered set of charCodes.
// A match is determined when sequence of key presses == ordered sequence.
// A partial match occurs when one are more charCodes are recorded in sequence
// but not all charCodes have arrived yet.
// reset occurs when charCode is not part of the sequence or a charCode is not
// in the sequence order
// Return 0 when no match or the lengh of a matched sequence.
function quickCodeMatch(quickCodeSeq,matchBuffer,charCode) {
    matchBuffer.chars.push(charCode);
    var matchSequenceLength = 0;
    for(var i in matchBuffer.chars) {
      if (matchBuffer.chars[i] === quickCodeSeq[i]) {
        if (matchBuffer.chars.length === quickCodeSeq.length) {
            matchSequenceLength = quickCodeSeq.length;
            matchBuffer.chars = [];
            break;
        }
      } else {
          matchBuffer.chars = []; // Reset;
          break;
      }
    }
    return matchSequenceLength;
}

angular.module('app')
    .directive('ruler', [function () {
        return {
            replace: true,
            transclude: true,
            restrict: 'E',
            template:
            '<div class="row">'+
                '<div class="col-md-1 twcola">1</div>'+
                '<div class="col-md-1 twcolb">2</div>'+
                '<div class="col-md-1 twcolc">3</div>'+
                '<div class="col-md-1 twcola">4</div>'+
                '<div class="col-md-1 twcolb">5</div>'+
                '<div class="col-md-1 twcolc">6</div>'+
                '<div class="col-md-1 twcola">7</div>'+
                '<div class="col-md-1 twcolb">8</div>'+
                '<div class="col-md-1 twcolc">9</div>'+
                '<div class="col-md-1 twcola">10</div>'+
                '<div class="col-md-1 twcolb">11</div>'+
                '<div class="col-md-1 twcolc">12</div>'+
            '</div>',
            link: function postLink(scope, element, attrs) {

            }
        }
    }]);
