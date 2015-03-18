// get our fullscreen variables
var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;

// since these are global objects, lets just represent them as such here (but reduce the number of global variables)
window.splash = null;
window.visualizer = null;
window.controlPanel = null;

// bootstrap our application
window.onload = function() {
    // initialize the visualizer
    visualizer = new Visualizer({});

    // initialize the splash screen
    splash = new Splash({fftSize: 512});

    // initialize the sidebar
    controlPanel = new ControlPanel({});

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
