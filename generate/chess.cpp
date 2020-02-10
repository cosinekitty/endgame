#include "chess.h"

namespace CosineKitty
{
    ChessBoard::ChessBoard()
    {
        for (int x=0; x<10; ++x)
        {
            for (int y=0; y<12; ++y)
            {
                int offset = 10*y + x;
                if (x>=1 && x<=8 && y>=2 && y<=9)
                    square[offset] = Empty;
                else
                    square[offset] = OffBoard;
            }
        }

        square[wkpos=25] = WhiteKing;
        square[bkpos=95] = BlackKing;
        isWhiteTurn = true;
    }
}
