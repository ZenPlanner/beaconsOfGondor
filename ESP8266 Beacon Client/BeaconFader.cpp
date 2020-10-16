#include "BeaconFader.h"
#include "BeaconColor.h"

BeaconFader::BeaconFader() {
  init(BeaconColor::off(), BeaconColor::off());  
}

BeaconFader::BeaconFader(BeaconColor sourceColor, BeaconColor destinationColor) {
  init(sourceColor, destinationColor);
}

void BeaconFader::init(BeaconColor sourceColor, BeaconColor destinationColor) {
  this -> sourceColor = sourceColor;
  this -> destinationColor = destinationColor;
  red = sourceColor.getRed();
  green = sourceColor.getGreen();
  blue = sourceColor.getBlue();
  white = sourceColor.getWhite();
  rRatio = ((sourceColor.getRed() - destinationColor.getRed())/255) * -1;
  gRatio = ((sourceColor.getGreen() - destinationColor.getGreen())/255) * -1;
  bRatio = ((sourceColor.getBlue() - destinationColor.getBlue())/255) * -1;
  wRatio = ((sourceColor.getWhite() - destinationColor.getWhite())/255) * -1;
}

bool BeaconFader::isComplete() {
  return getCurrentColor().equals(destinationColor);
}

BeaconColor BeaconFader::getNext() {
  red = red + rRatio;
  green = green + gRatio;
  blue = blue + bRatio;
  white = white + wRatio;
  normalize();
  return getCurrentColor();
}

void BeaconFader::normalize() {
  if (red > 255) red = 255;
  if (red < 0) red = 0;
  if (green > 255) green = 255;
  if (green < 0) green = 0;
  if (blue > 255) blue = 255;
  if (blue < 0) blue = 0;
  if (white > 255) white = 255;
  if (white < 0) white = 0;
}

BeaconColor BeaconFader::getCurrentColor() {
  return BeaconColor(red, green, blue, white);
}

void BeaconFader::setDestination(BeaconColor destination) {
  init(getCurrentColor(), destination);
}

bool BeaconFader::off() {
  return getCurrentColor().equals(BeaconColor::off());
}
