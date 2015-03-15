/**
 * The sidebar controller. Manages any of the actions that are
 * inacted upon the sidebar and reacts accordingly.
 *
 * @class Sidebar
 */
window.Sidebar = function(options) {
    var self = this;

    // create an initial set of options and then subsequently
    // merge it with user-provided options.
    this.options = $.extend({
        // ...
    }, options);
    
    // assign the side bar element
    self.element = $("#sidebar");
    
    // open the sidebar by default
    self.open();
}
/**
 * Opens the side bar.
 *
 * @method open
 */
Sidebar.prototype.open = function() {
    var $el = $(this.element);
    $el.addClass("open");
};
/**
 * Closes the side bar.
 *
 * @method close
 */
Sidebar.prototype.close = function() {
    var $el = $(this.element);
    $el.removeClass("open");
};
