class GUI {
	// dependency injection for board object
	#board;

	// array of p5 Image objects corresponding to all the pieces in chess
	#piece_images;

	// p5 Graphics object for storing background as pixel
	#background;

	// p5js Instance
	#p5;

	// the size of the canvas in pixels, width and height
	#screen_size_px;

	constructor(board) {
		// inject board here
		this.#board = board;

		this.#initP5();
	}

	#initP5() {
		// get nice integer screen size in px to fit in view
		this.#screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);

		// Use p5js instantiation mode, using html element with id "p5_container"
		this.#p5 = new p5((p5) => {
			this.#p5 = p5;

			// In order to refer to ChessGUI object inside p5 functions we need to use
			// Function.bind in order to redefine the this variable inside the functions
			// to our ChessGUI object

			p5.setup = this.#setup.bind(this);
			p5.draw = this.#draw.bind(this);

			p5.windowResized = this.#handleWindowResize.bind(this);
		}, "p5_container");
	}

	#setup() {
		// p5.noLoop causes p5js to not continously run draw loop, so that user can start it
		this.#p5.noLoop();

		this.#p5.createCanvas(this.#screen_size_px, this.#screen_size_px);

		this.#generateBackground();

		this.#generatePieceImages();

		this.hide();
	}

	#draw() {
		if (this.#p5.isLooping()) {
			this.#drawBackground();
			this.#drawPieces();
		}
	}

	#drawBackground() {
		// only way to draw a p5.Graphics object to canvas is with image draw function
		this.#p5.image(this.#background, 0, 0);
	}

	#drawPieces() {
		const pieces = this.#board.getPieces();

		const cell_width = this.#screen_size_px / 8;

		for (const piece of pieces) {
			this.#p5.image(
				this.#piece_images[piece.color][piece.type],	// image
				piece.col * cell_width,							// x in pixels
				piece.row * cell_width,							// y in pixels
				cell_width,										// width in pixels
				cell_width										// height in pixels
			);
		}
	}

	#handleWindowResize() {
		this.#screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);
		this.#p5.resizeCanvas(this.#screen_size_px, this.#screen_size_px);
		this.#generateBackground();
	}

	show() {
		// need to manually check here
		this.#handleWindowResize();

		// enables p5js draw loop
		this.#p5.loop();

		// change internal canvas html element's display to normal
		this.#p5.canvas.style.display = '';
	}

	hide() {
		// change internal canvas html element's display to none
		this.#p5.canvas.style.display = 'none';

		// disables p5js draw loop
		this.#p5.noLoop();
	}

	#generatePieceImages() {
		this.#piece_images = [];

		this.#piece_images[Piece.WHITE] = [];
		this.#piece_images[Piece.BLACK] = [];

		// SOURCE:
		// adapted from https://commons.wikimedia.org/wiki/File:Chess_Pieces_Sprite.svg

		this.#p5.loadImage('./assets/pieces.png', (pieces_png) => {
			// https://p5js.org/reference/#/p5.Image/get
			// basically grabs image pixels from x,y, width, and height inside image
			// (p5.Image).get(x, y, width, height)

			this.#piece_images[Piece.WHITE][Piece.PAWN] = pieces_png.get(1665, 0.5, 333.33334, 333.5);
			this.#piece_images[Piece.WHITE][Piece.ROOK] = pieces_png.get(1332, 0.5, 333.33334, 333.5);
			this.#piece_images[Piece.WHITE][Piece.KNIGHT] = pieces_png.get(999, 0.5, 333.33334, 333.5);
			this.#piece_images[Piece.WHITE][Piece.BISHOP] = pieces_png.get(666, 0.5, 333.33334, 333.5);
			this.#piece_images[Piece.WHITE][Piece.KING] = pieces_png.get(0, 0.5, 333.33334, 333.5);
			this.#piece_images[Piece.WHITE][Piece.QUEEN] = pieces_png.get(333, 0.5, 333.33334, 333.5);

			this.#piece_images[Piece.BLACK][Piece.PAWN] = pieces_png.get(1665, 333.5, 333.33334, 333.5);
			this.#piece_images[Piece.BLACK][Piece.ROOK] = pieces_png.get(1332, 333.5, 333.33334, 333.5);
			this.#piece_images[Piece.BLACK][Piece.KNIGHT] = pieces_png.get(999, 333.5, 333.33334, 333.5);
			this.#piece_images[Piece.BLACK][Piece.BISHOP] = pieces_png.get(666, 333.5, 333.33334, 333.5);
			this.#piece_images[Piece.BLACK][Piece.KING] = pieces_png.get(0, 333.5, 333.33334, 333.5);
			this.#piece_images[Piece.BLACK][Piece.QUEEN] = pieces_png.get(333, 333.5, 333.33334, 333.5);
		});
	}

	#generateBackground() {
		if (this.#background == undefined) this.#background = this.#p5.createGraphics();

		this.#background.resizeCanvas(this.#screen_size_px, this.#screen_size_px);

		// define colors using hex color codes
		const square_color_even = this.#p5.color("#f1d9c0");
		const square_color_odd = this.#p5.color("#a97b65");

		this.#background.background(square_color_even);

		this.#background.fill(square_color_odd);
		this.#background.noStroke();

		// fill rectangles with other color in alternating pattern
		// in the shape of an 8x8 board
		const cell_width = this.#screen_size_px / 8;
		for (let col = 0; col < 8; col++) {
			for (let row = 0; row < 8; row++) {
				if ((col + row) & 1 != 0) this.#background.rect(col * cell_width, row * cell_width, cell_width, cell_width);
			}
		}
	}
}
