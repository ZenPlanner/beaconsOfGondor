void setColorPattern() {
  boolean changingColor = false;
  if (lightPattern == "fade") {
    if (colorPattern == "range") {
      if (getIntensityAsNumber() == colors[currentColor]) {
        changingColor = true;
      }
    } else {
      if (allLightsOff()) {
        changingColor = true;
      }
    }
  } else if (lightPattern != "fade") {
    if (on) {
      changingColor = true;
    }
  }
  if (changingColor) {
    if (colorPattern == "list" && numColors > 1)  {
      if (currentColor < (numColors - 1))
        currentColor++;
      else
        currentColor = 0;
    } else if (colorPattern == "randomlist") {
      currentColor = random(numColors);
    } else if (colorPattern == "range" && numColors > 1) {
        if (currentColor < (numColors - 1))
          currentColor++;
        else
          currentColor = 0;
    } else if (colorPattern == "randomrange") {
      
    } else if (colorPattern == "random") {
      numColors = 1;
      currentColor = 0;
      colors[currentColor] = random(2147483647);
    }
  }
  if (lightPattern == "fade") {
    redRatio = ((double) getRed(colors[currentColor])) / maxIntensity;
    greenRatio = ((double) getGreen(colors[currentColor])) / maxIntensity;
    blueRatio = ((double) getBlue(colors[currentColor])) / maxIntensity;
    whiteRatio = ((double) getWhite(colors[currentColor])) / maxIntensity;
  }
}

boolean allLightsOff() {
  return currentRedIntensity <= 0 && currentGreenIntensity <= 0 && currentBlueIntensity <= 0 && currentWhiteIntensity <= 0;
}

unsigned long getIntensityAsNumber() {
  return (currentRedIntensity << 24) | (currentGreenIntensity << 16) | (currentBlueIntensity << 8) | (currentWhiteIntensity);
}

void setLightPattern() {
  if (lightPattern == "solid") {
    on = true;
    currentRedIntensity = getRed(colors[currentColor]);
    currentGreenIntensity = getGreen(colors[currentColor]);
    currentBlueIntensity = getBlue(colors[currentColor]);
    currentWhiteIntensity = getWhite(colors[currentColor]);
  } else if (lightPattern == "strobe") {
    if (on) {
      currentRedIntensity = 0;
      currentGreenIntensity = 0;
      currentBlueIntensity = 0;
      currentWhiteIntensity = 0;
      on = false;
    } else {
      currentRedIntensity = getRed(colors[currentColor]);
      currentGreenIntensity = getGreen(colors[currentColor]);
      currentBlueIntensity = getBlue(colors[currentColor]);
      currentWhiteIntensity = getWhite(colors[currentColor]);
      on = true;
    }
  } else if (lightPattern == "fade") {
    if (colorPattern == "range") {
      fade(colors[currentColor]);
    } else {
      if (currentRedIntensity <= 0 && currentGreenIntensity <= 0 && currentBlueIntensity <= 0 && currentWhiteIntensity <= 0) {
        fadingIn = true;
      } else if (
          currentRedIntensity >= getRed(colors[currentColor]) &&
          currentGreenIntensity >= getGreen(colors[currentColor]) &&
          currentBlueIntensity >= getBlue(colors[currentColor]) &&
          currentWhiteIntensity >= getWhite(colors[currentColor])
        ) {
        fadingIn = false;
      }
      if (fadingIn) {
        fade(colors[currentColor]);
      } else {
        fade(0);
      } 
    }
  }
}

void fade(unsigned long color) {
  if (currentRedIntensity > getRed(color))
    rFader = rFader - redRatio;
  else if (currentRedIntensity < getRed(color))
    rFader = rFader + redRatio;
  if (currentGreenIntensity > getGreen(color))
    gFader = gFader - greenRatio;
  else if (currentGreenIntensity < getGreen(color))
    gFader = gFader + greenRatio;
  if (currentBlueIntensity > getBlue(color))
    bFader = bFader - blueRatio;
  else if (currentBlueIntensity < getBlue(color))
    bFader = bFader + blueRatio;
  if (currentWhiteIntensity > getWhite(color))
    wFader = wFader - whiteRatio;
  else if (currentWhiteIntensity < getWhite(color))
    wFader = wFader + whiteRatio;
  if (rFader < 0) rFader = 0;
  if (rFader > 255) rFader = 255;
  if (gFader < 0) gFader = 0;
  if (gFader > 255) gFader = 255;
  if (bFader < 0) bFader = 0;
  if (bFader > 255) bFader = 255;
  if (wFader < 0) wFader = 0;    
  if (wFader > 255) wFader = 255;
  currentRedIntensity = rFader;
  currentGreenIntensity = gFader;
  currentBlueIntensity = bFader;
  currentWhiteIntensity = wFader;
}

void setPins() {
  analogWrite(redPin, currentRedIntensity);
  analogWrite(greenPin, currentGreenIntensity);
  analogWrite(bluePin, currentBlueIntensity);
  analogWrite(whitePin, currentWhiteIntensity); 
}

unsigned long getRed(unsigned long color) {
  return (color & 0xFF000000) >> 24;
}

unsigned long getGreen(unsigned long color) {
  return (color & 0x00FF0000) >> 16;
}

unsigned long getBlue(unsigned long color) {
  return (color & 0x0000FF00) >> 8;
}

unsigned long getWhite(unsigned long color) {
  return color & 0x000000FF;
}
