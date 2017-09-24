function playOrPause(e) {
    updateAudioManager(e);    
    var className = e.getAttribute("class");
    if(className=="fa fa-play") {
        e.className = "fa fa-pause";
        activeAudio.play();
    }
    else {
        e.className = "fa fa-play";
        activeAudio.pause();
    }
}

function stop(e) {
    updateAudioManager(e);
    // Keep the play button mode in a consistent state - if stop then play button should show play icon.
    var playBtnInPauseMode = $(e).siblings(".fa-pause")[0];
    if (playBtnInPauseMode !== undefined) {
        $(playBtnInPauseMode).removeClass("fa-pause");
        $(playBtnInPauseMode).addClass("fa-play");
    }
    activeAudio.stop();
}

function loopToggle(e) {
    updateAudioManager(e); 
    var styleColor = e.style.color;
    if (styleColor === 'deepskyblue') {
        e.style.color = 'lightgrey';
        activeAudio.setLoop(false);
    } else {                
        e.style.color = 'deepskyblue'; 
        activeAudio.setLoop(true);
    }
    
}

function setSpeed(e) {
    updateAudioManager(e); 
    var width = $(e).innerWidth();
    var circleElem = $(e).children(".audio-circle")[0];
    var circleDia = $(circleElem).innerWidth(); 
    var circleRadius = circleDia / 2; 
    var x = e.onclick.arguments["0"].offsetX;
    
    var xInterval = intervalRes(width,circleRadius,10,x);
    var speed = correlate(width,circleRadius,xInterval);

    $(e).siblings(".audio-speed")[0].innerHTML = speed;          
    $(circleElem).css('left', xInterval-circleRadius);
    activeAudio.setSpeed(speed);
}

function intervalRes(rangeWidth,margin,numIntevals,x) { 
    var intervalWidth = (rangeWidth - margin * 2) / numIntevals; 
    var pos = Math.round((x - margin) / intervalWidth); 
    return Math.round(pos * intervalWidth) + margin; 
}

function correlate(rangeWidth,margin,xInterval) {
    var p = xInterval / (rangeWidth - (margin * 2));
    var base = 0.5;
    return round1(base + p);
}

function updateAudioManager(e) {
    var audioElement = $(e).parent(); // Audio element is the parent element where, class="audio"
    var id = $(audioElement).attr("id");
    var tuneName = $(audioElement).attr("data-tune");
    activeAudio.init(id,audioElement,tuneName,reset);
}

// When changing to another tune on the web page just put the last one back to it's original state.
function reset(audioElement) {
    var holder = $(audioElement).children(".audio-holder")[0];
    // play button
    var ela = $(audioElement).children(".fa-pause")[0];
    if (ela !== undefined) {
        $(ela).removeClass("fa-pause");
        $(ela).addClass("fa-play");
    }

    // loop button
    var elb = $(audioElement).children(".fa-repeat")[0];
    if (elb !== undefined) {
        elb.style.color = 'deepskyblue';
    }

    var elc = $(holder).children(".audio-circle")[0];
    $(elc).css('left',"4.6em");
    $(audioElement).children(".audio-speed")[0].innerHTML = 1;
}

function togglePlayButton(audioElement,oldPlayingState) {           
    var oldClass, newClass;
    if (oldPlayingState === true) {
        oldClass = "fa-pause";  // When playing the pause button shown.
        newClass = "fa-play";
    } else {
        oldClass = "fa-play";  
        newClass = "fa-pause";
    }

    // play button
    var ela = $(audioElement).children("."+oldClass)[0];
    if (ela !== undefined) {
        $(ela).removeClass(oldClass);
        $(ela).addClass(newClass);
    }
}

function unloadAudio() {
    activeAudio.unloadSound();
}



function round1(x) {
    return Math.round(x * 10) / 10;
}

function AudioMgr() {
    this.id = -1;
    this.audioElement; // parent element. 
    this.tune;
    this.speed = 1;
    this.loop = true;
    this.playing = false;
    this.sound = null;
    this.soundId = null;
    this.soundSeekPos = null;

    this.init = function(id,audioElement,tune,reset) {
        if (this.id !== id) {                  
            if (this.id !== -1) {                        
                this.unloadSound(); 
                reset(this.audioElement);    
            }
            this.speed = 1;
            this.loop = true;                    
            this.id = id;
            this.audioElement = audioElement;
            this.tune = tune;
            this.playing = false;
            this.started = false;
            this.sound = null;
            this.soundId = null;
            this.soundSeekPos = null;
        }
    }

    this.setupSound = function() {
        // See: https://github.com/goldfire/howler.js/blob/master/examples/player/player.js
        this.sound = new Howl({
            src:[this.tune],
            html5: true,
            loop: this.loop,   
            rate: this.speed  // The rate of playback. 0.5 to 4.0, with 1.0 being normal speed.  
        });                       
    } 

    this.unloadSound = function() {
        if (this.sound !== null) {
            this.sound.unload();
            this.sound = null;
        }
    }

    this.play = function() {
        if (this.soundId === null) {
            this.setupSound();
            this.soundId = this.sound.play();                                       
        } else {
            this.sound.seek(this.soundSeekPos,this.soundId)
            this.sound.play(this.soundId);
        }
        this.playing = true;
    }

    this.pause = function() {
        this.playing = false;
        this.sound.pause();
        this.soundSeekPos = this.sound.seek(this.soundId);
    }

    this.stop = function() {
        this.playing = false;        
        if (this.sound !== null) {
            this.sound.stop();
            this.soundSeekPos = this.sound.seek(this.soundId); 
        }
    }

    this.togglePlay = function() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    }

    this.setSpeed = function(speed) {
        this.speed = speed;
        if(this.soundId != null) {
            this.sound.rate(this.speed,this.soundId);
            if (this.playing) {                    
                this.pause();                   
                this.sound.play(this.soundId);
            }
        } 
    }

    this.setLoop = function(loop) {
        this.loop = loop;
        console.log("loop " + loop);        
    }
}