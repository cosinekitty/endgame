/*
    endgame.cpp  -  Don Cross  -  https://github.com/cosinekitty/endgame
*/

#include "chess.h"

namespace CosineKitty
{
    Endgame::Endgame(const char *piecelist)
    {
        // There is always an implicit Black King [0] and White King [1].
        pieces.push_back(BlackKing);
        pieces.push_back(WhiteKing);

        // The other pieces are all White pieces: Q, R, N, and/or B.
        for (int i=0; piecelist[i]; ++i)
        {
            // More than 4 total pieces uses more than 1 GB of memory!
            if (pieces.size() == 4)
                throw ChessException("Cannot have more than 4 pieces total in an endgame configuration.");

            switch (piecelist[i])
            {
            case 'q':   pieces.push_back(WhiteQueen);   break;
            case 'r':   pieces.push_back(WhiteRook);    break;
            case 'b':   pieces.push_back(WhiteKnight);  break;
            case 'n':   pieces.push_back(WhiteKnight);  break;
            default:
                throw ChessException("Illegal endgame piece: must be q, r, b, n.");
            }
        }

        // Calculate the table length based on the maximum possible index.
        // Using eightfold symmetry, the Black King can be in only 10 possible distinct locations.
        // The White King can be in any remaining square, but call it 64 to keep code simple.
        length = 10;
        std::size_t npieces = pieces.size();
        for (std::size_t i=1; i < npieces; ++i)
            length *= 64;
    }

    static const int FirstPieceOffsets[10] =
    {
        21, 22, 23, 24,
        32, 33, 34,
        43, 44,
        54
    };

    static const int PieceOffsets[64] =
    {
        21, 22, 23, 24, 25, 26, 27, 28,
        31, 32, 33, 34, 35, 36, 37, 38,
        41, 42, 43, 44, 45, 46, 47, 48,
        51, 52, 53, 54, 55, 56, 57, 58,
        61, 62, 63, 64, 65, 66, 67, 68,
        71, 72, 73, 74, 75, 76, 77, 78,
        81, 82, 83, 84, 85, 86, 87, 88,
        91, 92, 93, 94, 95, 96, 97, 98
    };

    void Endgame::Generate()
    {
        using namespace std;

        whiteTable = vector<Move>(length);
        blackTable = vector<Move>(length);
        ChessBoard board;

        int nfound = 1;
        for (int mateDelay = 0; nfound > 1; ++mateDelay)
        {
            nfound = 0;
            // If mateDelay is even, then White has the turn; otherwise Black does.
            board.SetTurn((mateDelay & 1) == 0);
            Search(board, 0, 0, mateDelay, nfound);
        }
    }

    void Endgame::Search(ChessBoard& board, std::size_t npieces, std::size_t index, int mateDelay, int& nfound)
    {
        using namespace std;

        if (npieces == 0)
        {
            // The Black King is special: exploit symmetry by keeping
            // it in the 10 distinct board locations.
            for (size_t i=0; i < 10; ++i)
            {
                board.SetSquare(FirstPieceOffsets[i], pieces[0]);
                Search(board, 1, i, mateDelay, nfound);
                // No need to erase Black King because it is moved automatically.
            }
        }
        else if (npieces == 1)
        {
            // Try putting the White King in 63 remaining different locations.
            size_t basis = 10 * index;      // The Black King is in one of 10 different places.
            for (size_t i=0; i < 64; ++i)
            {
                if (board.GetSquare(PieceOffsets[i]) == Empty)
                {
                    board.SetSquare(PieceOffsets[i], pieces[npieces]);
                    if (board.IsLegalPosition())        // prune positions where kings are touching
                        Search(board, npieces+1, basis + i, mateDelay, nfound);
                    // No need to erase White King because it is moved automatically.
                }
            }
        }
        else if (npieces < pieces.size())
        {
            size_t basis = 64 * index;
            for (size_t i=0; i < 64; ++i)
            {
                if (board.GetSquare(PieceOffsets[i] == Empty))
                {
                    board.SetSquare(PieceOffsets[i], pieces[npieces]);
                    Search(board, npieces+1, basis + i, mateDelay, nfound);
                    board.SetSquare(PieceOffsets[i], Empty);    // must erase non-King pieces
                }
            }
        }
        else
        {
            // All the pieces have been placed on the board.
            // Make sure we don't waste any effort re-calculating a position
            // that has already been resolved.
            vector<Move>& table = *(board.IsWhiteTurn() ? &whiteTable : &blackTable);
            Move& entry = table.at(index);
            if (entry.score != Unscored)
                return;

            // Perform one final check that the position is legal.
            if (!board.IsLegalPosition())
                return;

            // Generate a list of all legal moves for the current player.
            MoveList movelist;
            board.GenMoves(movelist);
            if (movelist.length == 0)
            {
                // The current player has no legal moves. Is he stalemated or checkmated?
                if (board.IsCurrentPlayerInCheck())
                {
                    // The current player has been checkmated.
                    
                }
                else
                {
                    // The game is a draw due to stalemate.
                }
            }
        }
    }

    void Endgame::Save(std::string filename) const
    {

    }
}
