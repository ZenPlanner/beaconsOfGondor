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
            state: 'on',
            lightPattern: 'fade',
            colorPattern: 'list',
            colors: [0xFF000000],
            numColors: 1,
            currentColor: 0,
            fadingIn: true
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

    static hexStringToInt(hex) {
        var result = /^#?([a-f\d]{2}[a-f\d]{2}[a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
        var hexString = result[1] + ((result[2] != null) ? result[4] : '00');
        return parseInt(hexString, 16);
    };

    //Gets a random int between [min, max). The minimum is inclusive and the maximum is exclusive
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

    // set the colors on a new call
    setCurrentColors(hexColor) {
        var colorMap = LEDController.hexToRgb(hexColor);
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
        if (this.current.state === 'red') {
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
        if (this.current.state === 'green') {
            return this.setReturnValue(LEDController.getRandomInt(0, 255), 0, 0, 0, 'red');
        } else {
            return this.setReturnValue(0, LEDController.getRandomInt(0, 255), 0, 0, 'green');
        }
    }

    goParty() {
        return this.setReturnValue(LEDController.getRandomInt(0, this.current.r), LEDController.getRandomInt(0, this.current.g), LEDController.getRandomInt(0, this.current.b), LEDController.getRandomInt(0, this.current.w), 'party');
    }

    goRandom() {
        if (this.current.state === 'on') {
            return this.setReturnValue(0, 0, 0, 0, 'off');
        } else {
            return this.setReturnValue(LEDController.getRandomInt(0, this.current.r), LEDController.getRandomInt(0, this.current.g), LEDController.getRandomInt(0, this.current.b), LEDController.getRandomInt(0, this.current.w), 'on');
        }
    }

    goRandomFade() {
        if (this.current.r === this.current.g === this.current.b === this.current.w === 0) {
            return this.setReturnValue(LEDController.getRandomInt(0, this.current.fader.r), LEDController.getRandomInt(0, this.current.fader.g), LEDController.getRandomInt(0, this.current.fader.b), LEDController.getRandomInt(0, this.current.fader.w));
        }
        if (this.current.state === 'on') {
            return this.fadeIn();
        } else {
            return this.fadeOut();
        }

    }

    goRainbow() {
        if (this.current === undefined || this.current.state === undefined) {
            this.current.state = 'white';
        }
        switch (this.current.state) {
            case 'red':
                return this.setReturnValue(226, 87, 30, 0, 'orangeish');
            case 'orangeish':
                return this.setReturnValue(255, 87, 127, 0, 'orange');
            case 'orange':
                return this.setReturnValue(255, 255, 0, 0, 'yellow');
            case 'yellow':
                return this.setReturnValue(0, 255, 0, 0, 'green');
            case 'green':
                return this.setReturnValue(150, 191, 51, 0, 'somegreen');
            case 'somegreen':
                return this.setReturnValue(0, 0, 255, 0, 'blue');
            case 'blue':
                return this.setReturnValue(75, 0, 130, 0, 'indigo');
            case 'indigo':
                return this.setReturnValue(139, 0, 255, 0, 'violet');
            case 'violet':
                return this.setReturnValue(0, 0, 0, 255, 'white');
            case 'white':
                return this.setReturnValue(255, 0, 0, 0, 'red');
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
            case 'rainbow':
                retVal = this.goRainbow();
                break;
        }
        return retVal;
    };

    setLightPattern() {
        if (this.current.lightPattern === "solid") {
            this.current.state = 'on';
            this.setIntensity(
                LEDController.getRed(this.current.colors[this.current.currentColor]),
                LEDController.getGreen(this.current.colors[this.current.currentColor]),
                LEDController.getBlue(this.current.colors[this.current.currentColor]),
                LEDController.getWhite(this.current.colors[this.current.currentColor])
            );
        } else if (this.current.lightPattern === "strobe") {
            if (this.current.state === 'on') {
                this.setIntensity(0,0,0,0);
                this.current.state = 'off';
            } else {
                this.setIntensity(
                    LEDController.getRed(this.current.colors[this.current.currentColor]),
                    LEDController.getGreen(this.current.colors[this.current.currentColor]),
                    LEDController.getBlue(this.current.colors[this.current.currentColor]),
                    LEDController.getWhite(this.current.colors[this.current.currentColor])
                );
                this.current.state = 'on';
            }
        } else if (
            (this.current.colorPattern === 'range' || this.current.colorPattern === 'randomrange')
            && this.current.lightPattern === 'fade'
        ) {
            if (this.current.r < LEDController.getRed(this.current.colors[this.current.currentColor]))
                this.current.fader.r = this.current.fader.r + this.current.fader.rRatio;
            else if (this.current.r > LEDController.getRed(this.current.colors[this.current.currentColor]))
                this.current.fader.r = this.current.fader.r - this.current.fader.rRatio;
            if (this.current.g < LEDController.getGreen(this.current.colors[this.current.currentColor]))
                this.current.fader.g = this.current.fader.g + this.current.fader.gRatio;
            else if (this.current.g > LEDController.getGreen(this.current.colors[this.current.currentColor]))
                this.current.fader.g = this.current.fader.g - this.current.fader.gRatio;
            if (this.current.b < LEDController.getBlue(this.current.colors[this.current.currentColor]))
                this.current.fader.b = this.current.fader.b + this.current.fader.bRatio;
            else if (this.current.b > LEDController.getBlue(this.current.colors[this.current.currentColor]))
                this.current.fader.b = this.current.fader.b - this.current.fader.bRatio;
            if (this.current.w < LEDController.getWhite(this.current.colors[this.current.currentColor]))
                this.current.fader.w = this.current.fader.w + this.current.fader.wRatio;
            else if (this.current.w > LEDController.getWhite(this.current.colors[this.current.currentColor]))
                this.current.fader.w = this.current.fader.w - this.current.fader.wRatio;
            this.setIntensity(this.current.fader.r, this.current.fader.g, this.current.fader.b, this.current.fader.w);
        } else if (this.current.lightPattern === "fade") {
            if (this.current.fader.r <= 0 && this.current.fader.g <= 0 && this.current.fader.b <= 0 && this.current.fader.w <= 0) {
                this.current.fadingIn = true;
            } else if (
                this.current.fader.r >= LEDController.getRed(this.current.colors[this.current.currentColor]) &&
                this.current.fader.g >= LEDController.getGreen(this.current.colors[this.current.currentColor]) &&
                this.current.fader.b >= LEDController.getBlue(this.current.colors[this.current.currentColor]) &&
                this.current.fader.w >= LEDController.getWhite(this.current.colors[this.current.currentColor])) {
                this.current.fadingIn = false;
            }
            if (this.current.fadingIn) {
                if (this.current.fader.r < LEDController.getRed(this.current.colors[this.current.currentColor]))
                    this.current.fader.r = this.current.fader.r + this.current.fader.rRatio;
                if (this.current.fader.g < LEDController.getGreen(this.current.colors[this.current.currentColor]))
                    this.current.fader.g = this.current.fader.g + this.current.fader.gRatio;
                if (this.current.fader.b < LEDController.getBlue(this.current.colors[this.current.currentColor]))
                    this.current.fader.b = this.current.fader.b + this.current.fader.bRatio;
                if (this.current.fader.w < LEDController.getWhite(this.current.colors[this.current.currentColor]))
                    this.current.fader.w = this.current.fader.w + this.current.fader.wRatio;
            } else {
                if (this.current.fader.r > 0) {
                    this.current.fader.r = this.current.fader.r - this.current.fader.rRatio;
                    if (this.current.fader.r < 0) this.current.fader.r = 0;
                }
                if (this.current.fader.g > 0) {
                    this.current.fader.g = this.current.fader.g - this.current.fader.gRatio;
                    if (this.current.fader.g < 0) this.current.fader.g = 0;
                }
                if (this.current.fader.b > 0) {
                    this.current.fader.b = this.current.fader.b - this.current.fader.bRatio;
                    if (this.current.fader.b < 0) this.current.fader.b = 0;
                }
                if (this.current.fader.w > 0) {
                    this.current.fader.w = this.current.fader.w - this.current.fader.wRatio;
                    if (this.current.fader.w < 0) this.current.fader.w = 0;
                }
            }
            this.setIntensity(this.current.fader.r, this.current.fader.g, this.current.fader.b, this.current.fader.w);
        }
    }

    setIntensity(r, g, b, w) {
        this.current.r = Math.floor(r);
        this.current.g = Math.floor(g);
        this.current.b = Math.floor(b);
        this.current.w = Math.floor(w);
    }

    setColorPattern() {
        let changingColor = false;
        if ((this.current.colorPattern === 'range' || this.current.colorPattern === 'randomrange') && this.current.lightPattern === 'fade') {
            if (this.current.r === LEDController.getRed(this.current.colors[this.current.currentColor]) &&
                this.current.g === LEDController.getGreen(this.current.colors[this.current.currentColor]) &&
                this.current.b === LEDController.getBlue(this.current.colors[this.current.currentColor]) &&
                this.current.w === LEDController.getWhite(this.current.colors[this.current.currentColor])) {
                changingColor = true;
            }
        }
        if (this.current.lightPattern === "fade") {
            if (this.current.fader.r <= 0 &&
                this.current.fader.g <= 0 &&
                this.current.fader.b <= 0 &&
                this.current.fader.w <= 0) {
                changingColor = true;
            }
        } else {
            if (this.current.state === "on") {
                changingColor = true;
            }
        }
        if (changingColor) {
            if (this.current.colorPattern === "list" && this.current.numColors > 1) {
                if (this.current.currentColor < (this.current.numColors - 1))
                    this.current.currentColor++;
                else
                    this.current.currentColor = 0;
            } else if (this.current.colorPattern === "randomlist") {
                this.current.currentColor = Math.floor(Math.random() * this.current.numColors);
            } else if (this.current.colorPattern === "range") {
                if (this.current.currentColor < (this.current.numColors - 1))
                    this.current.currentColor++;
                else
                    this.current.currentColor = 0;
                this.current.fader.rRatio = Math.abs((this.current.r - LEDController.getRed(this.current.colors[this.current.currentColor])) / 255);
                this.current.fader.gRatio = Math.abs((this.current.g - LEDController.getGreen(this.current.colors[this.current.currentColor])) / 255);
                this.current.fader.bRatio = Math.abs((this.current.b - LEDController.getBlue(this.current.colors[this.current.currentColor])) / 255);
                this.current.fader.wRatio = Math.abs((this.current.w - LEDController.getWhite(this.current.colors[this.current.currentColor])) / 255);
            } else if (this.current.colorPattern === "randomrange") {
                this.current.currentColor = Math.floor(Math.random() * this.current.numColors);
                this.current.fader.rRatio = Math.abs((this.current.r - LEDController.getRed(this.current.colors[this.current.currentColor])) / 255);
                this.current.fader.gRatio = Math.abs((this.current.g - LEDController.getGreen(this.current.colors[this.current.currentColor])) / 255);
                this.current.fader.bRatio = Math.abs((this.current.b - LEDController.getBlue(this.current.colors[this.current.currentColor])) / 255);
                this.current.fader.wRatio = Math.abs((this.current.w - LEDController.getWhite(this.current.colors[this.current.currentColor])) / 255);
            } else if (this.current.colorPattern === "random") {
                this.current.numColors = 1;
                this.current.currentColor = 0;
                this.current.colors[this.current.currentColor] = Math.random() * 2147483647;
            }
            if (this.current.lightPattern === 'fade' && this.current.colorPattern !== 'range' && this.current.colorPattern !== 'randomrange') {
                this.current.fader.rRatio = LEDController.getRed(this.current.colors[this.current.currentColor]) / 255;
                this.current.fader.gRatio = LEDController.getGreen(this.current.colors[this.current.currentColor]) / 255;
                this.current.fader.bRatio = LEDController.getBlue(this.current.colors[this.current.currentColor]) / 255;
                this.current.fader.wRatio = LEDController.getWhite(this.current.colors[this.current.currentColor]) / 255;

            }
        }
    }

    getPinSettingsFromProgram() {
        this.setColorPattern();
        this.setLightPattern();
        return this.current;
    }

    setProgram(data) {
        this.current.frequency = data.frequency;
        this.current.lightPattern = data.lightPattern;
        this.current.colorPattern = data.colorPattern;
        const receivedColors = data.colors;
        for (let i = 0; i < receivedColors.length; i++) {
            this.current.colors[i] = receivedColors[i];
            this.current.numColors = i + 1;
        }
        this.current.fader.r = 0;
        this.current.fader.g = 0;
        this.current.fader.b = 0;
        this.current.fader.w = 0;
        this.current.fadingIn = true;
        this.current.currentColor = this.current.numColors - 1;
        this.current.r = LEDController.getRed(this.current.colors[this.current.currentColor]);
        this.current.g = LEDController.getGreen(this.current.colors[this.current.currentColor]);
        this.current.b = LEDController.getBlue(this.current.colors[this.current.currentColor]);
        this.current.w = LEDController.getWhite(this.current.colors[this.current.currentColor]);
        this.current.fader.rRatio = LEDController.getRed(this.current.colors[this.current.currentColor]) / 255;
        this.current.fader.gRatio = LEDController.getGreen(this.current.colors[this.current.currentColor]) / 255;
        this.current.fader.bRatio = LEDController.getBlue(this.current.colors[this.current.currentColor]) / 255;
        this.current.fader.wRatio = LEDController.getWhite(this.current.colors[this.current.currentColor]) / 255;
    }

    static getRed(color) {
        return (color >> 24) & 0x000000FF;
    }

    static getGreen(color) {
        return (color >> 16) & 0x000000FF;
    }

    static getBlue(color) {
        return (color >> 8) & 0x000000FF;
    }

    static getWhite(color) {
        return (color & 0x000000FF);
    }
}

module.exports = LEDController;
