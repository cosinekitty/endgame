/*
    main.cpp  -  Don Cross  -  https://github.com/cosinekitty/endgame
*/

#include <cstring>
#include <iostream>
#include "chess.h"

namespace CosineKitty
{
    int PrintUsage()
    {
        std::cerr <<
            "USAGE:\n"
            "\n" <<
            "endgame test\n" <<
            "    Performs unit tests of the chess engine.\n" <<
            "\n" <<
            "endgame generate <piecelist>\n" <<
            "    Generate endgame database for the specified non-King White pieces.\n" <<
            "\n";

        return 1;
    }

    int Test_Coordinates()
    {
        using namespace std;

        // Exercise coordinate conversions.
        // Make sure we can convert algebraic coordinates to board offsets and back.
        for (char rank='1'; rank <= '8'; ++rank)
        {
            for (char file='a'; file <= 'h'; ++file)
            {
                int offset = Offset(file, rank);
                int rcheck = Rank(offset);
                int fcheck = File(offset);
                if (rank != rcheck || file != fcheck)
                {
                    cerr << "FAIL: coords=" << file << rank << ", offset=" << offset << ", check=" << fcheck << rcheck << endl;
                    return 1;
                }
            }
        }
        cout << "Test_Coordinates: PASS" << endl;
        return 0;
    }

    int VerifyMoveList(ChessBoard &board, const char *text)
    {
        using namespace std;

        // Parse the list of expected moves inside 'text'.
        MoveList expected;
        for (int n=0; text[5*n] != '\0'; ++n)
        {
            int source = Offset(text[5*n], text[5*n+1]);
            int dest = Offset(text[5*n+2], text[5*n+3]);
            expected.Add(Move(source, dest));
            if (text[5*n+4] == '\0')
                break;      // normal end of string

            if (text[5*n+4] != ' ')
            {
                cerr << "VerifyMoveList: invalid text '" << text << "'" << endl;
                return 1;
            }
        }

        MoveList movelist;
        board.GenMoves(movelist);

        // Confirm that the two move lists contain the same moves, ignoring order.
        if (expected.length != movelist.length)
        {
            cerr << "VerifyMoveList: expected " << expected.length << " moves, found " << movelist.length << endl;
            return 1;
        }

        for (int i=0; i < expected.length; ++i)
        {
            const Move& e = expected.movelist[i];
            bool found = false;
            for (int k=0; k < movelist.length; ++k)
            {
                const Move &m = movelist.movelist[k];
                if (e.source == m.source && e.dest == m.dest)
                {
                    found = true;
                    break;
                }
            }
            if (!found)
            {
                cerr << "VerifyMoveList: Expected " << e.Algebraic() << " in move list, but is missing." << endl;
                return 1;
            }
        }

        return 0;
    }

    int Test_Moves()
    {
        using namespace std;

        ChessBoard board;
        if (VerifyMoveList(board, "e1d1 e1d2 e1e2 e1f2 e1f1")) return 1;
        board.SetSquare(Offset('c', '2'), WhiteKnight);
        if (VerifyMoveList(board, "e1d1 e1d2 e1e2 e1f2 e1f1 c2a1 c2a3 c2b4 c2d4 c2e3")) return 1;

        board.Clear(false);
        if (VerifyMoveList(board, "e8d8 e8d7 e8e7 e8f7 e8f8")) return 1;

        cout << "Test_Moves: PASS" << endl;
        return 0;
    }

    int UnitTest()
    {
        using namespace std;

        if (Test_Coordinates()) return 1;
        if (Test_Moves()) return 1;
        cout << "UnitTest: PASS" << endl;
        return 0;
    }

    int GenerateDatabase(const char *piecelist)
    {
        using namespace std;

        // Create an EndgameConfig object from the piecelist string.
        Endgame db(piecelist);
        cout << "Table size = " << db.GetTableSize() << endl;
        db.Generate();
        db.Save(std::string(piecelist) + ".egm");
        return 0;
    }
}

int main(int argc, const char *argv[])
{
    using namespace std;
    using namespace CosineKitty;

    try
    {
        if (argc == 2 && !strcmp(argv[1], "test"))
            return UnitTest();

        if (argc == 3 && !strcmp(argv[1], "generate"))
            return GenerateDatabase(argv[2]);

        return PrintUsage();
    }
    catch (const ChessException& ex)
    {
        cerr << "EXCEPTION: " << ex.Message() << endl;
        return 1;
    }
}
