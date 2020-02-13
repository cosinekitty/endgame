@echo off
setlocal EnableDelayedExpansion
set genexe=..\windows\endgame\Debug\endgame.exe
if not exist !genexe! (
    echo.ERROR: executable does not exist: !genexe!
    exit /b 1
)

!genexe! test
if errorlevel 1 (
    echo.ERROR: Unit test failure.
    exit /b 1
)

for %%x in (q) do (
    echo.Generating database: %%x
    !genexe! generate %%x
    if errorlevel 1 (
        echo.FAILURE generating database '%%x'
        exit /b 1
    )
)

exit /b 0
