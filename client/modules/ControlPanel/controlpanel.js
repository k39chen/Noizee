/**
 * The control panel controller. Manages any of the actions that are
 * inacted upon the control panel and reacts accordingly.
 *
 * @class ControlPanel
 */
window.ControlPanel = function(options) {
    var self = this;

    // create an initial set of options and then subsequently
    // merge it with user-provided options.
    this.options = $.extend({
        // ...
    }, options);
    
    // assign the control panel element
    self.element = $("#control-panel");
    
    // initialize all sliders
    self.element.find(".slider").slider({
        value: 30,
        orientation: "vertical",
        range: "min",
        animate: true
    });
    // open the control panel by default
    self.open();
}
/**
 * Opens the control panel.
 *
 * @method open
 */
ControlPanel.prototype.open = function() {
    var $el = $(this.element);
    $el.addClass("open");
};
/**
 * Closes the control panel.
 *
 * @method close
 */
ControlPanel.prototype.close = function() {
    var $el = $(this.element);
    $el.removeClass("open");
};
