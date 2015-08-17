function Pager(items,itemsPerPage,numberOfPagerButtons) {
  this.items = items;
  this.itemsPerPage = itemsPerPage;
  this.currentPage = 0;
  this.numberOfPagerButtons=numberOfPagerButtons;

  this.range = function() {
    var rangeSize = this.numberOfPagerButtons;  var ret = [];  var start;

    if (this.pageCount()+1 < rangeSize) {
      rangeSize= this.pageCount()+1;
    }

    start = this.currentPage;
    if ( start > this.pageCount()-rangeSize ) {
      start = this.pageCount()-rangeSize+1;
    }

    for (var i=start; i<start+rangeSize; i++) {
      ret.push(i);
    }
    return ret;
  };

  this.pageCount = function() {
    var c = Math.ceil(this.items.length/this.itemsPerPage)-1;
    return c;
  };

  this.prevPage = function() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  };

  this.prevPageDisabled = function() {
    return this.currentPage === 0 ? "disabled" : "";
  };

  this.nextPage = function() {
    if (this.currentPage < this.pageCount()) {
      this.currentPage++;
    }
  };

  this.nextPageDisabled = function() {
    return this.currentPage === this.pageCount() ? "disabled" : "";
  };

  this.setPage = function(n) {
    this.currentPage = n;
  };

  this.offset = function() {
    return this.currentPage * this.itemsPerPage;
  }
}
