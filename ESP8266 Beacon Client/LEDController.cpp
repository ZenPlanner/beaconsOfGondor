#include "LEDController.h"
#include <Arduino.h>

LEDController::LEDController(int redPin, int greenPin, int bluePin, int whitePin) {
  this -> redPin = redPin;
  this -> greenPin = greenPin;
  this -> bluePin = bluePin;
  this -> whitePin = whitePin;
  colorCount = 1;
  frequency = 10;
  programTimer = millis();
  colors[0] = BeaconColor::off();
  lightPattern = LightPattern::FADE;
  colorPattern = ColorPattern::LIST;
  currentColor = colors[0];
  // test Pattern
  colorCount = 4;
  colors[0] = BeaconColor(255,0,0,0);
  colors[1] = BeaconColor(0,255,0,0);
  colors[2] = BeaconColor(0,0,255,0);
  colors[3] = BeaconColor(0,0,0,255);
  setProgram(frequency, colorCount, colors, lightPattern, colorPattern);
}

void LEDController::setProgram(int frequency, int colorCount, BeaconColor colors[64], LightPattern lightPattern, ColorPattern colorPattern) {
  this -> frequency = frequency;
  if (colorCount == 0) {
    colors[0] = BeaconColor::off();
    colorCount = 1;  
  } else {
    for (int i = 0; i < colorCount; i++) {
      this -> colors[i] = colors[i];  
    }    
  }
  this -> colorCount = colorCount;
  this -> lightPattern = lightPattern;
  this -> colorPattern = colorPattern;
  switch(lightPattern) {
    case LightPattern::SOLID:
    case LightPattern::STROBE:
        currentColor = colors[0];
        currentColorIndex = colorCount;
      break;
    case LightPattern::FADE:
      currentFader = BeaconFader();
      break;
  }
}

BeaconColor LEDController::getNext() {
  BeaconColor returnColor = BeaconColor::off();
  bool changingColor = true;
  switch (lightPattern) {
    case SOLID:
      currentColor = getNextSolid();
      return currentColor;
    case STROBE:
      currentColor = getNextStrobe();
      return currentColor;
    case FADE:
      switch (colorPattern) {
        case LIST:
        case RANDOMLIST:
        case RANDOM:
          if (currentFader.isComplete()) {
            if (currentFader.off()) {
              currentFader.setDestination(getNextSolid());
            } else {
              currentFader.setDestination(BeaconColor::off());
            }
          }
          break;
        case RANGE:
        case RANDOMRANGE:
        case RANDOMFADE:
          if (currentFader.isComplete()) {
            currentFader.setDestination(getNextSolid());
          }
          break;
      }
      currentColor = currentFader.getNext();
      return currentColor;
  }
  currentColor = returnColor;
  return returnColor;
}

void LEDController::beaconLoop() {
  unsigned long currentTimer = millis();
  if (currentTimer - programTimer >= frequency) {
    setPins(getNext()); 
    programTimer = currentTimer;
  }
}

BeaconColor LEDController::getNextSolid() {
  switch (colorPattern) {
    case LIST:
    case RANGE:
      return getNextListColor();
    case RANDOMLIST:
    case RANDOMRANGE:
      return getNextRandomListColor();
    case RANDOM:
    case RANDOMFADE:
      return getNextRandomColor();
  }
  return BeaconColor::off();
}

BeaconColor LEDController::getNextStrobe() {
  if (currentColor.equals(BeaconColor::off()))
    return getNextSolid();
  else
    return BeaconColor::off();
}

BeaconColor LEDController::getNextListColor() {
  if (currentColorIndex < (colorCount - 1))
    currentColorIndex++;
  else
    currentColorIndex = 0;
  return colors[currentColorIndex];
}

BeaconColor LEDController::getNextRandomListColor() {
  currentColorIndex = random(colorCount);
  return colors[currentColorIndex];
}

BeaconColor LEDController::getNextRandomColor() {
  return BeaconColor((int) random(256),(int) random(256),(int) random(256),(int) random(256));
}

void LEDController::setPins(BeaconColor color) {
  analogWrite(redPin, color.getRed());
  analogWrite(greenPin, color.getGreen());
  analogWrite(bluePin, color.getBlue());
  analogWrite(whitePin, color.getWhite()); 
}
