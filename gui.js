class GUI {
	// dependency injection for board object
	#board;

	// full image of all pieces
	#pieces_image;

	// array of p5 Image objects corresponding to all the pieces in chess
	#piece_images;

	// p5 Graphics object for storing background as pixel
	#background;

	// p5js Instance
	#p5;

	// the size of the canvas in pixels, width and height
	#screen_size_px;

	// the width in pixels of each chess cell/square
	#cell_width_px;

	// the column and row of where the last mouse pressed was
	#mouse_pressed_col;
	#mouse_pressed_row;

	constructor(board) {
		// dependency inject board here
		this.#board = board;

		this.#initP5();
	}

	#initP5() {
		// Use p5js instantiation mode, using html element with id "p5_container"
		this.#p5 = new p5((p5) => {
			this.#p5 = p5;

			// In order to refer to ChessGUI object inside p5 functions we need to use
			// Function.bind in order to redefine the this variable inside the functions
			// to our ChessGUI object

			p5.preload = this.#preload.bind(this);
			p5.setup = this.#setup.bind(this);
			p5.draw = this.#draw.bind(this);

			p5.windowResized = this.#handleWindowResize.bind(this);
			p5.mousePressed = this.#handleMousePressed.bind(this);
			p5.mouseReleased = this.#handleMouseReleased.bind(this);
		}, "p5_container");
	}

	#preload() {
		// SOURCE:
		// adapted from https://commons.wikimedia.org/wiki/File:Chess_Pieces_Sprite.svg
		this.#pieces_image = this.#p5.loadImage('assets/pieces.png');
	}

	#setup() {
		// get nice integer screen size in px to fit in user's view
		this.#screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);
		this.#cell_width_px = this.#screen_size_px / 8;

		this.#generateBackground();

		this.#generatePieceImages();

		this.#p5.createCanvas(this.#screen_size_px, this.#screen_size_px);
	}

	#draw() {
		this.#drawBackground();
		this.#drawPieces();
	}

	#handleWindowResize() {
		this.#screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);
		this.#cell_width_px = this.#screen_size_px / 8;

		this.#p5.resizeCanvas(this.#screen_size_px, this.#screen_size_px);
		this.#generateBackground();
	}

	#handleMousePressed() {
		this.#mouse_pressed_col = Math.floor(this.#p5.mouseX / this.#cell_width_px);
		this.#mouse_pressed_row = Math.floor(this.#p5.mouseY / this.#cell_width_px);
	}

	#handleMouseReleased() {
		const mouse_released_col = Math.floor(this.#p5.mouseX / this.#cell_width_px);
		const mouse_released_row = Math.floor(this.#p5.mouseY / this.#cell_width_px);

		this.#board.move(
			this.#mouse_pressed_row,
			this.#mouse_pressed_col,
			mouse_released_row,
			mouse_released_col
		);

		this.#mouse_pressed_col = undefined;
		this.#mouse_pressed_row = undefined;
	}

	#drawBackground() {
		// only way to draw a p5.Graphics object to canvas is with image draw function
		this.#p5.image(this.#background, 0, 0);
	}

	#drawPieces() {
		const pieces = this.#board.getPieces();
		const mouse_pressed_piece = this.#board.at(this.#mouse_pressed_row, this.#mouse_pressed_col);

		for (const piece of pieces) {
			const draw_x = piece.col * this.#cell_width_px;
			const draw_y = piece.row * this.#cell_width_px;

			// don't draw piece grabbed by mouse, we'll do it after
			if (piece == mouse_pressed_piece)
				continue;

			this.#drawPiece(piece, draw_x, draw_y);
		}

		// draw piece grabbed by mouse now
		// this is so that it's above all other pieces
		if (mouse_pressed_piece != undefined) {
			// to draw middle on mouse, we need to offset
			const draw_x = this.#p5.mouseX - (this.#cell_width_px / 2);
			const draw_y = this.#p5.mouseY - (this.#cell_width_px / 2);

			this.#drawPiece(mouse_pressed_piece, draw_x, draw_y);
		}
	}

	#drawPiece(piece, x, y) {
		// draw p5.Image
		this.#p5.image(
			this.#piece_images[piece.color][piece.type],	// image
			x,												// x in pixels
			y,												// y in pixels
			this.#cell_width_px,							// width in pixels
			this.#cell_width_px								// height in pixels
		);
	}

	// https://p5js.org/reference/#/p5.Image/get
	// (p5.Image).get(x, y, width, height)
	#generatePieceImages() {
		this.#piece_images = [];

		this.#piece_images[Piece.WHITE] = [];
		this.#piece_images[Piece.BLACK] = [];

		// average size of piece images, doesn't really matter
		const size = 333.4;

		// generate all white piece images
		this.#piece_images[Piece.WHITE][Piece.PAWN] = this.#pieces_image.get(1665, 0.5, size, size);
		this.#piece_images[Piece.WHITE][Piece.ROOK] = this.#pieces_image.get(1332, 0.5, size, size);
		this.#piece_images[Piece.WHITE][Piece.KNIGHT] = this.#pieces_image.get(999, 0.5, size, size);
		this.#piece_images[Piece.WHITE][Piece.BISHOP] = this.#pieces_image.get(666, 0.5, size, size);
		this.#piece_images[Piece.WHITE][Piece.KING] = this.#pieces_image.get(0, 0.5, size, size);
		this.#piece_images[Piece.WHITE][Piece.QUEEN] = this.#pieces_image.get(333, 0.5, size, size);

		// generate all black piece images
		this.#piece_images[Piece.BLACK][Piece.PAWN] = this.#pieces_image.get(1665, 333.5, size, size);
		this.#piece_images[Piece.BLACK][Piece.ROOK] = this.#pieces_image.get(1332, 333.5, size, size);
		this.#piece_images[Piece.BLACK][Piece.KNIGHT] = this.#pieces_image.get(999, 333.5, size, size);
		this.#piece_images[Piece.BLACK][Piece.BISHOP] = this.#pieces_image.get(666, 333.5, size, size);
		this.#piece_images[Piece.BLACK][Piece.KING] = this.#pieces_image.get(0, 333.5, size, size);
		this.#piece_images[Piece.BLACK][Piece.QUEEN] = this.#pieces_image.get(333, 333.5, size, size);
	}

	#generateBackground() {
		if (this.#background == undefined) this.#background = this.#p5.createGraphics();

		// resize the actual p5.Graphics to the size of our canvas
		this.#background.resizeCanvas(this.#screen_size_px, this.#screen_size_px);

		// define colors using hex color codes
		const square_color_even = this.#p5.color("#f1d9c0");
		const square_color_odd = this.#p5.color("#a97b65");

		// fill with even color
		this.#background.background(square_color_even);

		// drawing will fill with odd color, and without "stroke" or a border
		this.#background.fill(square_color_odd);
		this.#background.noStroke();

		// in the shape of an 8x8 board, at every other square ^
		for (let col = 0; col < 8; col++) {
			for (let row = 0; row < 8; row++) {
				if ((col + row) & 1 != 0)			// magic every other square thing
					this.#background.rect(
						col * this.#cell_width_px,	// x in pixels
						row * this.#cell_width_px,	// y in pixels
						this.#cell_width_px,		// width in pixels
						this.#cell_width_px			// height in pixels
					);
			}
		}
	}
}
