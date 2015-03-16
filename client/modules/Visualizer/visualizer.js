var SC_CLIENT_ID = "09af4ac81403d0e0b85d7edd30a4fd57";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

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
        ytInfo: {},
        scInfo: {},
        canvas: null,
        backgroundColor: "#444",
        themeColor: "#37CCDF",
        analyserConfig: {
            numDataPoints: 1024,
            smoothingTimeConstant: 0.80,
            minDecibels: -90,
            maxDecibels: 10  
        },
        _analyser: null,
        _frequencyData: null
    }, options);

    // assign the visualizer element
    self.element = $("#visualizer").get(0);
    self.options.canvas = self.element.getContext("2d");

    // initialize the size of the canvas
    self.handleResize();
    $(window).resize($.proxy(self.handleResize,self));

    function testYouTube() {
        var url = "https://www.youtube.com/watch?v=d01XRSB-7dA";
        $.when(
            self.getYouTubeVideo(url)
        ).then(function(videoId) {
            var info = self.options.ytInfo[videoId];
            var video = $("#video").get(0);
            video.src = info.url;
            self.attachAnalyser(video);
        });
    }
    function testSoundCloud() {
        var url = "https://soundcloud.com/nightcorereality3/nightstep-coming-home";
        $.when(
            self.getSoundCloudAudio(url)
        ).then(function(trackId) {
            var info = self.options.scInfo[trackId];
            var audio = $("#audio").get(0);
            audio.src = info.url;
            self.attachAnalyser(audio);
        });
    }
    function testAudio() {
        var audio = $("#audio").get(0);
        audio.src = "resources/audio/Squirly Girl.mp3";
        self.attachAnalyser(audio);
    }
    testYouTube();
    //testSoundCloud();
    //testAudio();
};
/*========================================================================*
 * ANALYSER BOOTSTRAP, RENDERING, AND CONFIGURATION
 *========================================================================*/
/**
 * Initializes the the provided audio file.
 *
 * @method attachAnalyser
 * @param mediaElement {Object} Either a video or audio element.
 */
Visualizer.prototype.attachAnalyser = function(mediaElement) {
    var self = this;
    var context = new AudioContext();
    var analyser = context.createAnalyser();

    // connect the audio object to an analyzer
    var source = context.createMediaElementSource(mediaElement);
    source.connect(analyser);
    analyser.connect(context.destination);

    // update our remote reference to the audio analyser
    self.options._analyser = analyser;

    // apply the initial configuration for the analyser
    self.configureAnalyser(self.options.analyserConfig);

    // create an interval listener to render the frame
    self.updateFrequencyData();
    mediaElement.play();
};
/**
 * Changes the analyser based on the provided object.
 *
 * @method configureAnalyser
 * @param config {Object} The set of configuration changes.
 */
Visualizer.prototype.configureAnalyser = function(config) {
    var self = this;
    var analyser = self.options._analyser;

    // based on the specific kind of configuration, we'll have to
    // modify the analyser in a different way.
    _.each(config, function(value, name) {
        switch (name) {
        case "numDataPoints":
            analyser.fftSize = value * 2;
            self.options._frequencyData = new Uint8Array(analyser.frequencyBinCount);
            break;
        case "smoothingTimeConstant":
            /* falls through */
        case "minDecibels":
            /* falls through */
        case "maxDecibels":
            analyser[name] = value
            break;
        }
    });
    // update our reference to the current analyser configuration
    $.extend(self.options.analyserConfig, config);
};
/**
 * Updates the frequency data provided from the audio analyser.
 *
 * @method updateFrequencyData
 */
Visualizer.prototype.updateFrequencyData = function() {
    var self = this;
    var analyser = self.options._analyser;
    var frequencyData = self.options._frequencyData;
    var averageVolume = self.computeAverageVolume(frequencyData);

    // update the frequency data based on what the analyser delivers
    requestAnimationFrame(function() {
        self.updateFrequencyData();
    });
    analyser.getByteFrequencyData(frequencyData);

    // use this frequency data to render the visualizer
    self.renderVisualization(frequencyData, averageVolume);
};
/**
 * Renders the visualization.
 *
 * @method renderVisualization
 * @param data {Array} The list of frequency data to render.
 * @param averageVolume {Number} The average volume.
 */
Visualizer.prototype.renderVisualization = function(data, averageVolume) {
    var self = this;
    var canvas = self.options.canvas;
    var width = self.element.width;
    var height = self.element.height;

    // clear the canvas
    canvas.fillStyle = self.options.backgroundColor;
    canvas.fillRect(0,0,width,height);

    // render the frequency data
    self.renderFrequencyData(data);

    // render the volume data
    self.renderVolumeData(averageVolume);
};
/**
 * Renders the visualizer with the provided frequency data.
 *
 * @method renderFrequencyData
 * @param data {Array} The list of frequency data to render.
 */
Visualizer.prototype.renderFrequencyData = function(data) {
    var self = this;
    var canvas = self.options.canvas;
    var width = self.element.width;
    var height = self.element.height;
    var barWidth = width / data.length * 2.5;
    var barHeight;
    var barOffset = 0;

    // draw the frequency spectrum
    _.each(data, function(datum) {
        barHeight = datum;

        // draw the bar
        canvas.fillStyle = self.options.themeColor;
        canvas.fillRect(barOffset, height * 0.5 - barHeight * 0.75, barWidth, barHeight);

        // compute the offset appropriately
        barOffset = barOffset + barWidth + 4;
    });
};
/**
 * Renders the volume data.
 *
 * @method renderVolumeData
 * @param averageVolume {Number} The average volume.
 */
Visualizer.prototype.renderVolumeData = function(averageVolume) {
    var self = this;
    var canvas = self.options.canvas;
    var width = self.element.width;
    var height = self.element.height;
    var radius = averageVolume / 2;

    // draw the volume reactor
    canvas.beginPath();
    canvas.arc(width/2, height*0.25, radius, 0, 2 * Math.PI, false);
    canvas.lineWidth = 2;
    canvas.strokeStyle = self.options.themeColor;
    canvas.stroke();
};
/**
 * Computes the average length at any give frame, provided the list
 * of frequency data.
 *
 * @method computeAverageVolume
 * @param data {Array} The list of frequency data.
 * @return {Number} The computed average volume.
 */
Visualizer.prototype.computeAverageVolume = function(data) {
    var self = this;
    var sum = _.foldr(data, function(d1,d2) { return d1 + d2; });
    var avg = sum / data.length;
    return avg;
};
/*========================================================================*
 * THIRD PARTY DATA FETCHING
 *========================================================================*/
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
 * @method getYouTubeVideo
 * @param url {String} The complete YouTube URL.
 * @return {Deferred} The promise for when all the required data is loaded.
 */
Visualizer.prototype.getYouTubeVideo = function(url) {
    var self = this;
    var $dfd = new $.Deferred();
    var isYoutube = url && url.match(/(?:youtu|youtube)(?:\.com|\.be)\/([\w\W]+)/i);
    var id = self.getYouTubeVideoId(url);

    // now we will get the video information.
    $.when (
        $.ajax({
            type: "GET",
            url: "https://gdata.youtube.com/feeds/api/videos/"+id+"?v=2",
            dataType: "jsonp"
        })
    ).done(
        $.proxy(function(id, data, textStatus) {
            var $data = $(data);
            var title = $data.find("title").get(0).textContent;
            var author = $data.find("author").find("name").get(0).textContent;
            var thumbnail = "http://img.youtube.com/vi/"+id+"/mqdefault.jpg";

            // store the video information
            self.options.ytInfo[id] = {
                title: title,
                author: author,
                thumbnail: thumbnail,
                type: "video",
                url: "http://www.youtubeinmp4.com/redirect.php?video="+id
            };
            // resolve the deferred
            $dfd.resolve(id);
        }, self, id)
    ).fail(
        $.proxy(function(id) {
            // invalidate the video info object.
            self.options.ytInfo[id] = null;

            // resolve the deferred
            $dfd.resolve(id);
        }, self, id)
    );
    return $dfd.promise();
};
/**
 * This will get a SoundCloud mp3, based on a given URL, then retrieve its
 * title/author/thumbnail as a returned result.
 *
 * @method getVideo
 * @param url {String} The complete SoundCloud URL.
 * @return {Deferred} The promise for when all the required data is loaded.
 */
Visualizer.prototype.getSoundCloudAudio = function(url) {
    var self = this;
    var $dfd = new $.Deferred();
    var requestUrl = "https://api.soundcloud.com/resolve.json?url="+url+"&client_id="+SC_CLIENT_ID;

    // now we will get the audio information.
    $.when (
        $.ajax({
            type: "GET",
            url: requestUrl,
            dataType: "jsonp"
        })
    ).done(
        $.proxy(function(data, textStatus) {
            // store the audio information
            self.options.scInfo[data.id] = {
                title: data.title,
                author: data.user.username,
                thumbnail: data.artwork_url,
                type: "audio",
                url: "https://api.soundcloud.com/tracks/"+data.id+"/stream?client_id="+SC_CLIENT_ID
            };
            // resolve the deferred
            $dfd.resolve(data.id);
        }, self)
    ).fail(
        $.proxy(function() {
            // resolve the deferred
            $dfd.resolve();
        }, self)
    );
    return $dfd.promise();
};
/*========================================================================*
 * HELPERS
 *========================================================================*/
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
