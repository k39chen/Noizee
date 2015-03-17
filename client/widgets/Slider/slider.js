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
        label: "Sample Label"
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
        value: 30,
        orientation: "vertical",
        range: "min",
        animate: true
    });
    // bind events for this widget
    self.bindEvents();
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

    // unbind all the events for this widget
    self.unbindEvents();

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
    "click .icon": function() {
        // ...
    },
    "mouseover .icon": function(ev) {
        var $el = $(ev.target);
        $el.addClass("hover");
    },
    "mouseout .icon": function(ev) {
        var $el = $(ev.target);
        $el.removeClass("hover");
    }
});

/**
 * Binds all the events for this widget.
 *
 * @method bindEvents
 */
Slider.prototype.bindEvents = function() {
    var self = this;
    var $el = $(self.element);

    // add hover event handlers for the icon
    $el.find(".icon").hover();
};
/**
 * Unbinds all the events for this widget.
 *
 * @method bindEvents
 */
Slider.prototype.unbindEvents = function() {
    var self = this;
    var $el = $(self.element);
};
