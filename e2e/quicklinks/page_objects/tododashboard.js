module.exports = {
    getTotalTodos: function () {
        return element(by.binding('numTodos')).getAttribute('textContent');
    },
    getWithTodoStatus: function () {
        return element(by.binding('listTodo.length')).getAttribute('textContent');
    },
    getWithWaitingStatus: function () {
        return element(by.binding('listWaiting.length')).getAttribute('textContent');
    },
    getWithCurrentStatus: function () {
        return element(by.binding('listCurrent.length')).getAttribute('textContent');
    },
    getWithDoneStatus: function () {
        return element(by.binding('listDone.length')).getAttribute('textContent');
    },
    closeDashboard:function() {
        var e = $('[ng-click="close()"]');
        expect(e.isDisplayed()).toBe(true);
        e.click();
    }
}