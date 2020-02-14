/*
    chess.h  -  Don Cross  -  https://github.com/cosinekitty/endgame
*/
#ifndef __COSINEKITTY_CHESS_H
#define __COSINEKITTY_CHESS_H

#include <string>
#include <stack>
#include <vector>

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

        const std::string& Message() const { return message; }
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
        return static_cast<char>((x - 1) + 'a');
    }

    inline char Rank(int offset)
    {
        int y = offset / 10;
        if (y < 2 || y > 9)
            throw ChessException("Invalid chess board offset (rank)");
        return static_cast<char>((y - 2) + '1');
    }

    inline unsigned char ValidateOffset(int offset)
    {
        // Call Rank, File for the side-effect of throwing an exception if offset is invalid.
        Rank(offset);
        File(offset);
        return static_cast<unsigned char>(offset);
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

    inline char SquareChar(Square s)
    {
        switch (s)
        {
        case Empty:         return '.';
        case WhitePawn:     return 'P';
        case WhiteKnight:   return 'N';
        case WhiteBishop:   return 'B';
        case WhiteRook:     return 'R';
        case WhiteQueen:    return 'Q';
        case WhiteKing:     return 'K';
        case BlackPawn:     return 'p';
        case BlackKnight:   return 'n';
        case BlackBishop:   return 'b';
        case BlackRook:     return 'r';
        case BlackQueen:    return 'q';
        case BlackKing:     return 'k';
        default:            return '?';
        }
    }

    enum Side
    {
        Invalid,
        Nobody,
        White,
        Black,
    };

    inline Side SquareSide(Square square)
    {
        switch (square)
        {
        case WhitePawn:
        case WhiteKnight:
        case WhiteBishop:
        case WhiteRook:
        case WhiteQueen:
        case WhiteKing:
            return White;

        case BlackPawn:
        case BlackKnight:
        case BlackBishop:
        case BlackRook:
        case BlackQueen:
        case BlackKing:
            return Black;

        case Empty:
            return Nobody;

        default:
            return Invalid;     // off the board or not a valid piece at all.
        }
    }

    inline Side Opposite(Side side)
    {
        switch (side)
        {
        case White:
            return Black;
        case Black:
            return White;
        default:
            return side;
        }
    }

    // The directional offsets in the chess board...
    const int North     = +10;
    const int NorthEast = +11;
    const int East      =  +1;
    const int SouthEast =  -9;
    const int South     = -10;
    const int SouthWest = -11;
    const int West      =  -1;
    const int NorthWest =  +9;

    const int KnightDir1 = (2*North + East);
    const int KnightDir2 = (2*North + West);
    const int KnightDir3 = (2*South + East);
    const int KnightDir4 = (2*South + West);
    const int KnightDir5 = (2*East + North);
    const int KnightDir6 = (2*East + South);
    const int KnightDir7 = (2*West + North);
    const int KnightDir8 = (2*West + South);

    // Score constants...
    const short Unscored   = -2000;
    const short BlackMates = -1000;
    const short WhiteMates = +1000;
    const short PosInf     = +2000;    // better than any possible score
    const short Draw       =     0;

    struct Move
    {
        unsigned char   source;
        unsigned char   dest;
        short           score;

        Move()
            : source(0)
            , dest(0)
            , score(Unscored)
            {}

        Move(short _score)      // create a null move with a score, to represent checkmate/stalemate
            : source(0)
            , dest(0)
            , score(_score)
            {}

        Move(int _source, int _dest, short _score = Unscored)
            : source(ValidateOffset(_source))
            , dest(ValidateOffset(_dest))
            , score(_score)
            {}

        std::string Algebraic() const
        {
            std::string text;
            text.push_back(File(source));
            text.push_back(Rank(source));
            text.push_back(File(dest));
            text.push_back(Rank(dest));
            return text;
        }
    };

    struct Unmove       // information needed to undo a move on the ChessBoard
    {
        Move   move;
        Square capture;

        Unmove(Move _move, Square _capture)
            : move(_move)
            , capture(_capture)
            {}
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
        Square  square[120];    // 8x8 chess board embedded in a 10x12 buffer.
        int     wkpos;          // White King's position (index into 'square')
        int     bkpos;          // Black King's position (index into 'square')
        bool    isWhiteTurn;    // is it White's turn to move?
        std::stack<Unmove> unmoveStack;

    public:
        ChessBoard() { Clear(true); }
        void Clear(bool whiteToMove);
        bool IsWhiteTurn() const { return isWhiteTurn; }
        void GenMoves(MoveList &movelist);      // Get list of all legal moves for current player.
        void PushMove(Move move);
        void PopMove();
        Square GetSquare(int offset) const;
        void SetTurn(bool whiteToMove) { isWhiteTurn = whiteToMove; }
        void SetSquare(int offset, Square value);
        bool IsLegalPosition() const;
        bool IsCurrentPlayerInCheck() const;

    private:
        void GenWhiteMoves(MoveList &movelist);
        void GenBlackMoves(MoveList &movelist);
        void TryWhiteMove(MoveList &movelist, int source, int dest);
        void TryBlackMove(MoveList &movelist, int source, int dest);
        void TryWhiteRay(MoveList &movelist, int source, int dir);
        void TryBlackRay(MoveList &movelist, int source, int dir);
        bool IsAttackedByWhite(int offset) const;
        bool IsAttackedByBlack(int offset) const;
        bool IsAttackedRay(int source, int dir, Square piece1, Square piece2) const;
    };

    struct Position
    {
        std::size_t index;
        int         symmetry;

        Position(std::size_t _index, int _symmetry)
            : index(_index)
            , symmetry(_symmetry)
            {}

        Move RotateMove(Move raw) const;
    };

    class Endgame
    {
    private:
        std::vector<Square> pieces;
        std::vector<int>    offsetList;
        std::vector<Move>   whiteTable;
        std::vector<short>  blackTable;
        std::size_t         length;

    public:
        Endgame(const char *piecelist);
        std::size_t GetTableSize() const { return length; }
        void Generate();
        void Save(std::string filename) const;

        static int UnitTest();

    private:
        void Search(ChessBoard& board, std::size_t npieces, int mateInMoves, int& nfound, Side side);
        Position CalcPosition(int symmetry) const;
        Position TableIndex() const;
        int ScoreWhite(ChessBoard &board, int mateInMoves);
        int ScoreBlack(ChessBoard &board);
        void UpdateOffset(int oldOffset, int newOffset);
        std::string PositionText(std::size_t index) const;
    };
}

#endif /* __COSINEKITTY_CHESS_H */
