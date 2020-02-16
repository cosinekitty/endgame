module FwDemo {
    'use strict';

    enum MoveStateType {
        OpponentTurn,   // not user's turn (computer's turn)
        SelectSource,
        SelectDest,
        SelectPromotionPiece,
        GameOver,
    };

    enum PlayerType {
        Human,
        Computer,
    };

    var SquarePixels:number = 70;
    var TheBoard:Flywheel.Board = new Flywheel.Board('8/8/8/8/4k3/8/8/R6K b - - 0 1');
    var RotateFlag:boolean = false;
    var MoveState:MoveStateType = MoveStateType.SelectSource;
    var SourceSquareInfo;
    var BgDark = '#8FA679';
    var BgPale = '#D4CEA3';
    var BoardDiv: HTMLElement;
    var ResultTextDiv: HTMLElement;
    var PromptTextDiv: HTMLElement;
    var PlayerForSide:{[side:number]:PlayerType} = {};
    PlayerForSide[Flywheel.Side.White] = PlayerType.Computer;
    PlayerForSide[Flywheel.Side.Black] = PlayerType.Human;

    // The chess board stores the history, but we need to be able to redo
    // moves that have been undone.
    var GameHistory:Flywheel.Move[] = [];
    var GameHistoryIndex:number = 0;

    function MakeImageHtml(s:Flywheel.Square):string {
        let fn:string;
        switch (s) {
            case Flywheel.Square.WhitePawn:     fn = 'wp';  break;
            case Flywheel.Square.WhiteKnight:   fn = 'wn';  break;
            case Flywheel.Square.WhiteBishop:   fn = 'wb';  break;
            case Flywheel.Square.WhiteRook:     fn = 'wr';  break;
            case Flywheel.Square.WhiteQueen:    fn = 'wq';  break;
            case Flywheel.Square.WhiteKing:     fn = 'wk';  break;

            case Flywheel.Square.BlackPawn:     fn = 'bp';  break;
            case Flywheel.Square.BlackKnight:   fn = 'bn';  break;
            case Flywheel.Square.BlackBishop:   fn = 'bb';  break;
            case Flywheel.Square.BlackRook:     fn = 'br';  break;
            case Flywheel.Square.BlackQueen:    fn = 'bq';  break;
            case Flywheel.Square.BlackKing:     fn = 'bk';  break;

            default:
                return '';
        }

        fn = './pieces/' + fn + '.png';
        return '<img src="' + fn + '" width="' + SquarePixels + '" height="' + SquarePixels + '">';
    }

    function MakeFileLabel(x:number): string {
        return '<div class="RankFileText" id="FileLabel_' + x.toFixed() + '"' +
            ' style="position: absolute; top: ' + (SquarePixels*8 + 8).toFixed() + 'px; ' +
            ' left: ' + (SquarePixels*x + (SquarePixels >> 1) - 4).toFixed() + 'px; ">x</div>';
    }

    function MakeRankLabel(y:number): string {
        return '<div class="RankFileText" id="RankLabel_' + y.toFixed() + '"' +
            ' style="position: absolute; left:-20px; top:' +
            (SquarePixels*y + (SquarePixels >> 1) - 7).toFixed() + 'px;' +
            '">y</div>';
    }

    function SquareSelector(x:number, y:number):string {
        return 'Square_' + x.toFixed() + y.toFixed();
    }

    function SquareDiv(x:number, y:number):HTMLElement {
        return document.getElementById(SquareSelector(x, y));
    }

    function MakeImageContainer(x:number, y:number):string {
        return '<div id="' + SquareSelector(x,y) + '"' +
            ' class="ChessSquare"' +
            ' style="position:absolute; left:' +
            (SquarePixels * x).toFixed() + 'px; top:' +
            (SquarePixels * (7 - y)).toFixed() + 'px;' +
            ' background-color: ' + (((x+y)&1) ? BgPale : BgDark) + '; ' +
            ' width: ' + SquarePixels + 'px; ' +
            ' height: ' + SquarePixels + 'px; ' +
            '"></div>';
    }

    function MakeSpriteContainer():string {
        return '<div id="DivMoveSprite" style="display:none; z-index:1; width:' + SquarePixels + 'px; height:' + SquarePixels + 'px; ' +
            'position:absolute; left:0px; top:' + (SquarePixels*7).toFixed() + 'px;"></div>';
    }

    function MakeResultTextDiv():HTMLElement {
        var div = document.createElement('div');
        div.id = 'DivResultText';
        div.className = 'GameResultText';
        div.style.width = (8 * SquarePixels).toFixed() + 'px';
        div.style.height = div.style.lineHeight = (8 * SquarePixels).toFixed() + 'px';
        div.style.display = 'none';
        return div;
    }

    function MakeChessPromptDiv():HTMLElement {
        var div = document.createElement('div');
        div.id = 'PromptText';
        div.className = 'ChessPromptText';
        div.style.width = (8 * SquarePixels).toFixed() + 'px';
        div.style.height = div.style.lineHeight = (5 * SquarePixels).toFixed() + 'px';
        div.style.display = 'none';
        return div;
    }

    function InitBoardDisplay():void {
        var x:number, y:number;

        let html = '';

        for (y=0; y < 8; ++y) {
            for (x=0; x < 8; ++x) {
                html += MakeImageContainer(x, y);
            }
        }

        for (x=0; x < 8; ++x) {
            html += MakeFileLabel(x);
        }
        for (x=0; x < 8; ++x) {
            html += MakeRankLabel(x);
        }

        html += MakeSpriteContainer();

        BoardDiv.innerHTML = html;
        BoardDiv.appendChild(PromptTextDiv = MakeChessPromptDiv());
        BoardDiv.appendChild(ResultTextDiv = MakeResultTextDiv());
    }

    function AlgCoords(alg:string) {
        let chessX = 'abcdefgh'.indexOf(alg.charAt(0));
        let chessY = '12345678'.indexOf(alg.charAt(1));
        let screenX = RotateFlag ? (7-chessX) : chessX;
        let screenY = RotateFlag ? (7-chessY) : chessY;

        return {
            alg: alg,
            chessX: chessX,
            chessY: chessY,
            screenX: screenX,
            screenY: screenY,
            selector: SquareSelector(screenX, screenY),
        };
    }

    function MoveCoords(move:Flywheel.Move) {
        let sourceAlg = Flywheel.Board.Algebraic(move.source);
        let destAlg   = Flywheel.Board.Algebraic(move.dest);
        return { source:AlgCoords(sourceAlg), dest:AlgCoords(destAlg) };
    }

    function ForEachSquareDiv(visitor: (elem:HTMLElement) => void):void {
        for (var x=0; x < 8; ++x) {
            for (var y=0; y < 8; ++y) {
                visitor(SquareDiv(x, y));
            }
        }
    }

    function ClassList(elem:HTMLElement):string[] {
        var filt = [];
        if (elem.className) {
            for (let token of elem.className.split(/\s+/g)) {
                if (token) {
                    filt.push(token);
                }
            }
        }
        return filt;
    }

    function RemoveClass(elem:HTMLElement, classname:string):HTMLElement {
        var classlist = ClassList(elem);
        var updated = [];
        var found = false;
        for (var cn of classlist) {
            if (cn === classname) {
                found = true;
            } else {
                updated.push(cn);
            }
        }
        if (found) {
            elem.className = updated.join(' ');
        }
        return elem;
    }

    function AddClass(elem:HTMLElement, classname:string):HTMLElement {
        var classlist = ClassList(elem);
        var found = false;
        for (var cn of classlist) {
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

    function HasClass(elem:HTMLElement, classname:string):boolean {
        for (var cn of ClassList(elem)) {
            if (cn === classname) {
                return true;
            }
        }
        return false;
    }

    function BeginPieceDrag(sourceInfo):void {
        var imgSource = sourceInfo.squareDiv.children[0];
        var x0 = sourceInfo.pageX;
        var y0 = sourceInfo.pageY;

        imgSource.style.display = 'none';   // hide the origin image while animating

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

        var hoveredSquareDiv: HTMLElement;

        BoardDiv.onmousemove = function(e) {
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
        }
    }

    function EndPieceDrag(sourceInfo):void {
        BoardDiv.onmousemove = null;
        if (sourceInfo && sourceInfo.dragged) {
            sourceInfo.dragged.imgSource.style.display = '';    // unhide the origin image (it's about to be moved anyway)
        }
        var divSprite = document.getElementById('DivMoveSprite');
        divSprite.innerHTML = '';   // erase the sprite image
        divSprite.style.display = 'none';
    }

    function SetMoveState(state:MoveStateType, sourceInfo?):void {
        EndPawnPromotion();
        MoveState = state;
        if (sourceInfo) {
            BeginPieceDrag(sourceInfo);
        } else {
            EndPieceDrag(SourceSquareInfo);
        }
        SourceSquareInfo = sourceInfo;

        // Make all squares unselectable.
        ForEachSquareDiv((div) => RemoveClass(div, 'UserCanSelect'));
        ForEachSquareDiv((div) => RemoveClass(div, 'ChessSquareHover'));

        let legal:Flywheel.Move[] = TheBoard.LegalMoves();
        if (state === MoveStateType.SelectSource) {
            // Mark all squares that contain a piece the user can move with 'UserCanSelect' class.
            for (let move of legal) {
                let coords = MoveCoords(move);
                let div = document.getElementById(coords.source.selector);
                AddClass(div, 'UserCanSelect');
            }
        } else if (state === MoveStateType.SelectDest) {
            for (let move of legal) {
                let coords = MoveCoords(move);
                if (coords.source.selector === SourceSquareInfo.selector) {
                    let div = document.getElementById(coords.dest.selector);
                    AddClass(div, 'UserCanSelect');
                }
            }
        }
    }

    function DrawResultText(result:Flywheel.GameResult):void {
        let rhtml:string;
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
        } else {
            ResultTextDiv.style.display = 'none';
            PromptTextDiv.style.display = 'none';
        }
    }

    const endgame_q = new Flywheel.Endgame(
        Endgame_q.GetTable(),
        [Flywheel.Square.BlackKing, Flywheel.Square.WhiteKing, Flywheel.Square.WhiteQueen]
    );

    const endgame_r = new Flywheel.Endgame(
        Endgame_r.GetTable(),
        [Flywheel.Square.BlackKing, Flywheel.Square.WhiteKing, Flywheel.Square.WhiteRook]
    );

    const KnownEndgames = [endgame_q, endgame_r];

    function DrawBoard(board:Flywheel.Board):void {
        for (let y=0; y < 8; ++y) {
            let ry = RotateFlag ? (7 - y) : y;
            document.getElementById('RankLabel_' + ry.toFixed()).textContent = ('87654321'.charAt(y));
            document.getElementById('FileLabel_' + ry.toFixed()).textContent = ('abcdefgh'.charAt(y));
            for (let x=0; x < 8; ++x) {
                let rx = RotateFlag ? (7 - x) : x;
                let sq:Flywheel.Square = board.GetSquareByCoords(x, y);
                let sdiv = SquareDiv(rx, ry);
                sdiv.innerHTML = MakeImageHtml(sq);
            }
        }

        let result = board.GetGameResult();
        DrawResultText(result);

        if (result.status === Flywheel.GameStatus.InProgress) {
            if (PlayerForSide[board.SideToMove()] === PlayerType.Computer) {
                if (MoveState !== MoveStateType.OpponentTurn) {
                    SetMoveState(MoveStateType.OpponentTurn);
                    for (let endgame of KnownEndgames) {
                        const response:Flywheel.EndgameLookup = endgame.GetMove(TheBoard);
                        if (response) {
                            AnimateMove(response.algebraicMove);
                            // FIXFIXFIX: render number of moves remaining until mate
                            return;
                        }
                    }
                    alert('Could not find endgame response.');
                }
            } else {
                SetMoveState(MoveStateType.SelectSource);
            }
        } else {
            // Game is over!
            SetMoveState(MoveStateType.GameOver);
        }
    }

    function SquareCoords(algsquare:string) {
        if (typeof algsquare !== 'string') {
            throw 'Parameter "algsquare" must be a string.';
        }

        if (!/^[a-h][1-8]$/.test(algsquare)) {
            throw `Invalid algebraic notation for a square: "${algsquare}"`;
        }

        var chessX = 'abcdefgh'.indexOf(algsquare.charAt(0));
        var chessY = '12345678'.indexOf(algsquare.charAt(1));
        var screenX = RotateFlag ? (7-chessX) : chessX;
        var screenY = RotateFlag ? (7-chessY) : chessY;
        var selector = SquareSelector(screenX, screenY);
        return {
            screenX: screenX,
            screenY: screenY,
            chessX: chessX,
            chessY: chessY,
            selector: selector,
            squareDiv: document.getElementById(selector),
        }
    }

    function SourceDestCoords(algmove:string) {
        return {
            source: SquareCoords(algmove.substr(0, 2)),
            dest:   SquareCoords(algmove.substr(2, 2))
        }
    }

    function BoardCoords(e) {
        let screenX:number = Math.floor((e.pageX - BoardDiv.offsetLeft) / SquarePixels);
        let screenY:number = Math.floor(8.0 - ((e.pageY - BoardDiv.offsetTop)  / SquarePixels));
        let chessX:number = RotateFlag ? (7-screenX) : screenX;
        let chessY:number = RotateFlag ? (7-screenY) : screenY;

        if (chessX < 0 || chessX > 7 || chessY < 0 || chessY > 7) {
            return null;    // outside the board
        }

        let selector:string = SquareSelector(screenX, screenY);

        return {
            screenX: screenX,   // cartesian square coordinates as seen on the screen
            screenY: screenY,

            chessX: chessX,     // chess board coordinates from White's point of view (includes rotation)
            chessY: chessY,

            pageX: e.pageX,     // original mouse coordinates
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
        if (e.which === 1) {        // primary mouse button
            if (MoveState === MoveStateType.SelectSource) {
                let bc = BoardCoords(e);
                if (bc) {
                    if (HasClass(bc.squareDiv, 'UserCanSelect')) {
                        SetMoveState(MoveStateType.SelectDest, bc);
                    }
                }
            }
        }
    }

    function AnimateMove(notation:string):void {
        // FIXFIXFIX: Lock controls while the piece is sliding across the board.
        var coords = SourceDestCoords(notation);
        var ldx = coords.dest.screenX - coords.source.screenX;
        var ldy = coords.dest.screenY - coords.source.screenY;
        var linearPixelDistance = Math.round(SquarePixels * Math.sqrt(ldx*ldx + ldy*ldy));
        var pixelsPerFrame = 10;
        var numFrames = Math.round(linearPixelDistance / pixelsPerFrame);
        var frameCounter = 0;
        var millisPerFrame = 20;
        var image = <HTMLElement> coords.source.squareDiv.children[0];
        image.style.position = 'absolute';
        image.style.zIndex = '1';

        var intervalId = window.setInterval(function(){
            if (++frameCounter <= numFrames) {
                var fraction = frameCounter / numFrames;
                var px = Math.round(fraction * ldx * SquarePixels);
                var py = -Math.round(fraction * ldy * SquarePixels);    // negative because y-coords grow downward
                image.style.left = px.toFixed() + 'px';
                image.style.top = py.toFixed() + 'px';
            } else {
                window.clearInterval(intervalId);
                CommitMove(notation);
            }
        }, millisPerFrame);
    }

    function CommitMove(move:Flywheel.Move | string):void {
        var notation:string;
        if (typeof move === 'string') {
            TheBoard.PushNotation(move);
            notation = move;
        } else if (move instanceof Flywheel.Move) {
            TheBoard.PushMove(move);
            notation = move.toString();
        } else {
            throw 'Invalid type for "move" parameter';
        }
        if ((GameHistoryIndex < GameHistory.length) && (notation === GameHistory[GameHistoryIndex].toString())) {
            // Special case: treat this move as a redo, so don't disrupt the history.
            ++GameHistoryIndex;
        } else {
            GameHistory = TheBoard.MoveHistory();
            GameHistoryIndex = GameHistory.length;
        }
        DrawBoard(TheBoard);
    }

    var PawnPromotionInfo = null;

    function BeginPawnPromotion(movelist:Flywheel.Move[]):void {
        // The user has clicked on a (source, dest) pair that indicates pawn promotion.
        // The 'promlist' passed in is a list of the 4 promotion moves to choose from.
        // They are all the same except the promotion piece is one of:
        // NeutralPiece.Queen, NeutralPiece.Rook, NeutralPiece.Bishop, NeutralPiece.Knight.
        // Enter a user interface state where the user can select which piece to promote the pawn to,
        // or he may opt to cancel the move.
        let source:number = movelist[0].source;
        let dest:number = movelist[0].dest;
        let destRank:number = Flywheel.Board.GetRankNumber(dest);
        let side:Flywheel.Side = (destRank === 8) ? Flywheel.Side.White : Flywheel.Side.Black;

        // Create a promotion menu div that sits on top of the board display.
        let menudiv = document.createElement('div');
        menudiv.className = 'PawnPromotionMenu';
        menudiv.style.top = (SquarePixels * 3.5).toFixed() + 'px';
        menudiv.style.left = (SquarePixels * 1.5).toFixed() + 'px';
        menudiv.style.width = (SquarePixels * 5).toFixed() + 'px';
        menudiv.style.height = (SquarePixels).toFixed() + 'px';
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Queen,  movelist, 0));
        menudiv.appendChild(PromotionOptionDiv(side, Flywheel.NeutralPiece.Rook,   movelist, 1));
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
        var intervalId = window.setInterval(function(){
            toggle = !toggle;
            if (toggle) {
                destSquareDiv.innerHTML = '<img src="../icon/question-mark.png" width="' + SquarePixels + '" height="' + SquarePixels + '">';
            } else {
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

    function EndPawnPromotion():void {
        // Remove pawn promotion menu div.
        if (PawnPromotionInfo) {
            window.clearInterval(PawnPromotionInfo.toggleIntervalId);
            BoardDiv.removeChild(PawnPromotionInfo.menudiv);
            PawnPromotionInfo = null;
        }
    }

    function PromotionOptionDiv(
        side:Flywheel.Side,
        prom:Flywheel.NeutralPiece,
        movelist:Flywheel.Move[],
        index:number
    ):HTMLElement {
        // Search for the matching promotion move in the movelist.
        // Keep that move in case this is the promotion option chosen by the user.
        var move:Flywheel.Move;
        for (var m of movelist) {
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
        var piece:Flywheel.Square = Flywheel.Board.GetSidedPiece(side, prom);
        div.innerHTML = MakeImageHtml(piece);
        div.onclick = function() {
            CommitMove(move);
        }
        div.onmouseover = function() {
            div.className = 'PawnPromotionOptionHover';
        }
        div.onmouseout = function() {
            div.className = 'PawnPromotionOptionNormal';
        }
        return div;
    }

    function PromotionCancelDiv(index:number):HTMLElement {
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

        div.onclick = function() {
            DrawBoard(TheBoard);
        }
        div.onmouseover = function() {
            div.className = 'PawnPromotionOptionHover';
        }
        div.onmouseout = function() {
            div.className = 'PawnPromotionOptionNormal';
        }

        return div;
    }

    function OnSquareMouseUp(e) {
        if (e.which === 1) {        // primary mouse button
            let bc = BoardCoords(e);
            if (bc) {
                if (MoveState === MoveStateType.GameOver) {
                    TheBoard.SetForsythEdwardsNotation('8/8/8/8/4k3/8/8/R6K b - - 0 1');
                    DrawBoard(TheBoard);
                } else if (MoveState === MoveStateType.SelectDest) {
                    // Support two styles of moving chess pieces:
                    // 1. Dragging pieces from source square to target square.
                    // 2. Clicking on source square, then clicking on target square.
                    // If the mouse lifts up in the same square as it went down,
                    // and the mouse has never left that square, treat it as style #2.
                    if (SourceSquareInfo.selector === bc.selector) {
                        if (!SourceSquareInfo.dragged.hasLeftSourceSquare && !SourceSquareInfo.dragged.mouseUpOnSourceSquare) {
                            SourceSquareInfo.dragged.mouseUpOnSourceSquare = true;
                            return;     // remain in SelectDest state
                        }
                    }

                    // Find matching (source,dest) pair in legal move list, make move on board, redraw board.
                    let legal:Flywheel.Move[] = TheBoard.LegalMoves();
                    let matchingMoveList:Flywheel.Move[] = [];
                    for (let move of legal) {
                        let coords = MoveCoords(move);
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

        for (let x=0; x < 8; ++x) {
            for (let y=0; y < 8; ++y) {
                let sq = SquareDiv(x, y);
                sq.onmouseover = OnSquareHoverIn;
                sq.onmouseout = OnSquareHoverOut;
            }
        }
    }

    export function InitPage() {
        BoardDiv = document.getElementById('DivBoard');
        InitBoardDisplay();
        DrawBoard(TheBoard);
        InitControls();
    }
}

window.onload = FwDemo.InitPage;
