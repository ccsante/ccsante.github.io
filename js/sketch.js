var colourx = [];
var coloury = [];
var colourz = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
  /* Use for static colours
  COMMENT HERE IF YOU WANT DYNAMIC COLOURS*/
  //setColours();
  stroke(128);
  strokeWeight(0.5)
  lines(50, height/2, 14, 200);
  lines(150,80, 7, 50);
  lines(width - 100, height*0.8, 11 , 150);
  lines(width +200, height*0.1, 21 , 350);

}

function getPoints(xc, yc) {
  for (let i = 0; i < count; i++) {
    xarr[i] = xc + (rad * sin((2 * (22 / 7) * i) / count));
    yarr[i] = yc + (rad * cos((2 * (22 / 7) * i) / count));
    point(xarr[i], yarr[i]);
  }
}

function setColours() {
  for (let i = 0; i < 50; i++) {

    colourx[i] = random() * 255;
    coloury[i] = random() * 255;
    colourz[i] = random() * 255;

  }
}

function draw() 

{
  


}

function lines(xc, yc, count, rad) {

  let xarr = [];
  let yarr = [];


  for (var i = 0; i < count; i++) {
    xarr[i] = xc + (rad * sin((2 * (22 / 7) * i) / count));
    yarr[i] = yc + (rad * cos((2 * (22 / 7) * i) / count));
    point(xarr[i], yarr[i]);
  }

  for (var i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      if (((i - j) != 1) && ((j - i) != 1)) {
        //stroke(255 / 16 * j, 255 / 256 * i * j, 255 / 16 * i);
        line(xarr[i], yarr[i], xarr[j], yarr[j]);
      }
    }
  }
}