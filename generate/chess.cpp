#include "chess.h"

namespace CosineKitty
{
    ChessBoard::ChessBoard()
    {
        for (int x=0; x<10; ++x)
            for (int y=0; y<12; ++y)
                square[10*y + x] = (x>=1 && x<=8 && y>=2 && y<=9) ? Empty : OffBoard;

        square[wkpos = Offset('e', '1')] = WhiteKing;
        square[bkpos = Offset('e', '8')] = BlackKing;
        isWhiteTurn = true;
    }
}
