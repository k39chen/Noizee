$(window).on("load", function() {
    // initialize the sidebar
    var controlPanel = new ControlPanel();

    // initialize the visualizer
    var visualizer = new Visualizer({
        audioFilePath: "resources/playlists/ety/Squirly Girl.mp3"
    });
});
