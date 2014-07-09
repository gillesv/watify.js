import processing.pdf.*;

ArrayList<Waveform> waves = new ArrayList<Waveform>();

// output folder
String OUTPUT_FOLDER = "WatifyGenerated/";

boolean useBackground = true;
boolean showLogo = true;

int selected_color = 0;
String colors[] = {"blue", "yellow", "green", "red"};

float RESOLUTION = 1;  // num steps per degree

void setup() {
  size(800, 800);
  
  if (frame != null) {
    frame.setResizable(false);
  }
  
  logo_svg = loadShape("data/watify.svg");
  logo_svg.disableStyle();
    
  
  background(0);
  
  smooth();
  
  randomize();
}

void pushWave() {
  Waveform wave;
  
  if(waves.size() > 0) {
    wave = lastWave().clone();
  } else {
    wave = new Waveform();
  }
  
  waves.add(wave);
  
  NUM_ITERATIONS = waves.size();
}

int NUM_ITERATIONS = 15;

// iterative mode variables
float it_radius = 360;
float it_radius_step = 10.0;
float it_frequency = 10.0;
float it_frequency_step = -1.0;
float it_amplitude = 30.0;
float it_amplitude_step = -1.0;
float it_angle = 0.0;
float it_angle_step = 1.0;

// randomly create a waveform logo 
void randomize() {

  float min_frequency = 1.0;
  float max_frequency = 5.0;
  float min_frequency_step = -0.2;
  float max_frequency_step = 0.2;
  float min_amplitude = 1.0;
  float max_amplitude = 40.0;
  float min_amplitude_step = -1.0;
  float max_amplitude_step = 1.0;
  float min_radius_step = 10.0;
  float max_radius_step = 20.0;
  float min_angle_offset_step = -1.0;
  float max_angle_offset_step = 1.0;
  float min_angle_offset = 0.0;
  float max_angle_offset = 45.0;
  
  it_radius_step = random(min_radius_step, max_radius_step);
  it_frequency = round(random(min_frequency, max_frequency));
  it_frequency_step = -0.2; //random(min_frequency_step, max_frequency_step);
  it_amplitude = random(min_amplitude, max_amplitude);
  it_amplitude_step = -0.1; //random(min_amplitude_step, max_amplitude_step);
  it_angle = random(min_angle_offset, max_angle_offset);
  it_angle_step = 0.0; //random(min_angle_offset_step, max_angle_offset_step);
   
}

void popWave() {
  if(waves.size() > 0) {
    waves.remove(waves.size() - 1);
  }
  
  NUM_ITERATIONS = waves.size();
}

Waveform lastWave() {
  return waves.get(waves.size() - 1);
}

void setFreq(float delta) {
  Waveform wave = lastWave();
  wave.frequency += delta;
}

void setAmpl(float delta) {
  Waveform wave = lastWave();
  wave.amplitude += delta;
}

void setRadius(float delta) {
  Waveform wave = lastWave();
  wave.radius += delta;
}

void setWeight(float delta) {
  Waveform wave = lastWave();
  wave.weight += delta;
}

void setAngleOffset(float delta) {
  Waveform wave = lastWave();
  wave.angle_offset += delta;
}

boolean isRecording = false;

void draw() {  
  if(isRecording) {
    beginRecord(PDF, OUTPUT_FOLDER + "watify_" + colors[selected_color] + "-" + year() + "-" + month() + "-" + day() + "-" + hour() + "" + minute() + "" + second() + ".pdf");
  }
  
  // draw a circle
  Boolean useFill = true;
  Boolean useOutline = false;
  int fillColor = color(0, 0, 0, 77);
  int strokeColor = #ffffff;
  noFill();
  
  if(!useBackground && !isRecording) {
    clear();
  }
  
  switch(selected_color) {
    case 1: // yellow
      if(useBackground) {
        background(#fbc700);
      }
      strokeColor = #fbc700;
      useFill = true;
      fillColor = #f8b327;
    break;
    case 2: // green
      if(useBackground) {
        background(#00a285);
      }
      strokeColor = #00a285;
      useOutline = false;
      useFill = true;
      fillColor = #00856b;
    break;
    case 3: // red
      if(useBackground) {
        background(#e51935);
      }
      strokeColor = #e51935;
      useOutline = false;
      useFill = true;
      fillColor = #c80b30;
    break;
    default:
    case 0:  // blue
      if(useBackground) {
        background(#3a90c1);
      }
      useFill = true;
      fillColor = #286386;
      
      strokeColor = #3a90c1;
    break;
  }
  
  translate(width/2, height/2);

  float radius = min(it_radius, min(width, height)*.45); //it_radius;
  float angle_offset = it_angle;
  float frequency = it_frequency;
  float amplitude = it_amplitude;
  
  strokeWeight(1);
  
  while(radius > 0) {
    pushMatrix();
    
    rotate(radians(angle_offset));
    
    if(useFill) {
      fill(fillColor);
      useFill = false;
    } else {
      noFill();
    }
    
    if(useOutline) {
      stroke(255);
      useOutline = false;
    } else {
      stroke(strokeColor);
    }
    
    beginShape();
    
    for(int i = 0; i < 360*RESOLUTION; i++ ){
      float angle = (float)i/RESOLUTION;
      
      float freq = (float) frequency;
      
      if( i < 90 ) {
        freq = lerp(round(frequency), frequency, i/90.0);
      } else if (i > 270) {
        freq = lerp(frequency, round(frequency), (i - 270.0)/90.0);
      }
      
      float rad = radius + (amplitude * sin(radians((i/RESOLUTION)*round(freq))));
        
      float xpos = rad * sin(radians(angle));
      float ypos = rad * cos(radians(angle));
      
      curveVertex(xpos, ypos);
    }
    
    radius -= it_radius_step;
    angle_offset += it_angle_step;
    frequency += it_frequency_step;
    amplitude += it_amplitude_step;
    
    endShape(CLOSE);
    
    popMatrix();
  }
  
  // render logo 
  if(showLogo) {
    renderLogo();
  }
  
  if(isRecording) {
    endRecord();
    isRecording = false;
  } else {
    pushMatrix();
    renderGUI();
    popMatrix();
  }
}

PGraphics logo_dropshadow;
PShape logo_svg;

void renderLogo() {
  pushMatrix();
  translate(-width/2, -height/2);
  
  // lazy
  if(logo_dropshadow == null) {
    logo_dropshadow = createGraphics(width, height);
    
    // render drop shadow
    logo_dropshadow.beginDraw();
    logo_dropshadow.fill(#60142b, 64);
    logo_dropshadow.translate(10, 10);
    logo_dropshadow.shape(logo_svg, 0, 0, width, height);
    logo_dropshadow.filter(BLUR, 10);
    logo_dropshadow.endDraw();
  }
  
  // attach images
  image(logo_dropshadow, 0, 0);
  
  noStroke();
  fill(255);
  shape(logo_svg, 0, 0, width, height);
      
  popMatrix();
}

void renderGUI() {
  translate(-width/2, -height/2);
  
  String[][] keybindingscopy;
  String title = "";
  
  keybindingscopy = new String[5][];
  title = "Iterative Waveform generator:";
  
  keybindingscopy[0] = new String[] {"spacebar", "export current waveform to PDF"};
  keybindingscopy[1] = new String[] {"q", "generate new waveform"};
  keybindingscopy[2] = new String[] {"left/right", "toggle color scheme"};
  keybindingscopy[3] = new String[] {"b", "toggle background"};
  keybindingscopy[4] = new String[] {"l", "toggle Watify typographical logo"};
  
  translate(20, 20);
  textSize(10);
  fill(255);
  text(title, 0, 0);
  translate(0, 20);
  
  for(int i = 0; i < keybindingscopy.length; i++) {
    text(keybindingscopy[i][0], 0, 0);
    text(keybindingscopy[i][1], 60, 0);
    translate(0, 10);
  }
  
}

void keyPressed() {
    
  if(key == CODED) {
    if(keyCode == LEFT) {
      selected_color --;
    }
    
    if(keyCode == RIGHT) {
      selected_color ++;
    }
    
    if(selected_color < 0) {
      selected_color = colors.length - 1;
    }
    
    if(selected_color > colors.length - 1) {
      selected_color = 0;
    }
  }
  
  if(key == "b".charAt(0)) {
    // toggle background
    useBackground = !useBackground;
  }
  
  if(key == "l".charAt(0)) {
    // toggle typo logo
    showLogo = !showLogo;
  }
  
  if(key == "q".charAt(0)) {
    // random
    randomize();
  }
    
  if(key == " ".charAt(0)) {
    isRecording = true;
  }
}


class Waveform {
  public float radius = 200.0;
  public float frequency = 10.0;
  public float amplitude = 20.0;
  public float weight = 1.0;
  public float angle_offset = 0.0;
  
  Waveform () {
    
  }
  
  Waveform clone() {
    Waveform wave = new Waveform();
    wave.radius = this.radius;
    wave.frequency = this.frequency;
    wave.amplitude = this.amplitude;
    wave.weight = this.weight;
    wave.angle_offset = this.angle_offset;
    
    return wave;
  }
}
