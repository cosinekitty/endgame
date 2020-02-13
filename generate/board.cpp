#include "chess.h"

namespace CosineKitty
{
    void ChessBoard::Clear(bool whiteToMove)
    {
        for (int x=0; x<10; ++x)
            for (int y=0; y<12; ++y)
                square[10*y + x] = (x>=1 && x<=8 && y>=2 && y<=9) ? Empty : OffBoard;

        square[wkpos = Offset('e', '1')] = WhiteKing;
        square[bkpos = Offset('e', '8')] = BlackKing;
        isWhiteTurn = whiteToMove;
        unmoveStack = std::stack<Unmove>();
    }

    Square ChessBoard::GetSquare(int offset) const
    {
        if (offset < 0 || offset >= 120 || square[offset] == OffBoard)
            throw ChessException("ChessBoard::GetSquare: invalid offset");

        return square[offset];
    }

    void ChessBoard::SetSquare(int offset, Square value)
    {
        ValidateOffset(offset);
        if (SquareSide(value) == Invalid)
            throw ChessException("SetSquare: invalid square value");

        if (value == WhiteKing)
        {
            // There must be exactly one White King on the board.
            square[wkpos] = Empty;
            wkpos = offset;
        }
        else if (value == BlackKing)
        {
            // There must be exactly one Black King on the board.
            square[bkpos] = Empty;
            bkpos = offset;
        }

        square[offset] = value;

        if (square[wkpos] != WhiteKing)
            throw ChessException("White King is missing");

        if (square[bkpos] != BlackKing)
            throw ChessException("Black King is missing");
    }

    void ChessBoard::PushMove(Move move)
    {
        Square mover = square[move.source];
        Square capture = square[move.dest];
        if (isWhiteTurn)
        {
            if (SquareSide(mover) != White)
                throw ChessException("PushMove: attempt to move non-White piece");
            if (mover == WhiteKing)
                wkpos = move.dest;
        }
        else
        {
            if (SquareSide(mover) != Black)
                throw ChessException("PushMove: attempt to move non-Black piece");
            if (mover == BlackKing)
                bkpos = move.dest;
        }
        unmoveStack.push(Unmove(move, capture));
        square[move.dest] = mover;
        square[move.source] = Empty;
        isWhiteTurn = !isWhiteTurn;
    }

    void ChessBoard::PopMove()
    {
        if (unmoveStack.empty())
            throw ChessException("PopMove: unmove stack is empty.");

        isWhiteTurn = !isWhiteTurn;
        Unmove unmove = unmoveStack.top();
        unmoveStack.pop();
        square[unmove.move.source] = square[unmove.move.dest];
        square[unmove.move.dest] = unmove.capture;
        if (square[unmove.move.source] == WhiteKing)
            wkpos = unmove.move.source;
        else if (square[unmove.move.source] == BlackKing)
            bkpos = unmove.move.source;
    }

    void ChessBoard::GenMoves(MoveList &movelist)
    {
        if (isWhiteTurn)
            GenWhiteMoves(movelist);
        else
            GenBlackMoves(movelist);
    }

    bool ChessBoard::IsCurrentPlayerInCheck() const
    {
        return isWhiteTurn ? IsAttackedByBlack(wkpos) : IsAttackedByWhite(bkpos);
    }

    void ChessBoard::GenWhiteMoves(MoveList &movelist)
    {
        movelist.length = 0;
        for (char file='a'; file <= 'h'; ++file)
        {
            for (char rank='1'; rank <= '8'; ++rank)
            {
                int source = Offset(file, rank);
                switch (square[source])
                {
                case WhiteKing:
                    TryWhiteMove(movelist, source, source + North);
                    TryWhiteMove(movelist, source, source + NorthEast);
                    TryWhiteMove(movelist, source, source + East);
                    TryWhiteMove(movelist, source, source + SouthEast);
                    TryWhiteMove(movelist, source, source + South);
                    TryWhiteMove(movelist, source, source + SouthWest);
                    TryWhiteMove(movelist, source, source + West);
                    TryWhiteMove(movelist, source, source + NorthWest);
                    break;

                case WhiteQueen:
                    TryWhiteRay(movelist, source, North);
                    TryWhiteRay(movelist, source, NorthEast);
                    TryWhiteRay(movelist, source, East);
                    TryWhiteRay(movelist, source, SouthEast);
                    TryWhiteRay(movelist, source, South);
                    TryWhiteRay(movelist, source, SouthWest);
                    TryWhiteRay(movelist, source, West);
                    TryWhiteRay(movelist, source, NorthWest);
                    break;

                case WhiteRook:
                    TryWhiteRay(movelist, source, North);
                    TryWhiteRay(movelist, source, East);
                    TryWhiteRay(movelist, source, South);
                    TryWhiteRay(movelist, source, West);
                    break;

                case WhiteBishop:
                    TryWhiteRay(movelist, source, NorthEast);
                    TryWhiteRay(movelist, source, SouthEast);
                    TryWhiteRay(movelist, source, SouthWest);
                    TryWhiteRay(movelist, source, NorthWest);
                    break;

                case WhiteKnight:
                    TryWhiteMove(movelist, source, source + KnightDir1);
                    TryWhiteMove(movelist, source, source + KnightDir2);
                    TryWhiteMove(movelist, source, source + KnightDir3);
                    TryWhiteMove(movelist, source, source + KnightDir4);
                    TryWhiteMove(movelist, source, source + KnightDir5);
                    TryWhiteMove(movelist, source, source + KnightDir6);
                    TryWhiteMove(movelist, source, source + KnightDir7);
                    TryWhiteMove(movelist, source, source + KnightDir8);
                    break;

                case WhitePawn:
                    throw ChessException("Pawn movement not yet implemented.");

                default:
                    break;  // ignore anything but White's pieces.
                }
            }
        }
    }

    void ChessBoard::GenBlackMoves(MoveList &movelist)
    {
        movelist.length = 0;
        for (char file='a'; file <= 'h'; ++file)
        {
            for (char rank='1'; rank <= '8'; ++rank)
            {
                int source = Offset(file, rank);
                switch (square[source])
                {
                case BlackKing:
                    TryBlackMove(movelist, source, source + North);
                    TryBlackMove(movelist, source, source + NorthEast);
                    TryBlackMove(movelist, source, source + East);
                    TryBlackMove(movelist, source, source + SouthEast);
                    TryBlackMove(movelist, source, source + South);
                    TryBlackMove(movelist, source, source + SouthWest);
                    TryBlackMove(movelist, source, source + West);
                    TryBlackMove(movelist, source, source + NorthWest);
                    break;

                case BlackQueen:
                    TryBlackRay(movelist, source, North);
                    TryBlackRay(movelist, source, NorthEast);
                    TryBlackRay(movelist, source, East);
                    TryBlackRay(movelist, source, SouthEast);
                    TryBlackRay(movelist, source, South);
                    TryBlackRay(movelist, source, SouthWest);
                    TryBlackRay(movelist, source, West);
                    TryBlackRay(movelist, source, NorthWest);
                    break;

                case BlackRook:
                    TryBlackRay(movelist, source, North);
                    TryBlackRay(movelist, source, East);
                    TryBlackRay(movelist, source, South);
                    TryBlackRay(movelist, source, West);
                    break;

                case BlackBishop:
                    TryBlackRay(movelist, source, NorthEast);
                    TryBlackRay(movelist, source, SouthEast);
                    TryBlackRay(movelist, source, SouthWest);
                    TryBlackRay(movelist, source, NorthWest);
                    break;

                case BlackKnight:
                    TryBlackMove(movelist, source, source + KnightDir1);
                    TryBlackMove(movelist, source, source + KnightDir2);
                    TryBlackMove(movelist, source, source + KnightDir3);
                    TryBlackMove(movelist, source, source + KnightDir4);
                    TryBlackMove(movelist, source, source + KnightDir5);
                    TryBlackMove(movelist, source, source + KnightDir6);
                    TryBlackMove(movelist, source, source + KnightDir7);
                    TryBlackMove(movelist, source, source + KnightDir8);
                    break;

                case BlackPawn:
                    throw ChessException("Pawn movement not yet implemented.");

                default:
                    break;  // ignore anything but Black's pieces.
                }
            }
        }
    }

    void ChessBoard::TryWhiteMove(MoveList& movelist, int source, int dest)
    {
        Side mover = SquareSide(square[source]);
        if (mover != White)
            throw ChessException("TryWhiteMove: Attempt to move non-White piece.");

        Side capture = SquareSide(square[dest]);
        if (capture == Nobody || capture == Black)
        {
            // Determine whether the move is legal.
            // Try making the move and see if it places the mover's king in check.
            Move move(source, dest);
            PushMove(move);
            bool self_check = IsAttackedByBlack(wkpos);
            PopMove();
            if (!self_check)
                movelist.Add(move);
        }
    }

    void ChessBoard::TryBlackMove(MoveList& movelist, int source, int dest)
    {
        Side mover = SquareSide(square[source]);
        if (mover != Black)
            throw ChessException("TryBlackMove: Attempt to move non-Black piece.");

        Side capture = SquareSide(square[dest]);
        if (capture == Nobody || capture == White)
        {
            // Determine whether the move is legal.
            // Try making the move and see if it places the mover's king in check.
            Move move(source, dest);
            PushMove(move);
            bool self_check = IsAttackedByWhite(bkpos);
            PopMove();
            if (!self_check)
                movelist.Add(move);
        }
    }

    void ChessBoard::TryWhiteRay(MoveList &movelist, int source, int dir)
    {
        int dest;
        for (dest = source + dir; square[dest] == Empty; dest += dir)
            TryWhiteMove(movelist, source, dest);

        if (SquareSide(square[dest]) == Black)
            TryWhiteMove(movelist, source, dest);
    }

    void ChessBoard::TryBlackRay(MoveList &movelist, int source, int dir)
    {
        int dest;
        for (dest = source + dir; square[dest] == Empty; dest += dir)
            TryBlackMove(movelist, source, dest);

        if (SquareSide(square[dest]) == White)
            TryBlackMove(movelist, source, dest);
    }

    bool ChessBoard::IsAttackedByWhite(int offset) const
    {
        if (square[offset + North]     == WhiteKing) return true;
        if (square[offset + NorthEast] == WhiteKing) return true;
        if (square[offset + East]      == WhiteKing) return true;
        if (square[offset + SouthEast] == WhiteKing) return true;
        if (square[offset + South]     == WhiteKing) return true;
        if (square[offset + SouthWest] == WhiteKing) return true;
        if (square[offset + West]      == WhiteKing) return true;
        if (square[offset + NorthWest] == WhiteKing) return true;

        if (square[offset + KnightDir1] == WhiteKnight) return true;
        if (square[offset + KnightDir2] == WhiteKnight) return true;
        if (square[offset + KnightDir3] == WhiteKnight) return true;
        if (square[offset + KnightDir4] == WhiteKnight) return true;
        if (square[offset + KnightDir5] == WhiteKnight) return true;
        if (square[offset + KnightDir6] == WhiteKnight) return true;
        if (square[offset + KnightDir7] == WhiteKnight) return true;
        if (square[offset + KnightDir8] == WhiteKnight) return true;

        if (square[offset + SouthEast] == WhitePawn) return true;
        if (square[offset + SouthWest] == WhitePawn) return true;

        if (IsAttackedRay(offset, North, WhiteRook, WhiteQueen)) return true;
        if (IsAttackedRay(offset, East,  WhiteRook, WhiteQueen)) return true;
        if (IsAttackedRay(offset, South, WhiteRook, WhiteQueen)) return true;
        if (IsAttackedRay(offset, West,  WhiteRook, WhiteQueen)) return true;

        if (IsAttackedRay(offset, NorthEast, WhiteBishop, WhiteQueen)) return true;
        if (IsAttackedRay(offset, SouthEast, WhiteBishop, WhiteQueen)) return true;
        if (IsAttackedRay(offset, SouthWest, WhiteBishop, WhiteQueen)) return true;
        if (IsAttackedRay(offset, NorthWest, WhiteBishop, WhiteQueen)) return true;

        return false;
    }

    bool ChessBoard::IsAttackedByBlack(int offset) const
    {
        if (square[offset + North]     == BlackKing) return true;
        if (square[offset + NorthEast] == BlackKing) return true;
        if (square[offset + East]      == BlackKing) return true;
        if (square[offset + SouthEast] == BlackKing) return true;
        if (square[offset + South]     == BlackKing) return true;
        if (square[offset + SouthWest] == BlackKing) return true;
        if (square[offset + West]      == BlackKing) return true;
        if (square[offset + NorthWest] == BlackKing) return true;

        if (square[offset + KnightDir1] == BlackKnight) return true;
        if (square[offset + KnightDir2] == BlackKnight) return true;
        if (square[offset + KnightDir3] == BlackKnight) return true;
        if (square[offset + KnightDir4] == BlackKnight) return true;
        if (square[offset + KnightDir5] == BlackKnight) return true;
        if (square[offset + KnightDir6] == BlackKnight) return true;
        if (square[offset + KnightDir7] == BlackKnight) return true;
        if (square[offset + KnightDir8] == BlackKnight) return true;

        if (square[offset + NorthEast] == BlackPawn) return true;
        if (square[offset + NorthWest] == BlackPawn) return true;

        if (IsAttackedRay(offset, North, BlackRook, BlackQueen)) return true;
        if (IsAttackedRay(offset, East,  BlackRook, BlackQueen)) return true;
        if (IsAttackedRay(offset, South, BlackRook, BlackQueen)) return true;
        if (IsAttackedRay(offset, West,  BlackRook, BlackQueen)) return true;

        if (IsAttackedRay(offset, NorthEast, BlackBishop, BlackQueen)) return true;
        if (IsAttackedRay(offset, SouthEast, BlackBishop, BlackQueen)) return true;
        if (IsAttackedRay(offset, SouthWest, BlackBishop, BlackQueen)) return true;
        if (IsAttackedRay(offset, NorthWest, BlackBishop, BlackQueen)) return true;

        return false;
    }

    bool ChessBoard::IsAttackedRay(int source, int dir, Square piece1, Square piece2) const
    {
        int dest;
        for (dest = source + dir; square[dest] == Empty; dest += dir)
            /* do nothing */;

        return square[dest] == piece1 || square[dest] == piece2;
    }

    bool ChessBoard::IsLegalPosition() const
    {
        // It is never legal for a player to make a move that leaves
        // his own King in check. If the player not having the turn
        // is in check, then this is not a valid position.
        return isWhiteTurn ? !IsAttackedByWhite(bkpos) : !IsAttackedByBlack(wkpos);
    }
}
