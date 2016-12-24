
// Semafore - to ensure only one drap and drop is taking place.
// this mechanism is required for nested elements.
var currentDragDropSituation = null;
var lookup = [];
lookup["DRAG_DROP_REFSECTION"] = {dragCssClass:"drag", overCssClass:"over"};
lookup["DRAG_DROP_LINKITEM"] ={dragCssClass:"dragLinkItem", overCssClass:"overLinkItem"};
lookup["DRAG_DROP_JUMPITEM"] = {dragCssClass:"dragJumpItem", overCssClass:"overJumpItem"};


function clearDragDropClasses() {
  _.each(_.values(lookup),function(e){
    angular.element(document.querySelector("." + e.dragCssClass)).removeClass(e.dragCssClass);
    angular.element(document.querySelector("." + e.overCssClass)).removeClass(e.overCssClass);
  });
}


function attachDraggableEventHandling(scope,el,dragDropSituation,fnGetSourceDetail) {
    el.draggable = true;
    el.addEventListener(
      'dragstart',
      function(e) {
        if (currentDragDropSituation === null) {
          currentDragDropSituation = dragDropSituation;
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('Text',fnGetSourceDetail());
          this.classList.add(lookup[currentDragDropSituation].dragCssClass);
        }
        return false;
      },
      false
    );

    el.addEventListener(
      'dragend',
      function(e) {
        if (currentDragDropSituation === dragDropSituation) {
          this.classList.remove(lookup[currentDragDropSituation].dragCssClass);
        }
        return false;
      },
      false
    );
  };

function attachDroppableEventHandling(scope,el,dragDropSituation,dropHandlerCB) {
      el.addEventListener(
        'dragover',
        function(e) {
          if (currentDragDropSituation === dragDropSituation) {
            e.dataTransfer.dropEffect = 'move';
            // allows us to drop
            if (e.preventDefault) e.preventDefault();
            this.classList.add(lookup[currentDragDropSituation].overCssClass);
          }
          return false;
        },
        false
      );

      el.addEventListener(
        'dragenter',
        function(e) {
          if (currentDragDropSituation === dragDropSituation) {
            this.classList.add(lookup[currentDragDropSituation].overCssClass);
          }
          return false;
        },
        false
      );

      el.addEventListener(
        'dragleave',
        function(e) {
          if (currentDragDropSituation === dragDropSituation) {
            this.classList.remove(lookup[currentDragDropSituation].overCssClass);
          }
          return false;
        },
        false
      );

      el.addEventListener(
        'drop',
        function(e) {
            // Stops some browsers from redirecting.
            if (e.stopPropagation) e.stopPropagation();
            if (currentDragDropSituation === dragDropSituation) {
                this.classList.remove(lookup[currentDragDropSituation].overCssClass);
                var sourceDetail = e.dataTransfer.getData('Text');
                // call the passed drop function
                scope.$apply(function(scope) {
                    dropHandlerCB(sourceDetail);
                });
             currentDragDropSituation = null;
          }
          return false;
        },
        false
      );
    }
