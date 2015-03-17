/**
 * The control panel controller. Manages any of the actions that are
 * inacted upon the control panel and reacts accordingly.
 *
 * @class ControlPanel
 * @param options {Object} Options for this controller.
 */
window.ControlPanel = function(options) {
    var self = this;

    // create an initial set of options and then subsequently
    // merge it with user-provided options.
    this.options = $.extend({
        sliders: []
    }, options);
    
    // assign the control panel element
    self.element = $("#control-panel");

    // go through all sliders in the control panel and initialize them    
    self.element.find(".slider").each(function(index) {
        var $slider = $(this);

        // bind this slider to this container element
        self.options.sliders[index] = new Slider($slider, {
            icon: $slider.data("icon")
        });
    });
    // open the control panel by default
    self.open();
};
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
