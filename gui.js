class ChessGUI {

	constructor() {
		// get nice integer screen size in px to fit in screen
		this.screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);

		this.initP5();
		this.generateBackground();
		this.drawBackground();
	}

	initP5() {
		// Use p5js instantiation mode, using html element with id "p5_container"
		// p5.noLoop causes p5js to not continously run draw loop
		this.p5 = new p5((p5) => { p5.noLoop() }, "p5_container");
		this.p5.resizeCanvas(this.screen_size_px, this.screen_size_px);

		// In order to refer to ChessGUI object inside p5 functions we need to use
		// Function.bind in order to redefine the this variable inside the functions
		// to our ChessGUI object

		this.p5.draw = this.draw.bind(this);
		this.p5.windowResized = this.handleWindowResize.bind(this);

		// re enable p5js draw loop
		this.p5.loop();
	}

	draw() {
		this.drawBackground();
	}

	handleWindowResize() {
		this.screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);
		this.p5.resizeCanvas(this.screen_size_px, this.screen_size_px);
		this.generateBackground();
		this.drawBackground();
	}

	show() {
		// change internal canvas html element's display to normal
		this.p5.canvas.style.display = '';
	}

	hide() {
		// change internal canvas html element's display to none
		this.p5.canvas.style.display = 'none';
	}

	generateBackground() {
		if (this.background == undefined) this.background = this.p5.createGraphics();

		this.background.resizeCanvas(this.screen_size_px, this.screen_size_px);

		// define colors using hex color codes
		const SquareColorEven = this.p5.color("#f1d9c0");
		const SquareColorOdd = this.p5.color("#a97b65");

		this.background.background(SquareColorEven);

		this.background.fill(SquareColorOdd);
		this.background.noStroke();

		// fill rectangles with other color in alternating pattern
		// in the shape of an 8x8 board
		const cell_width = this.screen_size_px / 8;
		for (let col = 0; col < 8; col++) {
			for (let row = 0; row < 8; row++) {
				if ((col + row) & 1 != 0) this.background.rect(col * cell_width, row * cell_width, cell_width, cell_width);
			}
		}
	}

	drawBackground() {
		this.p5.image(this.background, 0, 0);
	}
}
