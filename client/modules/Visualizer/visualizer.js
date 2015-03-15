var NUM_BARS = 64;

/**
 * The visualizer controller. Manages any of the actions that are
 * inacted upon the visualizer and reacts accordingly.
 *
 * @class Visualizer
 */
window.Visualizer = function(options) {
    var self = this;

    // create an initial set of options and then subsequently
    // merge it with user-provided options.
    this.options = $.extend({
        audioFilePath: null,
        numBars: NUM_BARS,
        context: null,
        backgroundColor: "#444",
        barColor: "#37CCDF"
    }, options);

    // assign the visualizer element
    self.element = $("#visualizer").get(0);
    self.options.context = self.element.getContext("2d");

    // initialize the size of the canvas
    self.handleResize();

    // initialize the initial audio file (if provided)
    if (!_.isEmpty(self.options.audioFilePath)) {
        self.initAudio(self.options.audioFilePath);
    }
};
/**
 * Initializes the the provided audio file.
 *
 * @method initAudio
 * @return {[type]} [description]
 */
Visualizer.prototype.initAudio = function() {
    var self = this;
    var context = new AudioContext();
    var analyser = context.createAnalyser();
    
    // create the audio object
    var audio = new Audio();
    audio.src = self.options.audioFilePath;

    // connect the audio object to an analyzer
    var source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    // configure for the number of bars to produce
    analyser.fftSize = self.options.numBars * 2;

    // create a bucket for the frequency data as the analyser
    // does its work.
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // create an interval listener to render the frame
    function renderFrame() {
        requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(frequencyData);

        // use this frequency data to render the visualizer
        self.renderFrequencyData(frequencyData);
    }
    // $(audio).trigger("play");
    // renderFrame();
};
/**
 * Renders the visualizer with tthe provided frequency data.
 *
 * @method renderFrequencyData
 * @param data {Array} The list of frequency data to render.
 */
Visualizer.prototype.renderFrequencyData = function(data) {
    var self = this;
    var context = self.options.context;
    var width = self.element.width;
    var height = self.element.height;
    var barWidth = width / data.length;
    var barHeight;
    var barOffset = 0;

    console.log(barWidth);

    context.fillStyle = self.options.backgroundColor;
    context.fillRect(0,0,width,height);

    _.each(data, function(datum) {
        barHeight = datum / 2;


        context.fillStyle = self.options.barColor;
        context.fillRect(barOffset, height - barHeight/2, barWidth, barHeight);

        barOffset = barOffset + barWidth + 4;
    });
};
/**
 * Handles a window resize.
 *
 * @method handleResize
 */
Visualizer.prototype.handleResize = function() {
    var self = this;

    // update the width of the canvas
    self.element.width = $(window).width();
    self.element.height = $(window).height();
};
