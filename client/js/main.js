$(window).on("load", function() {
    var context = new AudioContext();
    var analyser = context.createAnalyser();
    
    var audio = new Audio();
    audio.src = "resources/playlists/ety/Infectious.mp3";
    audio.controls = true;
    audio.autoplay = true;
    audio.loop = true;

    var source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
});