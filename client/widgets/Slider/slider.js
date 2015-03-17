/**
 * The control panel controller. Manages any of the actions that are
 * inacted upon the control panel and reacts accordingly.
 *
 * @class Slider
 * @param $el {Object} The DOM object to bind this widget to.
 * @param options {Object} Options for this widget.
 */
window.Slider = function($el, options) {
    var self = this;

    // create an initial set of options and then subsequently
    // merge it with user-provided options.
    this.options = $.extend({
        label: "Sample Label",
        min: 0,
        value: 30,
        max: 100,
        handleChange: $.noop
    }, options);
    
    // assign a reference to the DOM element
    self.element = $el;

    // assign the slider class to the element
    self.element.addClass("Slider");

    // clear out any text that was here before
    self.element.empty();

    // render the widget inside the slider container
    UI.renderWithData(
        Template.slider,
        self.options,
        self.element.get(0)
    );
    // initialize the sliders
    self.element.find(".slider-el").slider({
        min: self.options.min,
        value: self.options.value,
        max: self.options.max,
        orientation: "vertical",
        range: "min",
        animate: true,
        slide: function(ev,ui) {
            if (_.isFunction(self.options.handleChange)) {
                self.options.handleChange(ui.value);
            }
        }
    });
};
/**
 * Destroys and unbinds the slider to its original state.
 *
 * @method destroy
 */
Slider.prototype.destroy = function() {
    var self = this;
    var $el = $(self.element);

    // unbind the slider widget
    $el.find(".slider").slider("destroy");

    // empty out the element
    $el.empty();

    // remove the Slider class which identifies that the widget is bound
    $el.removeClass("Slider");
};
/*========================================================================*
 * EVENT HANDLERS
 *========================================================================*/
Template.slider.events({
    // Mouse event handlers for the icon
    //-------------------------------------------------------------------------
    "mouseover .slider-el": function(ev) {
        var $el = $(ev.target);
        var $slider = $el.closest(".Slider");

        $slider.addClass("hover");
    },
    "mouseout .slider-el": function(ev) {
        var $el = $(ev.target);
        var $slider = $el.closest(".Slider");

        $slider.removeClass("hover");
    }
});
