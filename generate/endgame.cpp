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
        int length = 10;
        int npieces = static_cast<int>(pieces.size());
        for (int i=1; i < npieces; ++i)
            length *= 64;
    }

    void Endgame::Search()
    {

    }

    void Endgame::Save(std::string filename) const
    {

    }
}
