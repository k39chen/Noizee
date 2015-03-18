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
            icon: $slider.data("icon"),
            value: _.random(10,100)
        });
    });
    // bind some custom event listeners for when the visualizer sets its background
    self.element.bind("background-set", $.proxy(function(ev,background) {
        var $bg = $("#blurred-bg");
        var $img = $bg.find("img")
            .attr("data-x", background.x)
            .attr("data-y", background.y)
            .attr("data-width", background.width)
            .attr("data-height", background.height)
            .attr("src", background.source.url)
            .css({
                left: background.x,
                top: background.y - self.element.position().top,
                width: background.width,
                height: background.height
            });
    }, self));
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
    var $bg = $("#blurred-bg");
    var $img = $bg.find("img");

    $el.addClass("open");

    $el.animate({top: "100%",opacity: 0}).stop().animate({top: "50%",opacity: 0.8},300);
    $bg.animate({top: "100%"}).stop().animate({top: "50%"}, {
        duration: 300,
        step: function(now, tween) {
            $img.css({top: Math.ceil($img.data("y") - $(this).offset().top)});
        },
        complete: function() {
            $img.css({top: Math.ceil($img.data("y") - $(this).offset().top)});  
        }
    });
};
/**
 * Closes the control panel.
 *
 * @method close
 */
ControlPanel.prototype.close = function() {
    var $el = $(this.element);
    var $bg = $("#blurred-bg");
    var $img = $bg.find("img");

    $el.removeClass("open");

    $el.animate({top: "50%",opacity: 0.8}).stop().animate({top: "100%",opacity: 0},300);
    $bg.animate({top: "50%"}).stop().animate({top: "100%"}, {
        duration: 300,
        step: function(now, tween) {
            $img.css({top: Math.ceil($img.data("y") - $(this).offset().top)});
        },
        complete: function() {
            $img.css({top: Math.ceil($img.data("y") - $(this).offset().top)});  
        }
    });
};
