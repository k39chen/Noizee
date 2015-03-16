var NUM_DATA_POINTS = 1024;
var SMOOTHING_CONSTANT = 0.5;
var MIN_DECIBELS = -90;
var MAX_DECIBELS = 10;
var SC_CLIENT_ID = "09af4ac81403d0e0b85d7edd30a4fd57";

var context = new AudioContext();

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
    self.options = $.extend({
        videoInfo: {},
        numDataPoints: NUM_DATA_POINTS,
        context: null,
        backgroundColor: "#444",
        barColor: "#37CCDF"
    }, options);

    // assign the visualizer element
    self.element = $("#visualizer").get(0);
    self.options.context = self.element.getContext("2d");

    // initialize the size of the canvas
    self.handleResize();
    $(window).resize($.proxy(self.handleResize,self));


    function testYouTube() {
        var url = "https://www.youtube.com/watch?v=d01XRSB-7dA";
        var videoId = self.getYouTubeVideoId(url);

        $.when(
            self.getVideo(url)
        ).then(function() {
            var info = self.options.videoInfo[videoId];
            self.attachAnalyser(info.video);
        });
    }
    function testSoundCloud() {
        var audio = $("#audio").get(0);
        audio.src = "https://api.soundcloud.com/tracks/169508644/stream?client_id=09af4ac81403d0e0b85d7edd30a4fd57";
        self.attachAnalyser(audio);
    }
    //testVideo();
    testSoundCloud();
};
/**
 * Initializes the the provided audio file.
 *
 * @method initAudio
 * @return {[type]} [description]
 */
Visualizer.prototype.attachAnalyser = function(mediaElement) {
    var self = this;
    var context = new AudioContext();
    var analyser = context.createAnalyser();

    // connect the audio object to an analyzer
    var source = context.createMediaElementSource(mediaElement);
    source.connect(analyser);
    analyser.connect(context.destination);

    // configure for the number of bars to produce
    analyser.fftSize = self.options.numDataPoints * 2;
    analyser.minDecibels = MIN_DECIBELS;
    analyser.maxDecibels = MAX_DECIBELS;
    analyser.smoothingTimeConstant = SMOOTHING_CONSTANT;

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
    renderFrame();
    mediaElement.play();
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
    var barWidth = width / data.length * 2.5;
    var barHeight;
    var barOffset = 0;

    context.fillStyle = self.options.backgroundColor;
    context.fillRect(0,0,width,height);

    _.each(data, function(datum) {
        barHeight = datum * 2;

        // draw the bar
        context.fillStyle = self.options.barColor;
        context.fillRect(barOffset, height * 0.5 - barHeight * 0.75, barWidth, barHeight);

        // compute the offset appropriately
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
/**
 * Gets the video ID from the YouTube url.
 *
 * @method getYouTubeVideoId
 * @param url {String} The complete YouTube URL.
 * @return {String} The video ID.
 */
Visualizer.prototype.getYouTubeVideoId = function(url) {
    var isYoutube = url && url.match(/(?:youtu|youtube)(?:\.com|\.be)\/([\w\W]+)/i);
    var id = isYoutube[1].match(/watch\?v=|[\w\W]+/gi);
    id = (id.length > 1) ? id.splice(1) : id;
    id = id.toString();
    return id || null;
};
/**
 * This will get a YouTube video, based on a given URL, and then convert it into an
 * MP4 using a third-party service, then retrieve its title/author/thumbnail as a
 * returned result.
 *
 * @method getVideo
 * @param url {String} The complete YouTube URL.
 * @return {Deferred} The promise for when all the required data is loaded.
 */
Visualizer.prototype.getYouTubeVideo = function(url) {
    var self = this;
    var $dfd = new $.Deferred();
    var video = $("#video").get(0);
    var isYoutube = url && url.match(/(?:youtu|youtube)(?:\.com|\.be)\/([\w\W]+)/i);
    var id = self.getYouTubeVideoId(url);

    // if this is a valid youtube url, then let's defer the the conversion.
    if (isYoutube) {
        video.src = "http://www.youtubeinmp4.com/redirect.php?video="+id;
    }
    // now we will get the video information.
    $.when (
        $.ajax({
            type: "GET",
            url: "https://gdata.youtube.com/feeds/api/videos/"+id+"?v=2"
        })
    ).done(
        $.proxy(function(id, data, textStatus) {
            var $data = $(data);
            var title = $data.find("title").get(0).textContent;
            var author = $data.find("author").find("name").get(0).textContent;
            var thumbnail = "http://img.youtube.com/vi/"+id+"/mqdefault.jpg";

            // store the video information
            self.options.videoInfo[id] = {
                title: title,
                author: author,
                thumbnail: thumbnail,
                video: video
            };
            // resolve the deferred
            $dfd.resolve();
        }, self, id)
    ).fail(
        $.proxy(function(id) {
            // invalidate the video info object.
            self.options.videoInfo[id] = null;

            // resolve the deferred
            $dfd.resolve();
        }, self, id)
    );
    return $dfd.promise();
};
