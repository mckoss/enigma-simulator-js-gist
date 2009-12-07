/* Enigma.js

   Enigma machine simulation.
   
   Rotor settings from http://homepages.tesco.net/~andycarlson/enigma/simulating_enigma.html
   
   TODO
   	- Ring Settings - notch moves relative to wires
   	- Plugboard
*/
global_namespace.Define('startpad.enigma', function (NS)
{
NS.mRotors = {
	I: {wires: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: 'Q'},
	II: {wires: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: 'E'},
	III: {wires: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: 'V'},
	IV: {wires: "ESOVPZJAYQUIRHXLNFTGKDCMWB", notch: 'J'},
	V: {wires: "VZBRGITYUPSDNHLXAWMJQOFECK", notch: 'Z'}
	};

NS.mReflectors = {
	B: {wires: "YRUHQSLDPXNGOKMIEBFZCWVJAT"},
	C: {wires: "FVPJIAOYEDRZXWGCTKUQSBNMHL"},
	};
	
var codeA = 'A'.charCodeAt(0);

function IFromCh(ch)
{
	ch = ch.toUpperCase();
	return ch.charCodeAt(0) - codeA;
}

function ChFromI(i)
{
	return String.fromCharCode(i + codeA);
}
	
function MapRotor(rotor)
{
	// Determine the relative offset (mod 26) of encoding and decoding each letter
	// (wire position)
	rotor.map = {};
	rotor.mapRev = {};
	for (var iFrom = 0; iFrom < 26; iFrom++)
		{
		var iTo = IFromCh(rotor.wires.charAt(iFrom));
		rotor.mapRev[iFrom] = (26 + iTo - iFrom) % 26;
		rotor.map[iTo] = (26 + iFrom - iTo) % 26;
		}
}

// Compute forward and reverse mappings for rotors and reflectors
for (var sRotor in NS.mRotors)
	MapRotor(NS.mRotors[sRotor]);
	
for (var sReflector in NS.mReflectors)
	MapRotor(NS.mReflectors[sReflector]);

NS.Enigma = function(rotors, reflector, settings)
{
	if (rotors == undefined)
		rotors = ['I', 'II', 'III'];
	if (reflector == undefined)
		reflector = 'B';
	if (settings == undefined)
		settings = {
			rotors: ['M', 'C', 'K'],
			rings: ['A', 'A', 'A'],
			plugboard: []
			};
	
	this.rotors = [];
	for (var i in rotors)
			this.rotors[i] = NS.mRotors[rotors[i]];
	this.reflector = NS.mReflectors[reflector];
	this.settings = settings;
	this.Init();
};

NS.Extend(NS.Enigma.prototype, {
Init: function(aRotors)
	{
	this.position = [];
	if (aRotors != undefined)
		this.settings.rotors = aRotors;

	for (var i in this.settings.rotors)
		{
		this.position[i] = (IFromCh(this.settings.rotors[i])) +
			IFromCh(this.settings.rings[i]) % 26;
		}
	},

// Return machine state	
toString: function()
	{
	var s = "";
	
	for (var i in this.settings.rotors)
		s += ChFromI(this.position[i]);
	return s;
	},
	
IncrementRotors: function()
	{
	// Middle notch - all rotors rotate
	if (this.position[1] == IFromCh(this.rotors[1].notch))
		{
		this.position[0] += 1;
		this.position[1] += 1;
		}
	// Right notch - right two rotors rotate
	else if (this.position[2] == IFromCh(this.rotors[2].notch))
		this.position[1] += 1;
		
	this.position[2] += 1;
	
	for (var i in this.rotors)
		this.position[i] = this.position[i] % 26; 
	},
	
EncodeCh: function(ch)
	{
	ch = ch.toUpperCase();
	
	// Short circuit non alphabetics
	if (ch < 'A' || ch > 'Z')
		return ch;
		
	var i = IFromCh(ch);
	
	this.IncrementRotors();

	for (var r = 2; r >= 0; r--)
		{
		var d = this.rotors[r].mapRev[(i + this.position[r]) % 26];
		i = (i + d) % 26;
		}
		
	i = (i + this.reflector.map[i]) % 26;
	
	for (var r = 0; r < 3; r++)
		{
		var d = this.rotors[r].map[(i + this.position[r]) % 26];
		i = (i + d) % 26;
		}
		
	return ChFromI(i);
	},
	
Encode: function(s)
	{
	var sOut = "";
	for (var i = 0; i < s.length; i++)
		sOut += this.EncodeCh(s[i]);
	return sOut;
	}
});

}); // startpad.enigma