var FwDemo;
(function (FwDemo) {
    'use strict';
    var MoveStateType;
    (function (MoveStateType) {
        MoveStateType[MoveStateType["OpponentTurn"] = 0] = "OpponentTurn";
        MoveStateType[MoveStateType["SelectSource"] = 1] = "SelectSource";
        MoveStateType[MoveStateType["SelectDest"] = 2] = "SelectDest";
        MoveStateType[MoveStateType["SelectPromotionPiece"] = 3] = "SelectPromotionPiece";
        MoveStateType[MoveStateType["GameOver"] = 4] = "GameOver";
    })(MoveStateType || (MoveStateType = {}));
    ;
    var PlayerType;
    (function (PlayerType) {
        PlayerType[PlayerType["Human"] = 0] = "Human";
        PlayerType[PlayerType["Computer"] = 1] = "Computer";
    })(PlayerType || (PlayerType = {}));
    ;
    var PositionList = [
        '8/8/8/8/4k3/8/8/R6K b - - 0 1',
        '8/2Q5/8/8/4k3/8/6K1/8 b - - 0 1'
    ];
    var PositionIndex = 0;
    var SquarePixels = 70;
    var TheBoard = new Flywheel.Board(PositionList[PositionIndex]);
    var RotateFlag = false;
    var MoveState = MoveStateType.SelectSource;
    var SourceSquareInfo;
    var BgDark = '#8FA679';
    var BgPale = '#D4CEA3';
    var BoardDiv;
    var ResultTextDiv;
    var PromptTextDiv;
    var PlayerForSide = {};
    PlayerForSide[Flywheel.Side.White] = PlayerType.Computer;
    PlayerForSide[Flywheel.Side.Black] = PlayerType.Human;
    // The chess board stores the history, but we need to be able to redo
    // moves that have been undone.
    var GameHistory = [];
    var GameHistoryIndex = 0;
    function MakeImageHtml(s) {
        var fn;
        switch (s) {
            case Flywheel.Square.WhitePawn:
                fn = 'wp';
                break;
            case Flywheel.Square.WhiteKnight:
                fn = 'wn';
                break;
            case Flywheel.Square.WhiteBishop:
                fn = 'wb';
                break;
            case Flywheel.Square.WhiteRook:
                fn = 'wr';
                break;
            case Flywheel.Square.WhiteQueen:
                fn = 'wq';
                break;
            case Flywheel.Square.WhiteKing:
                fn = 'wk';
                break;
            case Flywheel.Square.BlackPawn:
                fn = 'bp';
                break;
            case Flywheel.Square.BlackKnight:
                fn = 'bn';
                break;
            case Flywheel.Square.BlackBishop:
                fn = 'bb';
                break;
            case Flywheel.Square.BlackRook:
                fn = 'br';
                break;
            case Flywheel.Square.BlackQueen:
                fn = 'bq';
                break;
            case Flywheel.Square.BlackKing:
                fn = 'bk';
                break;
            default:
                return '';
        }
        fn = './pieces/' + fn + '.png';
        return '<img src="' + fn + '" width="' + SquarePixels + '" height="' + SquarePixels + '">';
    }
    function MakeFileLabel(x) {
        return '<div class="RankFileText" id="FileLabel_' + x.toFixed() + '"' +
            ' style="position: absolute; top: ' + (SquarePixels * 8 + 8).toFixed() + 'px; ' +
            ' left: ' + (SquarePixels * x + (SquarePixels >> 1) - 4).toFixed() + 'px; ">x</div>';
    }
    function MakeRankLabel(y) {
        return '<div class="RankFileText" id="RankLabel_' + y.toFixed() + '"' +
            ' style="position: absolute; left:-20px; top:' +
            (SquarePixels * y + (SquarePixels >> 1) - 7).toFixed() + 'px;' +
            '">y</div>';
    }
    function SquareSelector(x, y) {
        return 'Square_' + x.toFixed() + y.toFixed();
    }
    function SquareDiv(x, y) {
        return document.getElementById(SquareSelector(x, y));
    }
    function MakeImageContainer(x, y) {
        return '<div id="' + SquareSelector(x, y) + '"' +
            ' class="ChessSquare"' +
            ' style="position:absolute; left:' +
            (SquarePixels * x).toFixed() + 'px; top:' +
            (SquarePixels * (7 - y)).toFixed() + 'px;' +
            ' background-color: ' + (((x + y) & 1) ? BgPale : BgDark) + '; ' +
            ' width: ' + SquarePixels + 'px; ' +
            ' height: ' + SquarePixels + 'px; ' +
            '"></div>';
    }
    function MakeSpriteContainer() {
        return '<div id="DivMoveSprite" style="display:none; z-index:1; width:' + SquarePixels + 'px; height:' + SquarePixels + 'px; ' +
            'position:absolute; left:0px; top:' + (SquarePixels * 7).toFixed() + 'px;"></div>';
    }
    function MakeResultTextDiv() {
        var div = document.createElement('div');
        div.id = 'DivResultText';
        div.className = 'GameResultText';
        div.style.width = (8 * SquarePixels).toFixed() + 'px';
        div.style.height = div.style.lineHeight = (8 * SquarePixels).toFixed() + 'px';
        div.style.display = 'none';
        return div;
    }
    function MakeChessPromptDiv() {
        var div = document.createElement('div');
        div.id = 'PromptText';
        div.className = 'ChessPromptText';
        div.style.width = (8 * SquarePixels).toFixed() + 'px';
        div.style.height = div.style.lineHeight = (5 * SquarePixels).toFixed() + 'px';
        div.style.display = 'none';
        return div;
    }
    function InitBoardDisplay() {
        var x, y;
        var html = '';
        for (y = 0; y < 8; ++y) {
            for (x = 0; x < 8; ++x) {
                html += MakeImageContainer(x, y);
            }
        }
        for (x = 0; x < 8; ++x) {
            html += MakeFileLabel(x);
        }
        for (x = 0; x < 8; ++x) {
            html += MakeRankLabel(x);
        }
        html += MakeSpriteContainer();
        BoardDiv.innerHTML = html;
        BoardDiv.appendChild(PromptTextDiv = MakeChessPromptDiv());
        BoardDiv.appendChild(ResultTextDiv = MakeResultTextDiv());
    }
    function AlgCoords(alg) {
        var chessX = 'abcdefgh'.indexOf(alg.charAt(0));
        var chessY = '12345678'.indexOf(alg.charAt(1));
        var screenX = RotateFlag ? (7 - chessX) : chessX;
        var screenY = RotateFlag ? (7 - chessY) : chessY;
        return {
            alg: alg,
            chessX: chessX,
            chessY: chessY,
            screenX: screenX,
            screenY: screenY,
            selector: SquareSelector(screenX, screenY),
        };
    }
    function MoveCoords(move) {
        var sourceAlg = Flywheel.Board.Algebraic(move.source);
        var destAlg = Flywheel.Board.Algebraic(move.dest);
        return { source: AlgCoords(sourceAlg), dest: AlgCoords(destAlg) };
    }
    function ForEachSquareDiv(visitor) {
        for (var x = 0; x < 8; ++x) {
            for (var y = 0; y < 8; ++y) {
                visitor(SquareDiv(x, y));
            }
        }
    }
    function ClassList(elem) {
        var filt = [];
        if (elem.className) {
            for (var _i = 0, _a = elem.className.split(/\s+/g); _i < _a.length; _i++) {
                var token = _a[_i];
                if (token) {
                    filt.push(token);
                }
            }
        }
        return filt;
    }
    function RemoveClass(elem, classname) {
        var classlist = ClassList(elem);
        var updated = [];
        var found = false;
        for (var _i = 0, classlist_1 = classlist; _i < classlist_1.length; _i++) {
            var cn = classlist_1[_i];
            if (cn === classname) {
                found = true;
            }
            else {
                updated.push(cn);
            }
        }
        if (found) {
            elem.className = updated.join(' ');
        }
        return elem;
    }
    function AddClass(elem, classname) {
        var classlist = ClassList(elem);
        var found = false;
        for (var _i = 0, classlist_2 = classlist; _i < classlist_2.length; _i++) {
            var cn = classlist_2[_i];
            if (cn === classname) {
                found = true;
                break;
            }
        }
        if (!found) {
            classlist.push(classname);
            elem.className = classlist.join(' ');
        }
        return elem;
    }
    function HasClass(elem, classname) {
        for (var _i = 0, _a = ClassList(elem); _i < _a.length; _i++) {
            var cn = _a[_i];
            if (cn === classname) {
                return true;
            }
        }
        return false;
    }
    function BeginPieceDrag(sourceInfo) {
        var imgSource = sourceInfo.squareDiv.children[0];
        var x0 = sourceInfo.pageX;
        var y0 = sourceInfo.pageY;
        imgSource.style.display = 'none'; // hide the origin image while animating
        // Create a "sprite" image for the purposes of animation.
        // It will follow the mouse around.
        var divSprite = document.getElementById('DivMoveSprite');
        divSprite.style.left = sourceInfo.squareDiv.style.left;
        divSprite.style.top = sourceInfo.squareDiv.style.top;
        divSprite.style.display = '';
        var imgSprite = document.createElement('img');
        imgSprite.setAttribute('src', imgSource.getAttribute('src'));
        imgSprite.setAttribute('width', SquarePixels.toFixed());
        imgSprite.setAttribute('height', SquarePixels.toFixed());
        imgSprite.style.zIndex = '1';
        imgSprite.style.position = 'absolute';
        divSprite.appendChild(imgSprite);
        sourceInfo.dragged = {
            imgSource: imgSource,
            imgSprite: imgSprite,
            hasLeftSourceSquare: false,
            mouseUpOnSourceSquare: false,
        };
        var hoveredSquareDiv;
        BoardDiv.onmousemove = function (e) {
            var bc = BoardCoords(e);
            if (bc) {
                // Update the sprite location.
                var dx = e.pageX - x0;
                var dy = e.pageY - y0;
                imgSprite.style.left = dx.toFixed() + 'px';
                imgSprite.style.top = dy.toFixed() + 'px';
                // This animation interferes with receiving proper
                // mouse hover events (onmouseover, onmouseout).
                // Replicate those events here.
                if (hoveredSquareDiv !== bc.squareDiv) {
                    if (hoveredSquareDiv) {
                        RemoveClass(hoveredSquareDiv, 'ChessSquareHover');
                    }
                    if (HasClass(bc.squareDiv, 'UserCanSelect')) {
                        AddClass(bc.squareDiv, 'ChessSquareHover');
                    }
                    hoveredSquareDiv = bc.squareDiv;
                    if (!sourceInfo.dragged.hasLeftSourceSquare) {
                        if (bc.squareDiv !== sourceInfo.squareDiv) {
                            sourceInfo.dragged.hasLeftSourceSquare = true;
                        }
                    }
                }
            }
        };
    }
    function EndPieceDrag(sourceInfo) {
        BoardDiv.onmousemove = null;
        if (sourceInfo && sourceInfo.dragged) {
            sourceInfo.dragged.imgSource.style.display = ''; // unhide the origin image (it's about to be moved anyway)
        }
        var divSprite = document.getElementById('DivMoveSprite');
        divSprite.innerHTML = ''; // erase the sprite image
        divSprite.style.display = 'none';
    }
    function SetMoveState(state, sourceInfo) {
        EndPawnPromotion();
        MoveState = state;
        if (sourceInfo) {
            BeginPieceDrag(sourceInfo);
        }
        else {
            EndPieceDrag(SourceSquareInfo);
        }
        SourceSquareInfo = sourceInfo;
        // Make all squares unselectable.
        ForEachSquareDiv(function (div) { return RemoveClass(div, 'UserCanSelect'); });
        ForEachSquareDiv(function (div) { return RemoveClass(div, 'ChessSquareHover'); });
        var legal = TheBoard.LegalMoves();
        if (state === MoveStateType.SelectSource) {
            // Mark all squares that contain a piece the user can move with 'UserCanSelect' class.
            for (var _i = 0, legal_1 = legal; _i < legal_1.length; _i++) {
                var move = legal_1[_i];
                var coords = MoveCoords(move);
                var div = document.getElementById(coords.source.selector);
                AddClass(div, 'UserCanSelect');
            }
        }
        else if (state === MoveStateType.SelectDest) {
            for (var _a = 0, legal_2 = legal; _a < legal_2.length; _a++) {
                var move = legal_2[_a];
                var coords = MoveCoords(move);
                if (coords.source.selector === SourceSquareInfo.selector) {
                    var div = document.getElementById(coords.dest.selector);
                    AddClass(div, 'UserCanSelect');
                }
            }
        }
    }
    function DrawResultText(result) {
        var rhtml;
        switch (result.status) {
            case Flywheel.GameStatus.Draw:
                rhtml = '&frac12;&ndash;&frac12;';
                break;
            case Flywheel.GameStatus.WhiteWins:
                rhtml = '1&ndash;0';
                break;
            case Flywheel.GameStatus.BlackWins:
                rhtml = '0&ndash;1';
                break;
        }
        if (rhtml) {
            ResultTextDiv.innerHTML = rhtml;
            ResultTextDiv.style.display = '';
            PromptTextDiv.innerText = 'Click anywhere on the board to play again.';
            PromptTextDiv.style.display = '';
        }
        else {
            ResultTextDiv.style.display = 'none';
            PromptTextDiv.style.display = 'none';
        }
    }
    var endgame_q = new Flywheel.Endgame(Endgame_q.GetTable(), [Flywheel.Square.BlackKing, Flywheel.Square.WhiteKing, Flywheel.Square.WhiteQueen]);
    var endgame_r = new Flywheel.Endgame(Endgame_r.GetTable(), [Flywheel.Square.BlackKing, Flywheel.Square.WhiteKing, Flywheel.Square.WhiteRook]);
    var KnownEndgames = [endgame_q, endgame_r];
    function DrawBoard(board) {
        for (var y = 0; y < 8; ++y) {
            var ry = RotateFlag ? (7 - y) : y;
            document.getElementById('RankLabel_' + ry.toFixed()).textContent = ('87654321'.charAt(y));
            document.getElementById('FileLabel_' + ry.toFixed()).textContent = ('abcdefgh'.charAt(y));
            for (var x = 0; x < 8; ++x) {
                var rx = RotateFlag ? (7 - x) : x;
                var sq = board.GetSquareByCoords(x, y);
                var sdiv = SquareDiv(rx, ry);
                sdiv.innerHTML = MakeImageHtml(sq);
            }
        }
        var result = board.GetGameResult();
        DrawResultText(result);
        if (result.status === Flywheel.GameStatus.InProgress) {
            if (PlayerForSide[board.SideToMove()] === PlayerType.Computer) {
                if (MoveState !== MoveStateType.OpponentTurn) {
                    SetMoveState(MoveStateType.OpponentTurn);
                    for (var _i = 0, KnownEndgames_1 = KnownEndgames; _i < KnownEndgames_1.length; _i++) {
                        var endgame = KnownEndgames_1[_i];
                        var response = endgame.GetMove(TheBoard);
                        if (response) {
                            AnimateMove(response.algebraicMove);
                            // FIXFIXFIX: render number of moves remaining until mate
                            return;
                        }
                    }
                    alert('Could not find endgame response.');
                }
            }
            else {
                SetMoveState(MoveStateType.SelectSource);
            }
        }
        else {
            // Game is over!
            SetMoveState(MoveStateType.GameOver);
        }
    }
    function SquareCoords(algsquare) {
        if (typeof algsquare !== 'string') {
            throw 'Parameter "algsquare" must be a string.';
        }
        if (!/^[a-h][1-8]$/.test(algsquare)) {
            throw "Invalid algebraic notation for a square: \"" + algsquare + "\"";
        }
        var chessX = 'abcdefgh'.indexOf(algsquare.charAt(0));
        var chessY = '12345678'.indexOf(algsquare.charAt(1));
        var screenX = RotateFlag ? (7 - chessX) : chessX;
        var screenY = RotateFlag ? (7 - chessY) : chessY;
        var selector = SquareSelector(screenX, screenY);
        return {
            screenX: screenX,
            screenY: screenY,
            chessX: chessX,
            chessY: chessY,
            selector: selector,
            squareDiv: document.getElementById(selector),
        };
    }
    function SourceDestCoords(algmove) {
        return {
            source: SquareCoords(algmove.substr(0, 2)),
            dest: SquareCoords(algmove.substr(2, 2))
        };
    }
    function BoardCoords(e) {
        var screenX = Math.floor((e.pageX - BoardDiv.offsetLeft) / SquarePixels);
        var screenY = Math.floor(8.0 - ((e.pageY - BoardDiv.offsetTop) / SquarePixels));
        var chessX = RotateFlag ? (7 - screenX) : screenX;
        var chessY = RotateFlag ? (7 - screenY) : screenY;
        if (chessX < 0 || chessX > 7 || chessY < 0 || chessY > 7) {
            return null; // outside the board
        }
        var selector = SquareSelector(screenX, screenY);
        return {
            screenX: screenX,
            screenY: screenY,
            chessX: chessX,
            chessY: chessY,
            pageX: e.pageX,
            pageY: e.pageY,
            selector: selector,
            squareDiv: document.getElementById(selector),
        };
    }
    function OnSquareHoverIn() {
        if (HasClass(this, 'UserCanSelect')) {
            AddClass(this, 'ChessSquareHover');
        }
    }
    function OnSquareHoverOut() {
        RemoveClass(this, 'ChessSquareHover');
    }
    function OnSquareMouseDown(e) {
        if (e.which === 1) { // primary mouse button
            if (MoveState === MoveStateType.SelectSource) {
                var bc = BoardCoords(e);
                if (bc) {
                    if (HasClass(bc.squareDiv, 'UserCanSelect')) {
                        SetMoveState(MoveStateType.SelectDest, bc);
                    }
                }
            }
        }
    }
    function AnimateMove(notation) {
        // FIXFIXFIX: Lock controls while the piece is sliding across the board.
        var coords = SourceDestCoords(notation);
        var ldx = coords.dest.screenX - coords.source.screenX;
        var ldy = coords.dest.screenY - coords.source.screenY;
        var linearPixelDistance = Math.round(SquarePixels * Math.sqrt(ldx * ldx + ldy * ldy));
        var pixelsPerFrame = 10;
        var numFrames = Math.round(linearPixelDistance / pixelsPerFrame);
        var frameCounter = 0;
        var millisPerFrame = 20;
        var image = coords.source.squareDiv.children[0];
        image.style.position = 'absolute';
        image.style.zIndex = '1';
        var intervalId = window.setInterval(function () {
            if (++frameCounter <= numFrames) {
                var fraction = frameCounter / numFrames;
                var px = Math.round(fraction * ldx * SquarePixels);
                var py = -Math.round(fraction * ldy * SquarePixels); // negative because y-coords grow downward
                image.style.left = px.toFixed() + 'px';
                image.style.top = py.toFixed() + 'px';
            }
            else {
                window.clearInterval(intervalId);
                CommitMove(notation);
            }
        }, millisPerFrame);
    }
    function CommitMove(move) {
        var notation;
        if (typeof move === 'string') {
            TheBoard.PushNotation(move);
            notation = move;
        }
        else if (move instanceof Flywheel.Move) {
            TheBoard.PushMove(move);
            notation = move.toString();
        }
        else {
            throw 'Invalid type for "move" parameter';
        }
        if ((GameHistoryIndex < GameHistory.length) && (notation === GameHistory[GameHistoryIndex].toString())) {
            // Special case: treat this move as a redo, so don't disrupt the history.
            ++GameHistoryIndex;
        }
        else {
            GameHistory = TheBoard.MoveHistory();
            GameHistoryIndex = GameHistory.length;
        }
        DrawBoard(TheBoard);
    }
    var PawnPromotionInfo = null;
    function BeginPawnPromotion(movelist) {
        // The user has clicked on a (source, dest) pair that indicates pawn promotion.
        // The 'promlist' passed in is a list of the 4 promotion moves to choose from.
        // They are all the same except the promotion piece is one of:
        // NeutralPiece.Queen, NeutralPiece.Rook, NeutralPiece.Bishop, NeutralPiece.Knight.
        // Enter a user interface state where the user can select which piece to promote the pawn to,
        // or he may opt to cancel the move.
        var source = movelist[0].source;
        var dest = movelist[0].dest;
        var destRank = Flywheel.Board.GetRankNumber(dest);
        var side = (destRank === 8) ? Flywheel.Side.White : Flywheel.Side.Black;
        // Create a promotion menu div that sits on top of the board display.
        var menudiv = document.createElement('div');
        menudiv.className = 'PawnPromotionMenu';
        menudiv.style.top = (SquarePixels * 3.5).toFixed() + 'px';
        menudiv.style.left = (SquarePixels * 1.5).toFixed() + 'px';
        menudiv.style.width = (SquarePixels * 5).toFixed() + 'px';
        menudiv.style.height = (SquarePixels).toFixed() + 'px';
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Queen, movelist, 0));
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Rook, movelist, 1));
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Bishop, movelist, 2));
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Knight, movelist, 3));
        menudiv.appendChild(PromotionCancelDiv(4));
        BoardDiv.appendChild(menudiv);
        // Remove the pawn from the origin square.
        // Alternate showing the pawn and a question mark on the target square.
        var coords = MoveCoords(movelist[0]);
        var sourceSquareDiv = document.getElementById(coords.source.selector);
        var destSquareDiv = document.getElementById(coords.dest.selector);
        sourceSquareDiv.innerHTML = MakeImageHtml(Flywheel.Square.Empty);
        function ShowPawnInTargetSquare() {
            destSquareDiv.innerHTML = MakeImageHtml(Flywheel.Board.GetSidedPiece(side, Flywheel.NeutralPiece.Pawn));
        }
        ShowPawnInTargetSquare();
        var toggle = false;
        var intervalId = window.setInterval(function () {
            toggle = !toggle;
            if (toggle) {
                destSquareDiv.innerHTML = '<img src="../icon/question-mark.png" width="' + SquarePixels + '" height="' + SquarePixels + '">';
            }
            else {
                ShowPawnInTargetSquare();
            }
        }, 500);
        // Transition to pawn promotion state.
        SetMoveState(MoveStateType.SelectPromotionPiece);
        // Remember information needed to manage pawn promotion UI state.
        PawnPromotionInfo = {
            menudiv: menudiv,
            toggleIntervalId: intervalId,
        };
    }
    function EndPawnPromotion() {
        // Remove pawn promotion menu div.
        if (PawnPromotionInfo) {
            window.clearInterval(PawnPromotionInfo.toggleIntervalId);
            BoardDiv.removeChild(PawnPromotionInfo.menudiv);
            PawnPromotionInfo = null;
        }
    }
    function PromotionOptionDiv(side, prom, movelist, index) {
        // Search for the matching promotion move in the movelist.
        // Keep that move in case this is the promotion option chosen by the user.
        var move;
        for (var _i = 0, movelist_1 = movelist; _i < movelist_1.length; _i++) {
            var m = movelist_1[_i];
            if (m.prom === prom) {
                move = m;
                break;
            }
        }
        if (!move) {
            throw 'Could not find promotion to ' + prom;
        }
        var div = document.createElement('div');
        div.className = 'PawnPromotionOptionNormal';
        div.style.width = SquarePixels.toFixed() + 'px';
        div.style.height = SquarePixels.toFixed() + 'px';
        div.style.top = '0px';
        div.style.left = (index * SquarePixels).toFixed() + 'px';
        var piece = Flywheel.Board.GetSidedPiece(side, prom);
        div.innerHTML = MakeImageHtml(piece);
        div.onclick = function () {
            CommitMove(move);
        };
        div.onmouseover = function () {
            div.className = 'PawnPromotionOptionHover';
        };
        div.onmouseout = function () {
            div.className = 'PawnPromotionOptionNormal';
        };
        return div;
    }
    function PromotionCancelDiv(index) {
        var div = document.createElement('div');
        div.className = 'PawnPromotionOptionNormal';
        div.style.width = SquarePixels.toFixed() + 'px';
        div.style.height = SquarePixels.toFixed() + 'px';
        div.style.top = '0px';
        div.style.left = (index * SquarePixels).toFixed() + 'px';
        var icon = document.createElement('img');
        icon.setAttribute('src', '../icon/cancel-button.png');
        icon.setAttribute('width', SquarePixels.toFixed());
        icon.setAttribute('height', SquarePixels.toFixed());
        div.appendChild(icon);
        div.onclick = function () {
            DrawBoard(TheBoard);
        };
        div.onmouseover = function () {
            div.className = 'PawnPromotionOptionHover';
        };
        div.onmouseout = function () {
            div.className = 'PawnPromotionOptionNormal';
        };
        return div;
    }
    function OnSquareMouseUp(e) {
        if (e.which === 1) { // primary mouse button
            var bc = BoardCoords(e);
            if (bc) {
                if (MoveState === MoveStateType.GameOver) {
                    PositionIndex = (PositionIndex + 1) % PositionList.length;
                    TheBoard.SetForsythEdwardsNotation(PositionList[PositionIndex]);
                    DrawBoard(TheBoard);
                }
                else if (MoveState === MoveStateType.SelectDest) {
                    // Support two styles of moving chess pieces:
                    // 1. Dragging pieces from source square to target square.
                    // 2. Clicking on source square, then clicking on target square.
                    // If the mouse lifts up in the same square as it went down,
                    // and the mouse has never left that square, treat it as style #2.
                    if (SourceSquareInfo.selector === bc.selector) {
                        if (!SourceSquareInfo.dragged.hasLeftSourceSquare && !SourceSquareInfo.dragged.mouseUpOnSourceSquare) {
                            SourceSquareInfo.dragged.mouseUpOnSourceSquare = true;
                            return; // remain in SelectDest state
                        }
                    }
                    // Find matching (source,dest) pair in legal move list, make move on board, redraw board.
                    var legal = TheBoard.LegalMoves();
                    var matchingMoveList = [];
                    for (var _i = 0, legal_3 = legal; _i < legal_3.length; _i++) {
                        var move = legal_3[_i];
                        var coords = MoveCoords(move);
                        if (coords.dest.selector === bc.selector) {
                            if (coords.source.selector === SourceSquareInfo.selector) {
                                // Usually only one move will match, but when a player promotes a pawn,
                                // there will be 4 matching moves (Q, B, R, N).
                                matchingMoveList.push(move);
                            }
                        }
                    }
                    switch (matchingMoveList.length) {
                        case 0:
                            // Not a valid move, so cancel the current move and start over.
                            SetMoveState(MoveStateType.SelectSource);
                            break;
                        case 1:
                            // A non-promotion legal move is always unique based on (source, dest) pair.
                            CommitMove(matchingMoveList[0]);
                            break;
                        case 4:
                            // Assume this is a pawn promotion.
                            // There are 4 matching moves based on (source, dest) pair:
                            // one for each possible promotion piece (Queen, Rook, Bishop, Knight).
                            BeginPawnPromotion(matchingMoveList);
                            break;
                        default:
                            // This should be impossible if the legal move generator is working correctly!
                            throw 'Impossible number of matching moves = ' + matchingMoveList.length;
                    }
                }
            }
        }
    }
    function InitControls() {
        BoardDiv.onmousedown = OnSquareMouseDown;
        BoardDiv.onmouseup = OnSquareMouseUp;
        for (var x = 0; x < 8; ++x) {
            for (var y = 0; y < 8; ++y) {
                var sq = SquareDiv(x, y);
                sq.onmouseover = OnSquareHoverIn;
                sq.onmouseout = OnSquareHoverOut;
            }
        }
    }
    function InitPage() {
        BoardDiv = document.getElementById('DivBoard');
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
    }
    FwDemo.InitPage = InitPage;
})(FwDemo || (FwDemo = {}));
window.onload = FwDemo.InitPage;
