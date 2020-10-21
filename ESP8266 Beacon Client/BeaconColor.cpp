#include "BeaconColor.h"

BeaconColor::BeaconColor() {
  red = 0;
  green = 0;
  blue = 0;
  white = 0;
}

BeaconColor::BeaconColor(int red, int green, int blue, int white) {
  this -> red = red;
  this -> green = green;
  this -> blue = blue;
  this -> white = white;
}

BeaconColor::BeaconColor(double red, double green, double blue, double white) {
  this -> red = round(red);
  this -> green = round(green);
  this -> blue = round(blue);
  this -> white = round(white);
}

bool BeaconColor::equals(BeaconColor color) {
  return color.getRed() == red && 
         color.getGreen() == green && 
         color.getBlue() == blue && 
         color.getWhite() == white;
}

BeaconColor BeaconColor::off() {
  return BeaconColor(0,0,0,0);
}

void BeaconColor::setRed(int red) {
  this -> red = red;
}

int BeaconColor::getRed() {
  return red;
}

void BeaconColor::setGreen(int green) {
  this -> green = green;
}

int BeaconColor::getGreen() {
  return green;
}
void BeaconColor::setBlue(int blue) {
  this -> blue = blue;
}

int BeaconColor::getBlue() {
  return blue;
}
void BeaconColor::setWhite(int white) {
  this -> white = white;
}

int BeaconColor::getWhite() {
  return white;
}
