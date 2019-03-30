window.handsfree = new Handsfree({
    debug: true,
    hideCursor: false,
    settings: {
        // Sets up the webcam
        webcam: {
          video: {
            width: 100,
            height: 100
          }
        }
    }
});

const handsfree = window.handsfree

handsfree.use({
    name: 'test',
    onUse() {
        console.log(`Loaded: ${this.name}`);
    },

    onFrame(faces) {
        faces.forEach((face,faceIndex)=>{
            if(face.cursor.state.mouseDown) {
                console.log("mouse pressed");
                //console.log(document.getElementById("defaultCanvas0"));
                document.getElementById("defaultCanvas0").dispatchEvent(
                    new MouseEvent("mousedown", {
                        clientX : face.cursor.x,
                        clientY : face.cursor.y
                    })
                );
                //mousePressed();
                if (face.cursor.x < width) {
                    let key = floor(map(face.cursor.x, 0, width, 0, notes.length));
                    playNote(notes[key]);
                    //fill(100,255,200);
                    //fill(127);
                    //rect(x, 0, w-1, height-1);
                    let w = width / notes.length;
                    for (let i = 0; i < notes.length; i++) {
                        let x = i * w;
                        // If the mouse is over the key
                        if (face.cursor.x > x && face.cursor.x < x + w && face.cursor.y < height) {
                          // If we're clicking
                          //if (mouseIsPressed) {
                            fill(100,255,200);
                          // Or just rolling over
                          //} else {
                          //  fill(127);
                          //}
                        } else {
                          fill(200);
                        }

                        // Or if we're playing the song, let's highlight it too
                        //if (autoplay && i === song[index-1].note) {
                        //  fill(100,255,200);
                        //}

                        // Draw the key
                        rect(x, 0, w-1, height-1);
                      }

                    osc.fade(0,1);
                }

                //mouseReleased();
            }
        });
    },
    onStart() {
        console.log("HandsFree online");
    },

    onStop() {
        console.log("stopping");
    }
});

let notes = [ 60, 62, 64, 65, 67, 69, 71];

// For automatically playing the song
let index = 0;
let song = [
  { note: 4, duration: 400, display: "D" },
  { note: 0, duration: 200, display: "G" },
  { note: 1, duration: 200, display: "A" },
  { note: 2, duration: 200, display: "B" },
  { note: 3, duration: 200, display: "C" },
  { note: 4, duration: 400, display: "D" },
  { note: 0, duration: 400, display: "G" },
  { note: 0, duration: 400, display: "G" }
];
let trigger = 0;
let autoplay = false;
let osc;

function setup() {
  let canvas = createCanvas(720, 400);
  canvas.parent("base");
  let div = createDiv("Click to play notes or ")
  div.id("instructions");
  let button = createButton("play song automatically.").addClass('btn btn-warning');
  button.className = "btn btn-warning";
  button.parent("instructions");
  // Trigger automatically playing
  button.mousePressed(function() {
    if (!autoplay) {
      index = 0;
      autoplay = true;
    }
  });

  // A triangle oscillator
  osc = new p5.TriOsc();
  // Start silent
  osc.start();
  osc.amp(0);
}

// A function to play a note
function playNote(note, duration) {
  osc.freq(midiToFreq(note));
  // Fade it in
  osc.fade(0.5,0.2);

  // If we sest a duration, fade it out
  if (duration) {
    setTimeout(function() {
      osc.fade(0,0.2);
    }, duration-50);
  }
}

function draw() {

  // If we are autoplaying and it's time for the next note
  if (autoplay && millis() > trigger){
    playNote(notes[song[index].note], song[index].duration);
    trigger = millis() + song[index].duration;
    // Move to the next note
    index ++;
  // We're at the end, stop autoplaying.
  } else if (index >= song.length) {
    autoplay = false;
  }


  // Draw a keyboard

  // The width for each key
  let w = width / notes.length;
  for (let i = 0; i < notes.length; i++) {
    let x = i * w;
    // If the mouse is over the key
    if (mouseX > x && mouseX < x + w && mouseY < height) {
      // If we're clicking
      if (mouseIsPressed) {
        fill(100,255,200);
      // Or just rolling over
      } else {
        fill(127);
      }
    } else {
      fill(200);
    }

    // Or if we're playing the song, let's highlight it too
    if (autoplay && i === song[index-1].note) {
      fill(100,255,200);
    }

    // Draw the key
    rect(x, 0, w-1, height-1);
  }

}

// When we click
function mousePressed() {
  // Map mouse to the key index
  let key = floor(map(mouseX, 0, width, 0, notes.length));
  playNote(notes[key]);
}

// Fade it out when we release
function mouseReleased() {
  osc.fade(0,0.5);
}
