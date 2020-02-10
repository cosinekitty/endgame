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

        const std::string& Message() const
        {
            return message;
        }
    };

    inline int Offset(char file, char rank)
    {
        // file is a letter 'a'..'h'.
        // rank is a digit  '1'..'8'.
        // Return the offset into the 10x12 board array.
        if (file < 'a' || file > 'h' || rank < '1' || rank > '8')
            throw ChessException("Invalid file/rank coordinates.");
        return ((file - 'a') + 1) + 10*((rank - '1') + 2);
    }

    inline char File(int offset)
    {
        int x = offset % 10;
        if (x < 1 || x > 8)
            throw ChessException("Invalid chess board offset (file)");
        return (x - 1) + 'a';
    }

    inline char Rank(int offset)
    {
        int y = offset / 10;
        if (y < 2 || y > 9)
            throw ChessException("Invalid chess board offset (rank)");
        return (y - 2) + '1';
    }

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

        void Add(Move move)
        {
            if (length >= MaxMoves)
                throw ChessException("MoveList overflow");

            movelist[length++] = move;
        }
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
