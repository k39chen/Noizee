// get our fullscreen variables
var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

// initial fft size
var fftSize;

// since these are global objects, lets just represent them as such here (but reduce the number of global variables)
window.visualizer = null;
window.controlPanel = null;

// bootstrap our application
window.onload = function() {
    // initialize the visualizer
    visualizer = new Visualizer({
        // ...
    });
    // initialize the sidebar
    controlPanel = new ControlPanel({
        // ...
    });

    // for the miniature visualization we'll need a smaller fft size
    fftSize = visualizer.options.analysers.frequency.config.fftSize;
    visualizer.configureAnalyser("frequency", {
        fftSize: 512
    });
    // bind the full screen toggle button
    $("#fullscreen-toggle")
        .mouseover(function() { $(this).addClass("hover"); })
        .mouseout(function() { $(this).removeClass("hover"); })
        .click(function() {
            toggleFullScreen();
        });
};
/**
 * Toggles fullscreen mode for the entire window and updates
 * the toggle icon.
 *
 * @method toggleFullScreen
 */
function toggleFullScreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
        $("#fullscreen-toggle").removeClass("fa-expand").addClass("fa-compress");
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        $("#fullscreen-toggle").addClass("fa-expand").removeClass("fa-compress");
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
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
        var $el = $(ev.target);
        var $splash = $("#splash-screen");
        var $blur = $("#splash-blur");

        $splash.data("is-closed",true);

        // reconfigure the fft size
        visualizer.configureAnalyser("frequency", {
            fftSize: fftSize
        });
        // animate the splash out of existence
        $splash.css({opacity: 0.9}).stop().animate({opacity: 0}, 1000, function() {
            $(this).remove();
        });
        $blur.css({opacity: 1.0}).stop().animate({opacity: 0}, 1000, function() {
            $(this).remove();
        });
    }
});