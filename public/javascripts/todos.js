angular.module('app').controller(
    "TodoDashboardController",
    function( $scope, modals, RefDA) {
        var params = modals.params();
        $scope.numTodos = null;
        $scope.showSectionTitle = true;

        $scope.sync = function() {
            // $scope.refSections = params.refSections;
            var select = {select:{ dtype: "ref-section"}};
            RefDA.query(select,function(sections){
              var todos = filterTodos(sections);
              $scope.numTodos = todos.length;
              $scope.listDone = _.filter(todos, function(todo) {
                  return todo.done;
              });

              $scope.listWaiting = _.filter(todos, function(todo) {
                  return !todo.done && todo.waiting;
              })

              $scope.listCurrent = _.filter(todos, function(todo) {
                  return !todo.done && !todo.waiting && todo.current;
              });

              $scope.listTodo = _.filter(todos, function(todo) {
                  return !todo.done && !todo.waiting && !todo.current;
              });
            });
        };

        $scope.sync();

        $scope.close = modals.resolve;
        $scope.dismiss = modals.reject;
    }
);


function filterTodos(sections) {
    var todos = [];
    var now = moment();
    var infinityMinusOne = moment("2049-12-31");
    var threshold = now.add(3, 'days');
    _.each(sections, function(s) {
        _.each(s.linkItems,function(item,index){
            if(item.hasTodo) {
                // Attribute kind can be: current, todo, or done.
                // current :: = !t.done && t.due > now || t.startBy > now || t.due + 3 day > now
                var due = moment(item.todoInfo.due), startBy = moment(item.todoInfo.startBy);
                var current = (!item.todoInfo.done && ( now.isAfter(due) || threshold.isAfter(due) ||
                                           now.isAfter(startBy)));

                var showDates = (due.isBefore(infinityMinusOne));

                todos.push(
                    {
                        section: s,
                        linkItemIndex:index,
                        title: item.title,
                        note: item.note,
                        link: item.link,
                        done: item.todoInfo.done,
                        waiting: item.todoInfo.waiting,
                        due: item.todoInfo.due,
                        startBy: item.todoInfo.startBy,
                        current: current,   // The todo item is now needing attention.
                        showDates: showDates
                    }
                );
            }
        });
    });

    return todos;
}
