# 6502-Emulator
This software <a href="http://en.wikipedia.org/wiki/MOS_Technology_6502" target="_blank">MOS 6502</a> Emulator written in Javascript. This software also features a C64 style text-mode <em>simulator</em> for drawing the C64 font to the screen using the original colours.

The font was extracted from an <a href="http://kofler.dot.at/c64/images/c64_upp.gif" target="_blank">image</a> I found online, I created a program in Java to extract it to an 8 bit integer. So for an 8x8 character, a mere 8 bytes of RAM is required. There is 256 characters in total.

This is not finished, specifically zero-page addressing is not implemented and I'm sure there are some bugs that need to be ironed out. I'm just publishing it now because I'm unsure when I'll be able to work on it again.

# Instructions
There is a "Hello World" example shown for drawing hello world to the screen. But I think this needs some more explaining. 

The memory of the machine is split into a few parts:

<ol>
<li>Characters</li>
<li>Screen region</li>
<li>Character map</li>
</ol>

## Characters
The entire character set requires 2048 bytes of memory, and I have placed it in location dec 0 to dec 2048. The characters are 8 bytes in length and are drawn to the screen using their binary representations from top to bottom, left to right.

## Screen region
The screen region can be found in dec 2049 to dec 3049. This is because in text-mode, the C64's screen is 40 tiles by 25 tiles (which equals 1000). The screen works by placing a number in the region, and it will draw the corresponding character in the appropriate location on the screen. For example if you placed #$01 in the memory location $801, an @ symbol would appear on the screen in the first position. This is because the @ symbol is the first symbol on the C64 font list.

## Character map
The character map is from location dec 3050 to dec 3306, it is largely unused but points to the first byte of each character.

If you don't want to pull the repo you can find a live version <a href="http://www.donnybridgen.ca/6502/index.html" target="_blank">here</a>
