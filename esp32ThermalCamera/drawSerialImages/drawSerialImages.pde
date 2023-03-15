import processing.serial.*;

Serial myPort;  // Create object from Serial class
static String lineStr;    // Data received from the serial port
static boolean readingImage = false;

static int xPos = 0;
static int yPos = 0;
static int sqSz = 9;

void setup()
{
  String portName = Serial.list()[1]; //change the 0 to a 1 or 2 etc. to match your port  
  println(portName);
  myPort = new Serial(this, portName, 9600);
  
  size(300, 300);
  colorMode(HSB, 1, 1, 1);
}

void draw()
{
  if ( myPort.available() > 0) 
  { 
    lineStr = myPort.readStringUntil('\n');         // read it and store it in val
    //print(lineStr);
    
    if (lineStr != null) {
      
      if (lineStr.contains("begin image")) {
        readingImage = true;
        println("Start");
      }

      if (lineStr.contains("end image")) {
        readingImage = false;
        println("End");
      }
      

      if (readingImage && !lineStr.contains("begin image")) {
        
        float[] vals = float(split(lineStr, " ")); 
        
        for (int iVal = 0; iVal < vals.length - 1; iVal++) {
          
          float val = vals[iVal];
          
          setFillColor(val);
          square(xPos, yPos, sqSz);
          xPos += sqSz;
        }
        
        xPos = 0;
        yPos += sqSz;
      }
      
      if (!readingImage) {
        xPos = 0;
        yPos = 0;
      }
    }
  } 
}


void setFillColor (float value) {
 
  float scale = map(value, 20, 40, 0.2, 1.0);
  color c = color(scale, 0.9, 1);
  
  fill(c);
}
