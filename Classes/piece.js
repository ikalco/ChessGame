class Piece {
    constructor(color, position = []) {
        this.color = color;
        this.boardPos = position;
        this.y = this.boardPos[0] * PiecePxSize;
        this.x = this.boardPos[1] * PiecePxSize;
    }

    show() {
        push();
        if (this.color == '') {
            fill(0,255,255);
        } else if (this.color == 'White') {
            fill(255);
        } else if (this.color = 'Black'){
            fill(0)
        }
        rect(this.x, this.y, PiecePxSize, PiecePxSize);
        pop();
    }
}