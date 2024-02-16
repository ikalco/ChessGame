/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        "./piece.js": "./piece",
        "./board.js": "./board",
        "./fen_notation.js": "./fen_notation",
        "./algebra_notation.js": "./algebra_notation",
        "./board_factory.js": "./board_factory",
        "./legal_move_generator.js": "./legal_move_generator",
        "./pseudo_move_generator.js": "./pseudo_move_generator",
        "./gui.js": "./gui",
        "./move.js": "./move",
        "./perft.js": "./perft"
    }
};