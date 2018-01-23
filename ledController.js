class LEDController {

    constructor () {
        this.current = {
            fader: {
                r:0,
                g:0,
                b:0,
                w:0,
                rRatio: 1,
                gRatio: 1,
                bRatio: 1,
                wRatio: 1
            },
            r: 0,
            g: 0,
            b: 0,
            w: 0,
            pattern: 'normal',
            frequency: 100,
            state: 'on'
        };
    };

    // Converts a 6-8 digit hex string to rgbw colors
    static hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            w: (result[4] != null) ? parseInt(result[4], 16) : 0
        } : null;
    };

    //Gets a random int between [min, max). The minimum is inclusive and the maximum is exclusive
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

    // set the colors on a new call
    setCurrentColors(hexColor) {
        var colorMap = this.hexToRgb(hexColor);
        this.current.r = colorMap.r;
        this.current.g = colorMap.g;
        this.current.b = colorMap.b;
        this.current.w = colorMap.w;
        this.current.fader.r = colorMap.r;
        this.current.fader.g = colorMap.g;
        this.current.fader.b = colorMap.b;
        this.current.fader.w = colorMap.w;
        this.current.fader.rRatio = colorMap.r / 255;
        this.current.fader.gRatio = colorMap.g / 255;
        this.current.fader.bRatio = colorMap.b / 255;
        this.current.fader.wRatio = colorMap.w / 255;
        return this.current;
    };

    fadeIn() {
        if (this.current.r < this.current.fader.r)
            this.current.r = this.current.r + (this.current.fader.rRatio);
        if (this.current.g < this.current.fader.g)
            this.current.g = this.current.g + (this.current.fader.gRatio);
        if (this.current.b < this.current.fader.b)
            this.current.b = this.current.b + (this.current.fader.bRatio);
        if (this.current.w < this.current.fader.w)
            this.current.w = this.current.w + (this.current.fader.wRatio);
        if (this.current.r >= this.current.fader.r &&
            this.current.g >= this.current.fader.g &&
            this.current.b >= this.current.fader.b &&
            this.current.w >= this.current.fader.w) {
            this.current.state = 'off'; // start fading out
        }
        return this.current;
    };

    fadeOut() {
        if (this.current.r > 0)
            this.current.r = this.current.r - (this.current.fader.rRatio);
        if (this.current.g > 0)
            this.current.g = this.current.g - (this.current.fader.gRatio);
        if (this.current.b > 0)
            this.current.b = this.current.b - (this.current.fader.bRatio);
        if (this.current.w > 0)
            this.current.w = this.current.w - (this.current.fader.wRatio);
        if (this.current.r <= 0 && this.current.g <= 0 &&
            this.current.b <= 0 && this.current.w <= 0)
            this.current.state = 'on'; // start fading in
        return this.current;
    };

    setReturnValue(r,g,b,w,state) {
        this.current.state = state;
        var retVal = {};
        retVal.r = r;
        retVal.g = g;
        retVal.b = b;
        retVal.w = w;
        return retVal;
    };

    goNormal() {
        return this.setReturnValue(this.current.r, this.current.g, this.current.b, this.current.w, 'normal');
    }

    goStrobe() {
        if (this.current.state === 'on') {
            return this.setReturnValue(0, 0, 0, 0, 'off');
        } else {
            return this.setReturnValue(this.current.r, this.current.g, this.current.b, this.current.w, 'on');
        }
    }

    goOutage() {
        if (this.current.state == 'red') {
            return this.setReturnValue(255, 60, 0, 0, 'yellow');
        } else {
            return this.setReturnValue(255, 0, 0, 0, 'red');
        }
    }

    goFade() {
        if (this.current.state === 'on') {
            return this.fadeIn();
        } else {
            return this.fadeOut();
        }

    }

    goChristmas() {
        if (this.current.state == 'green') {
            return this.setReturnValue(this.getRandomInt(0, 255), 0, 0, 0, 'red');
        } else {
            return this.setReturnValue(0, this.getRandomInt(0, 255), 0, 0, 'green');
        }
    }

    goParty() {
        return this.setReturnValue(this.getRandomInt(0, this.current.r), this.getRandomInt(0, this.current.g), this.getRandomInt(0, this.current.b), this.getRandomInt(0, this.current.w), 'party');
    }

    goRandom() {
        if (this.current.state === 'on') {
            return this.setReturnValue(0, 0, 0, 0, 'off');
        } else {
            return this.setReturnValue(this.getRandomInt(0, this.current.r), this.getRandomInt(0, this.current.g), this.getRandomInt(0, this.current.b), this.getRandomInt(0, this.current.w), 'on');
        }
    }

    goRandomFade() {
        if (this.current.r === this.current.g === this.current.b === this.current.w === 0) {
            return this.setReturnValue(this.getRandomInt(0, this.current.fader.r), this.getRandomInt(0, this.current.fader.g), this.getRandomInt(0, this.current.fader.b), this.getRandomInt(0, this.current.fader.w));
        }
        if (this.current.state === 'on') {
            return this.fadeIn();
        } else {
            return this.fadeOut();
        }

    }

    getPinSettings() {
        var retVal = {};
        switch (this.current.pattern) {
            case 'normal':
                retVal = this.goNormal();
                break;
            case 'strobe':
                retVal = this.goStrobe();
                break;
            case 'outage':
                retVal = this.goOutage();
                break;
            case 'fade':
                retVal = this.goFade();
                break;
            case 'christmas':
                retVal = this.goChristmas();
                break;
            case 'party':
                retVal = this.goParty();
                break;
            case 'randomfade':
                retVal = this.goRandomFade();
                break;
            case 'random':
                retVal = this.goRandom();
                break;
        }
        return retVal;
    };
};

module.exports = LEDController;
