var putils = require('./page.utils');

module.exports = {
    retriveNoteText: function() {
        return $('div[dynamic="htmlEdNote"] .ng-scope').getAttribute('textContent');
    }
}