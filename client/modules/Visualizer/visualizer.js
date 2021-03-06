var SC_CLIENT_ID = "09af4ac81403d0e0b85d7edd30a4fd57";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

/**
 * The visualizer controller. Manages any of the actions that are
 * inacted upon the visualizer and reacts accordingly.
 *
 * @class Visualizer
 * @param options {Object} Options for this controller.
 */
window.Visualizer = function(options) {
    var self = this;

    // create an initial set of options and then subsequently
    // merge it with user-provided options.
    self.options = $.extend({
        ytInfo: {},
        scInfo: {},
        canvas: null,
        themeColor: "#37CCDF",

        // defined the background information for rendering        
        background: {
            source: {
                url: null,
                width: 0,
                height: 0
            },
            config: {
                scale: IMAGE_FIT.BEST_FILL,
                align: IMAGE_FIT.ALIGN_CENTER
            },
            image: null,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            fill: "#444"
        },
        // tracks configuration and data changes for the registered frequency analyser
        analysers: {
            frequency: {
                analyser: null,
                data: null,
                config: {
                    fftSize: 2048,
                    smoothingTimeConstant: 0.8,
                    minDecibels: -90,
                    maxDecibels: 10
                }
            },
            volume1: {
                analyser: null,
                data: null,
                config: {
                    fftSize: 2048,
                    smoothingTimeConstant: 0.3
                }
            },
            volume2: {
                analyser: null,
                data: null,
                config: {
                    fftSize: 256,
                    smoothingTimeConstant: 0.9
                }
            }
        }
    }, options);

    // assign the visualizer element
    self.element = $("#visualizer").get(0);
    self.options.canvas = self.element.getContext("2d");

    // initialize the size of the canvas
    self.handleResize();
    $(window).resize($.proxy(self.handleResize,self));

    function testYouTube() {
        var url = "https://www.youtube.com/watch?v=ShLTI5xgoFA";
        //url = "https://www.youtube.com/watch?v=RA_vxjTdw7A";
        $.when(
            self.getYouTubeVideo(url)
        ).then(function(videoId) {
            var info = self.options.ytInfo[videoId];
            var video = $("#video").get(0);
            video.src = info.url;
            self.attachAnalysers(video);
            splash.initVisualization();
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
            self.attachAnalysers(audio);
            splash.initVisualization();
        });
    }
    function testAudio() {
        var audio = $("#audio").get(0);
        audio.src = "resources/audio/TheFatRat-Unity.mp3";
        self.attachAnalysers(audio);
        splash.initVisualization();
    }
    testYouTube();
    //testSoundCloud();
    //testAudio();

    // initialize our background (and render it)
    self.options.background.config.align = IMAGE_FIT.ALIGN_LEFT;
    self.setBackground("http://i.imgur.com/eKFGuyR.jpg");
};
/*========================================================================*
 * ANALYSER BOOTSTRAP
 *========================================================================*/
/**
 * Initializes the the provided audio or video element with the appropriate
 * analysers in order to achieve an awesome looking visualization.
 *
 * @method attachAnalysers
 * @param mediaElement {Object} Either a video or audio element.
 */
Visualizer.prototype.attachAnalysers = function(mediaElement) {
    var self = this;
    var context = new AudioContext();
    var source = context.createMediaElementSource(mediaElement);

    // initialize the frequency analyzer
    self.initAnalyzer("frequency",context);
    self.initAnalyzer("volume1",context);
    self.initAnalyzer("volume2",context);

    // connect the frequency analyser to the source
    source.connect(self.options.analysers.frequency.analyser);
    
    // connect our split volume analyser to the source
    var splitter = context.createChannelSplitter();
    source.connect(splitter);
    splitter.connect(self.options.analysers.volume1.analyser,0,0);
    splitter.connect(self.options.analysers.volume2.analyser,1,0);
    
    // connect our source to the audio context destination
    source.connect(context.destination);

    // kick off the analysing and start the media playing
    self.updateAnalyserData();
    mediaElement.play();
};
/**
 * Creates and configures a single analyser provided the type and the
 * audio context.
 *
 * @method initAnalyzer
 * @param type {String} Either `frequency` or `volume1` or `volume2`.
 * @param context {Object} The audio context object.
 */
Visualizer.prototype.initAnalyzer = function(type,context) {
    var self = this;

    // create the analyser
    var analyser = context.createAnalyser();

    // update our remote reference to the audio analyser
    self.options.analysers[type].analyser = analyser;

    // apply the initial configuration for the analyser
    self.configureAnalyser(type,self.options.analysers[type].config);
};
/**
 * Changes the analyser based on the provided object.
 *
 * @method configureAnalyser
 * @param type {String} Either `frequency` or `volume1` or `volume2`.
 * @param config {Object} The set of configuration changes.
 */
Visualizer.prototype.configureAnalyser = function(type,config) {
    var self = this;
    var analyser = self.options.analysers[type].analyser;
    var analyserConfig = self.options.analysers[type].config;

    // if the analyser hasn't been defined yet, then nothing to do here
    if (_.isNull(analyser)) return;

    // based on the specific kind of configuration, we'll have to
    // modify the analyser in a different way.
    _.each(config, function(value, name) {
        switch (name) {
        case "fftSize":
            analyser.fftSize = value;
            self.options.analysers[type].data = new Uint8Array(analyser.frequencyBinCount);
            break;
        case "smoothingTimeConstant":
            /* falls through */
        case "minDecibels":
            /* falls through */
        case "maxDecibels":
            analyser[name] = value;
            break;
        }
    });
    // update our reference to the current analyser configuration
    $.extend(analyserConfig, config);
};
/*========================================================================*
 * ANALYSER RENDERING
 *========================================================================*/
/**
 * Updates the frequency data provided from the audio analyser.
 *
 * @method updateAnalyserData
 */
Visualizer.prototype.updateAnalyserData = function() {
    var self = this;
    
    // get our relevent analysers
    var frequencyAnalyser = self.options.analysers.frequency.analyser;
    var volume1Analyser = self.options.analysers.volume1.analyser;
    var volume2Analyser = self.options.analysers.volume2.analyser;

    // compute the appropriate data to use
    frequencyAnalyser.getByteFrequencyData(self.options.analysers.frequency.data);
    volume1Analyser.getByteFrequencyData(self.options.analysers.volume1.data);
    volume2Analyser.getByteFrequencyData(self.options.analysers.volume2.data);

    // determine if we want to render a mini visualizer for the splash screen
    // or render the full-fledged one on the app
    var $splash = $("#splash-screen");
    var $miniViz = $splash.find("#mini-visualization");

    if (!_.isNull(splash) && $splash.length > 0 && $miniViz.length > 0) {
        var miniCanvas = $miniViz.get(0).getContext("2d");
        self.renderMiniVisualization(miniCanvas, self.options.analysers.frequency.data);
    } else {
        // use this frequency data to render the visualizer
        self.renderVisualization(
            self.options.canvas,
            self.options.analysers.frequency.data,
            self.computeAverageVolume(self.options.analysers.volume1.data),
            self.computeAverageVolume(self.options.analysers.volume2.data)
        );
    }
    // update the our analyser data on the specified interval
    requestAnimationFrame(function() {
        self.updateAnalyserData();
    });
};
/**
 * Renders a miniature version of the visualization.
 *
 * @method renderMiniVisualization
 * @param canvas {Canvas} The HTML5 Canvas element to render the visualization on.
 * @param frequencyData {Array} The list of frequency data to render.
 */
Visualizer.prototype.renderMiniVisualization = function(canvas, frequencyData) {
    var self = this;
    var width = canvas.canvas.width;
    var height = canvas.canvas.height;
    var barWidth = width / frequencyData.length * 2.5;
    var barHeight;
    var barOffset = 0;

    // clear the canvas
    canvas.fillStyle = "#222";
    canvas.fillRect(0,0,width,height);

    // draw the frequency spectrum
    _.each(frequencyData, function(datum) {
        barHeight = Math.max(datum,2) / 4;

        // draw the bar
        canvas.fillStyle = self.options.themeColor;
        canvas.fillRect(barOffset, height - barHeight, barWidth, barHeight);

        // compute the offset appropriately
        barOffset = barOffset + barWidth + 4;
    });
};
/**
 * Renders the visualization.
 *
 * @method renderVisualization
 * @param canvas {Canvas} The HTML5 Canvas element to render the visualization on.
 * @param frequencyData {Array} The list of frequency data to render.
 * @param volume1 {Number} The average volume in the first channel.
 * @param volume2 {Number} The average volume in the second channel.
 */
Visualizer.prototype.renderVisualization = function(canvas, frequencyData, volume1, volume2) {
    var self = this;
    var width = self.element.width;
    var height = self.element.height;

    // clear the canvas
    canvas.fillStyle = self.options.background.fill;
    canvas.fillRect(0,0,width,height);

    // render the background image
    self.renderBackground(canvas);

    // render the frequency data
    self.renderFrequencyData(canvas,frequencyData);

    // render the volume data
    self.renderVolumeData(canvas,volume1);
    self.renderVolumeData(canvas,volume2);
};
/**
 * Renders the visualization background.
 *
 * @method renderBackground
 * @param canvas {Canvas} The HTML5 Canvas element to render the visualization on.
 */
Visualizer.prototype.renderBackground = function(canvas) {
    var self = this;
    var bg = self.options.background;

    // draw the image onto the canvas
    if (!_.isNull(bg.image)) {
        canvas.drawImage(bg.image, bg.x, bg.y, bg.width, bg.height);
    }
};
/**
 * Renders the visualizer with the provided frequency data.
 *
 * @method renderFrequencyData
 * @param canvas {Canvas} The HTML5 Canvas element to render the visualization on.
 * @param frequencyData {Array} The list of frequency data to render.
 */
Visualizer.prototype.renderFrequencyData = function(canvas,frequencyData) {
    var self = this;
    var width = self.element.width;
    var height = self.element.height;
    var barWidth = width / frequencyData.length * 2.5;
    var barHeight;
    var barOffset = 0;

    // draw the frequency spectrum
    _.each(frequencyData, function(datum) {
        barHeight = Math.max(datum,2) * 1.5;

        // draw the bar
        canvas.fillStyle = self.options.themeColor;
        canvas.shadowBlur = 10;
        canvas.shadowColor = self.options.themeColor;
        canvas.fillRect(barOffset, height * 0.5 - barHeight * 0.5, barWidth, barHeight);

        // compute the offset appropriately
        barOffset = barOffset + barWidth + 4;
    });
};
/**
 * Renders the volume data.
 *
 * @method renderVolumeData
 * @param canvas {Canvas} The HTML5 Canvas element to render the visualization on.
 * @param volume {Number} The average volume.
 */
Visualizer.prototype.renderVolumeData = function(canvas,volume) {
    var self = this;
    var width = self.element.width;
    var height = self.element.height;
    var radius = volume / 2;

    // draw the volume reactor
    canvas.beginPath();
    canvas.arc(width/2, height*0.25, radius, 0, 2 * Math.PI, false);
    canvas.lineWidth = 2;
    canvas.strokeStyle = self.options.themeColor;
    canvas.stroke();
    canvas.closePath();
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

    // update the background
    self.setBackground(
        self.options.background.source.url,
        self.options.background.fill
    );
};
/**
 * Sets the background image for the canvas.
 *
 * @method setBackground
 * @param url {String} The url of the image to set on the canvas.
 * @param fill {String} The hex for the fill color (Optional parameter).
 */
Visualizer.prototype.setBackground = function(url, fill) {
    var self = this;

    // if the url is null, then we will invalidate everything
    if (_.isNull(url)) {
        self.options.background.image = null;
        self.options.background.source = {
            width: 0,
            height: 0
        };
        self.options.background.x = 0;
        self.options.background.y = 0;
        self.options.background.width = 0;
        self.options.background.height = 0;
        self.options.background.fill = fill;
        return;
    }
    // invalidate our previous source
    self.options.background.image = null;

    // update our background image information
    self.options.background.source.url = url;

    // update our background color if one was specified here
    if (!_.isUndefined(fill)) {
        self.options.background.fill = fill;
    }
    // create our background image first
    self.options.background.image = new Image();
    self.options.background.image.src = url;
    self.options.background.image.crossOrigin = "Anonymous";

    // once the image has been loaded, we can compute how to position
    // it on the canvas for the best appearance.
    self.options.background.image.onload = function() {
        self.options.background.source.width = self.options.background.image.width;
        self.options.background.source.height = self.options.background.image.height;

        // compute the best
        $.extend(self.options.background, computeImageFit(
            self.options.background.config.scale,
            self.options.background.config.align,
            self.options.background.source.width,
            self.options.background.source.height,
            $(window).width(),
            $(window).height()
        ));
        // render the background once we've initialized everything
        self.renderBackground(self.options.canvas);

        // after all this is done, let the control panel create a blurred version of this image as its
        // background, which will be handled with this event handler
        if (!_.isNull(controlPanel)) {
            controlPanel.element.trigger("background-set", self.options.background);
        }
        // if the splash screen exists, then trigger it for the splash screen as well
        if (!_.isNull(splash)) {
            splash.element.trigger("background-set", self.options.background);
        }
    };
};
