var PC = 0;			//Program Counter
var AC = 0x00;			//Accumulator
var X = 0x00;			//X Register
var Y = 0x00;			//Y register
var SR = "00100000";	//Status register N V ' B D I Z C
var SP = 0x00; 			//Stack pointer 

var PROGRAM = [];		//Program from textarea

var MEM = []; 			//Memory

/*
	40*25 cells
	CHAR set in MEM[0]-MEM[2048]
	
	TEXT SCREEN is MEM[2049] to MEM[3049]
	
	Character map is MEM[3050] to MEM[3306];
	
*/

function init()
{
	var rom = getRom();
	
	for(var i = 0; i < 2048; i++)
	{
		MEM[i] = parseInt(parseInt(rom[i],2).toString(16),16);
	}
	
	for (var i = 3050; i < 3306; i++)
	{
		MEM[i] = i * 8;
	}
	
	for (var i = 3307; i < 85536; i++)
	{
		MEM[i] = 0;
	}
}

function reset()
{
	var rom = getRom();
	
	for (var i = 0; i < PROGRAM.length; i++)
	{
		PROGRAM[i] = "";
	}
	
	for(var i = 0; i < 2048; i++)
	{
		MEM[i] = parseInt(parseInt(rom[i],2).toString(16),16);
	}
	
	for (var i = 3050; i < 3306; i++)
	{
		MEM[i] = i * 8;
	}
	
	for (var i = 3307; i < 85536; i++)
	{
		MEM[i] = 0;
	}
	
	for(var i = 2049; i < 3050; i++)
	{
		MEM[i] = 0;
	}
	stopProgram();
	stopScreen();
}

var ticker = null;

function runProgram()
{
	updateScreen();
	PC = 0;
	ticker = setInterval(function(){
		if (PROGRAM[PC] != null)
		{
			runMethod(PROGRAM[PC]);
		}
		PC++;
		if (PC > PROGRAM.length)
		{
			clearInterval(ticker);
		}
	},1);
}

function stopProgram()
{
	clearInterval(ticker);
	stopScreen();
}

var branches = {};
	
function decodeTextArea(textarea)
{
	PROGRAM = [];
	PC = 0;
	var linesToDecode = textarea.value.split('\n');
	
	for(var i = 0; i < linesToDecode.length; i++)
	{
		var newline = "";
		if (linesToDecode[i].contains(";"))
		{
			newLine = linesToDecode[i].split(";")[0];
		}
		else
		{
			newLine = linesToDecode[i];
		}
		
		if (newLine.contains(":"))
		{
		
			var temp = newLine.split(":")[0];
			if (temp != null)
			{
				var num = parseInt(temp.charCodeAt(0)-90);
				PC += num;
				branches[temp] = PC;
			}
		}
		else
		{
			if (branches[newLine.split(" ")[1]] != null)
			{
				PROGRAM[PC] = newLine.split(" ")[0] + " $" + branches[newLine.split(" ")[1]].toString(16);
				PC++;
			}
			else
			{
				PROGRAM[PC] = newLine;
				PC++;
			}
		}
	}
	setBranches();
}

function setBranches()
{
	for (var i = 0; i < PROGRAM.length; i++)
	{
		if (PROGRAM[i] != null)
		{
			if (branches[PROGRAM[i].split(" ")[1]] != null)
			{
				PROGRAM[i] = PROGRAM[i].split(" ")[0] + " $" + branches[PROGRAM[i].split(" ")[1]].toString(16);
			}
		}
	}
}

function seeDecode(box)
{
	var lines = "";
	lines += "<table style=\"text-align:left;width:100%;\">"
	for(var i = 0; i < PROGRAM.length; i++)
	{
		if (PROGRAM[i] != null)
		{
			lines += "<tr>"
			
			lines += "<td>" + i.toString(16) + "</td><td>" + PROGRAM[i] + "</td>";
			lines += "</tr>"
			
		}
	}
	lines +="</table>"
	box.innerHTML = lines;
}

function runMethod(text)
{
	var split = text.split(' ');
	
	var toRun = split[0] + "('" + split[1] +  "')";
	
	eval(toRun);
}

function updateFlags(n,v,q,b,d,i,z,c)
{
	//update Status register N V ' B D I Z C
	var temp = "";
	
	if (n )
		temp += "1"
	else 
		temp += "0"
		
	if (v )
		temp += "1"
	else
		temp += "0"
		
	temp += "1";
	
	if (b)
		temp += "1"
	else
		temp += "0"
		
	if (d)
		temp += "1"
	else
		temp += "0"
		
	if (i)
		temp += "1"
	else
		temp += "0"
		
	if (z)
		temp += "1"
	else
		temp += "0"
		
	if (c)
		temp += "1"
	else
		temp += "0"
	
	SR =  temp;
}

/* Add Memory to AC with carry */
function ADC(addr)
{
	var t = translateAddr(addr);
	if ((t & 0x10000) == 0x10000)
	{
		AC += t & 0xFF;
	}
	else
	{
		AC += MEM[t];
	}
	updateFlags(AC + MEM[t] < 0,
				AC + MEM[t] > 0xFF,
				false,false,false,false,
				AC + MEM[t] == 0,
				AC + MEM[t] != 0);
}

/* And memory with AC */
function AND(addr)
{
	var t = translateAddr(addr);
	if ((t & 0x10000) == 0x10000)
	{
		AC = AC & (t & 0xFF);
	}
	else
	{
		AC = AC & MEM[t];
	}
	updateFlags(AC & MEM[t] < 0,
				false,false,false,false,false,
				AC & MEM[t] == 0,
				false);
}

/* Shift left one bit */
function ASL(addr)
{
	var t = translateAddr(addr);
	if (t == 0)
	{
		AC = AC << 1;
		updateFlags(AC << 1 < 0,
				false,false,false,false,false,
				AC << 1 == 0,
				AC & 0x80 == 0x80);
	}
	else
	{
		MEM[t] = MEM[t] << 1;
		
		updateFlags(MEM[t] << 1 < 0,
				false,false,false,false,false,
				MEM[t] << 1 == 0,
				MEM[t] & 0x80 == 0x80);
	}
	
	
}

/* Branch on Carry Clear */

function BCC(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(7) === "0")
	{
		PC = t - 0x01;
	}
}

/* Branch on Carry Set */

function BCS(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(7) === "1")
	{
		PC = t - 0x01;
	}
}

/* Branch on Result Zero */

function BEQ(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(6) === "1")
	{
		PC = t - 0x01;
	}
}

/* Branch on Result Minus */

function BMI(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(0) === "1")
	{
		PC = t - 0x01;
	}
}

/* Branch on Result not Zero */

function BNE(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(6) === "0")
	{
		PC = t - 0x01;
	}
}

/* Branch on Result Plus */

function BPL(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(0) === "0")
	{
		
		PC = t - 0x01;
	}
}

/* Break */

function BRK(addr)
{
	var t = translateAddr(addr);
	PC = [SP+2];
	SP += 2;
	
	updateFlags(false,false,false,false,true,false,false);
}

/* Branch on Overflow Clear */

function BVC(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(1) === "0")
	{
		
		PC = t - 0x01;
	}
}

/* Branch on Overflow set */

function BVS(addr)
{
	var t = translateAddr(addr);
	if (SR.charAt(1) === "1")
	{
		
		PC = t - 0x01;
	}
}

/* Clear carry flag */

function CLC(addr)
{
	var t = translateAddr(addr);
	updateFlags(false,false,false,false,false,false,false,false);
}

/* Clear Decimal Mode */

function CLD(addr)
{
	var t = translateAddr(addr);
	updateFlags(false,false,false,false,false,false,false,false);
}

/* Clear Interrupt */

function CLI(addr)
{
	var t = translateAddr(addr);
	updateFlags(false,false,false,false,false,false,false,false);
}

/* Clear Overflow */

function CLV(addr)
{
	var t = translateAddr(addr);
	updateFlags(false,false,false,false,false,false,false,false);
}

/* Compare memory with accumulator */

function CMP(addr)
{
	var t = translateAddr(addr);
	if ((t & 0x10000) == 0x10000)
	{
	updateFlags(AC - (t & 0xFF) < 0,false,false,false,false,false,AC - (t & 0xFF) == 0,false);
	}
	else
	{
		updateFlags(AC - MEM[t] < 0,false,false,false,false,false,AC - MEM[t] == 0,false);
	}
}

/* Compare memory with x */

function CPX(addr)
{
	var t = translateAddr(addr);
	if ((t & 0x10000) == 0x10000)
	{
	updateFlags(X - (t & 0xFF) < 0,false,false,false,false,false,X - (t & 0xFF) == 0,false);
	}
	else
	{
	updateFlags(X - MEM[t] < 0,false,false,false,false,false,X - MEM[t] == 0,false);
	}
}

/* Compare memory with y */

function CPY(addr)
{
	var t = translateAddr(addr);
	if ((t & 0x10000) == 0x10000)
	{
	updateFlags(Y - (t & 0xFF) < 0,false,false,false,false,false,Y - (t & 0xFF) == 0,false);
	}
	else
	{
	updateFlags((Y - MEM[t]) < 0,false,false,false,false,false,Y - MEM[t] == 0,false);
	}
	
}

/* DEC addr 1 */

function DEC(addr)
{
	var t = translateAddr(addr);
	MEM[t]--;
	
	updateFlags( MEM[t] < 0,false,false,false,false,false,MEM[t] == 0,false);
}

/* DEC X 1 */

function DEX(addr)
{
	var t = translateAddr(addr);
	X--;
	
	updateFlags( X < 0,false,false,false,false,false, X == 0,false);
}

/* DEC Y 1 */

function DEY(addr)
{
	var t = translateAddr(addr);
	Y--;
	
	updateFlags( Y < 0,false,false,false,false,false, Y == 0,false);
}

/* XOR MEM with AC */

function EOR(addr)
{
	var t = translateAddr(addr);
	
	if ((t & 0x10000) == 0x10000)
	{
		var temp = (t & 0xFF);
		AC = ((temp ^ AC));
		updateFlags( (t & 0xFF) ^ AC < 0,false,false,false,false,false, (t & 0xFF) ^ AC == 0,false);

	}
	else
	{
		AC = MEM[t] ^ AC;
		updateFlags( MEM[t] ^= AC < 0,false,false,false,false,false, MEM[t] ^ AC == 0,false);

	}
	
}

/* INC LOC 1 */

function INC(addr)
{
	var t = translateAddr(addr);
	MEM[t]++;
	
	updateFlags( MEM[t] < 0,false,false,false,false,false, MEM[t] == 0,false);

}

/* INC X 1 */

function INX(addr)
{
	var t = translateAddr(addr);
	X++;
	
	updateFlags( X < 0,false,false,false,false,false, Y == 0,false);

}

/* INC Y 1 */

function INY(addr)
{
	var t = translateAddr(addr);
	
	Y++;
	
	updateFlags( Y < 0,false,false,false,false,false, Y == 0,false);

}

/* Jump to new loc */
function JMP(addr)
{
	var t = translateAddr(addr);
	PC = t - 0x01;
}

/* Jump to new loc saving return address */
function JSR(addr)
{
	var t = translateAddr(addr);
	SP = PC;
	PC = t - 0x01;
}

/* Load accumulator with memory */
function LDA(addr)
{
	var t = translateAddr(addr);
	
	if ((t & 0x10000) == 0x10000)
	{
		AC = (t & 0xFF);
	}
	else
	{
		AC = MEM[t];
	}
	
	updateFlags( AC < 0,false,false,false,false,false, AC == 0,false);

}

/* Load x with memory */
function LDX(addr)
{
	var t = translateAddr(addr);
	if ((t & 0x10000) == 0x10000)
	{
		X = (t & 0xFF);
	}
	else
	{
		X = MEM[t];
	}
	
	
	updateFlags( X < 0,false,false,false,false,false, X == 0,false);
}

/* Load y with memory */
function LDY(addr)
{
	var t = translateAddr(addr);
	
	if ((t & 0x10000) == 0x10000)
	{
		Y = (t & 0xFF);
	}
	else
	{
		Y = MEM[t];
	}
	
	updateFlags( Y < 0,false,false,false,false,false, Y == 0,false);
}

/* Shift one bit right */
function LSR(addr)
{
	var t = translateAddr(addr);
	if (t == 0)
	{
		AC = AC >> 1;
		updateFlags(AC >> 1 < 0,
				false,false,false,false,false,
				AC >> 1 == 0,
				AC & 0x80 == 0x80);
	}
	else
	{
		MEM[t] = MEM[t] >> 1;
		
		updateFlags(MEM[t] >> 1 < 0,
				false,false,false,false,false,
				MEM[t] >> 1 == 0,
				MEM[t] & 0x80 == 0x80);
	}
}

/* or memory with AC */
function ORA(addr)
{
	var t = translateAddr(addr);
	
	if ((t & 0x10000) == 0x10000)
	{
		AC = AC | (t & 0xFF);
		updateFlags( AC | (t & 0xFF) < 0,false,false,false,false,false, AC | (t & 0xFF) == 0,false);

	}
	else
	{
		AC =  AC | MEM[t];
		updateFlags( AC | MEM[t] < 0,false,false,false,false,false, AC | MEM[t] == 0,false);

	}
	
}

/* Push accumulator on stack */
function PHA(addr)
{
	var t = translateAddr(addr);
	MEM[SP] = AC;
}

/* Pull accumulator from stack */
function PLA(addr)
{
	var t = translateAddr(addr);
	AC = MEM[SP];
}

/* Push accumulator on stack */
function PHP(addr)
{
	var t = translateAddr(addr);
	MEM[SP] = SR;
}

/* Pull accumulator from stack */
function PLP(addr)
{
	var t = translateAddr(addr);
	SR = MEM[SP];
}

/* rotate one bit left */
function ROL(addr)
{
	var t = translateAddr(addr);
	if (t == 0)
	{
		var left = AC & 0x80;
		AC = AC << 1;
		if (left == 0x80)
			AC = AC | 0x01;
			
		//emulate byte
		AC = AC & 0xFF;
	}
	else
	{
		var left = MEM[t] & 0x80;
		MEM[t] = MEM[t] << 1;
		if (left == 0x80)
			MEM[t] = MEM[t] | 0x01;
		//emulate byte
		MEM[t] = MEM[t] & 0xFF;
	}
}

/* rotate one bit right */
function ROR(addr)
{
	var t = translateAddr(addr);
	if (t == 0)
	{
		var right = AC & 0x01;
		AC = AC >> 1;
		if (right == 0x01)
			AC = AC | 0x80;
	}
	else
	{
		var right = MEM[t] & 0x01;
		MEM[t] = MEM[t] >> 1;
		if (right == 0x01)
			MEM[t] = MEM[t] | 0x80;
	}
}

/* return from interrupt */
function RTI(addr)
{
	var t = translateAddr(addr);
	PC = SP;
}

/* return from sub routine */
function RTS(addr)
{
	var t = translateAddr(addr);
	PC = SP;
}

/* Subtract memory from accumulator with borrow */
function SBC(addr)
{
	var t = translateAddr(addr);
	if ((t & 0x10000) == 0x10000)
	{
		AC = AC - (t & 0xFF);
	}
	else
	{
		AC = AC - MEM[t];
	}
}

/* Set carry flag */
function SEC(addr)
{
	var t = translateAddr(addr);
	updateFlags(false,false,false,false,false,false,false,true);
}

/* Set decimal flag */
function SED(addr)
{
	var t = translateAddr(addr);
	updateFlags(false,false,false,false,true,false,false,false);
}

/* Set interrupt flag */
function SEI(addr)
{
	var t = translateAddr(addr);
	updateFlags(false,false,false,false,false,true,false,false);
}

/* Store accumulator in memory */
function STA(addr)
{
	var t = translateAddr(addr);
	MEM[t] = AC;
}

/* Store x in memory */
function STX(addr)
{
	var t = translateAddr(addr);
	MEM[t] = X;
}

/* Store y in memory */
function STY(addr)
{
	var t = translateAddr(addr);
	MEM[t] = Y;
}

/* Transfer accumulator to x */
function TAX(addr)
{
	var t = translateAddr(addr);
	X = AC;
}

/* Transfer accumulator to y */
function TAY(addr)
{
	var t = translateAddr(addr);
	Y = AC;
}

/* Transfer stack pointer to x */
function TSX(addr)
{
	var t = translateAddr(addr);
	X = SP;
}

/* Transfer x to ac */
function TXA(addr)
{
	var t = translateAddr(addr);
	AC = X;
}

/* Transfer y to ac */
function TYA(addr)
{
	var t = translateAddr(addr);
	AC = Y;
}

/* Transfer accumulator to y */
function TXS(addr)
{
	var t = translateAddr(addr);
	SP = X;
}

function translateAddr(addr)
{
	if (addr === "A")
	{
		return 0;
	}
	
	
	var indirect = false;
	if (addr.contains("("))
	{
		addr = addr.replace('(', '')
		addr = addr.replace(')', '')
		indirect = true;
	}
	var split = addr.split(',');
	if (split[1] == null)
	{
		if (indirect)
		{		
			if (addr.charAt(0) == '#')
			{
				if (addr.charAt(1) == '$')
				{
					return parseInt(addr.substr(2,addr.length),16) | 0x10000;
				}
				else
				{
					return parseInt(addr.substr(1,addr.length),16) | 0x10000;
				}
			}
			if (addr.charAt(0) == '$')
			{
				return MEM[parseInt(addr.substr(1,addr.length),16)];
			}
		}
		else
		{
			if (addr.charAt(0) == '#')
			{
				if (addr.charAt(1) == '$')
				{
					return parseInt(addr.substr(2,addr.length),16) | 0x10000;
				}
				else
				{
					return parseInt(addr.substr(1,addr.length),16) | 0x10000;
				}
			}
			if (addr.charAt(0) == '$')
			{
				return parseInt(addr.substr(1,addr.length),16);
			}
		}
	}
	else
	{
		if(indirect)
		{
			if (split[0].charAt(0) == '#')
			{
				var amt = split[1];
				return (parseInt(addr.substr(1,addr.length),16) + eval(amt)) | 0x10000;
			}
			if (split[0].charAt(0) == '$')
			{
				var amt = split[1];
				var temp = (parseInt(addr.substr(1,addr.length),16) + eval(amt));
				return MEM[temp];
			}
		}
		else
		{
			if (split[0].charAt(0) == '#')
			{
				var amt = split[1];
				return (parseInt(addr.substr(1,addr.length),16) + eval(amt)) | 0x10000;
			}
			if (split[0].charAt(0) == '$')
			{
				var amt = split[1];
				return (parseInt(addr.substr(1,addr.length),16) + eval(amt));
			}

		}
	}
	return addr;
}

if(!('contains' in String.prototype)) {
       String.prototype.contains = function(str, startIndex) {
                return -1 !== String.prototype.indexOf.call(this, str, startIndex);
       };
 }