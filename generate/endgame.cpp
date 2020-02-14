/*
    endgame.cpp  -  Don Cross  -  https://github.com/cosinekitty/endgame
*/

#include <cstdio>
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
            case 'b':   pieces.push_back(WhiteBishop);  break;
            case 'n':   pieces.push_back(WhiteKnight);  break;
            default:
                throw ChessException("Illegal endgame piece: must be q, r, b, n.");
            }
        }

        offsetList.resize(pieces.size());

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
        blackTable = vector<short>(length, Unscored);
        ChessBoard board;

        int nfound = 1;
        for (int mateInMoves = 1; nfound > 0; ++mateInMoves)
        {
            nfound = 0;
            Search(board, 0, mateInMoves, nfound, Black);
            cout << "Black Search(" << mateInMoves << "): found " << nfound << endl;

            nfound = 0;
            Search(board, 0, mateInMoves, nfound, White);
            cout << "White Search(" << mateInMoves << "): found " << nfound << endl;
        }
    }


    Position Endgame::CalcPosition(int symmetry) const
    {
        if (symmetry < 0 || symmetry >= NumSymmetries)
            throw ChessException("CalcPosition: symmetry is out of bounds.");

        int bkDisplacement = SymmetryTable[symmetry][Displacements[offsetList[0]]];
        int bkOffset = PieceOffsets[bkDisplacement];

        // A position has a valid index only if the Black King is inside
        // one of the 10 squares indicated by FirstDisplacements.
        int bkFirst = FirstDisplacements[bkOffset];
        if (bkFirst < 0)
            return Position(length, symmetry);      // return an invalid index to signal caller to ignore this symmetry

        if (bkFirst > 9)
            throw ChessException("Internal error in CalcPosition");

        std::size_t index = bkFirst;
        for (std::size_t i = 1; i < offsetList.size(); ++i)
            index = (64 * index) + SymmetryTable[symmetry][Displacements[offsetList[i]]];

        return Position(index, symmetry);
    }


    Position Endgame::TableIndex() const
    {
        // Iterate through all symmetries and pick the one with the smallest index.
        // That will be the canonical representation of the position.

        Position best = CalcPosition(0);
        for (int s=1; s < NumSymmetries; ++s)
        {
            Position pos = CalcPosition(s);
            if (pos.index < best.index)
                best = pos;
        }

        if (best.index >= length)
            throw ChessException("TableIndex: index is out of range");

        return best;
    }


    void Endgame::Search(ChessBoard& board, std::size_t npieces, int mateInMoves, int& nfound, Side side)
    {
        using namespace std;

        if (npieces == 0)
        {
            // The Black King is special: exploit symmetry by keeping
            // it in the 10 distinct board locations.
            for (size_t i=0; i < 10; ++i)
            {
                offsetList[npieces] = FirstPieceOffsets[i];
                board.SetSquare(FirstPieceOffsets[i], pieces[npieces]);
                Search(board, 1, mateInMoves, nfound, side);
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
                    offsetList[npieces] = PieceOffsets[i];
                    board.SetSquare(PieceOffsets[i], pieces[npieces]);
                    if (board.IsLegalPosition())        // prune positions where kings are touching
                        Search(board, npieces+1, mateInMoves, nfound, side);
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
                    offsetList[npieces] = PieceOffsets[i];
                    board.SetSquare(PieceOffsets[i], pieces[npieces]);
                    Search(board, npieces+1, mateInMoves, nfound, side);
                    board.SetSquare(PieceOffsets[i], Empty);    // must erase non-King pieces
                }
            }
        }
        else
        {
            // All the pieces have been placed on the board.
            switch (side)
            {
            case Black:
                nfound += ScoreBlack(board);
                break;

            case White:
                nfound += ScoreWhite(board, mateInMoves);
                break;

            default:
                throw ChessException("Search: invalid side");
            }
        }
    }

    int Endgame::ScoreWhite(ChessBoard& board, int mateInMoves)
    {
        board.SetTurn(true);    // make it be White's turn to move
        if (!board.IsLegalPosition())
            return 0;   // this position cannot be reached in a real chess game

        // Calculate the symmetric table index for this chess position.
        Position pos = TableIndex();

        // If the position has already been resolved, don't do any redundant work.
        if (whiteTable.at(pos.index).score != Unscored)
            return 0;

        // Generate legal moves for White.
        MoveList movelist;
        board.GenMoves(movelist);
        if (movelist.length == 0)
        {
            // The game is over. This should never happen! White should always have a move.
            throw ChessException("ScoreWhite: no legal moves for White");
        }

        // Try every legal move and see if any are forced wins at the expected win horizon.
        int requiredScore = (WhiteMates + 1) - 2*mateInMoves;
        for (int i=0; i < movelist.length; ++i)
        {
            Move move = movelist.movelist[i];
            UpdateOffset(move.source, move.dest);
            Position next = TableIndex();
            move.score = blackTable.at(next.index) - 1;     // penalize forced wins by one ply
            UpdateOffset(move.dest, move.source);

            if (move.score == requiredScore)
            {
                // We found a forced mate with the current horizon. Use it!
                whiteTable.at(pos.index) = pos.RotateMove(move);
                return 1;
            }
        }

        return 0;   // no forced mate found at this horizon
    }

    int Endgame::ScoreBlack(ChessBoard& board)
    {
        board.SetTurn(false);   // make it be Black's turn to move
        if (!board.IsLegalPosition())
            return 0;   // this position cannot be reached in a real chess game

        // Calculate the symmetric table index for this chess position.
        Position pos = TableIndex();

        // If the position has already been resolved, don't do any redundant work.
        if (blackTable.at(pos.index) != Unscored)
            return 0;

        // Generate legal moves for White.
        MoveList movelist;
        board.GenMoves(movelist);
        if (movelist.length == 0)
        {
            // The game is over: Black has either been stalemated or checkmated.
            short score = board.IsCurrentPlayerInCheck() ? WhiteMates : Draw;
            blackTable.at(pos.index) = score;
            return 1;
        }

        // Try every legal move for Black to see what happens in each case.
        // If any move leads to a forced draw (either because of stalemate or
        // a capture of White's necessary material for checkmate),
        // immediately call the position a draw. (This is the best possible outcome for Black).
        // Otherwise, if any resulting position is undecided, this one is undecided also.
        // If all resulting positions result in a loss, pick the one that postpones
        // checkmate the longest.

        int unresolvedCount = 0;
        short bestScore = PosInf;
        for (int i=0; i < movelist.length; ++i)
        {
            Move move = movelist.movelist[i];
            Square capture = board.GetSquare(move.dest);
            if (capture != Empty)
            {
                // Assume any capture of a White piece results in a draw.
                blackTable.at(pos.index) = Draw;
                return 1;
            }
            UpdateOffset(move.source, move.dest);
            Position next = TableIndex();
            short score = whiteTable.at(next.index).score;
            UpdateOffset(move.dest, move.source);

            if (score == Unscored)
            {
                ++unresolvedCount;
            }
            else if (score > Draw)
            {
                --score;    // give bonus to Black for postponing checkmate by one ply.
                if (score < bestScore)
                    bestScore = score;
            }
            else if (score == Draw)
            {
                // Black can force a draw, so this position is immediately known to be a draw.
                blackTable.at(pos.index) = Draw;
                return 1;
            }
            else
            {
                throw ChessException("ScoreBlack: Unexpected win for Black");
            }
        }

        if (unresolvedCount > 0)
            return 0;   // cannot evaluate this position yet

        if (bestScore > Draw && bestScore < WhiteMates)
        {
            blackTable.at(pos.index) = bestScore;
            return 1;
        }

        throw ChessException("ScoreBlack: impossible score");
    }


    void Endgame::UpdateOffset(int oldOffset, int newOffset)
    {
        ValidateOffset(oldOffset);
        ValidateOffset(newOffset);

        // Figure out which piece is being moved, and update its offset.
        for (int& ofs : offsetList)
        {
            if (ofs == oldOffset)
            {
                ofs = newOffset;
                return;
            }
        }

        // If we didn't find a matching offset, something is wrong!
        throw ChessException("UpdateOffset: could not find piece at old offset");
    }


    void Endgame::Save(std::string filename) const
    {
        FILE *outfile = fopen(filename.c_str(), "wt");
        if (outfile == NULL)
            throw ChessException(std::string("Cannot open output file: ") + filename);

        fprintf(outfile, "%lu\n", static_cast<unsigned long>(length));
        for (std::size_t i=0; i < length; ++i)
        {
            Move m = whiteTable[i];
            if (m.score > 0)
            {
                int mateIn = ((WhiteMates + 1) - m.score) / 2;
                fprintf(outfile, "%9lu %2d %s %s\n",
                    static_cast<unsigned long>(i),
                    mateIn,
                    m.Algebraic().c_str(),
                    PositionText(i).c_str());
            }
        }

        fclose(outfile);
    }

    std::string Endgame::PositionText(std::size_t index) const
    {
        using namespace std;

        int i;
        vector<int> offset(pieces.size());

        const int n = static_cast<int>(pieces.size());
        for (i = n-1; i > 0; --i)
        {
            offset[i] = PieceOffsets[index % 64];
            index /= 64;
        }

        if (index > 9)
            throw ChessException("PositionText: Invalid index residue");

        offset[0] = FirstPieceOffsets[index];

        string text;
        for (i = 0; i < n; ++i)
        {
            if (i > 0)
                text.push_back(',');
            text.push_back(SquareChar(pieces[i]));
            text.push_back(File(offset[i]));
            text.push_back(Rank(offset[i]));
        }

        return text;
    }

    Move Position::RotateMove(Move move) const
    {
        ValidateOffset(move.source);
        ValidateOffset(move.dest);
        int source = PieceOffsets[SymmetryTable[symmetry][Displacements[move.source]]];
        int dest   = PieceOffsets[SymmetryTable[symmetry][Displacements[move.dest]]];
        return Move(source, dest, move.score);
    }
}
