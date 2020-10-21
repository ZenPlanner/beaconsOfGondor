#ifndef _BEACONFADER_H
#define _BEACONFADER_H

#include "BeaconColor.h"

class BeaconFader {
  private:
    double red;
    double green;
    double blue;
    double white;
    double rRatio;
    double gRatio;
    double bRatio;
    double wRatio;
    BeaconColor sourceColor;
    BeaconColor destinationColor;
    BeaconColor getCurrentColor();
    
  public:
    BeaconFader();
    BeaconFader(BeaconColor sourceColor, BeaconColor destinationColor);
    void init(BeaconColor sourceColor, BeaconColor destinationColor);
    bool isComplete();
    BeaconColor getNext();
    void normalize();
    void setDestination(BeaconColor destination);
    bool off();
};

#endif
