var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width=320;
canvas.height=200;

init();

textMode();

function textMode()
{

ctx.fillStyle = "#4242E7";
	ctx.fillRect(0,0,320,200);
	ctx.fillStyle = "#A5A5FF";
	
	
	var currentChar = 0;
	
	var positionX = 0;
	var positionY = 0;
		
	for (var a = 0; a < 1000; a++)
	{
		
		currentChar = MEM[2049 + a];
		
			for (var i = 8 * positionX; i < (8 * positionX) + 8; i++)
			{
				for (var j = 8 * positionY; j < (8 * positionY) + 8; j++)
				{
					if(MEM[j + ((currentChar - ((positionY-1))-2) * 8)] >> 7-(i - (positionX * 8)) & 0x01 == 1)
					{
						ctx.fillRect(i,j,1,1);
					}
				}
			}
			
			positionX++;
			if (positionX == 40)
			{
				positionX = 0;
				positionY++;
			}
		
	}
}

var updater = null;

function updateScreen()
{
	updater = setInterval(function(){
		textMode();
		updateStatusRegister();},100);
}

function stopScreen()
{
	clearInterval(updater);
}



var statusRegister = document.getElementById("status_register");

updateStatusRegister();

function updateStatusRegister()
{
	statusRegister.innerHTML = "NV-BDIZC </br>" + SR;
}