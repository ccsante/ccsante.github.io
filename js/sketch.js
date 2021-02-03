let no = 16;
let r1 = 70;
let r2 = 100;

let dist = 200;

let bg = "#7cc3b1";
let fg = "#35b1b4";

// let choice=[+1,-1];
function setup() {
  createCanvas(windowWidth, windowHeight);
	angleMode(DEGREES);
	rectMode(CENTER);
	noStroke();
	frameRate(10);
  background(bg);
	
}
function draw() {
	
	for(let i=0;i<width*1.5;i+=dist) {
		for(let j =0;j<height*1.5;j+=dist) {
			push();
			noStroke();
			translate(i,j);
			rotate((i+j)*30);
			rotate(360/no*frameCount);
			scale(0.55);
			drawMandala(fg);
			pop();
		}
	}
	
	
	if(frameCount%(no+3) ==0) {
		background(bg);
	}
}

function drawMandala(colour) {
	fill(colour);
	//center dot + line
	ellipse(0,0,12);
	rect(r1/2+5, 0, 20,6,10);
	
	//small circle b/w dot and line
	stroke(colour);
	strokeWeight(5);
	arc(0,0,r1/2,r1/2,8*360/no,9*360/no, OPEN);
	
	// 2 circles
	noStroke();
	ellipse(0, -r1, 10,10);
	stroke(colour);
	strokeWeight(5);
	arc(0,0,2*r1+25,2*r1+25,-360/no,0, OPEN);
	arc(0,0,2*r1+45,2*r1+45,360/no*2,360/no*3, OPEN);
	
	//tiny bindhi thing
	noStroke();
	triangle(0,r2,6,r2+10,-6,r2+10);
	ellipse(0,r2+10,11);
	rotate(180/no);
	// triangle(0,r2,6,r2+10,-6,r2+10);
	ellipse(0,r2+10,11)
	rotate(-180/no);
	
	stroke(colour);
	strokeWeight(5);
	noFill();
	arc(r2+10,0,35,35, 270,90, OPEN);
	arc(r2+10,0,55,55, 310,50, OPEN);
	
	rotate(180/no);
	// ellipse(0,r2+35,5,5);
}