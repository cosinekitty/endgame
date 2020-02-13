/*
    endgame.cpp  -  Don Cross  -  https://github.com/cosinekitty/endgame
*/

#include <iostream>
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

        displist.resize(pieces.size());

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

    static const int FirstDisplacements[120] =   // inverse of FirstPieceOffsets
    {
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,   0,   1,   2,   3,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,   4,   5,   6,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,   7,   8,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,   9,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1
    };

    static const int PieceOffsets[64] =     // Convert displacement 0..64 to board offset
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

    static const int Displacements[120] =   // Convert board offsets to displacement 0..64 (inverse of PieceOffsets)
    {
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,   0,   1,   2,   3,   4,   5,   6,   7,  -1,
       -1,   8,   9,  10,  11,  12,  13,  14,  15,  -1,
       -1,  16,  17,  18,  19,  20,  21,  22,  23,  -1,
       -1,  24,  25,  26,  27,  28,  29,  30,  31,  -1,
       -1,  32,  33,  34,  35,  36,  37,  38,  39,  -1,
       -1,  40,  41,  42,  43,  44,  45,  46,  47,  -1,
       -1,  48,  49,  50,  51,  52,  53,  54,  55,  -1,
       -1,  56,  57,  58,  59,  60,  61,  62,  63,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
       -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1
    };

    static const int NumSymmetries = 8;

    static const int InverseSymmetry[NumSymmetries] =
    {
        0, 1, 2, 3, 4, 6, 5, 7
    };

    static const int SymmetryTable[NumSymmetries][64] =
    {
        // 0 = identity
        {
             0,  1,  2,  3,  4,  5,  6,  7,
             8,  9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23,
            24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39,
            40, 41, 42, 43, 44, 45, 46, 47,
            48, 49, 50, 51, 52, 53, 54, 55,
            56, 57, 58, 59, 60, 61, 62, 63
        },

        // 1 = flip x
        {
             7,  6,  5,  4,  3,  2,  1,  0,
            15, 14, 13, 12, 11, 10,  9,  8,
            23, 22, 21, 20, 19, 18, 17, 16,
            31, 30, 29, 28, 27, 26, 25, 24,
            39, 38, 37, 36, 35, 34, 33, 32,
            47, 46, 45, 44, 43, 42, 41, 40,
            55, 54, 53, 52, 51, 50, 49, 48,
            63, 62, 61, 60, 59, 58, 57, 56
        },

        // 2 = flip y
        {
            56, 57, 58, 59, 60, 61, 62, 63,
            48, 49, 50, 51, 52, 53, 54, 55,
            40, 41, 42, 43, 44, 45, 46, 47,
            32, 33, 34, 35, 36, 37, 38, 39,
            24, 25, 26, 27, 28, 29, 30, 31,
            16, 17, 18, 19, 20, 21, 22, 23,
             8,  9, 10, 11, 12, 13, 14, 15,
             0,  1,  2,  3,  4,  5,  6,  7
        },

        // 3 = rotate 180
        {
            63, 62, 61, 60, 59, 58, 57, 56,
            55, 54, 53, 52, 51, 50, 49, 48,
            47, 46, 45, 44, 43, 42, 41, 40,
            39, 38, 37, 36, 35, 34, 33, 32,
            31, 30, 29, 28, 27, 26, 25, 24,
            23, 22, 21, 20, 19, 18, 17, 16,
            15, 14, 13, 12, 11, 10,  9,  8,
             7,  6,  5,  4,  3,  2,  1,  0
        },

        // 4 = slash
        {
            0,  8, 16, 24, 32, 40, 48, 56,
            1,  9, 17, 25, 33, 41, 49, 57,
            2, 10, 18, 26, 34, 42, 50, 58,
            3, 11, 19, 27, 35, 43, 51, 59,
            4, 12, 20, 28, 36, 44, 52, 60,
            5, 13, 21, 29, 37, 45, 53, 61,
            6, 14, 22, 30, 38, 46, 54, 62,
            7, 15, 23, 31, 39, 47, 55, 63
        },

        // 5 = rotate right
        {
            7, 15, 23, 31, 39, 47, 55, 63,
            6, 14, 22, 30, 38, 46, 54, 62,
            5, 13, 21, 29, 37, 45, 53, 61,
            4, 12, 20, 28, 36, 44, 52, 60,
            3, 11, 19, 27, 35, 43, 51, 59,
            2, 10, 18, 26, 34, 42, 50, 58,
            1,  9, 17, 25, 33, 41, 49, 57,
            0,  8, 16, 24, 32, 40, 48, 56
        },

        // 6 = rotate left
        {
            56, 48, 40, 32, 24, 16,  8,  0,
            57, 49, 41, 33, 25, 17,  9,  1,
            58, 50, 42, 34, 26, 18, 10,  2,
            59, 51, 43, 35, 27, 19, 11,  3,
            60, 52, 44, 36, 28, 20, 12,  4,
            61, 53, 45, 37, 29, 21, 13,  5,
            62, 54, 46, 38, 30, 22, 14,  6,
            63, 55, 47, 39, 31, 23, 15,  7
        },

        // 7 = backslash
        {
            63, 55, 47, 39, 31, 23, 15,  7,
            62, 54, 46, 38, 30, 22, 14,  6,
            61, 53, 45, 37, 29, 21, 13,  5,
            60, 52, 44, 36, 28, 20, 12,  4,
            59, 51, 43, 35, 27, 19, 11,  3,
            58, 50, 42, 34, 26, 18, 10,  2,
            57, 49, 41, 33, 25, 17,  9,  1,
            56, 48, 40, 32, 24, 16,  8,  0
        },
    };

    int Endgame::UnitTest()
    {
        using namespace std;

        int i, s;

        // Confirm displacement/offset conversions.
        for (i = 0; i < 10; ++i)
        {
            if (i != FirstDisplacements[FirstPieceOffsets[i]])
            {
                cerr << "FAIL: i=" << i << ", FirstPieceOffsets[i]=" << FirstPieceOffsets[i] << ", FirstDisplacements=" << FirstDisplacements[FirstPieceOffsets[i]] << endl;
                return 1;
            }
        }

        for (i = 0; i < 64; ++i)
        {
            if (i != Displacements[PieceOffsets[i]])
            {
                cerr << "FAIL: i=" << i << ", PieceOffsets[i]=" << PieceOffsets[i] << ", Displacements=" << Displacements[PieceOffsets[i]] << endl;
                return 1;
            }
        }

        for (s = 0; s < NumSymmetries; ++s)
        {
            // Confirm that there every value 0..63 is represented exactly once in each symmetry.
            int count[64] = { 0 };
            for (i = 0; i < 64; ++i)
                ++count[SymmetryTable[s][i]];

            for (i = 0; i < 64; ++i)
            {
                if (count[i] != 1)
                {
                    cerr << "FAIL: SymmetryTable[" << s << "] does not hold 0..63" << endl;
                    return 1;
                }
            }

            // Verify inverse symmetries.
            for (i = 0; i < 64; ++i)
            {
                int k = SymmetryTable[s][i];
                int r = SymmetryTable[InverseSymmetry[s]][k];
                if (i != r)
                {
                    cerr << "FAIL: InverseSymmetry[" << s << "] is broken." << endl;
                    return 1;
                }
            }
        }

        cout << "EndGame::UnitTest: PASS" << endl;
        return 0;
    }

    void Endgame::Generate()
    {
        using namespace std;

        whiteTable = vector<Move>(length);
        blackTable = vector<Move>(length);
        ChessBoard board;

        int nfound = 1;
        while (nfound > 0)
        {
            nfound = 0;
            Search(board, 0, nfound);
        }
    }


    Position Endgame::CalcPosition(int symmetry) const
    {
        if (symmetry < 0 || symmetry >= NumSymmetries)
            throw ChessException("CalcPosition: symmetry is out of bounds.");

        std::size_t index = 0;
        for (int d : displist)
            index = (64 * index) + SymmetryTable[symmetry][d];

        return Position(index, symmetry);
    }


    Position Endgame::TableIndex() const
    {
        // Iterate through all symmetries and pick the one with the smallest index.
        // That is the canonical representation of the position.
        Position best = CalcPosition(0);
        for (int s=1; s < NumSymmetries; ++s)
        {
            Position pos = CalcPosition(s);
            if (pos.index < best.index)
                best = pos;
        }
        return best;
    }


    void Endgame::Search(ChessBoard& board, std::size_t npieces, int& nfound)
    {
        using namespace std;

        if (npieces == 0)
        {
            // The Black King is special: exploit symmetry by keeping
            // it in the 10 distinct board locations.
            for (size_t i=0; i < 10; ++i)
            {
                displist[npieces] = i;
                board.SetSquare(FirstPieceOffsets[i], pieces[npieces]);
                Search(board, 1, nfound);
                // No need to erase Black King because it is moved automatically.
            }
        }
        else if (npieces == 1)
        {
            // Try putting the White King in 63 remaining different locations.
            for (size_t i=0; i < 64; ++i)
            {
                if (board.GetSquare(PieceOffsets[i]) == Empty)
                {
                    displist[npieces] = i;
                    board.SetSquare(PieceOffsets[i], pieces[npieces]);
                    if (board.IsLegalPosition())        // prune positions where kings are touching
                        Search(board, npieces+1, nfound);
                    // No need to erase White King because it is moved automatically.
                }
            }
        }
        else if (npieces < pieces.size())
        {
            for (size_t i=0; i < 64; ++i)
            {
                if (board.GetSquare(PieceOffsets[i]) == Empty)
                {
                    displist[npieces] = i;
                    board.SetSquare(PieceOffsets[i], pieces[npieces]);
                    Search(board, npieces+1, nfound);
                    board.SetSquare(PieceOffsets[i], Empty);    // must erase non-King pieces
                }
            }
        }
        else
        {
            // All the pieces have been placed on the board.
            // Find best immediate scores for Black and White to move.
            nfound += ScoreWhite(board);
            nfound += ScoreBlack(board);
        }
    }

    int Endgame::ScoreWhite(ChessBoard& board)
    {
        board.SetTurn(true);    // make it be White's turn to move

        // Calculate the symmetric table index for this chess position.
        // If the position has already been resolved, don't do any more work.

        return 0;
    }

    int Endgame::ScoreBlack(ChessBoard& board)
    {
        board.SetTurn(false);   // make it be Black's turn to move
        return 0;
    }

    void Endgame::Save(std::string filename) const
    {

    }
}
