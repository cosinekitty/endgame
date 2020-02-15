/*
    flywheel.ts  -  a TypeScript chess engine by Don Cross.
    https://github.com/cosinekitty/flywheel

    The MIT License (MIT)

    Copyright (c) 2015 Don Cross

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Flywheel;
(function (Flywheel) {
    var FlyException = /** @class */ (function (_super) {
        __extends(FlyException, _super);
        // http://stackoverflow.com/questions/12915412/how-do-i-extend-a-host-object-e-g-error-in-typescript
        // https://github.com/Microsoft/TypeScript/issues/1168
        function FlyException(message, name) {
            var _this = _super.call(this) || this;
            _this.message = message;
            _this.name = name;
            _this.stack = new Error().stack;
            return _this;
        }
        return FlyException;
    }(Error));
    var FlywheelError = /** @class */ (function (_super) {
        __extends(FlywheelError, _super);
        function FlywheelError(message) {
            return _super.call(this, message, 'FlywheelError') || this;
        }
        return FlywheelError;
    }(FlyException));
    var SearchAbortedException = /** @class */ (function (_super) {
        __extends(SearchAbortedException, _super);
        function SearchAbortedException(message) {
            return _super.call(this, message, 'SearchAbortedException') || this;
        }
        return SearchAbortedException;
    }(FlyException));
    var Square;
    (function (Square) {
        Square[Square["Empty"] = 0] = "Empty";
        Square[Square["WhitePawn"] = 1] = "WhitePawn";
        Square[Square["WhiteKnight"] = 2] = "WhiteKnight";
        Square[Square["WhiteBishop"] = 3] = "WhiteBishop";
        Square[Square["WhiteRook"] = 4] = "WhiteRook";
        Square[Square["WhiteQueen"] = 5] = "WhiteQueen";
        Square[Square["WhiteKing"] = 6] = "WhiteKing";
        Square[Square["BlackPawn"] = 7] = "BlackPawn";
        Square[Square["BlackKnight"] = 8] = "BlackKnight";
        Square[Square["BlackBishop"] = 9] = "BlackBishop";
        Square[Square["BlackRook"] = 10] = "BlackRook";
        Square[Square["BlackQueen"] = 11] = "BlackQueen";
        Square[Square["BlackKing"] = 12] = "BlackKing";
        Square[Square["OffBoard"] = 13] = "OffBoard";
    })(Square = Flywheel.Square || (Flywheel.Square = {}));
    var NeutralPiece;
    (function (NeutralPiece) {
        NeutralPiece[NeutralPiece["Empty"] = 0] = "Empty";
        NeutralPiece[NeutralPiece["Pawn"] = 1] = "Pawn";
        NeutralPiece[NeutralPiece["Knight"] = 2] = "Knight";
        NeutralPiece[NeutralPiece["Bishop"] = 3] = "Bishop";
        NeutralPiece[NeutralPiece["Rook"] = 4] = "Rook";
        NeutralPiece[NeutralPiece["Queen"] = 5] = "Queen";
        NeutralPiece[NeutralPiece["King"] = 6] = "King";
    })(NeutralPiece = Flywheel.NeutralPiece || (Flywheel.NeutralPiece = {}));
    var Side;
    (function (Side) {
        Side[Side["Neither"] = 0] = "Neither";
        Side[Side["White"] = 1] = "White";
        Side[Side["Black"] = 2] = "Black";
    })(Side = Flywheel.Side || (Flywheel.Side = {}));
    function OppositeSide(side) {
        switch (side) {
            case Side.White: return Side.Black;
            case Side.Black: return Side.White;
            default: throw new FlywheelError("Invalid side " + side);
        }
    }
    Flywheel.OppositeSide = OppositeSide;
    var Utility = /** @class */ (function () {
        function Utility() {
        }
        Utility.StaticInit = function () {
            Utility.PieceSide = {};
            Utility.WhitePieces = {};
            Utility.BlackPieces = {};
            Utility.SidePieces = {};
            Utility.Neutral = {};
            Utility.PieceSide[Square.Empty] = Side.Neither;
            Utility.PieceSide[Utility.WhitePieces[NeutralPiece.Pawn] = Square.WhitePawn] = Side.White;
            Utility.PieceSide[Utility.WhitePieces[NeutralPiece.Knight] = Square.WhiteKnight] = Side.White;
            Utility.PieceSide[Utility.WhitePieces[NeutralPiece.Bishop] = Square.WhiteBishop] = Side.White;
            Utility.PieceSide[Utility.WhitePieces[NeutralPiece.Rook] = Square.WhiteRook] = Side.White;
            Utility.PieceSide[Utility.WhitePieces[NeutralPiece.Queen] = Square.WhiteQueen] = Side.White;
            Utility.PieceSide[Utility.WhitePieces[NeutralPiece.King] = Square.WhiteKing] = Side.White;
            Utility.PieceSide[Utility.BlackPieces[NeutralPiece.Pawn] = Square.BlackPawn] = Side.Black;
            Utility.PieceSide[Utility.BlackPieces[NeutralPiece.Knight] = Square.BlackKnight] = Side.Black;
            Utility.PieceSide[Utility.BlackPieces[NeutralPiece.Bishop] = Square.BlackBishop] = Side.Black;
            Utility.PieceSide[Utility.BlackPieces[NeutralPiece.Rook] = Square.BlackRook] = Side.Black;
            Utility.PieceSide[Utility.BlackPieces[NeutralPiece.Queen] = Square.BlackQueen] = Side.Black;
            Utility.PieceSide[Utility.BlackPieces[NeutralPiece.King] = Square.BlackKing] = Side.Black;
            Utility.Neutral[Square.Empty] = NeutralPiece.Empty;
            Utility.Neutral[Square.WhitePawn] = Utility.Neutral[Square.BlackPawn] = NeutralPiece.Pawn;
            Utility.Neutral[Square.WhiteKnight] = Utility.Neutral[Square.BlackKnight] = NeutralPiece.Knight;
            Utility.Neutral[Square.WhiteBishop] = Utility.Neutral[Square.BlackBishop] = NeutralPiece.Bishop;
            Utility.Neutral[Square.WhiteRook] = Utility.Neutral[Square.BlackRook] = NeutralPiece.Rook;
            Utility.Neutral[Square.WhiteQueen] = Utility.Neutral[Square.BlackQueen] = NeutralPiece.Queen;
            Utility.Neutral[Square.WhiteKing] = Utility.Neutral[Square.BlackKing] = NeutralPiece.King;
            Utility.SidePieces[Side.White] = Utility.WhitePieces;
            Utility.SidePieces[Side.Black] = Utility.BlackPieces;
            return true;
        };
        Utility.SidedPieceCharacter = function (p) {
            switch (p) {
                case Square.Empty: return '.';
                case Square.WhitePawn: return 'P';
                case Square.WhiteKnight: return 'N';
                case Square.WhiteBishop: return 'B';
                case Square.WhiteRook: return 'R';
                case Square.WhiteQueen: return 'Q';
                case Square.WhiteKing: return 'K';
                case Square.BlackPawn: return 'p';
                case Square.BlackKnight: return 'n';
                case Square.BlackBishop: return 'b';
                case Square.BlackRook: return 'r';
                case Square.BlackQueen: return 'q';
                case Square.BlackKing: return 'k';
                default:
                    throw new FlywheelError("Invalid square contents: " + p);
            }
        };
        Utility.UnsidedPieceCharacter = function (p) {
            return Utility.SidedPieceCharacter(p).toUpperCase();
        };
        Utility.NeutralPieceCharacter = function (p) {
            switch (p) {
                case NeutralPiece.Empty: return '.';
                case NeutralPiece.Pawn: return 'P';
                case NeutralPiece.Knight: return 'N';
                case NeutralPiece.Bishop: return 'B';
                case NeutralPiece.Rook: return 'R';
                case NeutralPiece.Queen: return 'Q';
                case NeutralPiece.King: return 'K';
                default:
                    throw new FlywheelError("Invalid neutral piece: " + p);
            }
        };
        Utility.IsInitialized = Utility.StaticInit();
        return Utility;
    }());
    var Score;
    (function (Score) {
        Score[Score["Draw"] = 0] = "Draw";
        Score[Score["Invalid"] = -2100000000] = "Invalid";
        Score[Score["NegInf"] = -2000000000] = "NegInf";
        Score[Score["PosInf"] = 2000000000] = "PosInf";
        Score[Score["CheckmateLoss"] = -1100000000] = "CheckmateLoss";
        Score[Score["CheckmateWin"] = 1100000000] = "CheckmateWin";
        Score[Score["ForcedLoss"] = -1000000000] = "ForcedLoss";
        Score[Score["ForcedWin"] = 1000000000] = "ForcedWin";
    })(Score = Flywheel.Score || (Flywheel.Score = {}));
    var Move = /** @class */ (function () {
        function Move(source, dest, prom, score, hash_a) {
            if (prom === void 0) { prom = NeutralPiece.Empty; }
            this.source = source;
            this.dest = dest;
            this.prom = prom;
            this.score = score;
            this.hash_a = hash_a;
        }
        Move.prototype.Clone = function () {
            return new Move(this.source, this.dest, this.prom, this.score, this.hash_a);
        };
        Move.prototype.Equals = function (other) {
            return (this.source == other.source) && (this.dest == other.dest) && (this.prom == other.prom);
        };
        Move.prototype.toString = function () {
            var notation = Board.Algebraic(this.source) + Board.Algebraic(this.dest);
            switch (this.prom) {
                case NeutralPiece.Empty: break;
                case NeutralPiece.Queen:
                    notation += 'q';
                    break;
                case NeutralPiece.Rook:
                    notation += 'r';
                    break;
                case NeutralPiece.Bishop:
                    notation += 'b';
                    break;
                case NeutralPiece.Knight:
                    notation += 'n';
                    break;
                default: throw new FlywheelError("Invalid pawn promotion piece " + this.prom);
            }
            return notation;
        };
        return Move;
    }());
    Flywheel.Move = Move;
    var HashValue = /** @class */ (function () {
        function HashValue(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        HashValue.prototype.Clone = function () {
            return new HashValue(this.a, this.b, this.c);
        };
        HashValue.prototype.Equals = function (other) {
            return (this.a === other.a) && (this.b === other.b) && (this.c === other.c);
        };
        return HashValue;
    }());
    var MoveState = /** @class */ (function () {
        function MoveState() {
        }
        return MoveState;
    }());
    /*
        The 8x8 chess board is represented as a one-dimensional array.
        This allows for a very simple and efficient way of representing
        locations and directions of things on the board, using only a single integer index.
        To simplify bounds checking, there is a belt of "OffBoard" values surrounding
        the 8x8 board squares.  Because of the way knights move, the board is represented
        as 10 columns and 12 rows, such that a knight on the inside 8x8 grid can never
        jump outside the array.

        +-----------------------------------------------+
        |  110   111 112 113 114 115 116 117 118   119  |
        |  100   101 102 103 104 105 106 107 108   109  |
        |                                               |
        |   90    91  92  93  94  95  96  97  98    99  |  8
        |   80    81  82  83  84  85  86  87  88    89  |  7
        |   70    71  72  73  74  75  76  77  78    79  |  6
        |   60    61  62  63  64  65  66  67  68    69  |  5
        |   50    51  52  53  54  55  56  57  58    59  |  4
        |   40    41  42  43  44  45  46  47  48    49  |  3
        |   30    31  32  33  34  35  36  37  38    39  |  2
        |   20    21  22  23  24  25  26  27  28    29  |  1
        |                                               |
        |   10    11  12  13  14  15  16  17  18    19  |  ^-- ranks
        |    0     1   2   3   4   5   6   7   8     9  |
        +-----------------------------------------------+
                   a   b   c   d   e   f   g   h   <-- files
    */
    var Direction;
    (function (Direction) {
        Direction[Direction["East"] = 1] = "East";
        Direction[Direction["NorthEast"] = 11] = "NorthEast";
        Direction[Direction["North"] = 10] = "North";
        Direction[Direction["NorthWest"] = 9] = "NorthWest";
        Direction[Direction["West"] = -1] = "West";
        Direction[Direction["SouthWest"] = -11] = "SouthWest";
        Direction[Direction["South"] = -10] = "South";
        Direction[Direction["SouthEast"] = -9] = "SouthEast";
        Direction[Direction["Knight1"] = 12] = "Knight1";
        Direction[Direction["Knight2"] = 21] = "Knight2";
        Direction[Direction["Knight3"] = 19] = "Knight3";
        Direction[Direction["Knight4"] = 8] = "Knight4";
        Direction[Direction["Knight5"] = -12] = "Knight5";
        Direction[Direction["Knight6"] = -21] = "Knight6";
        Direction[Direction["Knight7"] = -19] = "Knight7";
        Direction[Direction["Knight8"] = -8] = "Knight8";
    })(Direction || (Direction = {}));
    var GameStatus;
    (function (GameStatus) {
        GameStatus[GameStatus["InProgress"] = 0] = "InProgress";
        GameStatus[GameStatus["Draw"] = 1] = "Draw";
        GameStatus[GameStatus["WhiteWins"] = 2] = "WhiteWins";
        GameStatus[GameStatus["BlackWins"] = 3] = "BlackWins";
    })(GameStatus = Flywheel.GameStatus || (Flywheel.GameStatus = {}));
    var DrawType;
    (function (DrawType) {
        DrawType[DrawType["Stalemate"] = 0] = "Stalemate";
        DrawType[DrawType["InsufficientMaterial"] = 1] = "InsufficientMaterial";
        DrawType[DrawType["ThreefoldRepetition"] = 2] = "ThreefoldRepetition";
        DrawType[DrawType["FiftyMoveRule"] = 3] = "FiftyMoveRule";
    })(DrawType = Flywheel.DrawType || (Flywheel.DrawType = {}));
    var GameResult = /** @class */ (function () {
        function GameResult(status, drawType) {
            this.status = status;
            this.drawType = drawType;
        }
        return GameResult;
    }());
    Flywheel.GameResult = GameResult;
    var Board = /** @class */ (function () {
        function Board(fen) {
            if (fen === void 0) { fen = null; }
            this.debugMode = false;
            this.Init();
            if (fen) {
                this.SetForsythEdwardsNotation(fen);
            }
            else {
                this.Reset();
            }
        }
        Board.StaticInit = function () {
            Board.OffsetTable = {};
            Board.AlgTable = {};
            Board.ValidOffsetList = [];
            Board.IndexTable = {};
            Board.RankNumber = {};
            Board.SquareIsLight = {};
            for (var y = 0; y < 8; ++y) {
                var rank = '12345678'.charAt(y);
                for (var x = 0; x < 8; x++) {
                    var alg = 'abcdefgh'.charAt(x) + rank;
                    var ofs = 21 + x + (10 * y);
                    Board.OffsetTable[alg] = ofs;
                    Board.AlgTable[ofs] = alg;
                    Board.ValidOffsetList.push(ofs);
                    Board.IndexTable[ofs] = x + (8 * y);
                    Board.RankNumber[ofs] = 1 + y;
                    Board.SquareIsLight[ofs] = ((x + y) & 1) !== 0;
                }
            }
            return true;
        };
        Board.MakeBoardArray = function () {
            // It is up to the initializer to fill in valid values for the interior 8x8 squares.
            // Just make all 120 squares "off board" to start out.
            var square = [];
            for (var i = 0; i < 120; ++i) {
                square.push(Square.OffBoard);
            }
            return square;
        };
        Board.Offset = function (alg) {
            var ofs = Board.OffsetTable[alg];
            if (!ofs) {
                throw new FlywheelError("Invalid algebraic location \"" + alg + "\" : must be \"a1\"..\"h8\".");
            }
            return ofs;
        };
        Board.Algebraic = function (ofs) {
            var alg = Board.AlgTable[ofs];
            if (!alg) {
                throw new FlywheelError("Invalid board offset " + ofs);
            }
            return alg;
        };
        Board.GetRankNumber = function (ofs) {
            var rank = Board.RankNumber[ofs];
            if (!rank) {
                throw new FlywheelError("Invalid board offset " + ofs);
            }
            return rank;
        };
        Board.GetFileNumber = function (ofs) {
            return 'abcdefgh'.indexOf(Board.Algebraic(ofs).charAt(0)) + 1;
        };
        Board.GetSidedPiece = function (side, neut) {
            var pieceArray = Utility.SidePieces[side];
            if (!pieceArray) {
                throw new FlywheelError("Invalid side " + side);
            }
            var piece = pieceArray[neut];
            if (!piece) {
                throw new FlywheelError("Invalid neutral piece " + neut);
            }
            return piece;
        };
        Board.prototype.SetDebugMode = function (debugMode) {
            this.debugMode = debugMode;
        };
        Board.prototype.Clone = function () {
            var copy = new Board(this.initialFen);
            for (var _i = 0, _a = this.moveStack; _i < _a.length; _i++) {
                var info = _a[_i];
                copy.PushMove(info.move);
            }
            return copy;
        };
        Board.prototype.GetSquare = function (alg) {
            return this.square[Board.Offset(alg)];
        };
        Board.prototype.GetSquareByCoords = function (x, y) {
            if (x !== (x & 7) || y !== (y & 7)) {
                throw new FlywheelError("Invalid chess board coordinates x=" + x + ", y=" + y);
            }
            return this.square[21 + x + (10 * y)];
        };
        Board.prototype.SideToMove = function () {
            return this.sideToMove;
        };
        Board.prototype.IsWhiteToMove = function () {
            return this.sideToMove === Side.White;
        };
        Board.prototype.IsBlackToMove = function () {
            return this.sideToMove === Side.Black;
        };
        Board.prototype.CanPopMove = function () {
            return this.moveStack.length > 0;
        };
        Board.prototype.LegalMoves = function (rater) {
            var rawlist = this.RawMoves();
            var movelist = [];
            for (var _i = 0, rawlist_1 = rawlist; _i < rawlist_1.length; _i++) {
                var raw = rawlist_1[_i];
                // Before we make a move, we have to set the move.hash_a
                // to match the first 32 bits of the board's hash value.
                // This is an inexpensive way to catch bugs
                // where a caller tries to play a move for the wrong board position.
                raw.hash_a = this.hash.a;
                // Test each move for legality by making the move and
                // looking to see if the player who just moved is in check.
                this.PushMove(raw);
                if (!this.IsPlayerInCheck(this.enemy)) {
                    if (rater) {
                        raw.score = rater(this, raw);
                    }
                    movelist.push(raw);
                }
                this.PopMove();
            }
            if (rater) {
                // Sort the moves in descending order of the scores that were assigned by the rater.
                movelist.sort(function (a, b) { return b.score - a.score; });
            }
            return movelist;
        };
        Board.prototype.GetNonStalemateDrawType = function () {
            if (this.numQuietPlies >= 100) {
                return DrawType.FiftyMoveRule;
            }
            if (this.RepetitionCount() >= 3) {
                return DrawType.ThreefoldRepetition;
            }
            if (this.IsMaterialDraw()) {
                return DrawType.InsufficientMaterial;
            }
            return null; // non-stalemate draw not detected
        };
        Board.prototype.GetGameResult = function () {
            if (this.CurrentPlayerCanMove()) {
                var drawType = this.GetNonStalemateDrawType();
                if (drawType !== null) {
                    return new GameResult(GameStatus.Draw, drawType);
                }
                return new GameResult(GameStatus.InProgress);
            }
            if (this.IsCurrentPlayerInCheck()) {
                return new GameResult(this.IsWhiteToMove() ? GameStatus.BlackWins : GameStatus.WhiteWins);
            }
            return new GameResult(GameStatus.Draw, DrawType.Stalemate);
        };
        Board.prototype.CurrentPlayerCanMove = function () {
            for (var _i = 0, _a = Board.ValidOffsetList; _i < _a.length; _i++) {
                var source = _a[_i];
                var sq = this.square[source];
                if (Utility.PieceSide[sq] === this.sideToMove) {
                    var movelist = [];
                    this.addMoves[sq].call(this, movelist, source);
                    for (var _b = 0, movelist_1 = movelist; _b < movelist_1.length; _b++) {
                        var move = movelist_1[_b];
                        move.hash_a = this.hash.a;
                        this.PushMove(move);
                        var legal = !this.IsPlayerInCheck(this.enemy);
                        this.PopMove();
                        if (legal) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        Board.prototype.IsCurrentPlayerInCheck = function () {
            if (this.currentPlayerInCheck === undefined) {
                this.currentPlayerInCheck = this.IsPlayerInCheck(this.sideToMove);
            }
            return this.currentPlayerInCheck;
        };
        Board.prototype.IsCurrentPlayerCheckmated = function () {
            return this.IsCurrentPlayerInCheck() && !this.CurrentPlayerCanMove();
        };
        Board.prototype.IsMaterialDraw = function () {
            // This function must return false for any position where a checkmate
            // is even remotely possible in the future, even if it is not forcible.
            // It should return true only when we are SURE that checkmate is IMPOSSIBLE.
            var whiteKnights = 0;
            var blackKnights = 0;
            var whiteBishopsOnDark = 0;
            var whiteBishopsOnLight = 0;
            var blackBishopsOnDark = 0;
            var blackBishopsOnLight = 0;
            for (var _i = 0, _a = Board.ValidOffsetList; _i < _a.length; _i++) {
                var ofs = _a[_i];
                switch (this.square[ofs]) {
                    case Square.WhiteQueen:
                    case Square.BlackQueen:
                    case Square.WhiteRook:
                    case Square.BlackRook:
                    case Square.WhitePawn:
                    case Square.BlackPawn:
                        return false;
                    case Square.WhiteKnight:
                        ++whiteKnights;
                        break;
                    case Square.BlackKnight:
                        ++blackKnights;
                        break;
                    case Square.WhiteBishop:
                        if (Board.SquareIsLight[ofs]) {
                            ++whiteBishopsOnLight;
                        }
                        else {
                            ++whiteBishopsOnDark;
                        }
                        break;
                    case Square.BlackBishop:
                        if (Board.SquareIsLight[ofs]) {
                            ++blackBishopsOnLight;
                        }
                        else {
                            ++blackBishopsOnDark;
                        }
                        break;
                }
            }
            // Getting here means there are only 2 kings (of course),
            // 0 or more bishops, and 0 or more knights on the board.
            // Consider this case:   8/5B2/8/8/8/7K/8/6bk w - - 0 1
            // Here White wins immediately with Bd5#.
            // So even though it is K+B vs K+B, we would return false (not a DEFINITE draw).
            // For now, to be safe, we return true (definite draw) only
            // when both sides have lone kings,
            // or one side has a lone king and the other has
            // either a king + knight or a king + bishop(s) all on the same color.
            var whiteMinor = whiteKnights + whiteBishopsOnLight + whiteBishopsOnDark;
            var blackMinor = blackKnights + blackBishopsOnLight + blackBishopsOnDark;
            if (whiteMinor === 0) {
                // White has a lone King.
                if (blackBishopsOnLight === 0 || blackBishopsOnDark === 0) {
                    // Black either has no Bishops, or all Bishops on the same color.
                    if (blackKnights === 0) {
                        return true; // Black has nothing but bishops all on the same color.
                    }
                    if (blackKnights === 1) {
                        if (blackBishopsOnLight + blackBishopsOnDark === 0) {
                            return true; // Black has only a single knight.
                        }
                    }
                }
            }
            else if (blackMinor === 0) {
                // Black has a lone King.
                if (whiteBishopsOnLight === 0 || whiteBishopsOnDark === 0) {
                    // White either has no Bishops, or all Bishops on the same color.
                    if (whiteKnights === 0) {
                        return true; // White has nothing but bishops all on the same color.
                    }
                    if (whiteKnights === 1) {
                        if (whiteBishopsOnLight + whiteBishopsOnDark === 0) {
                            return true; // White has only a single knight.
                        }
                    }
                }
            }
            return false; // assume checkmate is still theoretically possible, even if it cannot not forced
        };
        Board.prototype.RepetitionCount = function () {
            var rep = 1; // every position we are in has occurred at least once, by definition
            // Count how many times it has been the same player's turn with this same hash value.
            // The most recent possible repetition was 2 full moves ago (4 plies).
            for (var index = this.moveStack.length - 4; index >= 0; index -= 2) {
                if (this.moveStack[index].hash.Equals(this.hash)) {
                    ++rep;
                }
            }
            return rep;
        };
        Board.prototype.IsPlayerInCheck = function (side) {
            if (side === Side.White) {
                return this.IsAttackedByBlack(this.whiteKingOfs);
            }
            else {
                return this.IsAttackedByWhite(this.blackKingOfs);
            }
        };
        Board.prototype.IsAttackedByWhite = function (ofs) {
            if (this.square[ofs + Direction.SouthWest] === Square.WhitePawn)
                return true;
            if (this.square[ofs + Direction.SouthEast] === Square.WhitePawn)
                return true;
            if (this.square[ofs + Direction.East] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.NorthEast] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.North] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.NorthWest] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.West] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.SouthWest] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.South] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.SouthEast] === Square.WhiteKing)
                return true;
            if (this.square[ofs + Direction.Knight1] === Square.WhiteKnight)
                return true;
            if (this.square[ofs + Direction.Knight2] === Square.WhiteKnight)
                return true;
            if (this.square[ofs + Direction.Knight3] === Square.WhiteKnight)
                return true;
            if (this.square[ofs + Direction.Knight4] === Square.WhiteKnight)
                return true;
            if (this.square[ofs + Direction.Knight5] === Square.WhiteKnight)
                return true;
            if (this.square[ofs + Direction.Knight6] === Square.WhiteKnight)
                return true;
            if (this.square[ofs + Direction.Knight7] === Square.WhiteKnight)
                return true;
            if (this.square[ofs + Direction.Knight8] === Square.WhiteKnight)
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.East, Square.WhiteQueen, Square.WhiteRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.West, Square.WhiteQueen, Square.WhiteRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.North, Square.WhiteQueen, Square.WhiteRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.South, Square.WhiteQueen, Square.WhiteRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.NorthEast, Square.WhiteQueen, Square.WhiteBishop))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.NorthWest, Square.WhiteQueen, Square.WhiteBishop))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthEast, Square.WhiteQueen, Square.WhiteBishop))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthWest, Square.WhiteQueen, Square.WhiteBishop))
                return true;
            return false;
        };
        Board.prototype.IsAttackedByBlack = function (ofs) {
            if (this.square[ofs + Direction.NorthWest] === Square.BlackPawn)
                return true;
            if (this.square[ofs + Direction.NorthEast] === Square.BlackPawn)
                return true;
            if (this.square[ofs + Direction.East] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.NorthEast] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.North] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.NorthWest] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.West] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.SouthWest] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.South] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.SouthEast] === Square.BlackKing)
                return true;
            if (this.square[ofs + Direction.Knight1] === Square.BlackKnight)
                return true;
            if (this.square[ofs + Direction.Knight2] === Square.BlackKnight)
                return true;
            if (this.square[ofs + Direction.Knight3] === Square.BlackKnight)
                return true;
            if (this.square[ofs + Direction.Knight4] === Square.BlackKnight)
                return true;
            if (this.square[ofs + Direction.Knight5] === Square.BlackKnight)
                return true;
            if (this.square[ofs + Direction.Knight6] === Square.BlackKnight)
                return true;
            if (this.square[ofs + Direction.Knight7] === Square.BlackKnight)
                return true;
            if (this.square[ofs + Direction.Knight8] === Square.BlackKnight)
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.East, Square.BlackQueen, Square.BlackRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.West, Square.BlackQueen, Square.BlackRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.North, Square.BlackQueen, Square.BlackRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.South, Square.BlackQueen, Square.BlackRook))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.NorthEast, Square.BlackQueen, Square.BlackBishop))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.NorthWest, Square.BlackQueen, Square.BlackBishop))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthEast, Square.BlackQueen, Square.BlackBishop))
                return true;
            if (this.IsAttackedFromDir(ofs, Direction.SouthWest, Square.BlackQueen, Square.BlackBishop))
                return true;
            return false;
        };
        Board.prototype.IsAttackedFromDir = function (ofs, dir, piece1, piece2) {
            ofs += dir;
            while (this.square[ofs] === Square.Empty) {
                ofs += dir;
            }
            return (this.square[ofs] === piece1) || (this.square[ofs] === piece2);
        };
        Board.prototype.MoveHistory = function () {
            // Make a clone of the moves in the move stack.
            var history = [];
            for (var _i = 0, _a = this.moveStack; _i < _a.length; _i++) {
                var info = _a[_i];
                history.push(info.move.Clone());
            }
            return history;
        };
        Board.prototype.AlgHistory = function () {
            var history = '';
            for (var _i = 0, _a = this.moveStack; _i < _a.length; _i++) {
                var info = _a[_i];
                if (history.length > 0) {
                    history += ' ';
                }
                history += info.move.toString();
            }
            return history;
        };
        Board.prototype.PgnHistory = function () {
            // We need the board to be in the state it was before
            // each move was made in order to format each move in PGN.
            // Therefore, we need to start with a board at the beginning of the game,
            // then for each move, format the move, then make the move.
            // Any exception that occurred in the middle of this procedure could corrupt
            // the board state.  Therefore, instead of modifying this Board object,
            // we create a temporary board object to make all the moves in.
            var tempBoard = new Board(this.initialFen);
            var history = '';
            for (var _i = 0, _a = this.moveStack; _i < _a.length; _i++) {
                var info = _a[_i];
                if (history.length > 0) {
                    history += ' ';
                }
                history += tempBoard.PgnFormat(info.move);
                tempBoard.PushMove(info.move);
            }
            return history;
        };
        Board.FilterCheckSuffix = function (notation) {
            if (notation.length > 0) {
                var lastChar = notation[notation.length - 1];
                if (lastChar === '+' || lastChar === '#') {
                    return notation.substr(0, notation.length - 2);
                }
            }
            return notation;
        };
        Board.prototype.PushNotation = function (notation, legal, callDepth) {
            if (legal === void 0) { legal = this.LegalMoves(); }
            if (callDepth === void 0) { callDepth = 0; }
            // Some programs may generate notation that omits '+' or '#' notation
            // where it should exist in PGN, and others may include it where we don't
            // generate it in plain long algebraic notation.
            // The PGN spec says that neither character counts for disambiguation,
            // so it is a safe comparison to ignore these suffixes.
            // So we filter out all check/checkmate suffixes for the sake of comparison.
            notation = Board.FilterCheckSuffix(notation);
            // Look for algebraic notation first, because it is simpler.
            // Ignore in recursive calls, where we are trying to match PGN only.
            if (callDepth === 0) {
                for (var _i = 0, legal_1 = legal; _i < legal_1.length; _i++) {
                    var move = legal_1[_i];
                    if (move.toString() === notation) {
                        this.PushMove(move);
                        return true;
                    }
                }
            }
            // Getting here means we could not find algebraic match.
            // Look for PGN match, a more costly operation.
            if (notation.length >= 2 && notation.length <= 7) { // PGN notation is always 2..7 characters
                for (var _a = 0, legal_2 = legal; _a < legal_2.length; _a++) {
                    var move = legal_2[_a];
                    var pgn = Board.FilterCheckSuffix(this.PgnFormat(move, legal));
                    if (pgn === notation) {
                        this.PushMove(move);
                        return true;
                    }
                }
                // There was no exact algebraic or PGN match.
                // I have seen cases where a PGN file generated by other software
                // will have a move like "Ngf3", even though "Nf3" was unambiguous.
                // Let's try to hack around that here by checking for that case and using recursion.
                // Note that in a case like "Na1b3", we may recurse twice:  "Na1b3" -> "N1b3" -> "Nb3".
                // If deleting the second character generates a truly ambiguous move, it will never match
                // any PGN string we generate above in the comparison loop, so we will always return
                // false after either 1 or 2 recursions.
                if (notation.length >= 4 && callDepth < 2) {
                    // long enough to contain an unnecessary source rank/file/square disambiguator
                    if (/^[NBRQK][a-h1-8]/.test(notation)) {
                        // Remove rank/file character and recurse.
                        var shorter = notation.charAt(0) + notation.substr(2);
                        if (this.PushNotation(shorter, legal, 1 + callDepth)) {
                            return true;
                        }
                    }
                }
            }
            if (callDepth > 0) {
                return false; // we want the topmost recursive caller to report an error on the original notation
            }
            throw new FlywheelError("Move notation is not valid/legal: \"" + notation + "\"");
        };
        Board.prototype.PushHistory = function (history) {
            if (history) {
                var notationArray = history.split(' ');
                for (var _i = 0, notationArray_1 = notationArray; _i < notationArray_1.length; _i++) {
                    var notation = notationArray_1[_i];
                    this.PushNotation(notation);
                }
            }
        };
        Board.prototype.Replace = function (ofs, newContents) {
            // Updates the contents of a square while keeping the hash value current.
            var oldContents = this.square[ofs];
            this.square[ofs] = newContents;
            var salt = PieceHashSalt[Board.IndexTable[ofs]];
            Board.XorHash(this.hash, salt[oldContents]);
            Board.XorHash(this.hash, salt[newContents]);
            return oldContents;
        };
        Board.prototype.ClearWhiteKingSideCastling = function () {
            if (this.whiteCanCastleKingSide) {
                this.whiteCanCastleKingSide = false;
                Board.XorHash(this.hash, CastlingRightsSalt.wk);
            }
        };
        Board.prototype.ClearWhiteQueenSideCastling = function () {
            if (this.whiteCanCastleQueenSide) {
                this.whiteCanCastleQueenSide = false;
                Board.XorHash(this.hash, CastlingRightsSalt.wq);
            }
        };
        Board.prototype.ClearBlackKingSideCastling = function () {
            if (this.blackCanCastleKingSide) {
                this.blackCanCastleKingSide = false;
                Board.XorHash(this.hash, CastlingRightsSalt.bk);
            }
        };
        Board.prototype.ClearBlackQueenSideCastling = function () {
            if (this.blackCanCastleQueenSide) {
                this.blackCanCastleQueenSide = false;
                Board.XorHash(this.hash, CastlingRightsSalt.bq);
            }
        };
        Board.prototype.PushMove = function (move) {
            // Before risking corruption of the board state, verify
            // that the move passed in pertains to the same board position it was generated for.
            if (move.hash_a !== this.hash.a) {
                throw new FlywheelError('Move was generated for a different board position.');
            }
            // Store current hash value before modifying it.
            var info = new MoveState();
            info.hash = this.hash.Clone();
            // Toggle white/black turn hash salt on every turn.
            Board.XorHash(this.hash, WhiteToMoveSalt);
            // Perform the state changes needed by the vast majority of moves.
            var dir = move.dest - move.source;
            var piece = this.Replace(move.source, Square.Empty);
            var capture = this.Replace(move.dest, piece);
            // Preserve information needed for PopMove() to undo this move.
            info.move = move.Clone(); // clone the move so we protect from any caller side-effects
            info.capture = capture;
            info.whiteCanCastleKingSide = this.whiteCanCastleKingSide;
            info.whiteCanCastleQueenSide = this.whiteCanCastleQueenSide;
            info.blackCanCastleKingSide = this.blackCanCastleKingSide;
            info.blackCanCastleQueenSide = this.blackCanCastleQueenSide;
            info.playerWasInCheck = this.currentPlayerInCheck;
            info.numQuietPlies = this.numQuietPlies;
            info.epTarget = this.epTarget;
            info.epFile = this.epFile;
            this.moveStack.push(info);
            ++this.numQuietPlies; // assume this is a quiet ply unless we see a pawn move or a capture
            this.currentPlayerInCheck = undefined; // we no longer know if the current player is in check
            // Undo en passant hash modifications from previous turn, if any.
            if (this.epFile !== null) {
                Board.XorHash(this.hash, EnPassantFileSalt[this.epFile]);
            }
            this.epTarget = 0; // Assume no en passant target unless this is a pawn moving 2 squares.
            if (capture !== Square.Empty) {
                this.numQuietPlies = 0;
            }
            // Now check for the special cases: castling, en passant, pawn promotion.
            if (move.prom !== NeutralPiece.Empty) {
                // Pawn promotion. Replace the pawn with the promoted piece in the destination square.
                this.Replace(move.dest, Utility.SidePieces[this.sideToMove][move.prom]);
                // A pawn is moving, so reset the quiet ply counter.
                this.numQuietPlies = 0;
            }
            else {
                var neutralPiece = Utility.Neutral[piece];
                if (neutralPiece === NeutralPiece.Pawn) {
                    // A pawn is moving, so reset the quiet ply counter.
                    this.numQuietPlies = 0;
                    // Is this an en passant capture?
                    if (capture === Square.Empty) {
                        if (dir === Direction.NorthEast || dir === Direction.SouthEast) {
                            // Pawn is moving like a eastward capture, but target square was empty.
                            // Assume this is an en passant capture.
                            info.epCaptureOffset = move.source + Direction.East;
                            this.Replace(info.epCaptureOffset, Square.Empty); // remove captured pawn
                        }
                        else if (dir === Direction.NorthWest || dir === Direction.SouthWest) {
                            // Pawn is moving like a westward capture, but target square was empty.
                            // Assume this is an en passant capture.
                            info.epCaptureOffset = move.source + Direction.West;
                            this.Replace(info.epCaptureOffset, Square.Empty); // remove captured pawn
                        }
                        else if (dir === 2 * Direction.North) {
                            // A White pawn is moving 2 squares forward.
                            // This might indicate an en passant opportunity for Black's next turn.
                            this.epTarget = move.source + Direction.North, Side.Black;
                        }
                        else if (dir === 2 * Direction.South) {
                            // A Black pawn is moving 2 squares forward.
                            // This might indicate an en passant opportunity for White's next turn.
                            this.epTarget = move.source + Direction.South, Side.White;
                        }
                    }
                }
                else if (neutralPiece === NeutralPiece.King) {
                    // Any king move disables castling for that player.
                    // We also keep the king offset variables up to date.
                    if (piece === Square.WhiteKing) {
                        this.ClearWhiteKingSideCastling();
                        this.ClearWhiteQueenSideCastling();
                        this.whiteKingOfs = move.dest;
                    }
                    else {
                        this.ClearBlackKingSideCastling();
                        this.ClearBlackQueenSideCastling();
                        this.blackKingOfs = move.dest;
                    }
                    if (dir === 2 * Direction.East) {
                        // Assume this is kingside castling.  Move the rook around the king.
                        info.castlingRookSource = move.source + 3 * Direction.East;
                        info.castlingRookDest = move.source + Direction.East;
                        var rook = this.Replace(info.castlingRookSource, Square.Empty);
                        this.Replace(info.castlingRookDest, rook);
                    }
                    else if (dir === 2 * Direction.West) {
                        // Assume this is queenside castling.  Move the rook around the king.
                        info.castlingRookSource = move.source + 4 * Direction.West;
                        info.castlingRookDest = move.source + Direction.West;
                        var rook = this.Replace(info.castlingRookSource, Square.Empty);
                        this.Replace(info.castlingRookDest, rook);
                    }
                }
                else if (piece === Square.WhiteRook) {
                    if (move.source === 21) {
                        this.ClearWhiteQueenSideCastling();
                    }
                    else if (move.source === 28) {
                        this.ClearWhiteKingSideCastling();
                    }
                }
                else if (piece === Square.BlackRook) {
                    if (move.source === 91) {
                        this.ClearBlackQueenSideCastling();
                    }
                    else if (move.source === 98) {
                        this.ClearBlackKingSideCastling();
                    }
                }
            }
            // Any move into a player's rook home square destroys castling for that player on that side of the board.
            // Here is an example of the tricky bug this prevents:
            // 1. White Bishop captures a Black Rook at h8.
            // 2. Later, White moves the Bishop away from h8.
            // 3. Black moves his other rook to h8.
            // 4. If we didn't set blackCanCastleKingSide=false in step #1, we might think Black could castle kingside!
            switch (move.dest) {
                case 21:
                    this.ClearWhiteQueenSideCastling();
                    break;
                case 28:
                    this.ClearWhiteKingSideCastling();
                    break;
                case 91:
                    this.ClearBlackQueenSideCastling();
                    break;
                case 98:
                    this.ClearBlackKingSideCastling();
                    break;
            }
            // After each move by Black, we increment the full move number.
            if (this.sideToMove === Side.Black) {
                ++this.fullMoveNumber;
            }
            // Toggle the side to move...
            var swap = this.sideToMove;
            this.sideToMove = this.enemy;
            this.enemy = swap;
            // Toggle hash values for en passant capture, if available for opponent.
            this.epFile = this.GetEnPassantFile(this.epTarget);
            if (this.epFile !== null) {
                Board.XorHash(this.hash, EnPassantFileSalt[this.epFile]);
            }
            if (this.debugMode) {
                // This really slows things down, but validates that the hash function is working correctly.
                var checkHash = this.CalcHash();
                if (!checkHash.Equals(this.hash)) {
                    throw new FlywheelError('Hash mismatch in PushMove()');
                }
            }
        };
        Board.prototype.PopMove = function () {
            if (this.moveStack.length === 0) {
                throw new FlywheelError('PopMove: move stack is empty!');
            }
            var info = this.moveStack.pop();
            // Reverse the actions we performed in PushMove().
            // Toggle the side to move back to where it was.
            var swap = this.sideToMove;
            this.sideToMove = this.enemy;
            this.enemy = swap;
            // Decrement the full move number each time we undo a move by Black.
            if (this.sideToMove === Side.Black) {
                --this.fullMoveNumber;
            }
            // Restore castling flags.
            this.whiteCanCastleKingSide = info.whiteCanCastleKingSide;
            this.whiteCanCastleQueenSide = info.whiteCanCastleQueenSide;
            this.blackCanCastleKingSide = info.blackCanCastleKingSide;
            this.blackCanCastleQueenSide = info.blackCanCastleQueenSide;
            // Restore king positions if we are undoing a king move.
            if (info.move.dest === this.whiteKingOfs) {
                this.whiteKingOfs = info.move.source;
            }
            else if (info.move.dest === this.blackKingOfs) {
                this.blackKingOfs = info.move.source;
            }
            // Restore any knowledge we might have had about the player being in check.
            this.currentPlayerInCheck = info.playerWasInCheck;
            // Put the pawn/capture halfmove clock back where it was.
            this.numQuietPlies = info.numQuietPlies;
            if (info.move.prom === NeutralPiece.Empty) {
                // This move is NOT a pawn promotion.
                // Put the piece that moved back in its source square.
                this.square[info.move.source] = this.square[info.move.dest];
            }
            else {
                // This move is a pawn promotion.
                // To undo pawn promotion, we change the promoted piece back into a pawn.
                this.square[info.move.source] = Utility.SidePieces[this.sideToMove][NeutralPiece.Pawn];
            }
            // Put whatever was in the destination square back there.
            // This could be an enemy piece or an empty square.
            // Quirk: info.capture is empty for en passant captures.
            this.square[info.move.dest] = info.capture;
            if (info.epCaptureOffset) {
                // This was an en passant capture, so restore the captured pawn to the board.
                this.square[info.epCaptureOffset] = Utility.SidePieces[this.enemy][NeutralPiece.Pawn];
            }
            else if (info.castlingRookSource) {
                // This was a castling move, so we need to restore the involved rook.
                this.square[info.castlingRookSource] = Utility.SidePieces[this.sideToMove][NeutralPiece.Rook];
                this.square[info.castlingRookDest] = Square.Empty;
            }
            // Restore en passant state.
            this.epTarget = info.epTarget;
            this.epFile = info.epFile;
            // Restore the hash value.
            this.hash = info.hash;
            return info.move; // return the popped move back to the caller, for algorithmic symmetry.
        };
        Board.prototype.RawMoves = function () {
            // Generate a list of all moves, without regard to whether the player would be in check.
            var movelist = [];
            for (var _i = 0, _a = Board.ValidOffsetList; _i < _a.length; _i++) {
                var source = _a[_i];
                var sq = this.square[source];
                if (Utility.PieceSide[sq] === this.sideToMove) {
                    this.addMoves[sq].call(this, movelist, source);
                }
            }
            return movelist;
        };
        Board.prototype.AddMoves_Pawn = function (movelist, source) {
            // Pawns are the most complicated of all pieces!
            // They capture differently than they move,
            // they can move 2 squares if starting on their home rank,
            // they can be promoted, and they can capture "en passant"
            // depending on what the opponent just moved.
            // They also move and capture different directions based on
            // whether they are White or Black.
            var rank = Board.RankNumber[source];
            var dir;
            var deltaRank;
            var promRank;
            var homeRank;
            if (this.sideToMove === Side.White) {
                dir = Direction.North;
                deltaRank = 1;
                homeRank = 2;
                promRank = 8;
            }
            else {
                dir = Direction.South;
                deltaRank = -1;
                homeRank = 7;
                promRank = 1;
            }
            // Check for moving one square forward.
            if (this.square[source + dir] === Square.Empty) {
                if (rank + deltaRank === promRank) {
                    // Pawn promotion found: generate 4 moves, one for each promotion piece.
                    movelist.push(new Move(source, source + dir, NeutralPiece.Queen));
                    movelist.push(new Move(source, source + dir, NeutralPiece.Rook));
                    movelist.push(new Move(source, source + dir, NeutralPiece.Bishop));
                    movelist.push(new Move(source, source + dir, NeutralPiece.Knight));
                }
                else {
                    // Not a pawn promotion... just a normal move.
                    movelist.push(new Move(source, source + dir));
                    // See if the pawn can also move 2 squares forward.
                    if ((rank === homeRank) && (this.square[source + 2 * dir] === Square.Empty)) {
                        movelist.push(new Move(source, source + 2 * dir));
                    }
                }
            }
            // Check for capturing to the east.
            var edest = source + dir + Direction.East;
            if (Utility.PieceSide[this.square[edest]] === this.enemy) {
                if (rank + deltaRank === promRank) {
                    // Pawn promotion as the pawn captures eastward.
                    movelist.push(new Move(source, edest, NeutralPiece.Queen));
                    movelist.push(new Move(source, edest, NeutralPiece.Rook));
                    movelist.push(new Move(source, edest, NeutralPiece.Bishop));
                    movelist.push(new Move(source, edest, NeutralPiece.Knight));
                }
                else {
                    // Normal capture - not a promotion.
                    movelist.push(new Move(source, edest));
                }
            }
            else if (edest === this.epTarget) {
                // En passant capture to the east.
                movelist.push(new Move(source, edest));
            }
            // Check for capturing to the west.
            var wdest = source + dir + Direction.West;
            if (Utility.PieceSide[this.square[wdest]] === this.enemy) {
                if (rank + deltaRank === promRank) {
                    // Pawn promotion as the pawn captures westward.
                    movelist.push(new Move(source, wdest, NeutralPiece.Queen));
                    movelist.push(new Move(source, wdest, NeutralPiece.Rook));
                    movelist.push(new Move(source, wdest, NeutralPiece.Bishop));
                    movelist.push(new Move(source, wdest, NeutralPiece.Knight));
                }
                else {
                    // Normal capture - not a promotion.
                    movelist.push(new Move(source, wdest));
                }
            }
            else if (wdest === this.epTarget) {
                // En passant capture to the west.
                movelist.push(new Move(source, wdest));
            }
        };
        Board.prototype.AddMoves_Knight = function (movelist, source) {
            this.DirAddMove(movelist, source, source + Direction.Knight1);
            this.DirAddMove(movelist, source, source + Direction.Knight2);
            this.DirAddMove(movelist, source, source + Direction.Knight3);
            this.DirAddMove(movelist, source, source + Direction.Knight4);
            this.DirAddMove(movelist, source, source + Direction.Knight5);
            this.DirAddMove(movelist, source, source + Direction.Knight6);
            this.DirAddMove(movelist, source, source + Direction.Knight7);
            this.DirAddMove(movelist, source, source + Direction.Knight8);
        };
        Board.prototype.AddMoves_Bishop = function (movelist, source) {
            this.RayAddMoves(movelist, source, Direction.NorthEast);
            this.RayAddMoves(movelist, source, Direction.NorthWest);
            this.RayAddMoves(movelist, source, Direction.SouthEast);
            this.RayAddMoves(movelist, source, Direction.SouthWest);
        };
        Board.prototype.AddMoves_Rook = function (movelist, source) {
            this.RayAddMoves(movelist, source, Direction.East);
            this.RayAddMoves(movelist, source, Direction.North);
            this.RayAddMoves(movelist, source, Direction.West);
            this.RayAddMoves(movelist, source, Direction.South);
        };
        Board.prototype.AddMoves_Queen = function (movelist, source) {
            this.RayAddMoves(movelist, source, Direction.East);
            this.RayAddMoves(movelist, source, Direction.NorthEast);
            this.RayAddMoves(movelist, source, Direction.North);
            this.RayAddMoves(movelist, source, Direction.NorthWest);
            this.RayAddMoves(movelist, source, Direction.West);
            this.RayAddMoves(movelist, source, Direction.SouthWest);
            this.RayAddMoves(movelist, source, Direction.South);
            this.RayAddMoves(movelist, source, Direction.SouthEast);
        };
        Board.prototype.AddMoves_King = function (movelist, source) {
            var canCastleKingSide;
            var canCastleQueenSide;
            if (this.sideToMove === Side.White) {
                canCastleKingSide = this.whiteCanCastleKingSide &&
                    (this.square[26] === Square.Empty) &&
                    (this.square[27] === Square.Empty) &&
                    !this.IsAttackedByBlack(26);
                canCastleQueenSide = this.whiteCanCastleQueenSide &&
                    (this.square[24] === Square.Empty) &&
                    (this.square[23] === Square.Empty) &&
                    (this.square[22] === Square.Empty) &&
                    !this.IsAttackedByBlack(24);
                if (canCastleKingSide || canCastleQueenSide) {
                    if (!this.IsCurrentPlayerInCheck()) {
                        if (canCastleKingSide) {
                            movelist.push(new Move(25, 27));
                        }
                        if (canCastleQueenSide) {
                            movelist.push(new Move(25, 23));
                        }
                    }
                }
            }
            else {
                canCastleKingSide = this.blackCanCastleKingSide &&
                    (this.square[96] === Square.Empty) &&
                    (this.square[97] === Square.Empty) &&
                    !this.IsAttackedByWhite(96);
                canCastleQueenSide = this.blackCanCastleQueenSide &&
                    (this.square[94] === Square.Empty) &&
                    (this.square[93] === Square.Empty) &&
                    (this.square[92] === Square.Empty) &&
                    !this.IsAttackedByWhite(94);
                if (canCastleKingSide || canCastleQueenSide) {
                    if (!this.IsCurrentPlayerInCheck()) {
                        if (canCastleKingSide) {
                            movelist.push(new Move(95, 97));
                        }
                        if (canCastleQueenSide) {
                            movelist.push(new Move(95, 93));
                        }
                    }
                }
            }
            this.DirAddMove(movelist, source, source + Direction.East);
            this.DirAddMove(movelist, source, source + Direction.NorthEast);
            this.DirAddMove(movelist, source, source + Direction.North);
            this.DirAddMove(movelist, source, source + Direction.NorthWest);
            this.DirAddMove(movelist, source, source + Direction.West);
            this.DirAddMove(movelist, source, source + Direction.SouthWest);
            this.DirAddMove(movelist, source, source + Direction.South);
            this.DirAddMove(movelist, source, source + Direction.SouthEast);
        };
        Board.prototype.DirAddMove = function (movelist, source, dest) {
            // Knights or Kings can move to an empty square or a square that contains the opposite color piece,
            // but NOT to squares that contain the same color piece or squares that are off the board.
            if (this.square[dest] === Square.Empty || Utility.PieceSide[this.square[dest]] === this.enemy) {
                movelist.push(new Move(source, dest));
            }
        };
        Board.prototype.RayAddMoves = function (movelist, source, dir) {
            // Queens, rooks, and bishops make moves along a series of squares in a given direction.
            // They can move any number of empty squares in a given direction.
            // If they hit any non-empty square (including going off the board), they are blocked.
            var dest = source + dir;
            while (this.square[dest] === Square.Empty) {
                movelist.push(new Move(source, dest));
                dest += dir;
            }
            // If the non-empty blocking square contains an enemy piece, capturing that piece is another valid move.
            if (Utility.PieceSide[this.square[dest]] === this.enemy) {
                movelist.push(new Move(source, dest));
            }
        };
        Board.prototype.Init = function () {
            this.square = Board.MakeBoardArray();
            // Create a lookup table of functions that append possible moves for each kind of piece.
            // The caller must detect which side has the move and call only for that side's pieces.
            this.addMoves = {};
            this.addMoves[Square.WhitePawn] = this.addMoves[Square.BlackPawn] = this.AddMoves_Pawn;
            this.addMoves[Square.WhiteKnight] = this.addMoves[Square.BlackKnight] = this.AddMoves_Knight;
            this.addMoves[Square.WhiteBishop] = this.addMoves[Square.BlackBishop] = this.AddMoves_Bishop;
            this.addMoves[Square.WhiteRook] = this.addMoves[Square.BlackRook] = this.AddMoves_Rook;
            this.addMoves[Square.WhiteQueen] = this.addMoves[Square.BlackQueen] = this.AddMoves_Queen;
            this.addMoves[Square.WhiteKing] = this.addMoves[Square.BlackKing] = this.AddMoves_King;
        };
        Board.prototype.Reset = function () {
            this.initialFen = undefined;
            this.sideToMove = Side.White;
            this.enemy = Side.Black;
            this.moveStack = [];
            this.numQuietPlies = 0;
            this.fullMoveNumber = 1;
            this.whiteCanCastleKingSide = true;
            this.whiteCanCastleQueenSide = true;
            this.blackCanCastleKingSide = true;
            this.blackCanCastleQueenSide = true;
            this.epTarget = 0;
            var x = Board.Offset('a1');
            this.square[x++] = Square.WhiteRook;
            this.square[x++] = Square.WhiteKnight;
            this.square[x++] = Square.WhiteBishop;
            this.square[x++] = Square.WhiteQueen;
            this.square[x++] = Square.WhiteKing;
            this.square[x++] = Square.WhiteBishop;
            this.square[x++] = Square.WhiteKnight;
            this.square[x++] = Square.WhiteRook;
            x = Board.Offset('a2');
            for (var i = 0; i < 8; ++i, ++x) {
                this.square[x] = Square.WhitePawn;
                this.square[x + 10] = Square.Empty;
                this.square[x + 20] = Square.Empty;
                this.square[x + 30] = Square.Empty;
                this.square[x + 40] = Square.Empty;
                this.square[x + 50] = Square.BlackPawn;
            }
            x = Board.Offset('a8');
            this.square[x++] = Square.BlackRook;
            this.square[x++] = Square.BlackKnight;
            this.square[x++] = Square.BlackBishop;
            this.square[x++] = Square.BlackQueen;
            this.square[x++] = Square.BlackKing;
            this.square[x++] = Square.BlackBishop;
            this.square[x++] = Square.BlackKnight;
            this.square[x++] = Square.BlackRook;
            this.Update();
        };
        Board.XorHash = function (hash, salt) {
            hash.a ^= salt[0];
            hash.b ^= salt[1];
            hash.c ^= salt[2];
        };
        Board.FormatHex = function (x) {
            // We want to convert negative integers to their 32-bit hex representation
            // without a minus sign showing up.
            var s = ((x < 0) ? ((0xffffffff + x) + 1) : x).toString(16);
            while (s.length < 8) {
                s = '0' + s;
            }
            return s;
        };
        Board.prototype.GetHash = function () {
            return Board.FormatHex(this.hash.a) + Board.FormatHex(this.hash.b) + Board.FormatHex(this.hash.c);
        };
        Board.prototype.CalcHash = function () {
            var hash = new HashValue(0, 0, 0);
            if (this.sideToMove === Side.White) {
                Board.XorHash(hash, WhiteToMoveSalt);
            }
            if (this.whiteCanCastleKingSide) {
                Board.XorHash(hash, CastlingRightsSalt.wk);
            }
            if (this.whiteCanCastleQueenSide) {
                Board.XorHash(hash, CastlingRightsSalt.wq);
            }
            if (this.blackCanCastleKingSide) {
                Board.XorHash(hash, CastlingRightsSalt.bk);
            }
            if (this.blackCanCastleQueenSide) {
                Board.XorHash(hash, CastlingRightsSalt.bq);
            }
            for (var index = 0; index < 64; ++index) {
                Board.XorHash(hash, PieceHashSalt[index][this.square[Board.ValidOffsetList[index]]]);
            }
            var epFile = this.GetEnPassantFile(this.epTarget);
            if (epFile !== null) {
                Board.XorHash(hash, EnPassantFileSalt[epFile]);
            }
            return hash;
        };
        Board.prototype.GetEnPassantFile = function (epTarget) {
            // Subtle: the ep target as defined by FEN is not quite what we need.
            // There is no reason to distinguish two positions where different
            // pawns have just moved, if there is no way for the current player
            // to exploit either move with an en passant capture.
            // So we only include EP file bits if at least one
            // pawn exists that can make an en passant capture to that file.
            // Tricky: the pawn might not actually be able to make the capture
            // because it is pinned or the player is in check.
            // For the sake of efficiency, we don't worry about that.
            if (epTarget !== 0) {
                var rank = Board.RankNumber[epTarget];
                if (rank === 6) {
                    // This epTarget indicates that Black just moved a pawn 2 squares toward the south.
                    // White Pawns capture northeast and northwest.
                    // Therefore look southwest and southeast from the ep target for a white pawn.
                    if (this.square[epTarget + Direction.SouthEast] === Square.WhitePawn ||
                        this.square[epTarget + Direction.SouthWest] === Square.WhitePawn) {
                        return 7 & Board.IndexTable[epTarget];
                    }
                }
                else if (rank === 3) {
                    // This epTarget indicates that White just moved a pawn 2 squares toward the north.
                    // Black Pawns capture southeast and southwest.
                    // Therefore look northeast and northwest from the ep target for a black pawn.
                    if (this.square[epTarget + Direction.NorthEast] === Square.BlackPawn ||
                        this.square[epTarget + Direction.NorthWest] === Square.BlackPawn) {
                        return 7 & Board.IndexTable[epTarget];
                    }
                }
                else {
                    throw new FlywheelError("Invalid en passant target offset = " + epTarget + " (" + Board.AlgTable[epTarget] + ")");
                }
            }
            return null;
        };
        Board.prototype.Update = function () {
            // Search the board's contents for the kings.
            // Initialize the board's hash value (triplet of 32-bit numbers).
            // Verify that exactly one White King and exactly one Black King are present
            // and store their locations.
            // Validate other constraints of valid chess positions: pawns only on ranks 2..7,
            // each side has total pawns = 0..8, pawns + queens = 0..9, etc.
            this.whiteKingOfs = undefined;
            this.blackKingOfs = undefined;
            var inventory = [
                0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0
            ]; // Black P N B R Q K
            for (var _i = 0, _a = Board.ValidOffsetList; _i < _a.length; _i++) {
                var ofs = _a[_i];
                var s = this.square[ofs];
                if (Utility.Neutral[s] === undefined) {
                    throw new FlywheelError("Invalid board contents at " + Board.AlgTable[ofs]);
                }
                ++inventory[s];
                switch (s) {
                    case Square.WhiteKing:
                        if (this.whiteKingOfs === undefined) {
                            this.whiteKingOfs = ofs;
                        }
                        else {
                            throw new FlywheelError('Found more than one White King on the board.');
                        }
                        break;
                    case Square.BlackKing:
                        if (this.blackKingOfs === undefined) {
                            this.blackKingOfs = ofs;
                        }
                        else {
                            throw new FlywheelError('Found more than one Black King on the board.');
                        }
                        break;
                    case Square.WhitePawn:
                    case Square.BlackPawn:
                        if (Board.RankNumber[ofs] === 1 || Board.RankNumber[ofs] === 8) {
                            throw new FlywheelError('Pawns are not allowed on ranks 1 or 8.');
                        }
                        break;
                }
            }
            if (this.whiteKingOfs === undefined) {
                throw new FlywheelError('There is no White King on the board.');
            }
            if (this.blackKingOfs === undefined) {
                throw new FlywheelError('There is no Black King on the board.');
            }
            Board.ValidateInventory(inventory, Side.White);
            Board.ValidateInventory(inventory, Side.Black);
            if (this.IsPlayerInCheck(this.enemy)) {
                throw new FlywheelError('Illegal position: side not having the turn is in check.');
            }
            this.epFile = this.GetEnPassantFile(this.epTarget);
            this.hash = this.CalcHash();
        };
        Board.ValidateInventory = function (inventory, side) {
            // Check non-king piece counts for being attainable in a real game of chess.
            // Kings are validated separately.
            var P = inventory[Utility.SidePieces[side][NeutralPiece.Pawn]];
            var N = inventory[Utility.SidePieces[side][NeutralPiece.Knight]];
            var B = inventory[Utility.SidePieces[side][NeutralPiece.Bishop]];
            var R = inventory[Utility.SidePieces[side][NeutralPiece.Rook]];
            var Q = inventory[Utility.SidePieces[side][NeutralPiece.Queen]];
            var stext = (side === Side.White) ? 'White' : 'Black';
            if (P > 8) {
                throw new FlywheelError("Cannot have more than 8 " + stext + " pawns on the board.");
            }
            if (N > 10) {
                throw new FlywheelError("Cannot have more than 10 " + stext + " knights on the board.");
            }
            if (B > 10) {
                throw new FlywheelError("Cannot have more than 10 " + stext + " bishops on the board.");
            }
            if (R > 10) {
                throw new FlywheelError("Cannot have more than 10 " + stext + " rooks on the board.");
            }
            if (Q > 9) {
                throw new FlywheelError("Cannot have more than 9 " + stext + " queens on the board.");
            }
            // If all 8 pawns are promoted, then there can be a maximum of 15
            // non-pawns per side.  So total pawns + total non-pawns (ignoring kings)
            // must never exceed 15.
            if (P + N + B + R + Q > 15) {
                throw new FlywheelError("Cannot have more than 16 " + stext + " pieces on the board.");
            }
        };
        Board.prototype.GetForsythEdwardsNotation = function () {
            var fen = '';
            /*
                http://www.thechessdrum.net/PGN_Reference.txt

                16.1.3.1: Piece placement data

                The first field represents the placement of the pieces on the board.  The board
                contents are specified starting with the eighth rank and ending with the first
                rank.  For each rank, the squares are specified from file a to file h.  White
                pieces are identified by uppercase SAN piece letters ("PNBRQK") and black
                pieces are identified by lowercase SAN piece letters ("pnbrqk").  Empty squares
                are represented by the digits one through eight; the digit used represents the
                count of contiguous empty squares along a rank.  A solidus character "/" is
                used to separate data of adjacent ranks.
            */
            for (var y = 7; y >= 0; --y) {
                var emptyCount = 0;
                for (var x = 0; x <= 7; ++x) {
                    var ofs = 21 + x + (10 * y);
                    var piece = this.square[ofs];
                    if (piece === Square.Empty) {
                        ++emptyCount;
                    }
                    else {
                        if (emptyCount > 0) {
                            fen += emptyCount.toFixed();
                            emptyCount = 0;
                        }
                        fen += Utility.SidedPieceCharacter(piece);
                    }
                }
                if (emptyCount > 0) {
                    fen += emptyCount.toFixed();
                }
                if (y > 0) {
                    fen += '/';
                }
            }
            /*
                16.1.3.2: Active color

                The second field represents the active color.  A lower case "w" is used if
                White is to move; a lower case "b" is used if Black is the active player.
            */
            fen += (this.sideToMove === Side.White) ? ' w ' : ' b ';
            /*
                16.1.3.3: Castling availability

                The third field represents castling availability.  This indicates potential
                future castling that may of may not be possible at the moment due to blocking
                pieces or enemy attacks.  If there is no castling availability for either side,
                the single character symbol "-" is used.  Otherwise, a combination of from one
                to four characters are present.  If White has kingside castling availability,
                the uppercase letter "K" appears.  If White has queenside castling
                availability, the uppercase letter "Q" appears.  If Black has kingside castling
                availability, the lowercase letter "k" appears.  If Black has queenside
                castling availability, then the lowercase letter "q" appears.  Those letters
                which appear will be ordered first uppercase before lowercase and second
                kingside before queenside.  There is no white space between the letters.
            */
            var castling = 0;
            if (this.whiteCanCastleKingSide) {
                fen += 'K';
                ++castling;
            }
            if (this.whiteCanCastleQueenSide) {
                fen += 'Q';
                ++castling;
            }
            if (this.blackCanCastleKingSide) {
                fen += 'k';
                ++castling;
            }
            if (this.blackCanCastleQueenSide) {
                fen += 'q';
                ++castling;
            }
            if (castling === 0) {
                fen += '-';
            }
            fen += ' ';
            /*
                16.1.3.4: En passant target square

                The fourth field is the en passant target square.  If there is no en passant
                target square then the single character symbol "-" appears.  If there is an en
                passant target square then is represented by a lowercase file character
                immediately followed by a rank digit.  Obviously, the rank digit will be "3"
                following a white pawn double advance (Black is the active color) or else be
                the digit "6" after a black pawn double advance (White being the active color).

                An en passant target square is given if and only if the last move was a pawn
                advance of two squares.  Therefore, an en passant target square field may have
                a square name even if there is no pawn of the opposing side that may
                immediately execute the en passant capture.
            */
            if (this.epTarget === 0) {
                fen += '-';
            }
            else {
                fen += Board.Algebraic(this.epTarget);
            }
            /*
                16.1.3.5: Halfmove clock

                The fifth field is a nonnegative integer representing the halfmove clock.
                This number is the count of halfmoves (or ply) since the last pawn advance or
                capturing move.  This value is used for the fifty move draw rule.
            */
            fen += ' ' + this.numQuietPlies.toFixed() + ' ';
            /*
                16.1.3.6: Fullmove number

                The sixth and last field is a positive integer that gives the fullmove number.
                This will have the value "1" for the first move of a game for both White and
                Black.  It is incremented by one immediately after each move by Black.
            */
            fen += this.fullMoveNumber.toFixed();
            return fen;
        };
        Board.prototype.SetForsythEdwardsNotation = function (fen) {
            // Example FEN:
            // 3qr2k/pbpp2pp/1p5N/3Q2b1/2P1P3/P7/1PP2PPP/R4RK1 w - - 0 1
            var field = fen.split(' ');
            if (field.length != 6) {
                throw new FlywheelError('FEN must have 6 space-delimited fields.');
            }
            var rowArray = field[0].split('/');
            if (rowArray.length != 8) {
                throw new FlywheelError('FEN board must have 8 slash-delimited rows.');
            }
            var newsq = Board.MakeBoardArray();
            for (var y = 0; y < 8; ++y) {
                var row = rowArray[7 - y]; // rows are stored starting with Black's side of the board
                var x = 0;
                for (var i = 0; i < row.length; ++i) {
                    var repeat = 1;
                    var piece = Square.Empty;
                    switch (row[i]) {
                        case '1':
                            repeat = 1;
                            break;
                        case '2':
                            repeat = 2;
                            break;
                        case '3':
                            repeat = 3;
                            break;
                        case '4':
                            repeat = 4;
                            break;
                        case '5':
                            repeat = 5;
                            break;
                        case '6':
                            repeat = 6;
                            break;
                        case '7':
                            repeat = 7;
                            break;
                        case '8':
                            repeat = 8;
                            break;
                        case 'p':
                            piece = Square.BlackPawn;
                            break;
                        case 'n':
                            piece = Square.BlackKnight;
                            break;
                        case 'b':
                            piece = Square.BlackBishop;
                            break;
                        case 'r':
                            piece = Square.BlackRook;
                            break;
                        case 'q':
                            piece = Square.BlackQueen;
                            break;
                        case 'k':
                            piece = Square.BlackKing;
                            break;
                        case 'P':
                            piece = Square.WhitePawn;
                            break;
                        case 'N':
                            piece = Square.WhiteKnight;
                            break;
                        case 'B':
                            piece = Square.WhiteBishop;
                            break;
                        case 'R':
                            piece = Square.WhiteRook;
                            break;
                        case 'Q':
                            piece = Square.WhiteQueen;
                            break;
                        case 'K':
                            piece = Square.WhiteKing;
                            break;
                        default: throw new FlywheelError('Invalid character in FEN board');
                    }
                    while (repeat > 0) {
                        if (x > 7) {
                            throw new FlywheelError('Too many squares in FEN row');
                        }
                        newsq[21 + (10 * y) + x] = piece;
                        ++x;
                        --repeat;
                    }
                }
                if (x !== 8) {
                    throw new FlywheelError('There must be exactly 8 squares on each row of the FEN.');
                }
            }
            var friend;
            var enemy;
            switch (field[1]) {
                case 'w':
                    friend = Side.White;
                    enemy = Side.Black;
                    break;
                case 'b':
                    friend = Side.Black;
                    enemy = Side.White;
                    break;
                default:
                    throw new FlywheelError('Side specifier must be "w" or "b" in FEN.');
            }
            // Parse castle enable flags.
            var castling = field[2];
            if (castling.length === 0 || !/-|K?Q?k?q?/.test(castling)) {
                throw new FlywheelError('Invalid castling specifier in FEN.');
            }
            var wk = (castling.indexOf('K') >= 0);
            var wq = (castling.indexOf('Q') >= 0);
            var bk = (castling.indexOf('k') >= 0);
            var bq = (castling.indexOf('q') >= 0);
            // Parse en passant target offset.
            var ep = 0;
            if (field[3] !== '-') {
                if (/[a-h][36]/.test(field[3])) {
                    // FIXFIXFIX - validate that rank matches side to move: 3 for Black, 6 for White.
                    ep = Board.Offset(field[3]);
                }
                else {
                    throw new FlywheelError('Invalid en passant target in FEN.');
                }
            }
            // Parse halfmove clock.
            var quietPlies = parseInt(field[4], 10);
            if (isNaN(quietPlies) || quietPlies < 0 || quietPlies > 100) {
                throw new FlywheelError('Invalid halfmove clock (number of quiet plies) in FEN.');
            }
            // Parse fullmove number.
            var fullMoveNumber = parseInt(field[5], 10);
            if (isNaN(fullMoveNumber) || fullMoveNumber < 1) {
                throw new FlywheelError('Invalid fullmove number in FEN.');
            }
            // If we get here, it means the FEN is presumed valid.
            // Mutate the board based on what we found.
            this.square = newsq;
            this.initialFen = fen;
            this.whiteCanCastleKingSide = wk;
            this.whiteCanCastleQueenSide = wq;
            this.blackCanCastleKingSide = bk;
            this.blackCanCastleQueenSide = bq;
            this.moveStack = [];
            this.sideToMove = friend;
            this.enemy = enemy;
            this.epTarget = ep;
            this.numQuietPlies = quietPlies;
            this.fullMoveNumber = fullMoveNumber;
            this.Update();
        };
        Board.IsLegal = function (move, legalMoveList) {
            for (var _i = 0, legalMoveList_1 = legalMoveList; _i < legalMoveList_1.length; _i++) {
                var legal = legalMoveList_1[_i];
                if (move.source === legal.source && move.dest === legal.dest && move.prom === legal.prom) {
                    return true;
                }
            }
            return false;
        };
        Board.prototype.PgnFormat = function (move, legalMoveList) {
            if (legalMoveList === void 0) { legalMoveList = this.LegalMoves(); }
            if (!Board.IsLegal(move, legalMoveList)) {
                // It is important to prevent board corruption.
                // PushMove/PopMove can leave the board in a mangled state if the move is illegal.
                throw new FlywheelError('Illegal move passed to PgnFormat');
            }
            var pgn = '';
            this.PushMove(move);
            var check = this.IsCurrentPlayerInCheck();
            var immobile = this.CurrentPlayerCanMove();
            this.PopMove();
            var dir = move.dest - move.source;
            var piece = Utility.Neutral[this.square[move.source]];
            if (piece === NeutralPiece.King && dir === 2 * Direction.East) {
                pgn = 'O-O';
            }
            else if (piece === NeutralPiece.King && dir === 2 * Direction.West) {
                pgn = 'O-O-O';
            }
            else {
                var pieceSymbol = Utility.UnsidedPieceCharacter(this.square[move.source]);
                var alg1 = Board.AlgTable[move.source];
                var alg2 = Board.AlgTable[move.dest];
                var file1 = alg1.charAt(0);
                var rank1 = alg1.charAt(1);
                var file2 = alg2.charAt(0);
                var capture = Utility.Neutral[this.square[move.dest]];
                if (piece === NeutralPiece.Pawn && file1 !== file2 && capture === NeutralPiece.Empty) {
                    // Adjust for en passant capture
                    capture = NeutralPiece.Pawn;
                }
                // Central to PGN is the concept of "ambiguous" notation.
                // We want to figure out the minimum number of characters needed
                // to unambiguously encode the chess move.
                // Create a compact list that contains only moves with the same
                // destination and moving piece.
                // Include only pawn promotions to the same promoted piece.
                var compact = [];
                for (var _i = 0, legalMoveList_2 = legalMoveList; _i < legalMoveList_2.length; _i++) {
                    var cmove = legalMoveList_2[_i];
                    if ((cmove.dest === move.dest) && (cmove.prom === move.prom)) {
                        var cpiece = Utility.Neutral[this.square[cmove.source]];
                        if (cpiece === piece) {
                            compact.push(cmove);
                        }
                    }
                }
                // compact now contains moves to same dest by same piece (with same promotion if promotion)
                if (compact.length === 0) {
                    throw new FlywheelError('PGN compactor found 0 moves'); // should have been caught by legal move check above!
                }
                var needSourceFile = false;
                var needSourceRank = false;
                if (compact.length > 1) {
                    /*
                        [The following is quoted from http://www.very-best.de/pgn-spec.htm, section 8.2.3.]

                        In the case of ambiguities (multiple pieces of the same type moving to the same square),
                        the first appropriate disambiguating step of the three following steps is taken:

                        First, if the moving pieces can be distinguished by their originating files,
                        the originating file letter of the moving piece is inserted immediately after
                        the moving piece letter.

                        Second (when the first step fails), if the moving pieces can be distinguished by
                        their originating ranks, the originating rank digit of the moving piece is inserted
                        immediately after the moving piece letter.

                        Third (when both the first and the second steps fail), the two character square
                        coordinate of the originating square of the moving piece is inserted immediately
                        after the moving piece letter.
                    */
                    var fileCount = 0;
                    var rankCount = 0;
                    for (var _a = 0, compact_1 = compact; _a < compact_1.length; _a++) {
                        var cmove = compact_1[_a];
                        var calg = Board.Algebraic(cmove.source);
                        var cfile = calg.charAt(0);
                        var crank = calg.charAt(1);
                        if (cfile === file1) {
                            ++fileCount;
                        }
                        if (crank === rank1) {
                            ++rankCount;
                        }
                    }
                    if (fileCount === 1) {
                        needSourceFile = true;
                    }
                    else {
                        needSourceRank = true;
                        if (rankCount > 1) {
                            needSourceFile = true;
                        }
                    }
                }
                if (piece === NeutralPiece.Pawn) {
                    // A piece designator is never used for pawns.
                    // For example, a pawn moving from e2 to e4 is represented as "e4".
                    if (capture != NeutralPiece.Empty) {
                        // When a pawn makes a capture, include its original file letter before the 'x'.
                        // For example, a pawn at e4 capturing something at d5 is represented as "exd5".
                        needSourceFile = true;
                    }
                }
                else {
                    pgn += pieceSymbol;
                }
                if (needSourceFile) {
                    pgn += file1;
                }
                if (needSourceRank) {
                    pgn += rank1;
                }
                if (capture != NeutralPiece.Empty) {
                    pgn += 'x';
                }
                pgn += alg2; // append the notation for the destination square
                if (move.prom != NeutralPiece.Empty) {
                    pgn += '=' + Utility.NeutralPieceCharacter(move.prom);
                }
            }
            if (check) {
                // If a move causes checkmate, put '#' at the end.
                // Otherwise, if the move merely causes check, put '+' at the end.
                pgn += immobile ? '#' : '+';
            }
            return pgn;
        };
        //-----------------------------------------------------------------------------------------------------
        // Class/static stuff
        Board.IsInitialized = Board.StaticInit(); // simulate class static constructor
        return Board;
    }());
    Flywheel.Board = Board;
    //-------------------------------------------------------------------------------------------------------
    var EndgamePieceInfo = /** @class */ (function () {
        function EndgamePieceInfo(piece, offset) {
            this.piece = piece;
            this.offset = offset;
        }
        return EndgamePieceInfo;
    }());
    var Position = /** @class */ (function () {
        function Position(index, symmetry) {
            this.index = index;
            this.symmetry = symmetry;
        }
        return Position;
    }());
    var EndgameLookup = /** @class */ (function () {
        function EndgameLookup(algebraicMove, mateInMoves) {
            this.algebraicMove = algebraicMove;
            this.mateInMoves = mateInMoves;
        }
        return EndgameLookup;
    }());
    Flywheel.EndgameLookup = EndgameLookup;
    var Endgame = /** @class */ (function () {
        function Endgame(data, pieceList) {
            this.data = data;
            this.pieceList = pieceList;
        }
        Endgame.Config = function (board) {
            var config = [];
            var dict = {};
            for (var y = 0; y < 8; ++y) {
                for (var x = 0; x < 8; ++x) {
                    var s = board.GetSquareByCoords(x, y);
                    if (s != Square.Empty) {
                        dict[s] = (dict[s] || []);
                        dict[s].push(new EndgamePieceInfo(s, 10 * (y + 2) + (x + 1)));
                    }
                }
            }
            var pieceOrder = [
                Square.BlackKing, Square.BlackQueen, Square.BlackRook, Square.BlackBishop, Square.BlackKnight, Square.BlackPawn,
                Square.WhiteKing, Square.WhiteQueen, Square.WhiteRook, Square.WhiteBishop, Square.WhiteKnight, Square.WhitePawn
            ];
            for (var _i = 0, pieceOrder_1 = pieceOrder; _i < pieceOrder_1.length; _i++) {
                var p = pieceOrder_1[_i];
                if (dict[p]) {
                    for (var _a = 0, _b = dict[p]; _a < _b.length; _a++) {
                        var info = _b[_a];
                        config.push(info);
                    }
                }
            }
            return config;
        };
        Endgame.CalcPosition = function (symmetry, config) {
            var bkDisplacement = Endgame.SymmetryTable[symmetry][Endgame.Displacements[config[0].offset]];
            var bkOffset = Endgame.PieceOffsets[bkDisplacement];
            // A position has a valid index only if the Black King is inside
            // one of the 10 squares indicated by FirstDisplacements.
            var bkFirst = Endgame.FirstDisplacements[bkOffset];
            if (bkFirst < 0 || bkFirst > 9) {
                return null;
            }
            var index = bkFirst;
            for (var i = 1; i < config.length; ++i) {
                index = (64 * index) + Endgame.SymmetryTable[symmetry][Endgame.Displacements[config[i].offset]];
            }
            return new Position(index, symmetry);
        };
        Endgame.prototype.GetMove = function (board) {
            // See if the board contents match the pieceList.
            var config = Endgame.Config(board);
            if (config.length !== this.pieceList.length) {
                return null; // this endgame table does not match the board configuration
            }
            for (var i = 0; i < config.length; ++i) {
                if (config[i].piece !== this.pieceList[i]) {
                    return null; // this endgame table does not match the board configuration
                }
            }
            // Try all 8 symmetries to find the smallest valid table index.
            var bestPos = null;
            for (var symmetry = 0; symmetry < 8; ++symmetry) {
                var pos = Endgame.CalcPosition(symmetry, config);
                if (pos && (!bestPos || (pos.index < bestPos.index))) {
                    bestPos = pos;
                }
            }
            if (!bestPos) {
                return null;
            }
            var result = this.data[bestPos.index];
            if (!result) {
                return null;
            }
            // The first 4 characters of result are the algebraic move string.
            // Any remaining characters encode the number of moves (including this one) for forced mate.
            var source = Board.Offset(result.substr(0, 2));
            var dest = Board.Offset(result.substr(2, 2));
            var mateInMoves = parseInt(result.substr(4));
            // Unrotate the move back to the orientation needed by the caller.
            var algebraicMove = (Board.Algebraic(Endgame.Rotate(bestPos.symmetry, source)) +
                Board.Algebraic(Endgame.Rotate(bestPos.symmetry, dest)));
            return new EndgameLookup(algebraicMove, mateInMoves);
        };
        Endgame.Rotate = function (symmetry, offset) {
            return Endgame.PieceOffsets[Endgame.SymmetryTable[Endgame.InverseSymmetry[symmetry]][Endgame.Displacements[offset]]];
        };
        Endgame.InverseSymmetry = [
            0, 1, 2, 3, 4, 6, 5, 7
        ];
        Endgame.FirstDisplacements = [
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, 0, 1, 2, 3, -1, -1, -1, -1, -1,
            -1, -1, 4, 5, 6, -1, -1, -1, -1, -1,
            -1, -1, -1, 7, 8, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, 9, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
        ];
        Endgame.Displacements = [
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, 0, 1, 2, 3, 4, 5, 6, 7, -1,
            -1, 8, 9, 10, 11, 12, 13, 14, 15, -1,
            -1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
            -1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
            -1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
            -1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
            -1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
            -1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
        ];
        Endgame.PieceOffsets = [
            21, 22, 23, 24, 25, 26, 27, 28,
            31, 32, 33, 34, 35, 36, 37, 38,
            41, 42, 43, 44, 45, 46, 47, 48,
            51, 52, 53, 54, 55, 56, 57, 58,
            61, 62, 63, 64, 65, 66, 67, 68,
            71, 72, 73, 74, 75, 76, 77, 78,
            81, 82, 83, 84, 85, 86, 87, 88,
            91, 92, 93, 94, 95, 96, 97, 98
        ];
        Endgame.SymmetryTable = [
            // 0 = identity
            [
                0, 1, 2, 3, 4, 5, 6, 7,
                8, 9, 10, 11, 12, 13, 14, 15,
                16, 17, 18, 19, 20, 21, 22, 23,
                24, 25, 26, 27, 28, 29, 30, 31,
                32, 33, 34, 35, 36, 37, 38, 39,
                40, 41, 42, 43, 44, 45, 46, 47,
                48, 49, 50, 51, 52, 53, 54, 55,
                56, 57, 58, 59, 60, 61, 62, 63
            ],
            // 1 = flip x
            [
                7, 6, 5, 4, 3, 2, 1, 0,
                15, 14, 13, 12, 11, 10, 9, 8,
                23, 22, 21, 20, 19, 18, 17, 16,
                31, 30, 29, 28, 27, 26, 25, 24,
                39, 38, 37, 36, 35, 34, 33, 32,
                47, 46, 45, 44, 43, 42, 41, 40,
                55, 54, 53, 52, 51, 50, 49, 48,
                63, 62, 61, 60, 59, 58, 57, 56
            ],
            // 2 = flip y
            [
                56, 57, 58, 59, 60, 61, 62, 63,
                48, 49, 50, 51, 52, 53, 54, 55,
                40, 41, 42, 43, 44, 45, 46, 47,
                32, 33, 34, 35, 36, 37, 38, 39,
                24, 25, 26, 27, 28, 29, 30, 31,
                16, 17, 18, 19, 20, 21, 22, 23,
                8, 9, 10, 11, 12, 13, 14, 15,
                0, 1, 2, 3, 4, 5, 6, 7
            ],
            // 3 = rotate 180
            [
                63, 62, 61, 60, 59, 58, 57, 56,
                55, 54, 53, 52, 51, 50, 49, 48,
                47, 46, 45, 44, 43, 42, 41, 40,
                39, 38, 37, 36, 35, 34, 33, 32,
                31, 30, 29, 28, 27, 26, 25, 24,
                23, 22, 21, 20, 19, 18, 17, 16,
                15, 14, 13, 12, 11, 10, 9, 8,
                7, 6, 5, 4, 3, 2, 1, 0
            ],
            // 4 = slash
            [
                0, 8, 16, 24, 32, 40, 48, 56,
                1, 9, 17, 25, 33, 41, 49, 57,
                2, 10, 18, 26, 34, 42, 50, 58,
                3, 11, 19, 27, 35, 43, 51, 59,
                4, 12, 20, 28, 36, 44, 52, 60,
                5, 13, 21, 29, 37, 45, 53, 61,
                6, 14, 22, 30, 38, 46, 54, 62,
                7, 15, 23, 31, 39, 47, 55, 63
            ],
            // 5 = rotate right
            [
                7, 15, 23, 31, 39, 47, 55, 63,
                6, 14, 22, 30, 38, 46, 54, 62,
                5, 13, 21, 29, 37, 45, 53, 61,
                4, 12, 20, 28, 36, 44, 52, 60,
                3, 11, 19, 27, 35, 43, 51, 59,
                2, 10, 18, 26, 34, 42, 50, 58,
                1, 9, 17, 25, 33, 41, 49, 57,
                0, 8, 16, 24, 32, 40, 48, 56
            ],
            // 6 = rotate left
            [
                56, 48, 40, 32, 24, 16, 8, 0,
                57, 49, 41, 33, 25, 17, 9, 1,
                58, 50, 42, 34, 26, 18, 10, 2,
                59, 51, 43, 35, 27, 19, 11, 3,
                60, 52, 44, 36, 28, 20, 12, 4,
                61, 53, 45, 37, 29, 21, 13, 5,
                62, 54, 46, 38, 30, 22, 14, 6,
                63, 55, 47, 39, 31, 23, 15, 7
            ],
            // 7 = backslash
            [
                63, 55, 47, 39, 31, 23, 15, 7,
                62, 54, 46, 38, 30, 22, 14, 6,
                61, 53, 45, 37, 29, 21, 13, 5,
                60, 52, 44, 36, 28, 20, 12, 4,
                59, 51, 43, 35, 27, 19, 11, 3,
                58, 50, 42, 34, 26, 18, 10, 2,
                57, 49, 41, 33, 25, 17, 9, 1,
                56, 48, 40, 32, 24, 16, 8, 0
            ],
        ];
        return Endgame;
    }());
    Flywheel.Endgame = Endgame;
    //=====BEGIN HASH SALT=====
    var WhiteToMoveSalt = [0x66f9a833, 0x36d0a4f4, 0x829f8f19];
    var CastlingRightsSalt = {
        wk: [0xf0656f02, 0xa9eb1182, 0x810a730b],
        wq: [0xdc57edcc, 0xe5c1df62, 0x47ebdc41],
        bk: [0xdc8a5390, 0xa43267bf, 0xd146785a],
        bq: [0xa5afc980, 0xad449167, 0x3a26e039]
    };
    var EnPassantFileSalt = [
        [0xa47fe204, 0xb631c65f, 0x59d76814] // a
        ,
        [0x1755e2da, 0xfec23f21, 0x0331dbca] // b
        ,
        [0xe3b1c16b, 0xe5e6972b, 0x7ef28278] // c
        ,
        [0xa6271572, 0xfa8286d3, 0x51c5468d] // d
        ,
        [0x7b9909a0, 0x0c802e84, 0xf6bc46a3] // e
        ,
        [0x3b0a2b0d, 0x5e11e712, 0x9d1c6ab9] // f
        ,
        [0xf73758be, 0xe4fe5f99, 0xb209a9e5] // g
        ,
        [0x593ea6c8, 0x24c1ec9a, 0xd769f8c0] // h
    ];
    var PieceHashSalt = [
        //               Pawn                               Knight                              Bishop                               Rook                               Queen                               King
        // ---------------------------------   ---------------------------------   --------------------------------    ---------------------------------   --------------------------------    --------------------------------
        [[0, 0, 0],
            [0x3056e5e5, 0x470470bd, 0x630956b6], [0xe5052603, 0x3a81ed4d, 0x3cb97f79], [0xe661dd1a, 0xbd511d4d, 0x8916732f], [0xc76ae817, 0xe8abea6c, 0x9fe7fa8b], [0xf7faed53, 0x4402a908, 0xf16bacad], [0xd80c0187, 0xa275a8e2, 0xd183bb29] // a1 W
            ,
            [0x230f57dd, 0x71f5dcc0, 0x2f9b50b8], [0x885d1c9f, 0x12f17078, 0x57eb21d1], [0xcce19059, 0x86b018fa, 0x09871c23], [0x02c53f93, 0xb89dd984, 0x3ec5a8bd], [0x3477f485, 0x9be75cf7, 0x8c415907], [0x7f76e394, 0xcf92b435, 0xd696b734]] //    B
        ,
        [[0, 0, 0],
            [0x60859398, 0x2bfaf175, 0x84cadfd8], [0x0857475a, 0xd667742e, 0xce0aff3a], [0xca6c4efe, 0x76e1f221, 0x572ee7f9], [0x5fd85d08, 0xb2ccb650, 0x3d481c62], [0xcfc2302d, 0x93749f02, 0xf48e1e26], [0x4e4ffa5d, 0xdac30df7, 0x83ca19dd] // b1 W
            ,
            [0x155324cd, 0x5c93c520, 0xd643eabd], [0xa9760194, 0x0550b044, 0xe01da642], [0x54e4c347, 0xbb2bff50, 0x735c1397], [0xc3544f8d, 0x11d8b590, 0x1f07340e], [0x1a5d63af, 0x32cbef76, 0x5d5a741f], [0xdd98b8dc, 0x82ec4b93, 0x6317bdb8]] //    B
        ,
        [[0, 0, 0],
            [0xea022e98, 0xe8a00cc3, 0x83bdf9cc], [0x1aac25ce, 0x6f50f190, 0x12d2dc30], [0x8c72a6b8, 0xf38edff2, 0x1c03453e], [0xd9de142b, 0xe1849480, 0x0dc9d923], [0x88eb7041, 0xc0e153a9, 0x360ac389], [0x4c469e5f, 0x14f91229, 0x2ab8529b] // c1 W
            ,
            [0x95581355, 0x4f07009b, 0xeebabc76], [0x39020cb7, 0x36ef8267, 0x96e81ec5], [0xd9ebfea4, 0x3675dde4, 0x3e39d09b], [0xf3a0194e, 0x55dd69eb, 0x13bf95c6], [0xb17fb96e, 0xb6db50e4, 0x72299eed], [0x40fb4956, 0x12dadb1c, 0x3c9eb924]] //    B
        ,
        [[0, 0, 0],
            [0x004323f2, 0xce93a272, 0x5ac4c96f], [0x91769a1a, 0x79c799bb, 0xef2d293c], [0xb4c8a470, 0x6a2c0e94, 0x6b48d458], [0x4d7740b9, 0x8865d985, 0xa493ebc5], [0x88e7b004, 0x41adb6c3, 0xd1388e58], [0xd6650361, 0x7914bdb2, 0x3fa06198] // d1 W
            ,
            [0x3ceeadb5, 0x66278075, 0x3667b8d6], [0x70399872, 0xf06c2a0a, 0xe0d18865], [0x7630a6a9, 0x748c80be, 0x3c88a771], [0x0e533aea, 0xed645711, 0xa53fceba], [0xa9bf318c, 0x3912dea5, 0x34c08515], [0xc6173edb, 0xd1831ac5, 0xa888d475]] //    B
        ,
        [[0, 0, 0],
            [0xc5d79e33, 0xec540763, 0x91240d70], [0x26f6f433, 0xdde9b659, 0x100de1cd], [0xf0d34846, 0x89a2e68e, 0x043c833a], [0x4099aa4a, 0xa3739792, 0x1b37e88a], [0xb5dcb579, 0xe513b34e, 0x8b766e3b], [0x3cfdb3ca, 0x23c2c53e, 0x55ea2d94] // e1 W
            ,
            [0x0fe69958, 0x5ecd3114, 0xa587add3], [0x542a8899, 0xd91accb4, 0x227691a1], [0xce2e6e55, 0x5d1969e6, 0xee571981], [0xeb70e680, 0x2a69f878, 0x9339d98e], [0xfc1d4f2f, 0xd7021d04, 0xf1ae032f], [0xe364d9a9, 0xd9ca750e, 0x9b539aa7]] //    B
        ,
        [[0, 0, 0],
            [0xef8af1d9, 0x4ea17f58, 0xe6cf3ed9], [0x2cb0f5cc, 0x1128b1c7, 0xb9eee004], [0xb877bcf5, 0x5899c084, 0x560938b8], [0x4002fa7c, 0x78b2a0f5, 0x77ebb362], [0xa2a0f876, 0xf0158a57, 0x56b9b741], [0xfa8e3a2f, 0x43386e63, 0x2438b891] // f1 W
            ,
            [0xb61a1158, 0x861481c5, 0x51557cd5], [0x56d26c3f, 0xf262fa93, 0x4b677db8], [0x282f47f6, 0x443cfb28, 0x0cc09a58], [0xe3f5f313, 0xc48a6126, 0x11117935], [0xf363e3e7, 0xd64a227b, 0x131599e3], [0x39d448d0, 0x9d8332a4, 0x98a97497]] //    B
        ,
        [[0, 0, 0],
            [0x83d5f3a8, 0xf27c5f2c, 0x3db5b33e], [0xc6dd86a2, 0x2a8955ee, 0x479a7eb3], [0xb368c015, 0xd7ee2c3f, 0x0c3e8aa2], [0xcbde4fcd, 0xa2286b27, 0x1f1fba49], [0x774f6180, 0x81dc7d8d, 0x9cd1c01f], [0x2bb192ad, 0x7f3b544c, 0x085429ac] // g1 W
            ,
            [0xea347069, 0x193e98fc, 0x734ffbbe], [0x7ce707af, 0x70442e7a, 0x1c81c9af], [0x91dc8d5b, 0x028759de, 0x5733c427], [0x70887db1, 0x1795c6e0, 0x2c66173e], [0x6657d25d, 0xad31a5fd, 0x8e93b4ee], [0x383d010b, 0xc497acac, 0x46947342]] //    B
        ,
        [[0, 0, 0],
            [0xd971682b, 0x3717b230, 0x271735d5], [0x94e3d944, 0xd462f773, 0x1915988a], [0x7ed4ff8d, 0x8308ec7c, 0x39108192], [0x1a7e63ab, 0xac3043b7, 0xa34719d7], [0x53f58899, 0x53c25773, 0x49da8c73], [0x724958f5, 0x054a51c6, 0x2652757f] // h1 W
            ,
            [0xd9a53957, 0x05711161, 0x702e5fdc], [0x01e22a3c, 0xc937db4b, 0x6290b6a0], [0xb8404150, 0xe7ce279c, 0xcfc5342c], [0x89e81007, 0xbf7b4d16, 0x0db021f0], [0x6c37943b, 0xbbfff0e3, 0xf7ac8de8], [0x3d4e0ca6, 0xa13b5c14, 0x7cd8c263]] //    B
        ,
        [[0, 0, 0],
            [0x27253d60, 0x3f32aa08, 0x3b1150bb], [0x11294cf1, 0xb20dc251, 0x3ca989f0], [0x071e28d5, 0x3d54b880, 0x6443220a], [0xb1b1d82a, 0x857e9de0, 0x39c6d7a5], [0x177f6564, 0x7408891f, 0x0b7265ec], [0xeaf61f1a, 0xa5655361, 0x5093817a] // a2 W
            ,
            [0x7660553a, 0xce553442, 0xb236589a], [0x06c4545c, 0x4f77be01, 0x3eb1ad68], [0xf191da7d, 0x27a2269a, 0x7776acd2], [0xd10fe391, 0x4e625893, 0x0262d7f0], [0xa325ccbe, 0x306f7509, 0x64973476], [0x8e0be20e, 0xfbc6ddde, 0x47350242]] //    B
        ,
        [[0, 0, 0],
            [0x10f1d031, 0xd64d41ef, 0x8a37b688], [0xb4cad912, 0x095a2c51, 0x4955a6a7], [0xc6de948c, 0xa6570480, 0xeef66cb1], [0xe81b6d20, 0xfa5399e4, 0xf3d9ae24], [0xbf51c242, 0x4337ee27, 0xc545ad3c], [0x37672a8e, 0x43f92604, 0x55c62a8d] // b2 W
            ,
            [0x782eab3f, 0x66809d0b, 0xd1467343], [0x522ba4e5, 0x658707a2, 0xd63203e8], [0x3d08f4c0, 0x83bc91d4, 0x89579b80], [0xdad411b4, 0xc511b211, 0xfc7f072e], [0x56e6d625, 0x1221f981, 0x15d27c3e], [0x53ca8062, 0x9b38eb0d, 0x12ce21d7]] //    B
        ,
        [[0, 0, 0],
            [0xa9b60f03, 0x78f33f25, 0x0e04463b], [0xecc64973, 0x5d90f5b4, 0x91cca095], [0x7073c2cc, 0x4a729f93, 0x7dd843c5], [0xc3162814, 0x067d8a0f, 0xb7c2373b], [0x9eed04cf, 0x2df8290a, 0xc94594fc], [0xbd5a364e, 0x83dd9b40, 0xa7def452] // c2 W
            ,
            [0x88336a8e, 0x1a0c1c6f, 0xeaf98999], [0x76a5b84c, 0x6ce75d76, 0x5db0fc70], [0xb9a930b3, 0x38447dc0, 0x803101d4], [0xf56e82d2, 0xd2b5c6aa, 0xc72ef760], [0xec20ac74, 0xed961b16, 0xfceac86b], [0xfebef0e8, 0x6158afb9, 0xabb36212]] //    B
        ,
        [[0, 0, 0],
            [0xa3abd5b2, 0xf536c9bd, 0x40163611], [0xa26be49f, 0x61cf2678, 0x69f06c42], [0x3496fc0d, 0x6158135b, 0xceb4976f], [0x19b1c75c, 0x9c5e4777, 0xe91c28cb], [0x06023355, 0xcb51dff0, 0x768a55a3], [0x74df0cd2, 0x8a6b82b6, 0xeb8291c0] // d2 W
            ,
            [0x5bab5423, 0x0b21012c, 0x16033175], [0x4a680049, 0xaf9e1512, 0x5b40e761], [0x687fc176, 0x15858c5e, 0x59cfaa8a], [0x30ba85a7, 0x458ef923, 0xbf65c07e], [0x2215d41a, 0x30d24738, 0x14c5a5e0], [0xde469203, 0xb6954367, 0x634dd4f4]] //    B
        ,
        [[0, 0, 0],
            [0x2807ec78, 0x813e9857, 0xbe3eb1a7], [0x9176d2b4, 0x53e91c86, 0xc269df5d], [0x62183c2a, 0x3fc660f8, 0x24fb0221], [0x9294baaf, 0x9e6017c8, 0xe15b8cc8], [0xee8c8bc4, 0xefe0407a, 0x84ee6537], [0xc592f0a0, 0x09941e3e, 0x33a92143] // e2 W
            ,
            [0xf9130a99, 0x631b7858, 0x64fb8b96], [0x93936fb9, 0x9d772e67, 0xa7040499], [0x5b3f16a5, 0x5885fd33, 0x0a8e482c], [0x1944a9ce, 0xad7e0d01, 0xf950bd51], [0xc8f0b07f, 0x17470ae5, 0x2ee7ac76], [0x751159cb, 0x2208b686, 0x058f3d2a]] //    B
        ,
        [[0, 0, 0],
            [0xc5a59437, 0x11a20e17, 0x137fe4c4], [0x3ba56208, 0xee94c66f, 0x12f55fd9], [0xab219342, 0xb19ff70e, 0x836e928c], [0xc80c52f3, 0x50c0b5a7, 0x1ffeaada], [0x4638d7b4, 0xc07acf68, 0xc19353cf], [0x443e0c8f, 0x486de634, 0xd35a930c] // f2 W
            ,
            [0x23fcd5fb, 0x8a1eeb81, 0x22675c0d], [0xb8f15db0, 0xd9441d99, 0x3881e508], [0xe99f7b5d, 0x1521add1, 0xe2a02d15], [0xe714a29f, 0xf6a4bed0, 0x9596d0c8], [0x603e6ed4, 0xf0f7fb0b, 0x69b5345b], [0xb00d3565, 0x1643f8c1, 0x9be957c0]] //    B
        ,
        [[0, 0, 0],
            [0x2bd59260, 0x437cf962, 0x30b0e3c4], [0x135523db, 0xa13b5fcd, 0x41d17bb8], [0xa9def2a4, 0x522d05f5, 0x3910c444], [0x6cc3bf85, 0x508ada1f, 0xdf3251de], [0xbe9b9047, 0x3dcb7a09, 0x45495be7], [0x96f7e69c, 0xd411b98f, 0x16cd67c8] // g2 W
            ,
            [0xb7f39f6c, 0x657c7f4d, 0xbb7d919a], [0x55c2d89d, 0xf2b3cec8, 0x7710ac70], [0xf7d5147e, 0x57020837, 0x2a091465], [0xf35b3439, 0xa4537a0e, 0xbe3b66cd], [0x2ba18275, 0xb9354628, 0x4040c668], [0x664ae145, 0x2b199de4, 0xf98d2e29]] //    B
        ,
        [[0, 0, 0],
            [0x9cafd04d, 0x99c69fee, 0xc3d449a5], [0x8eded0e4, 0x19070c5e, 0x21400020], [0x1b75f3f4, 0x1a5e2eae, 0x471e8af5], [0xd8d4f576, 0x5442723d, 0xc12c5ef7], [0xce5e63ce, 0xc45f77f2, 0xecabbc23], [0xfe40a2aa, 0xaf949511, 0xfa3eedf6] // h2 W
            ,
            [0xddc3f2af, 0x0bd37d83, 0x593cdae0], [0xac0d1bb6, 0x842d1c4f, 0x5e812072], [0x61918631, 0x6e4296c9, 0x11da0648], [0x2672572a, 0x018bd617, 0x0c9b98e0], [0x1f285622, 0x24fd75d3, 0xec58de1e], [0x505c2108, 0xbc71e581, 0xa72091bc]] //    B
        ,
        [[0, 0, 0],
            [0xeec13b34, 0x45eef641, 0x38b5a4a6], [0xdd24bb36, 0xadedb2f9, 0xa97bcc91], [0x62f7544c, 0x9f4fd6ed, 0xb320f497], [0x317ac53d, 0x6856852e, 0xb1c0c453], [0x362f1827, 0x0d9eca70, 0x1b7b8db0], [0x5b9bd6f6, 0x40e73ec2, 0xea452fd1] // a3 W
            ,
            [0xa7025a1f, 0xea2eb5b4, 0x5111e420], [0x8eb0f8a7, 0x265f4804, 0x93a35398], [0x2f215ddc, 0x1bbbf27a, 0x5e999cf9], [0x408f7ad5, 0x2ba2ae07, 0x2c272bc1], [0x3a1157c1, 0x008459ad, 0x48c7e020], [0x12502222, 0xab7755bf, 0x6c24dff3]] //    B
        ,
        [[0, 0, 0],
            [0x05370d4e, 0x3ce3872f, 0x9b02da6e], [0x0f6ff95e, 0xe2cfa567, 0x98e8aa76], [0x42002a20, 0xf300a5ab, 0x8be8b43e], [0xcc701ea6, 0xa071c2ef, 0xb1990c8f], [0xa6a1b0e6, 0x50125d63, 0x843ce762], [0x1f9e915a, 0x1f7e2943, 0x5fee3412] // b3 W
            ,
            [0x26ecbffa, 0x72e7c84e, 0xc69fcd31], [0xf0faa5fd, 0x0819a2b3, 0x54f993b4], [0x99654230, 0xbc6d67e8, 0xdf7789b3], [0x87247c1a, 0xebf12638, 0x876c5c54], [0x59592de5, 0x458e08f0, 0x39eb76a4], [0x30c7b9a6, 0xab6569bd, 0x78376c94]] //    B
        ,
        [[0, 0, 0],
            [0x8d0d361e, 0xe959cc47, 0x4d924dfc], [0xb29077f5, 0xe6b991c6, 0x7b3f8fd5], [0xf6faca35, 0x253de41c, 0x9cc0198f], [0x2bd8739c, 0x5f8a9ecd, 0xd7dc8f5b], [0xa811af19, 0x14060995, 0x3d9c2ae9], [0x37b03dc2, 0x63eabd61, 0x3fb2f97b] // c3 W
            ,
            [0x7ea8c32f, 0x16987b20, 0x1d8854de], [0x4d4c76b2, 0x356c2914, 0x98571795], [0x831d536a, 0x6ba7fb6e, 0xebe1ab12], [0x69b93f1f, 0x36088035, 0xe2890dba], [0x5beb9e66, 0xd1e6f54e, 0x628a165b], [0x5d6cd7a0, 0x9b31f5f6, 0x81af83f7]] //    B
        ,
        [[0, 0, 0],
            [0xd8438406, 0x09221f67, 0x1df8c34d], [0x47c316dd, 0x00324b2e, 0x1555acc3], [0xb8a3a1fe, 0xa7cacfd9, 0xad8b44b0], [0xca6cf10b, 0xae2e6d75, 0x7120b71a], [0xb09a25ec, 0xe0cb5c78, 0xa975fb07], [0xdc0faeeb, 0x3280cfcf, 0x0f8191b8] // d3 W
            ,
            [0x0b6b1932, 0xd8ba28e6, 0x0ef1b22b], [0x4c9729cb, 0xa8a38b2c, 0xcb816127], [0x60a9c79d, 0x0c7c2771, 0xdbfe3c58], [0x344c1777, 0x93018240, 0xf108da87], [0x8151347f, 0x5631a3bd, 0xfc9d5010], [0x55335923, 0xfd356153, 0x233a4d52]] //    B
        ,
        [[0, 0, 0],
            [0x803f5cea, 0x4e9b8cd1, 0xde2a02ca], [0x39f2c302, 0x446e912b, 0x493dc24c], [0x0c4c2e0c, 0xa2472b1d, 0x3aeae368], [0x577b3a93, 0x72c9c300, 0xc90443a5], [0x267f8800, 0x5a02364e, 0x738a8046], [0xb100e8a6, 0x2f2af4bd, 0xc8d8fec4] // e3 W
            ,
            [0x5bf9fd06, 0xa4697196, 0x33d178b3], [0x17288670, 0x03eb9fd8, 0xe85561aa], [0x7f924482, 0x5c25d07e, 0xfff15ba1], [0x1dd687c5, 0xa69cb5ad, 0xa755eb82], [0xe9f8ed92, 0x92b7308f, 0x66f30b6f], [0x5991cb48, 0x1744580d, 0xe1f62524]] //    B
        ,
        [[0, 0, 0],
            [0xa4dcea07, 0x713b6240, 0x06b5c87d], [0x57f360c2, 0x4b39f537, 0x3b038625], [0x6d24031c, 0x378c6380, 0x9011dbb5], [0x66ecc5c2, 0xfaae640a, 0x0aa773ec], [0xb9a3944c, 0xe658381a, 0x58f92f63], [0x478bb3ac, 0xf190623a, 0x9f5fa10e] // f3 W
            ,
            [0x2ad1ac37, 0x3ca22d09, 0xc42ce337], [0x7318f5cc, 0x98548e4a, 0x05d31caa], [0x88a37401, 0x4d6c5ee8, 0xa431770c], [0x7c2963d0, 0x68a739ee, 0x9eb2a763], [0x574b257f, 0xa4b4de12, 0x4f41fc25], [0x696666e4, 0xf81d084b, 0x6969df60]] //    B
        ,
        [[0, 0, 0],
            [0xcfe429f0, 0x43eb5387, 0xdbfd1367], [0x86ff363b, 0x8ea2c387, 0x3b36ef31], [0x9ec77e3f, 0x8e9b5d45, 0x7e4dd37d], [0x459e720d, 0xc7e8be3e, 0xcfe27aa1], [0x239865a4, 0x4d8db794, 0x4a7ed990], [0xd878b41a, 0xc0f45944, 0xf6548010] // g3 W
            ,
            [0x8bd4c553, 0x0cf5d436, 0xbb535ac0], [0xfe1e3ed9, 0xbc3ce129, 0xd0ada921], [0xf0f03a82, 0x256e4a82, 0xcafa04a1], [0x51d7d9d1, 0x0314088a, 0xeef0638c], [0x280cc51c, 0x9b0e97ae, 0x9b2b81c4], [0xde8e35f5, 0xea055748, 0x2e1e7364]] //    B
        ,
        [[0, 0, 0],
            [0xe1c69036, 0x64db86dd, 0xf4a91ee2], [0x59769bb0, 0x97a9c7da, 0x9bd028a7], [0x7e9ec0d6, 0x1bb9a6a5, 0xa71cf02a], [0xe19069ad, 0xe14d58b7, 0x68f08ad1], [0x003e2048, 0x45a6072e, 0xd73c7180], [0xf5078b7a, 0xcea2fd0e, 0xcde76e7e] // h3 W
            ,
            [0xcadb0376, 0x46e35fa3, 0x40494fb5], [0xd454b770, 0x83c5bf5f, 0xa557efbb], [0x5705db92, 0x61344575, 0x857c4b82], [0x4301fb1d, 0x72e266cd, 0x5dd5bd46], [0xd429772d, 0xdb914084, 0x30e9e97b], [0x64639858, 0xa47d9c5b, 0x6ca062d7]] //    B
        ,
        [[0, 0, 0],
            [0x02e99936, 0xd93e3814, 0xd3141d1f], [0x6f8d52ac, 0xfb1bb1d3, 0xe96f4145], [0x3c8f08e1, 0xd542d6ab, 0xb4458b4d], [0x443b09a7, 0x180c5c29, 0x146d57f4], [0x3acaaf50, 0x28001bd9, 0x3a56b6fa], [0x4760e045, 0x9669bf6e, 0xbb3b7010] // a4 W
            ,
            [0xa6f68f31, 0xfb1f3213, 0xb3e5ff40], [0xbf734b27, 0x8321962e, 0x1dc8555d], [0xb380943c, 0x325d9212, 0xc2d59b68], [0x77e2b529, 0xf861ee3a, 0x89aae1b9], [0x8335fb15, 0x4c6a348d, 0x183e67cc], [0x939360e1, 0x9aab9461, 0x3e271b84]] //    B
        ,
        [[0, 0, 0],
            [0xbd0c2d7a, 0x98b1b421, 0xbc582e19], [0x7e151356, 0xc1fbe461, 0x3388db2c], [0x8fae08d2, 0x2eb3a8dd, 0x92f96db6], [0xd8704b8b, 0x6e7b76a1, 0xd3f114fe], [0xdcbddcab, 0x9a3f7043, 0xf7b64714], [0x5d729f97, 0x68ca9100, 0x6d7511cb] // b4 W
            ,
            [0x62f22574, 0x2764bf06, 0xc4c51902], [0x215e1d36, 0xafdb4c07, 0x5b4e76cd], [0x676dc796, 0xbec7543a, 0x780a09b0], [0x2b2478ba, 0xca253ffe, 0x1da6c519], [0xea622732, 0xf4b8463b, 0x4d538f45], [0x5618c225, 0x7e5f797b, 0x39d2d3c6]] //    B
        ,
        [[0, 0, 0],
            [0x40fcaa21, 0x1abc354f, 0xc9986222], [0x2e6d3d17, 0xa31e28ff, 0xbb392057], [0xa4d8670e, 0xac08a65c, 0x4f200b28], [0x6a375cc4, 0x36c98029, 0xcb66857a], [0x5b3ffbcf, 0x221f03cc, 0xd3b85ec9], [0x258f6ad9, 0xaacb1c48, 0x91df3735] // c4 W
            ,
            [0x35642856, 0xd1976678, 0x91afe935], [0x01d38537, 0x3abc82a2, 0x3c0fc89e], [0xbe53c8af, 0xf28c8238, 0xdd6615d4], [0x0baa5a60, 0xff1b4483, 0xca43cef2], [0x80693203, 0xc631f78b, 0x035bb7d2], [0xd155e19f, 0xc7c5687c, 0x485c5430]] //    B
        ,
        [[0, 0, 0],
            [0x0f1025a7, 0x9fddca00, 0x4dace01b], [0x94bed886, 0xfb63999e, 0x300edf21], [0xa18da285, 0x8ac85c44, 0xf2e08fdc], [0xcf1d8d73, 0x238f8b41, 0x16ce8db4], [0xb6dea775, 0xdb446415, 0x18d78fe3], [0xdd624080, 0x3abcfdb9, 0xb20c3af7] // d4 W
            ,
            [0x98d9ba5b, 0x3f83d2c8, 0xe156294d], [0xa31906e6, 0x1ba46a09, 0x3f4fac04], [0x9c36fff2, 0x8cc51533, 0xaba0c02a], [0xdc31f949, 0xfe2b9ec1, 0xeb22188a], [0x6a9f0cf0, 0x8f2941a5, 0xbf434d68], [0x66e62301, 0x6babe2f3, 0xf4ce257f]] //    B
        ,
        [[0, 0, 0],
            [0x9aedd3e9, 0x6d8a74c7, 0x6f14789b], [0xe403174d, 0x39f5e527, 0x4a76348e], [0xa93424c2, 0x1398e4fb, 0x28d260ea], [0x1567e46b, 0xf05760d0, 0x96104068], [0x8463f154, 0x307b3f8c, 0x6ef61e32], [0x19088ce1, 0xfa0c3ca9, 0x78347717] // e4 W
            ,
            [0xb2b3e3c0, 0xf6d846f0, 0x797ad1ac], [0xb2c85e0f, 0x95ca9124, 0xb43c4c67], [0xc3162ba0, 0x66b1d6e3, 0x33218a37], [0xa2f74d9b, 0x12a871f6, 0xedb16dee], [0x89c3d8c0, 0xe2f7cb93, 0xefd9f248], [0x01cb1927, 0xfd8643ba, 0x95fa637d]] //    B
        ,
        [[0, 0, 0],
            [0x8adbc830, 0xe393ccc7, 0x459f0d0e], [0x09f6bb5b, 0x0b11e4e7, 0x42cee16a], [0xa7fcfc14, 0x6cd2ad5b, 0x1e793381], [0xb52dc763, 0x654c7b2a, 0x1ffeb58d], [0x517d06f1, 0xd2838535, 0xffca0462], [0xe452421a, 0x0db7ab1d, 0x28343b63] // f4 W
            ,
            [0x13472617, 0x7f29f321, 0x152fce4e], [0x84ee98be, 0xd3805bc2, 0x8a9eb65a], [0x33a392a7, 0xe94d8853, 0x45d063e4], [0x4736e586, 0x1286527b, 0x23f7b613], [0x041c0f9a, 0xb1ac9298, 0x63124a4f], [0x78b8499d, 0x6b4c4bd8, 0x32525a72]] //    B
        ,
        [[0, 0, 0],
            [0x8d971a1d, 0xf957a546, 0x24ecf0e9], [0x4a07bb12, 0x9544afa0, 0xe82109ce], [0xa0bd94d5, 0xfdcc8d5c, 0x1b922423], [0x86cd1fbc, 0x2bf5dd66, 0x065e1f34], [0xdd3801ea, 0x964fd884, 0x8efa1188], [0xeb13bbb4, 0xcc06bcad, 0x93459f56] // g4 W
            ,
            [0x722f6a84, 0x660fd334, 0xd986f7f9], [0x24b69345, 0x99be9e1b, 0x4ea2ddd7], [0xe9ca0990, 0xf16f7d21, 0x15cd9a2e], [0xb83e672c, 0x334a7561, 0x173b8cc0], [0xb67cd101, 0xb373702f, 0x1c2abb37], [0x74261b42, 0xc52d0bb9, 0x719b48a7]] //    B
        ,
        [[0, 0, 0],
            [0x9c54bcd5, 0x44a0fd6b, 0x17916151], [0xd5980df1, 0x2ff8fbbb, 0xb1d6d800], [0x6b7b461b, 0xda34189c, 0x9f4963ad], [0xcabbdfc4, 0x24103c5d, 0xa8e1e10b], [0xc2189b15, 0x06020f7b, 0x356906c7], [0xbd96007b, 0x59d4d014, 0x059f52f7] // h4 W
            ,
            [0x2fe87db4, 0x61d4e134, 0xd80341c4], [0x90990347, 0x22bc1f24, 0xcaed8bc6], [0xe51ea9f6, 0x462dc368, 0x31a90d71], [0x6c1783fb, 0xa05faf7c, 0x359fcde7], [0x26195d99, 0xd3df676f, 0xf52c179c], [0x023b874d, 0xe444b99c, 0xb1e52631]] //    B
        ,
        [[0, 0, 0],
            [0x1436f8f4, 0x0cfa5776, 0x9e6ac85e], [0x834715e2, 0x7d71094d, 0x13220d25], [0x7a21e8ef, 0x18d83852, 0xb2ea92b2], [0x09bbe793, 0x0d544642, 0xf9522679], [0x7b983409, 0x486c2af7, 0x0ee6385c], [0xac4a8be5, 0xf69f2b06, 0x8142fcbc] // a5 W
            ,
            [0x44267142, 0xf6def107, 0x2b355de5], [0xb769fa97, 0xa0d785c8, 0x7694ecc9], [0x271e6df7, 0x3cc2139a, 0x28c16b97], [0x6f164f45, 0x6afbc949, 0x5ec750d8], [0x0d264666, 0x02fd773f, 0xcef023e5], [0xe636af6b, 0xd9accbd6, 0xc7ac2cba]] //    B
        ,
        [[0, 0, 0],
            [0x8584785f, 0x78d1e56f, 0xf5ebb262], [0x9dec5f0d, 0xf1d57c74, 0xda42a134], [0x39fb9a46, 0x64d049fd, 0x83268a4c], [0x4fe2aa7b, 0xa67cfbcb, 0x38418931], [0x2d410cf3, 0xb223df34, 0xb353aa82], [0x3350d29a, 0x4df5f7b1, 0x4c4023ce] // b5 W
            ,
            [0x930d3a63, 0xb317c64e, 0xc0dd47bb], [0xdec54207, 0xffd33e6b, 0x21e7b424], [0xad6c78d4, 0xa9893f83, 0xe01babd6], [0x1f217f63, 0x46b10831, 0x2eadfbe9], [0x696bed2d, 0x19eff651, 0x522b37ef], [0x87e87c5a, 0xc40a756d, 0x1fbb711b]] //    B
        ,
        [[0, 0, 0],
            [0x35023141, 0xe8936089, 0xfe91791a], [0xf83bd4f2, 0x971672aa, 0x0c94c890], [0x284025b9, 0x128cbb53, 0xa7bb2d8d], [0x9ec23898, 0xf407aef9, 0xdcac64b8], [0x9e9b7c81, 0x2a563e1c, 0x3f27dd86], [0xd89ab3df, 0x5c21663d, 0x11063f9e] // c5 W
            ,
            [0xc262e4f0, 0xa53739f1, 0x65be5749], [0xf5318830, 0x9bf4cb25, 0x43c788d3], [0x63b9760f, 0x8a56a825, 0x464add2f], [0x029be58b, 0x89f4d79a, 0xf0fd9833], [0x2ee9520e, 0x54f20105, 0x23776641], [0x4fcb7abe, 0x5d1095e9, 0x0da49278]] //    B
        ,
        [[0, 0, 0],
            [0x62f96f48, 0x49715214, 0x7784d7a7], [0x12f41bca, 0x53743d58, 0x880109a9], [0xc8495c7c, 0x5f5482cd, 0x0afa51a9], [0x39b25f4c, 0x215df358, 0x5cd7d714], [0x1d132c2f, 0x67f80edb, 0xedb0dba2], [0x02f0ffe2, 0x19bd7bbb, 0x9bce1d54] // d5 W
            ,
            [0xca2a068c, 0x1a7e201f, 0x469b9fbb], [0xae7a64b0, 0x81943308, 0xdcdf571e], [0x0e3f9150, 0x25ea94e4, 0xf2c35629], [0x6b1971f2, 0x3f304029, 0x579f8d6a], [0xb906dc69, 0x44514b86, 0xa9e72c05], [0x9f676b1c, 0x6905767c, 0x1c1469dc]] //    B
        ,
        [[0, 0, 0],
            [0x714f1f50, 0x9978e4bb, 0x2f69c420], [0x445a999e, 0x3db76f0f, 0x17e93f60], [0xbcba9c86, 0x32669067, 0xb2c5d2f6], [0xd5a8c17c, 0xb48f1a42, 0x03c4304b], [0x1915fa01, 0xec748c16, 0x5e7754d8], [0x981014ad, 0xf24b6b56, 0x073b0f5f] // e5 W
            ,
            [0x27c9e008, 0x68b1fb82, 0x56f72e7a], [0xcc902f09, 0xe337f20e, 0x7f875d20], [0x1f6d8d20, 0x4ca3487a, 0x7a862b25], [0x50b856bc, 0x59a970c1, 0xa3b77e5f], [0x56e8e069, 0x0c2c8ad1, 0x57062b5e], [0xe54610a7, 0x051b371a, 0x025e4427]] //    B
        ,
        [[0, 0, 0],
            [0x5d8f88e7, 0xfcd1acfa, 0x78134315], [0x9c4578ab, 0x2da6e045, 0x678c47a8], [0x6cc865d0, 0x5c2b716c, 0x807cb9a3], [0x507f512b, 0xff34f98b, 0xe06fd1a0], [0x0e1a5dbe, 0x980c0816, 0x619e1bcf], [0x24fc602b, 0x7eb7f650, 0xae9dd164] // f5 W
            ,
            [0x6ba6d43e, 0x8d65b006, 0x2d0ad587], [0xd2ad57e2, 0xd3d56b7d, 0x8f75d808], [0x0065fa4c, 0x1f376b02, 0x15c0a4d4], [0x3fa6cbf3, 0x442acd2a, 0x4a8d3858], [0x1d54a61b, 0x43a2eccf, 0x96c6fac4], [0xd4aba5b0, 0x09b05b0e, 0x999317af]] //    B
        ,
        [[0, 0, 0],
            [0xefc5a220, 0x8954a420, 0xe768cd7c], [0x48ec0e9c, 0x2d501f3f, 0x69ec5c92], [0x1b4cd7da, 0x30266e3e, 0xe457cc09], [0xec5e353d, 0x4217b568, 0x9bf323d4], [0x16233a0e, 0x373672e1, 0x7dfc081a], [0x3bf9b753, 0x6bbf1b79, 0xc4a4fe24] // g5 W
            ,
            [0x17543440, 0xaf63f301, 0x8d744195], [0xcc2e8645, 0xb11f28c1, 0x907d0fab], [0x58714f36, 0x2e120cc6, 0x486e724b], [0x6c9fe260, 0xbcf6f1b4, 0xa3994e65], [0x98800689, 0x991e1571, 0x8a081483], [0x851d381c, 0x621dc7cd, 0x8858103b]] //    B
        ,
        [[0, 0, 0],
            [0xa80a5cb1, 0x575c0e39, 0xd36ceab6], [0x6b490906, 0xcc5725db, 0x53b5159d], [0xd4558183, 0x5847acf2, 0x4932b7b4], [0xe1a34ff3, 0xeafb5cbb, 0xcbfb93cd], [0xf6a11a0d, 0xf02945de, 0xbf22bd7c], [0xd7faf961, 0xddc37863, 0x7fe493cf] // h5 W
            ,
            [0x5af0348d, 0x9fd487ce, 0xddfde7c9], [0x940414fe, 0xcfa9316e, 0xb140989b], [0x83a81ced, 0x8b18759e, 0x33da47f3], [0xf61644fc, 0x99690906, 0x29ae0e98], [0x570d740d, 0x6f760612, 0x090f22da], [0x4b29a88f, 0x524cf382, 0x9469584a]] //    B
        ,
        [[0, 0, 0],
            [0xbd1d9a43, 0x9ab38bb3, 0x3fde2dc7], [0x4e683fe0, 0x9acbf6e8, 0x0802f738], [0x4c461784, 0x3457bc77, 0x216a4151], [0x6ea56c2b, 0xf4d1ba39, 0xaf85a74a], [0xb034e195, 0x096a7049, 0x3b03fb8a], [0x06f6abca, 0xe0b51538, 0xefa107b9] // a6 W
            ,
            [0x22bf82f3, 0x61b9fcf2, 0xc13257c0], [0x11881ee8, 0x9f4af03e, 0x27c2a67d], [0x7dc3c453, 0x746709f8, 0x1272a3f1], [0x38bb31c8, 0x2fa92a3f, 0xc7b70d65], [0xfa1778bd, 0x72e9b48f, 0x002acd04], [0xc1d2aeb2, 0xcba5703c, 0x1655b89d]] //    B
        ,
        [[0, 0, 0],
            [0xb34d11b6, 0x91c3c8e3, 0xbf93bf2e], [0xcd9513b1, 0x3cfe87a3, 0x6a231ea6], [0x2d22bc41, 0xdd23db34, 0x3fc52354], [0xc498ed60, 0x231c2da0, 0xb9012139], [0x6c3868ab, 0xed709177, 0x5a79dc8e], [0x4b46999e, 0xd769e67c, 0x57615d9e] // b6 W
            ,
            [0x7ab673c1, 0xbc626f68, 0x339a0c9b], [0xc0963bf6, 0x3607a85e, 0x64ae1a31], [0x0ed4483c, 0x9bf7768d, 0xe6ca2e2b], [0xa10970a5, 0xccb49265, 0xd1c87232], [0x7b4e8b39, 0x13e2fa30, 0x9aa81270], [0xaec20f67, 0x157a65a0, 0x47e0ea49]] //    B
        ,
        [[0, 0, 0],
            [0xbcc77cad, 0xf4aed71c, 0x53663fc5], [0xb9e75444, 0xfb9e9343, 0x519a7fa2], [0x3016d5d5, 0x460077dd, 0x78b804e0], [0x7190b9fc, 0xbb093e14, 0xd74acec4], [0xec8ec4c9, 0x82148e38, 0xdba9f982], [0x9eaf8806, 0x19fbf3ca, 0xd0fbfe4a] // c6 W
            ,
            [0xbb1cca88, 0x1da31dab, 0xc0efbf26], [0x17e23c8f, 0x4ce3664a, 0x99484ed4], [0x5355ecf1, 0xd88d8113, 0x3e6b6996], [0x71c842af, 0x0d61784b, 0x4e9541f2], [0x45d96b3e, 0x925472c2, 0xe3af5636], [0xf8f9ce0c, 0x646abb1d, 0x5f67960d]] //    B
        ,
        [[0, 0, 0],
            [0x283aac59, 0x8ce0a4ac, 0x2cf1991e], [0x94e4b8e9, 0x70d037be, 0x7db459a2], [0x8977f34d, 0x9e8e263d, 0xa81a20e1], [0x2a95b68f, 0xd7e6a659, 0xe69efeac], [0xbc28087d, 0x84ce4500, 0x034ae52e], [0x7aadf99b, 0x90a92c24, 0xf8b26bd2] // d6 W
            ,
            [0x9cdf8737, 0x3ed6a279, 0x037303c5], [0xc416754e, 0xd28b1b41, 0x23a03519], [0xa2d1f3c4, 0x11011b3b, 0x26406890], [0xae2e658b, 0xa52ddfe0, 0x0d45bec1], [0x0bbcc8b7, 0x26b5b10e, 0xeab4eb85], [0x0db83ba0, 0x35ef5020, 0xf2a059a0]] //    B
        ,
        [[0, 0, 0],
            [0xc3a8d2e1, 0xc94556ba, 0x7e99d779], [0x8a2c3249, 0xae5ee7dd, 0x0e740f9f], [0x0a44e93c, 0x155d95e9, 0x46411b6f], [0x1d69b3be, 0xb8fc1527, 0x10826349], [0x70e53177, 0xf482ec3e, 0x93bedb95], [0x9e9f64a6, 0xc61b567e, 0xd3d1190e] // e6 W
            ,
            [0x1ebab22b, 0x57993501, 0x57cfe983], [0x9c9ffed2, 0xfcf08a9e, 0xfd01a06e], [0x45bd7621, 0xe1df4b30, 0x60ecee7a], [0x4d9c2efa, 0x54afcc1c, 0xfb9c2d4d], [0xfa8795a5, 0xb3ccd7fe, 0x2a37f59a], [0xbeef254d, 0xd0804ef6, 0xe72ac416]] //    B
        ,
        [[0, 0, 0],
            [0x4daf5ae1, 0x9cf4028c, 0x5fac38ce], [0x1a84ad04, 0xd2c85390, 0x188d4d28], [0x315c62df, 0x8805895c, 0x034ffd9d], [0x096e055d, 0xebbc15e4, 0x7c9f12f4], [0x32b5bc98, 0xd2b38eee, 0xd9d383c6], [0xf3d38b17, 0xa95a1cef, 0x2f3b6c96] // f6 W
            ,
            [0xb6311768, 0xb52b5d14, 0xb87b30d5], [0x4c6bca3d, 0x994d19df, 0x41b61ba7], [0x06e08525, 0x12270073, 0x30ab586d], [0x64855fa7, 0x863708ff, 0xc785782f], [0xc5e3fd60, 0x60110682, 0x2ecadb1a], [0xed3ea329, 0x9b4efaac, 0x4eb05b59]] //    B
        ,
        [[0, 0, 0],
            [0x0023c137, 0xb307b97b, 0x76234aab], [0x27284938, 0x67894399, 0x76fd7860], [0x0c637b89, 0xf23b4001, 0xcecca555], [0x97ee3d0e, 0xd85c4886, 0x992492c7], [0xcd0d99c4, 0x568b81e6, 0x367834f7], [0x7fbcc12d, 0xa56e2586, 0xdb77d534] // g6 W
            ,
            [0x93cff766, 0xb103da84, 0xd79e6a38], [0xc07bba6f, 0x4f090f99, 0x1af36bf3], [0xd8a6d9b0, 0xd1cf6db8, 0x1e04d1f1], [0xd85f0673, 0x1ff27a9a, 0xaae50006], [0xa0e8f75a, 0xbd0ecc0d, 0x7b7419d5], [0x37477065, 0x7e08e731, 0x6ee13e7c]] //    B
        ,
        [[0, 0, 0],
            [0xa3763075, 0x28b6b008, 0x775fbd9d], [0x5099ff57, 0x69081574, 0x53a18597], [0x04ee3ffe, 0x7253f81f, 0x19faffa1], [0x1e430d00, 0x539dbb1c, 0xe89712b5], [0xa701b953, 0x253444a7, 0x6ccf7ea7], [0x3e52de30, 0x16d53cb1, 0xe8226ffc] // h6 W
            ,
            [0x7dbc83c4, 0xa2e504bf, 0xe0328fc4], [0xbc2d7028, 0x78c416d9, 0xa20abc3c], [0x722ff8a2, 0x3f5e0415, 0x126b136d], [0x46f9ecce, 0x3080d865, 0xa1f70a9f], [0xb725506b, 0x4742c028, 0xe5f0b2d2], [0xc0e00194, 0x5b104f21, 0xd8c11cc8]] //    B
        ,
        [[0, 0, 0],
            [0xb30355c4, 0x698c625d, 0x09d416c3], [0xe8efeb6a, 0xc6212786, 0x05a81a06], [0xd5ad791a, 0x18024184, 0x6296dade], [0x6392d9e3, 0x33954d74, 0x2260b3ad], [0x4794bd33, 0x909bb020, 0xb6d39b4b], [0xa843ced6, 0xcedc1f09, 0x5c1871f4] // a7 W
            ,
            [0x61044d54, 0xb859ab27, 0x5aa8c84e], [0xb28287d3, 0x5cc3b036, 0xce53083e], [0xe3645890, 0x213a07a8, 0xd1341ca6], [0xfe39914a, 0xcf07e134, 0xd72e2e6a], [0xb1f4ef17, 0xb0d0bc82, 0x45211686], [0x2ddd3500, 0x779601d4, 0xb45e912b]] //    B
        ,
        [[0, 0, 0],
            [0x70c35ab1, 0xb97c7957, 0x1c1ca825], [0x25b6c90b, 0x6d455c0f, 0x3f0f2f0d], [0xcd17a8de, 0xf3c987cd, 0x072c62d8], [0x6cd62d7d, 0x1e971355, 0xff206e6a], [0x3d9a679f, 0xaad06b3d, 0x6a9b712f], [0x9a74a25f, 0x7411d334, 0xde99f10c] // b7 W
            ,
            [0xc1e137d4, 0x2dcd5e90, 0x8ddd30e3], [0xf209e869, 0x30333b18, 0x6f10e54d], [0x9954b259, 0xe092996a, 0xd4d24af6], [0x384e850d, 0x9a07f140, 0xd49b408a], [0x29a038b5, 0x66f1f931, 0x7683c30d], [0x6367bc84, 0x28db1671, 0x6acaffda]] //    B
        ,
        [[0, 0, 0],
            [0xf10dd0a4, 0x76c650eb, 0xe492a82d], [0x9212b35d, 0xc8ae544f, 0x05795518], [0x1aeb65d9, 0x50d0f970, 0x99edb90f], [0xceb98822, 0xbf68303a, 0x8ca27575], [0x2fdc3338, 0x30c24763, 0x40852158], [0x97b469e7, 0x43cc3e23, 0xb982d698] // c7 W
            ,
            [0x869a5c75, 0x25c682c5, 0x555abdb3], [0x5a6884e1, 0xbe9ae31f, 0x7aba2db8], [0xbc89bfab, 0x6a6de603, 0x094c3ff5], [0xf0e898a4, 0x348c0d36, 0x05061394], [0xfd573f7e, 0x4b803456, 0x48981c88], [0x9e6b827e, 0x86d280bd, 0x1deddd7b]] //    B
        ,
        [[0, 0, 0],
            [0x0f33a23b, 0x10ea9ada, 0x70e14079], [0xf947fba1, 0x39baf565, 0x6adf37c8], [0xcf54ed04, 0x5d24d5e5, 0x74ae8444], [0x95db911e, 0xec4a60f4, 0x18bc71e5], [0x1691514a, 0x1f1e7374, 0x641e7adc], [0x5b15f6d9, 0x004fb6cb, 0x8f5e12cb] // d7 W
            ,
            [0xf55db5f2, 0x66dd8b41, 0xb6856d33], [0x95b46ad3, 0x71bd7cb5, 0xce3347ea], [0xf3a749e6, 0xa2369091, 0xa412805b], [0x87d017de, 0xe8c0c00e, 0xe427a490], [0x0b9a02af, 0xa4e8cc2b, 0x11de5aee], [0x592efe62, 0x30bfc374, 0xcc91cdc0]] //    B
        ,
        [[0, 0, 0],
            [0xad0d93a8, 0x41112f1d, 0xe2fe30a6], [0x0903dd48, 0x1b454950, 0x1d2fdfc0], [0x59f42ea7, 0xda49a13d, 0x6c4866d2], [0x26cf9dda, 0xd7c18484, 0x85322608], [0x6430e9db, 0xaf0ddd0a, 0x2a9aed66], [0x6618167f, 0xf6485090, 0x2814dc23] // e7 W
            ,
            [0x172aa280, 0x2974d0f0, 0x7baf668e], [0xdf0e005c, 0x70ef60e5, 0x255e4ea5], [0xd76ec34d, 0x3f7ea218, 0x9ab3d241], [0xcf97f4d2, 0x387bb9e4, 0xfe13f792], [0x738cd967, 0xb4649088, 0xf395d883], [0x1d45beb5, 0xfc1cca1c, 0x4174236b]] //    B
        ,
        [[0, 0, 0],
            [0x9b728111, 0x39d36908, 0x6c5b06a1], [0x55c6c3ec, 0xea36087d, 0x20d3a640], [0x30d7b3fb, 0x4d955f1a, 0x644fd385], [0x5785760c, 0x5d42c4f1, 0x2c09f2eb], [0x468c06fd, 0xe432d772, 0x4eb149d0], [0xe00b9f85, 0x2cbcf6d4, 0x1bbcdcb7] // f7 W
            ,
            [0xde2875b7, 0x3c64ed6c, 0x2ae27fa3], [0x94ddbc75, 0x6301048d, 0x4727bb31], [0xed7e4df0, 0xaa759feb, 0x2f72cb6c], [0x5359f730, 0x80862394, 0x6681d83f], [0x876341c0, 0x29a27183, 0x9e765fe8], [0xfb1216c4, 0x90710182, 0xb6d71021]] //    B
        ,
        [[0, 0, 0],
            [0x5e4e3031, 0xae0e92ff, 0x945e08e7], [0x912c4b9b, 0xc95f4225, 0x149283e6], [0x7802ff95, 0x290b4e2a, 0x282b8794], [0x9e18f04d, 0x0e4a2732, 0x2d57dc93], [0xf8bdfe76, 0x445bcf68, 0xeb34fd88], [0x55d6eaa4, 0x2f2c0f42, 0x8e3cbd46] // g7 W
            ,
            [0xa6c6c486, 0x392838a6, 0x56a7ee7d], [0xd176076f, 0xe9813948, 0x6e904127], [0x908a826e, 0x8c3b296c, 0x522281c4], [0xaa8f7aea, 0x359b537c, 0xe49fcbd0], [0x429629fb, 0x7f216a47, 0x93439b0e], [0xbc9492ae, 0xbdfebc7f, 0x9dee5a11]] //    B
        ,
        [[0, 0, 0],
            [0xd5c54879, 0x75cd0c4a, 0x731ed48e], [0x003f61a3, 0x9f9960b3, 0xf1a02b6c], [0x88e2e55d, 0xda7af6e3, 0x2ec30c43], [0xf08b816b, 0x0f7777c4, 0xab2ff4e2], [0xe4eb1048, 0xb5e9d18b, 0x47a3d61d], [0xa6bd5c04, 0x2d56c5e6, 0x64998a79] // h7 W
            ,
            [0x4880608d, 0x6725101d, 0x4b332b11], [0x09159d03, 0xbfc6618e, 0x4d7085e6], [0x7247fec7, 0x6f7c02a4, 0xa9833b34], [0x0aa4fc9b, 0xc9e0f214, 0x59f99911], [0x62eab575, 0x9f473521, 0x34f7d2f1], [0x45da50e8, 0x338edff9, 0xd5364554]] //    B
        ,
        [[0, 0, 0],
            [0x1b53f4bb, 0x8be6ac5a, 0x3eea09c7], [0xd7ee8d3e, 0xcb27f4e4, 0x3ec02579], [0x07b3b57a, 0xc10000e4, 0x0eb75f9d], [0xda3840a5, 0xf5f7e843, 0xa9f4f103], [0xcc8cdf47, 0xf8982c10, 0xcd835853], [0x207cd49c, 0x85afa995, 0x7d9483cd] // a8 W
            ,
            [0xf83916fb, 0x3277685c, 0x939c6066], [0x809cad85, 0x93abceee, 0xeaa5d8f4], [0xeff1b945, 0x77169daf, 0xe89615a0], [0xf47405cd, 0x561fa6e4, 0x33f64c76], [0xf258cbff, 0xaee14686, 0xe607eec5], [0x31e0b5ca, 0x5bcdba09, 0x300ea349]] //    B
        ,
        [[0, 0, 0],
            [0x14f58609, 0x09bdae42, 0xfc6ddb79], [0x4c3fd1b4, 0x4a3d1ee3, 0x4e27078c], [0x17d87c67, 0xd4b3af8e, 0xbecc6635], [0x82d09675, 0xb0cf1c9b, 0x78942450], [0x774c307c, 0x8a1db697, 0x8c35ec40], [0x85b4f382, 0x11621fbb, 0xd04d3881] // b8 W
            ,
            [0x4c7084c8, 0x384e0670, 0x3776b7bd], [0xa713d0e4, 0xa2a344be, 0xed8d6d41], [0xd1675d23, 0xca67fb67, 0x7206412f], [0x1a0a4390, 0xb990b510, 0x973aa80c], [0xe593a995, 0x8122e755, 0xc90a5039], [0x45916348, 0xb1514eb4, 0xd633109b]] //    B
        ,
        [[0, 0, 0],
            [0x2b32f5a9, 0x9e9aa40f, 0x287eda46], [0x8b311d58, 0x584e35ce, 0xe20597d4], [0x3c34c60f, 0x5dafbbbc, 0x088b41a1], [0x1e587ce7, 0xfc915f44, 0xf82fb45b], [0x122ec95b, 0x587033a9, 0x0263afb3], [0xfa3ac508, 0x6bf749e1, 0xda4ae0c5] // c8 W
            ,
            [0x9ef08e64, 0xfd81ddb2, 0xa76f1758], [0x9d81282e, 0x75a4e1d1, 0xfc15bf40], [0x7d504101, 0x8298266e, 0x04dfefe0], [0xafb5c6bc, 0x0af76138, 0xa7753468], [0x4546228d, 0x17689588, 0xfb348d32], [0x5921edb9, 0xf3c53e0e, 0x653e8a5d]] //    B
        ,
        [[0, 0, 0],
            [0xc78efd55, 0xf0ed5213, 0xaaff8d72], [0x3a01b9de, 0xe27016e3, 0xa4f3decd], [0xd58012dc, 0x532a0b08, 0xb65e4691], [0xa14cd0b7, 0x999224ca, 0xf1bc576c], [0x596329ff, 0xfe6772a0, 0xf82dad81], [0xeb6237fa, 0x2bb5e07b, 0x84528632] // d8 W
            ,
            [0x47078e99, 0xc060c669, 0x2ece8bdb], [0xa02c9308, 0xa85bebf4, 0x170115eb], [0xc6a05081, 0xa5c819f3, 0x6848f64a], [0x98c44c10, 0x787e3c7d, 0xef58ef45], [0x53c8be6f, 0x01bd02f3, 0x966408e9], [0x99330971, 0x2a7760ef, 0xc8efb186]] //    B
        ,
        [[0, 0, 0],
            [0x2b1f2829, 0xc14197af, 0x7582c4a8], [0x51ef1bce, 0xa619a1bb, 0xa595e459], [0xe9cd5f73, 0x54811a32, 0x758514b1], [0xbcb57a70, 0x36f985c0, 0x3031980c], [0xca6bad2c, 0x6cd9221e, 0xc9d7b204], [0x67dac988, 0x6239aceb, 0x279291b0] // e8 W
            ,
            [0x6c26ef67, 0x9b5a62b2, 0x3ca7db3e], [0x44211478, 0x56671453, 0x7e6364f3], [0x0df8c3d9, 0xd914fefe, 0x53b454a4], [0x1fa453ae, 0xa317343a, 0xcd96db1b], [0xbd47eb12, 0x248a173a, 0x152af1d4], [0xcbb92bbe, 0xb2f1e1ce, 0x2ed41c41]] //    B
        ,
        [[0, 0, 0],
            [0x2aedf3a4, 0x53852464, 0xd5959765], [0xad5d86d8, 0xf4b4a05b, 0x20e99501], [0x4aae66fc, 0x52298bc0, 0x6e3b8be2], [0x365091b0, 0xdda63887, 0xd1eecdff], [0x398060a5, 0xbe9ac309, 0x66c695b5], [0x474c2023, 0xe6d82833, 0xb2dbd745] // f8 W
            ,
            [0x10892180, 0x01849f2d, 0xf8266032], [0x6c0f3696, 0x6a715a08, 0xadd2c521], [0xba55ff6b, 0x411d21c6, 0x24e5681b], [0x1760d1de, 0xd390988f, 0x3b5c67f8], [0x1c888745, 0xe46ae2ff, 0xd152cfe1], [0x29ee7655, 0xa904efa5, 0x66c819c3]] //    B
        ,
        [[0, 0, 0],
            [0x3e5ade8e, 0x1cd55d01, 0xadda5b83], [0x935865e1, 0x6cd02047, 0x0995ee61], [0x1515de3a, 0x590353c7, 0x6ec5379d], [0xdaa1ed59, 0x80245bfe, 0xda6e00b1], [0x962720fb, 0xfd2747e6, 0x5e386690], [0x308c6456, 0x41c4fffd, 0x7aa06833] // g8 W
            ,
            [0x263d99c5, 0x6eebe8ad, 0x93d9c597], [0xef7b99a5, 0x55c2c96e, 0x647cd568], [0x6cbc11f1, 0x8fb6fe87, 0x07c28b0b], [0x26314327, 0x9b955de1, 0xb61aa101], [0x7f37d6a3, 0x834bfbf6, 0x3bd5d34d], [0x48a1d3a3, 0x338c9bdb, 0xd11324ba]] //    B
        ,
        [[0, 0, 0],
            [0x186eedc5, 0xd29d5588, 0x39c0612a], [0x8f5d8dc4, 0x3d5f9abb, 0x921f31e2], [0xc992f199, 0xa6e2bea8, 0xb3031588], [0xa51a030a, 0xe0fe7b06, 0xdf96ecc7], [0x5c75c824, 0xc923c032, 0x6f5810dd], [0xe5bfa4fe, 0x3fbb298d, 0xc857f38c] // h8 W
            ,
            [0x5bc2e69c, 0x12f33fc9, 0x4188b799], [0x06df0a17, 0x94c0b1cb, 0x35162120], [0xa9f9654c, 0x9b8c5813, 0xb228a184], [0x8a722a51, 0x71f16c13, 0x0c9ded30], [0x1cd1107c, 0xcdd12672, 0xe207ed90], [0xcf71e527, 0x7aa05aa4, 0x683d95b0]] //    B
    ];
    //=====END HASH SALT=====
})(Flywheel || (Flywheel = {}));
