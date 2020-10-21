#ifndef _BEACONCOLOR_H
#define _BEACONCOLOR_H

#include <Math.h>

class BeaconColor {
  private:
    int red;
    int green;
    int blue;
    int white;

  public:
    BeaconColor();
    BeaconColor(int red, int green, int blue, int white);
    BeaconColor (double red, double green, double blue, double white);
    bool equals(BeaconColor color);
    static BeaconColor off();
    int getRed();
    int getGreen();
    int getBlue();
    int getWhite();
    void setRed(int red);
    void setGreen(int green);
    void setBlue(int blue);
    void setWhite(int white);
};

# endif 
