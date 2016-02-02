
var walletScreen = (function(){
    'use strict'

    var g = {};

    /**
     * single bullet
     * @param options
     * @constructor
     */
    var Bullet = function(options){

        options = options || {};
        this.json = options.json;
        this.speed = g.speed || 100;       //bullet speed, the unit is px/s
        this.initPos = 0;                  //initial display position
        this.destPos = 0;                  //destination position
        this.length = 0;                   //the length of the bullet
        this.startPos = 0;                 //start position of the bullet. When stopped, the start position is set to the stopped position for the next start.
        this.track = null;                 //the track that the bullet belongs to
        this.wholeDisplay = false;         //flag indicates if the bullet has entirely displayed in the screen
        this.finished = false;             //flag indicates if the bullet life cycle has finished
        this.wholeDisplayTimer = null;     //the js timer for bullet to display entirely
        this.finishTimer = null;           //the js timer for bullet to finish

    };

    /**
     * render html
     * @return {Element|*|ele} return the html element of current bullet
     */
    Bullet.prototype.render = function(){

        var ele = document.createElement('div');
        ele.className = 'bullet-item';
        ele.style.position = 'absolute';
        ele.style.height = 'auto';
        ele.style.width = 'auto';
        ele.style.whiteSpace = 'nowrap';
        ele.style.padding = '0 20px';
        ele.style.left = this.startPos + 'px';
        ele.innerHTML = this.json.text;
        this.element = ele;
        return this.element;

    };

    /**
     * start and run the animation of the bullet
     */
    Bullet.prototype.fly = function(){

        var flyTime = (this.startPos - this.destPos)/this.speed,
            that = this;

        this.element.style.transition = 'all '+flyTime+'s linear';
        this.element.style.left = this.destPos  + 'px';

        if(!this.wholeDisplay){
            var displayTime = (this.length + this.startPos - this.initPos)/this.speed;
            if(displayTime >= 0){
                this.wholeDisplayTimer = setTimeout(function(){
                    that.onWholeDisplay();
                }, displayTime * 1000);
            }
        }

        if(!this.finished){
            this.finishTimer = setTimeout(function(){
                that.onFinish();
            }, flyTime * 1000);
        }

    };

    /**
     * pause the animation of the bullet
     */
    Bullet.prototype.pause = function(){

        var computedStyle = window.getComputedStyle(this.element);
        var curPos = computedStyle.getPropertyValue('left');

        this.element.style.transition = null;
        this.element.style.left = curPos;
        this.startPos = parseInt(curPos);

        clearTimeout(this.wholeDisplayTimer);
        clearTimeout(this.finishTimer);

    };

    /**
     * remove the bullet element from page
     */
    Bullet.prototype.remove = function(){

        if(this.element){
            this.element.parentNode.removeChild(this.element);
        }

    };

    /**
     * the method to execute when the entire bullet body has displayed
     */
    Bullet.prototype.onWholeDisplay = function(){

        this.wholeDisplay = true;
        if(this.track){
            this.track.onIdle(this);
        }

    };

    /**
     * the method to execute when the bullet has finished its life cycle
     */
    Bullet.prototype.onFinish = function(){

        this.finished = true;
        this.remove();
        if(this.track){
            this.track.onBulletFinish(this);
        }

    };

    /**
     * the track of the bullet
     * @param options
     * @constructor
     */
    var Track = function(options){

        this.id = options.id;          //id of the track
        this.status = 'idle';          //status of the track. 'idle' or 'busy'
        this.length = options.length;  //length of the track. ie. the width of the Screen
        this.bulletList = [];          //the bullets belongs to this track
        this.hoverStop = true;         //flag indicates if the bullets of this track stop animation when the mouse hovers the track
        this.screen = options.screen;            //screen that the track belongs to

    };

    /**
     * render html element of the Track and add track event listener
     * @return {Element}
     */
    Track.prototype.render = function(){

        var ele = document.createElement('li');
        ele.className = 'bullet-track';
        ele.style.position = 'relative';
        ele.id = 'bullet-track-' + this.id;

        this.element = ele;

        if(this.hoverStop){
            this.addHoverListener();
        }

        return ele;

    };

    /**
     * add bullet to the track
     * @param b
     */
    Track.prototype.addBullet = function(b){

        var trackLength = this.length,
            bulletLength;

        //  set the properties of this track
        this.status = 'busy';
        this.bulletList.push(b);

        //  set bullet's init position and add the bullet to track
        b.startPos = b.initPos = this.length * 2;
        this.element.appendChild(b.render());
        bulletLength = b.element.clientWidth;

        //  set other properties to the bullet
        b.destPos = trackLength - bulletLength;
        b.length = bulletLength;
        b.track = this;

        //  kick off!
        b.fly();

    };

    /**
     * method executes when the track becomes idle. ie. the last bullet has entirely displayed and the track is ready for new bullet.
     * @param bullet ths last bullet
     */
    Track.prototype.onIdle = function(bullet){

        this.status = 'idle';
        this.screen.provideBulletToTrack(this);

    };

    /**
     * method executes when the each bullet finished its life cycle
     * @param bullet the bullet finished its life cycle
     */
    Track.prototype.onBulletFinish = function(bullet){
        var index = this.bulletList.indexOf(bullet);
        if(index >= 0){
            this.bulletList.splice(index, 1);
        }
    }

    /**
     * pause the animations all the bullets of this track
     */
    Track.prototype.pauseAllBullet = function(){

        this.bulletList.forEach(function(bullet, index, arr){
            bullet.pause();
        });

    };

    /**
     * resume the animations of all the bullets of this track
     */
    Track.prototype.resumeAllBullet = function(){

        this.bulletList.forEach(function(bullet, index, arr){
            bullet.fly();
        });

    };

    /**
     * add hover listener
     */
    Track.prototype.addHoverListener = function(){

        var that = this;
        this.element.addEventListener('mouseenter', function(e){
            that.pauseAllBullet();
            e.stopPropagation();
        });
        this.element.addEventListener('mouseleave', function(e){
            that.resumeAllBullet();
            e.stopPropagation();
        });

    };


    /**
     * the Bullet Screen class
     * @param options
     * @constructor
     */
    var Screen = function(options){

        options = options || {};
        this.elementId = options.elementId;                       //the elementId to build the screen
        this.element = document.getElementById(this.elementId);   //the element to build the screen
        this.width = this.element.clientWidth;                    //width of the element to build the screen

        this.trackCount = options.trackCount || 3;                //track count

        this._trackList = [];                                     //track list
        this._bulletList = [];                                    //bullet list to queue bullet

        //  initialize the track data
        for(var i=0; i<this.trackCount; i++){
            var track = new Track({id: i, length: this.width, screen: this});
            this._trackList.push(track);
        }

        //  initialize the bullet data
        var bullets = options.initData;
        if(bullets){
            for(var i=0; i<bullets.length; i++){
                this._bulletList.push(new Bullet({json: bullets[i]}));
            }
        }

    };

    /**
     * render the screen element of page
     * @return {Element|*}
     */
    Screen.prototype.render = function(){

        var wrap = '' +
            '<div style="position:relative;width:100%;height:100%;">' +
            '<div class="screen-bg" style="position:absolute;left:0;right:0;bottom:0;top:0;"></div>' +
            '<div class="screen-content" style="position:absolute;left:-' + this.width + 'px;right:-' + this.width + 'px;bottom:0;top:0;">' +
            '<ul id="ulTrackList" class="track-list" style="list-style:none;width:100%;overflow:hidden;">' +
            '</ul>' +
            '</div>' +
            '</div>';

        this.element.innerHTML = wrap;
        var eleTrackList = document.getElementById('ulTrackList');

        for(var i=0; i<this._trackList.length; i++){
            eleTrackList.appendChild(this._trackList[i].render());
        }

        return this.element;

    };

    /**
     * add the bullet to bullet list when received from back end or other ways
     * @param bullets single bullet or bullet array to add to bullet list
     */
    Screen.prototype.add = function(bullets){

        if(!bullets)
            return;

        if(Object.prototype.toString.call(bullets) === '[object Array]'){

            for(var i=0; i<bullets.length; i++){
                this._bulletList.push(new Bullet({json: bullets[i]}));
            }
            this.checkTrack();

        }else if(typeof bullets === 'object'){

            this._bulletList.push(new Bullet({json: bullets}));
            this.checkTrack();

        }

    };

    /**
     * add bullet to track. this method is for idle track to call and fetch bullet
     * @param track
     */
    Screen.prototype.provideBulletToTrack = function(track){

        if(this._bulletList.length === 0)
            return;
        if(track){
            track.addBullet(this._bulletList.shift());
        }

    };

    /**
     * check if there is some idle track to receive bullet.
     * this method is called when new bullet arrived to front end
     */
    Screen.prototype.checkTrack = function(){

        if(this._bulletList.length === 0)
            return;

        for(var i=0; i<this._trackList.length; i++){
            var curTrack = this._trackList[i];
            if('idle' === curTrack.status){
                var bullet = this._bulletList.shift();
                if(!bullet)
                    break;
                curTrack.addBullet(bullet);
            }
        }

    };

    Screen.prototype.start = function(){

        this.render();
        this.checkTrack();

    };

    return {
        init: function(options){
            if(options.speed){
                g.speed = parseInt(options.speed);
            }
            g.sc = new Screen(options);

            g.sc.start();
        },
        add: function(bullets){
            g.sc.add(bullets);
        }
    }
}());
