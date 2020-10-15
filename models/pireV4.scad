/*** itsLog ***
length: of log (y dimension)
diameter: of log (x dimension)
angle: of the cut on end
cuts: count of cuts on end
*/
module itsLog(diameter=10, length=50, angle=30, cuts=10) {
    extra=5;
    midX=diameter/2;
    midY=length/2;
    
    
    translate([midX,-midY,midX])
    rotate([-90,0,0])
    
    //make cuts
    difference() {
        cylinder(length,d=diameter, $fn=20);

        //loop cuts
        for(m=[1:cuts]) {
            //rotate cuts
            rotate([0,0,360/cuts*m]) {
                //cut bottom
                rotate([-90+angle,0,0])
                translate([-midX-extra/2,0,0])
                    cube([diameter+extra,2*diameter,2*diameter]);
                //cut top
                translate([-midX-extra/2,0,length])
                rotate([-angle,0,0])
                    cube([diameter+extra,2*diameter,2*diameter]);
            }
        }
    }
}

/*/examples
//itsLog();
//translate([0,50/-2,-10])
//cube([10,50,10]);
//*/


/*** get the diameter of the log in a log line ***/
function logLineD(number, width, smash) = (width+(number-1)*smash)/number; 

/*** logLine ***
logs stacking next to each other down the x dimension
their length is the Y dimension
number: of logs
width: of the log line (x dimension)
length: of each log (y dimension)
smash: how much to smash the logs
*/
module logLine(number=2, width=50, length=70, smash=0) {
    translate([width/-2,0,0]) 
    union() {   
        for(x=[0:number-1]) {
            translate([(logLineD(number, width, smash)-smash)*x,0,0])
                itsLog(diameter=logLineD(number, width, smash), length=length);
        }
    }
}

/*/examples
logLine(10);
logLine(10, 50, 70, 2);
translate([50/-2,70/-2,-logLineD(10,50,2)])
cube([50,70,logLineD(10,50,2)]);
//*/


/*** returns the number of logs for a layer***/
function layerNumber(dims, row) = dims[row-1][0];
/*** returns the width of the layer (x dimension) ***/
function layerWidth(dims, row) = dims[row-1][2-row%2];
/*** returns the length of the layer (y dimension) ***/
function layerLength(dims, row) = dims[row-1][1+row%2];
/*** returns the degrees a row should rotate (0 for odd rows, 90 for even) */
function layerRotate(row) = (1-(row%2))*90;
/*** returns the height (z) of where this layer starts ***/
function layerHeight(dims, row, smash, total=0) =
    (row-1<=0) ? total :
        layerHeight(dims, row-1, smash, 
            total +
            logLineD(layerNumber(dims, row-1), 
                    layerWidth(dims, row-1), 
                    smash) - smash);

/*** logPyre ****
a stacking pyre of logs defined row by row
*/
module logPyre(dims, low=1, high=1, smash=0, flatten=4) {
    difference() {
        union() {
            for(z=[low:high]) {
                rotate([0,0,layerRotate(z)])
                translate([0,0,layerHeight(dims, z, smash, -flatten)])
                    logLine(layerNumber(dims, z),
                            layerWidth(dims, z),
                            layerLength(dims, z), 
                            smash
                    );
            }
        }
        
        //flatten bottom
        translate([layerWidth(dims, 1)/-2,layerLength(dims, 1)/-2,-20])
            cube([layerWidth(dims, 1), layerLength(dims, 1), 20]);
    }
}

//the angled polygon that fills the pyre
module fillPoly(dims, low, high, smash, flatten) {
    adj = 9;
    lW0 = layerWidth(dims, low)-adj;
    lL0 = layerLength(dims, low)-adj;
    bot = layerHeight(dims, low-1, smash, -flatten) + adj;

    lWT = dims[high-1][1]-adj;
    lLT = dims[high-1][2]-adj;
    top = layerHeight(dims, high+1, smash, -flatten+smash)-adj;
    
    polyhedron([
        [-lW0/2,-lL0/2,bot],
        [ lW0/2,-lL0/2,bot],
        [ lW0/2, lL0/2,bot],
        [-lW0/2, lL0/2,bot],
        [-lWT/2,-lLT/2,top],
        [ lWT/2,-lLT/2,top],
        [ lWT/2, lLT/2,top],
        [-lWT/2, lLT/2,top]],    
        [[0,1,2,3],  // bottom
        [4,5,1,0],  // front
        [7,6,5,4],  // top
        [5,6,2,1],  // right
        [6,7,3,2],  // back
        [7,4,0,3]]);    
}

//vents are somewhat manually placed.  
//They go in the middle with the dimensions you pass in
module vents(ventW=2, ventL=42, ventN=13)
{
    union() {
    for(y=[1:ventN]) {
        translate([-ventL/2,-(2*ventW*ventN)/2+y*2*ventW-1.5*ventW,-2])
        cube([ventL,ventW,10]);
    }}
}

//top plug... the plug on the bottom of the top
module topPlug(dims, low) {
    adj = 2;
    tW0 = dims[low-1][1]-1.4;
    tL0 = dims[low-1][2]-7.5;
    ttop = layerHeight(dims, low, 2);
    tbot = ttop-7;
     polyhedron([
            [-(tW0-adj)/2,-(tL0-adj)/2,tbot],
            [ (tW0-adj)/2,-(tL0-adj)/2,tbot],
            [ (tW0-adj)/2, (tL0-adj)/2,tbot],
            [-(tW0-adj)/2, (tL0-adj)/2,tbot],
            [-tW0/2,-tL0/2,ttop],
            [ tW0/2,-tL0/2,ttop],
            [ tW0/2, tL0/2,ttop],
            [-tW0/2, tL0/2,ttop]],    
            [[0,1,2,3],  // bottom
            [4,5,1,0],  // front
            [7,6,5,4],  // top
            [5,6,2,1],  // right
            [6,7,3,2],  // back
            [7,4,0,3]]);    
}



/******** dimensions **********/
/*pyreDims = [[6,70,125],
            [10,70,120],
            [6,66,115],
            [9,66,110],
            [5,62,105],
            [8,62,100],
            [5,58,95],
            [8,58,90],
            [5,54,85]];*/

/***** whole thing *****/
//logPyre(pyreDims, 1, 8, 2);

/******** dimensions **********/
/*
pyreDims = [[6,70,125],
            [10,70,120],
            [6,66,115],
            [9,66,110],
            [5,62,105],
            [8,62,100],
            [5,58,95],
            [8,58,90],
            [5,54,85]];
            */

pyreDims = [[7,40,45],
            [9,38,44],
            [7,36,43]];
/***** whole thing *****/
//logPyre(pyreDims, 1, 5, 2);
//bottom 8266

difference() {
    logPyre(pyreDims, 1, 5, 2);
    union () {
        translate([-15,-18.5,11])
        cube ([30,37,12]);
        translate([-13.5,-20,3])
        cube([27,36,5]);
        translate([-13.5,-18,3])
        cube([27,36,10]);
        translate([-5.50,-25.5,1.5])
        cube([11,20,7]);        
    }
}

//top 8266
/*
union() {
    difference () {
        union () {
            translate([-15,-18.5,11])
            cube([30,37,2]);         
            translate([0,0,13])
            difference() {
                fyre(.25,.25,.25);
                fyre(.2,.2,.2);
            }
        }
    }
}*/


module fyre(xScale=.5,yScale=.5,zScale=.5) {
    scale([xScale,yScale,zScale])
    union() {
        translate([-80,-133,-10])
            import("fireb-1.stl");
        //cylinder(25,38,44,$fn=50);
    }
}

fyre(1,1,1);


     /*   
        translate([0,0,-1])
            cylinder(100,25,2);
    }*/


/****** top ******/
topLow=7;
topHigh=8;
ts = 2;

//top pyre
//difference() {
  //  union() {
//        logPyre(pyreDims, topLow, topHigh, ts);
 //       fillPoly(pyreDims, topLow, topHigh, ts, 0);
 //       topPlug(pyreDims, topLow);
        
    //}
    
    //translate([0,0,layerHeight(pyreDims, topHigh+1, ts)-8])
    //fyre(.6,1,.66);
//}
//*/

/****** bottom ******
botLow = 1;
botHigh = 6;
s = 2;
xCut = pyreDims[botHigh-1][1]-18;
yCut = pyreDims[botHigh-1][2]-15;

//bracket and holes vars
holeX = 23; 
holeY = 58;
holeD = 2.75;
postD = 6;
bx = 15; //corner mount x dimension
by = 18; //corner mount y dimension

union() {
    difference() {
        union() {
            //the pyre
            logPyre(pyreDims, botLow, botHigh, s);
            fillPoly(pyreDims, botLow, botHigh, s, 4);
        }
        
        vents();
        
        //hollow out
        translate([xCut/-2,yCut/-2,4])
            cube([xCut,yCut,layerHeight(pyreDims, botHigh+1, s)]);
    
        //test cutoff
        translate([-75,-75,20])
            cube([150,150,50]);
            
        cutOffY=32;
        translate([-37,cutOffY,-1])
            cube([75,75,50]);

        translate([-37,-cutOffY-75,-1])
            cube([75,75,50]);
        //*//*
    }
    
    difference() {
        union() {
            //bracket corners
            translate([holeX/2-postD/2,holeY/2-postD/2,4])
            cube([bx,by,7]);
            translate([-holeX/2+postD/2-bx,holeY/2-postD/2,4])
            cube([bx,by,7]);
            translate([holeX/2-postD/2,-holeY/2+postD/2-by,4])
            cube([bx,by,7]);
            translate([-holeX/2+postD/2-bx,-holeY/2+postD/2-by,4])
            cube([bx,by,7]);
        }
        
        //cut screw holes
        translate([-holeX/2,-holeY/2,6])
        cylinder(10, d=holeD, $fn=20);
        translate([holeX/2,-holeY/2,6])
        cylinder(10, d=holeD, $fn=20);
        translate([-holeX/2,holeY/2,6])
        cylinder(10, d=holeD, $fn=20);
        translate([holeX/2,holeY/2,6])
        cylinder(10, d=holeD, $fn=20);
    }
}
//*/
