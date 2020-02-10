/*
    endgame.cpp  -  Don Cross  -  https://github.com/cosinekitty/endgame
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
            "    Performs unit tests of the chess engine.\n"
            "\n";

        return 1;
    }

    int UnitTest()
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

        cout << "UnitTest: PASS" << endl;
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

        return PrintUsage();
    }
    catch (const ChessException& ex)
    {
        cerr << "EXCEPTION: " << ex.Message() << endl;
        return 1;
    }
}
