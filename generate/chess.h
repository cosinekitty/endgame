/*
    chess.h  -  Don Cross  -  https://github.com/cosinekitty/endgame
*/
#ifndef __COSINEKITTY_CHESS_H
#define __COSINEKITTY_CHESS_H

#include <string>

namespace CosineKitty
{
    class ChessException
    {
    private:
        const std::string message;

    public:
        ChessException(std::string _message)
            : message(_message)
            {}

        const std::string& Message() { return message; }
    };

    enum Square
    {
        Empty,
        OffBoard,

        WhitePawn,
        WhiteKnight,
        WhiteBishop,
        WhiteRook,
        WhiteQueen,
        WhiteKing,

        BlackPawn,
        BlackKnight,
        BlackBishop,
        BlackRook,
        BlackQueen,
        BlackKing,
    };

    struct Move
    {
        unsigned char source;
        unsigned char dest;
        short score;
    };

    const int MaxMoves = 255;       // The maximum number of moves possible in any chess position is less than this.

    struct MoveList
    {
        int length;     // the number of moves in 'movelist' that are valid
        Move movelist[MaxMoves];

        MoveList()
            : length(0)
            {}
    };

    class ChessBoard
    {
    private:
        Square square[120];     // 8x8 chess board embedded in a 10x12 buffer.
        int wkpos;              // White King's position (index into 'square')
        int bkpos;              // Black King's position (index into 'square')
        bool isWhiteTurn;       // is it White's turn to move?

    public:
        ChessBoard();
    };
}

#endif /* __COSINEKITTY_CHESS_H */
