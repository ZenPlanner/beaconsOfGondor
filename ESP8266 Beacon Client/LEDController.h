#ifndef _LEDCONTROLLER_H
#define _LEDCONTROLLER_H

#include "BeaconColor.h"
#include "BeaconFader.h"

/*

FREQUENCY
LIGHTPATTERN - SOLID, STROBE, FADE
COLORPATTERN - RANDOM, RANGE, RANDOMRANGE, LIST, RANDOMLIST
COLORS

{
 "frequency":"1000",
 "lightpattern":"solid",
 "colorpattern":"list",
 "colors: [
  "FF000000",
  "00FF0000",
  "0000FF00"]
}

*/

enum LightPattern {SOLID, STROBE, FADE};
enum ColorPattern {RANDOM, RANGE, RANDOMRANGE, LIST, RANDOMLIST, RANDOMFADE};

class LEDController {
  private:
    int frequency;
    unsigned long programTimer;
    int redPin;
    int greenPin;
    int bluePin;
    int whitePin;
    BeaconColor currentColor;
    BeaconFader currentFader;
    BeaconColor colors[64];
    LightPattern lightPattern;
    ColorPattern colorPattern;
    int colorCount;
    int currentColorIndex;
    bool fadingIn;
    BeaconColor getNextSolid();
    BeaconColor getNextStrobe();
    BeaconColor getNextListColor();
    BeaconColor getNextRandomListColor();
    BeaconColor getNextRandomColor();
    void setPins(BeaconColor color);

  public:
    LEDController(int redPin, int greenPin, int bluePin, int whitePin);
    void setProgram(int colorCount, BeaconColor colors[64], LightPattern lightPattern, ColorPattern colorPattern);
    BeaconColor getNext();
    void beaconLoop();
};

#endif
