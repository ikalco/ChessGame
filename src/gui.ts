import * as p5 from "p5";
import { Board } from "./board";
import { Piece, PieceColor, PieceType } from "./piece";

class GUI {
	private board: Board

	private p5: (p5 | undefined);

	private pieces_image: (p5.Image | undefined);
	private piece_images: (p5.Image[][] | undefined);
	private background: (p5.Graphics | undefined);

	private screen_size_px: (number | undefined);
	private cell_width_px: (number | undefined);

	private mouse_pressed_col: (number | undefined);
	private mouse_pressed_row: (number | undefined);

	constructor(board: Board) {
		this.board = board;

		this.initP5();
	}

	private initP5() {
		// Use p5js instantiation mode, using html element with id "p5_container"
		this.p5 = new p5((p5) => {
			this.p5 = p5;

			// In order to refer to GUI object inside p5 functions we need to use
			// Function.bind in order to redefine the "this" variable inside the functions
			// to our GUI object

			p5.preload = this.preload.bind(this);
			p5.setup = this.setup.bind(this);
			p5.draw = this.draw.bind(this);

			p5.windowResized = this.handleWindowResize.bind(this);
			p5.mousePressed = this.handleMousePressed.bind(this);
			p5.mouseReleased = this.handleMouseReleased.bind(this);
		}, document.getElementById("p5_container")!);
	}

	private preload(): void {
		// adapted from https://commons.wikimedia.org/wiki/File:Chess_Pieces_Sprite.svg
		this.pieces_image = this.p5!.loadImage('assets/pieces.png');
	}

	private setup(): void {
		// get nice integer screen size in px to fit in user's view
		this.screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);
		this.cell_width_px = this.screen_size_px / 8;

		this.generateBackground();

		this.generatePieceImages();

		this.p5!.createCanvas(this.screen_size_px, this.screen_size_px);
	}

	private draw() {
		this.drawBackground();
		this.drawPieces();
	}

	private handleWindowResize() {
		// get nice integer screen size in px to fit in user's view
		this.screen_size_px = Math.ceil(Math.min(window.innerWidth, window.innerHeight) * 0.9);
		this.cell_width_px = this.screen_size_px / 8;

		this.p5!.resizeCanvas(this.screen_size_px, this.screen_size_px);
		this.generateBackground();
	}

	private handleMousePressed() {
		if (this.cell_width_px === undefined)
			throw Error("cell_width_px is undefined, can't determine mouse position in row/col");

		this.mouse_pressed_col = Math.floor(this.p5!.mouseX / this.cell_width_px);
		this.mouse_pressed_row = Math.floor(this.p5!.mouseY / this.cell_width_px);
	}

	private handleMouseReleased() {
		// if there isn't a selected piece then don't do anything
		if (this.mouse_pressed_row === undefined || this.mouse_pressed_col === undefined) return;

		if (this.cell_width_px === undefined)
			throw Error("cell_width_px is undefined, can't determine mouse position in row/col");

		const to_col: number = Math.floor(this.p5!.mouseX / this.cell_width_px);
		const to_row: number = Math.floor(this.p5!.mouseY / this.cell_width_px);

		this.board.move(
			this.mouse_pressed_row,
			this.mouse_pressed_col,
			to_row,
			to_col
		);

		this.mouse_pressed_row = undefined;
		this.mouse_pressed_col = undefined;
	}

	private drawBackground() {
		if (this.background === undefined) throw Error("Background p5.Graphics is not defined");

		// only way to draw a p5.Graphics object to canvas is with image draw function
		this.p5!.image(this.background, 0, 0);
	}

	private drawPieces() {
		if (this.cell_width_px === undefined) throw Error("cell_width_px is undefined, can't draw pieces");

		const pieces = this.board.pieces;

		for (const piece of pieces) {
			const draw_x = piece.col * this.cell_width_px;
			const draw_y = piece.row * this.cell_width_px;

			// don't draw piece grabbed by mouse, we'll do it after
			if (piece.col == this.mouse_pressed_col && piece.row == this.mouse_pressed_row)
				continue;

			this.drawPiece(piece, draw_x, draw_y);
		}

		// draw piece grabbed by mouse now
		// this is so that it's above all other pieces
		if (this.mouse_pressed_col !== undefined && this.mouse_pressed_row !== undefined) {
			// to draw middle on mouse, we need to offset
			const draw_x = this.p5!.mouseX - (this.cell_width_px / 2);
			const draw_y = this.p5!.mouseY - (this.cell_width_px / 2);

			const mouse_pressed_piece = this.board.at(this.mouse_pressed_row, this.mouse_pressed_col);

			if (mouse_pressed_piece !== undefined)
				this.drawPiece(mouse_pressed_piece, draw_x, draw_y);
		}
	}

	private drawPiece(piece: Piece, x: number, y: number) {
		if (this.piece_images === undefined) throw Error("piece_images not loaded, can't draw pieces");
		if (this.cell_width_px === undefined) throw Error("cell_width_px is undefined, can't draw pieces");

		// draw p5.Image
		this.p5!.image(
			this.piece_images[piece.color][piece.type],	// image
			x,											// x in pixels
			y,											// y in pixels
			this.cell_width_px,							// width in pixels
			this.cell_width_px							// height in pixels
		);
	}

	// https://p5js.org/reference/#/p5.Image/get
	// (p5.Image).get(x, y, width, height)
	private generatePieceImages() {
		if (this.pieces_image === undefined) throw Error("pieces_image not loaded, can't generate piece images");

		this.piece_images = [];

		this.piece_images[PieceColor.WHITE] = [];
		this.piece_images[PieceColor.BLACK] = [];

		// average size of piece images, doesn't really matter
		const size = 333.4;

		// generate all white piece images
		this.piece_images[PieceColor.WHITE][PieceType.PAWN] = this.pieces_image.get(1665, 0.5, size, size);
		this.piece_images[PieceColor.WHITE][PieceType.ROOK] = this.pieces_image.get(1332, 0.5, size, size);
		this.piece_images[PieceColor.WHITE][PieceType.KNIGHT] = this.pieces_image.get(999, 0.5, size, size);
		this.piece_images[PieceColor.WHITE][PieceType.BISHOP] = this.pieces_image.get(666, 0.5, size, size);
		this.piece_images[PieceColor.WHITE][PieceType.KING] = this.pieces_image.get(0, 0.5, size, size);
		this.piece_images[PieceColor.WHITE][PieceType.QUEEN] = this.pieces_image.get(333, 0.5, size, size);

		// generate all black piece images
		this.piece_images[PieceColor.BLACK][PieceType.PAWN] = this.pieces_image.get(1665, 333.5, size, size);
		this.piece_images[PieceColor.BLACK][PieceType.ROOK] = this.pieces_image.get(1332, 333.5, size, size);
		this.piece_images[PieceColor.BLACK][PieceType.KNIGHT] = this.pieces_image.get(999, 333.5, size, size);
		this.piece_images[PieceColor.BLACK][PieceType.BISHOP] = this.pieces_image.get(666, 333.5, size, size);
		this.piece_images[PieceColor.BLACK][PieceType.KING] = this.pieces_image.get(0, 333.5, size, size);
		this.piece_images[PieceColor.BLACK][PieceType.QUEEN] = this.pieces_image.get(333, 333.5, size, size);
	}

	private generateBackground() {
		if (this.cell_width_px === undefined) throw Error("cell_width_px is undefined, can't generate background")
		if (this.screen_size_px === undefined) throw Error("screen_size_px is undefined, can't generate background")

		if (this.background == undefined)
			this.background = this.p5!.createGraphics(this.screen_size_px, this.screen_size_px);

		// define colors using hex color codes
		const square_color_even = this.p5!.color("#f1d9c0");
		const square_color_odd = this.p5!.color("#a97b65");

		// fill with even color
		this.background.background(square_color_even);

		// drawing will fill with odd color, and without "stroke" or a border
		this.background.fill(square_color_odd);
		this.background.noStroke();

		// in the shape of an 8x8 board, at every other square ^
		for (let col = 0; col < 8; col++) {
			for (let row = 0; row < 8; row++) {
				if (((col + row) & 1) != 0)			// magic every other square thing
					this.background.rect(
						col * this.cell_width_px,	// x in pixels
						row * this.cell_width_px,	// y in pixels
						this.cell_width_px,			// width in pixels
						this.cell_width_px			// height in pixels
					);
			}
		}
	}
}
