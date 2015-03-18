// initial fft size
var initialFftSize;

/**
 * The splash controller. Manages any of the actions that are
 * inacted upon the splash and reacts accordingly.
 *
 * @class Splash
 * @param options {Object} Options for this controller.
 */
window.Splash = function(options) {
    var self = this;

    // create an initial set of options and then subsequently
    // merge it with user-provided options.
    this.options = $.extend({
        fftSize: 512
    }, options);
    
    // assign the control panel element
    self.element = $("#splash-screen");
};
/**
 * Destroy this splash screen.
 *
 * @method destroy
 */
Splash.prototype.destroy = function() {
    var self = this;
    var $splash = $(self.element);
    var $blur = $("#splash-blur");

    // invalidate the splash reference
    splash = null;

    // reconfigure the fft size
    visualizer.configureAnalyser("frequency", {
        fftSize: initialFftSize
    });
    // animate the splash out of existence
    $splash.css({opacity: 0.9}).stop().animate({opacity: 0}, 3000, function() {
        $(this).remove();
    });
    $blur.css({opacity: 1.0}).stop().animate({opacity: 0}, 3000, function() {
        $(this).remove();
    });
};
/**
 * Initialize the miniature visualization canvas.
 *
 * @method initVisualization
 */
Splash.prototype.initVisualization = function() {
    var self = this;

    // for the miniature visualization we'll need a smaller fft size
    initialFftSize = visualizer.options.analysers.frequency.config.fftSize;
    visualizer.configureAnalyser("frequency", {
        fftSize: self.options.fftSize
    });
};
// Some basic event handlers for the splash screen
Template.splashScreen.events({
    "background-set #splash-screen": function(ev,el,background) {
        var $img = $("#splash-blur");
        $img.attr("src", background.source.url);
        $img.css({
            left: background.x,
            top: background.y,
            width: background.width,
            height: background.height
        });
    },
    "mouseover #proceed-btn": function(ev) {
        var $el = $(ev.target);
        $el.addClass("hover");
    },
    "mouseout #proceed-btn": function(ev) {
        var $el = $(ev.target);
        $el.removeClass("hover");
    },
    "click #proceed-btn": function(ev) {
        if (!_.isNull(splash)) {
            splash.destroy();
        }
    }
});
