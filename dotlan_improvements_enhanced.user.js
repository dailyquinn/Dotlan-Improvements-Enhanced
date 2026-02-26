// ==UserScript==
// @name        Dotlan Improvements Extended
// @namespace   https://github.com/dailyquinn/Dotlan-Improvements-Enhanced
// @match       https://evemaps.dotlan.net/jump/*
// @grant       none
// @version     2
// @author      Quinn Munba
// @description Route Fatigue calculation for Dotlan
// @license     MIT
// ==/UserScript==



var jumptable;					//Reference to the main jump table
var jumps = [];					//Ly distance of jumps
var fatiguefactor = 1;			//Modifier granted from ship
var prefatigues = [];			//Prefatigue value nodes
var postfatigues = [];			//Postfatigue value nodes
var reactivations = [];			//Reactivation value nodes
var fatiguecap = 5 * 60 * 60	//Jump fatigue cap

var ships = {
	// Blops
	"Panther": 0.25,
	"Redeemer": 0.25,
	"Sin": 0.25,
	"Widow": 0.25,

	// Industrials
	"Rorqual": 0.1,
	"Rorqual ORE Development Edition": 0.1,
	"Anshar": 0.1,
	"Ark": 0.1,
	"Nomad": 0.1,
	"Rhea": 0.1,

	// Carriers
	"Archon": 1.0,
	"Chimera": 1.0,
	"Nidhoggur": 1.0,
	"Thanatos": 1.0,

	// Dreads
	"Moros": 1.0,
	"Moros Interbus Edition": 1.0,
	"Naglfar": 1.0,
	"Naglfar Justice Edition": 1.0,
	"Phoenix": 1.0,
	"Phoenix Wiyrkomi Edition": 1.0,
	"Revelation": 1.0,
	"Revelation Sarum Edition": 1.0,
	"Vehement": 1.0,
	"Chemosh": 1.0,
	"Caiman": 1.0,

	// FAXes
	"Apostle": 1.0,
	"Minokawa": 1.0,
	"Lif": 1.0,
	"Ninazu": 1.0,
	"Loggerhead": 1.0,
	"Dagon": 1.0,

	// Supers
	"Aeon": 1.0,
	"Hel": 1.0,
	"Nyx": 1.0,
	"Revenant": 1.0,
	"Wyvern": 1.0,
	"Vendetta": 1.0,

	// Titans
	"Avatar": 1.0,
	"Erebus": 1.0,
	"Leviathan": 1.0,
	"Ragnarok": 1.0,
	"Vanquisher": 1.0,
	"Molok": 1.0,
	"Komodo": 1.0,

	// Infrastructure
	"Jump Bridge": 1.0,
	"QA Jump Bridge": 1.0,
}


function df_readJumps() {
	jumptable = document.getElementsByClassName('tablelist table-tooltip')[0];

	//Read jump distances
	var count = Math.floor((jumptable.rows.length - 1) / 2);
	for(var i = 0; i < count; i++) {
		var jump = parseFloat(jumptable.rows[2 + (i * 2)].cells[2].getElementsByTagName('b')[0].childNodes[0].nodeValue.replace(' ly', ''));
		jumps.push(jump);
	}

	//Read ship type and get factor
	var ship = document.getElementsByClassName('tn')[0].rows[2].cells[1].childNodes[2].childNodes[0].nodeValue;
	fatiguefactor = ships[ship];
}


function df_buildTableAdditions() {
	var count = Math.floor((jumptable.rows.length - 1) / 2);
	for(var i = 0; i < count; i++) {
		//Create new row
		var row = jumptable.insertRow(((i + 1) * 2) + 1 + i);
		row.className = "tlr1";
		row.style.verticalAlign = "center";
		row.style.height = "50px";

		//Insert cells
		var prefatigue = row.insertCell(0);
		var postfatigue = row.insertCell(1);
		var reactivation  = row.insertCell(2);
		var t = row.insertCell(3);

		//Modify
		prefatigue.colSpan = 2;
		postfatigue.colSpan = 2;
		reactivation.colSpan = 2;

		//Content
			//Post fatigue
			postfatigue.appendChild(document.createTextNode("Fatigue After Jump: "));
			var pb = document.createElement('b');
			var p = document.createTextNode("00:00:00");
			pb = postfatigue.appendChild(pb);
			p = pb.appendChild(p);
			postfatigues[i] = p;

			//Reactivation timer
			reactivation.appendChild(document.createTextNode("Reactivation Timer: "));
			var rb = document.createElement('b');
			var r = document.createTextNode("00:00:00");
			rb.appendChild(r);
			reactivation.appendChild(rb);
			reactivations.push(r);

			//Pre Fatigue
			if(i == 0) {
				//Starting fatigue
				prefatigue.appendChild(document.createTextNode("Starting Fatigue: "));
				prefatigue.appendChild(document.createElement('br'));
				var s = "<input id=sd type=number min=0 max=30 value=0 class=tnbox>D <input id=sh type=number min=0 max=24 value=0 class=tnbox>:<input id=sm type=number min=0 max=59 value=0 class=tnbox>:<input id=ss type=number min=0 max=59 value=0 class=tnbox>";
				prefatigue.innerHTML += s;
			} else {
				//Wait time
				prefatigue.appendChild(document.createTextNode("Wait before Next Jump: "));
				var s = "<input id=sd type=number min=0 max=30 value=0 class=tnbox>D <input id=sh type=number min=0 max=24 value=0 class=tnbox>:<input id=sm type=number min=0 max=59 value=0 class=tnbox>:<input id=ss type=number min=0 max=59 value=0 class=tnbox>";
				prefatigue.appendChild(document.createElement('br'));
				prefatigue.innerHTML += s;
			}
			prefatigues.push(prefatigue);
	}

    // Add Row for Totals
    var row = jumptable.insertRow(jumptable.rows.length);
    row.className = "tlr1";
    row.style.verticalAlign = "center";
    row.style.height = "70px";
    var totalRow = row.insertCell(0);
    totalRow.colSpan = 7;
    totalRow.style.textAlign = "center";
    totalRow.style.fontWeight = "bold";

    // --- Line 1: Arrival Stats ---
    totalRow.appendChild(document.createTextNode("Arrival Fatigue: "));
    var arrFatigueB = document.createElement('b');
    var arrFatigueText = document.createTextNode("00:00:00");
    arrFatigueB.appendChild(arrFatigueText);
    totalRow.appendChild(arrFatigueB);

    // Arrival Reactivation
    totalRow.appendChild(document.createTextNode(" | Arrival Reactivation: "));
    var arrReactB = document.createElement('b');
    var arrReactText = document.createTextNode("00:00:00");
    arrReactB.appendChild(arrReactText);
    totalRow.appendChild(arrReactB);

    totalRow.appendChild(document.createElement('br'));

    // --- Line 2: Route Totals ---
    // Total Reactivation
    totalRow.appendChild(document.createTextNode("All Red Timers: "));
    var totalB = document.createElement('b');
    var totalText = document.createTextNode("00:00:00");
    totalB.appendChild(totalText);
    totalRow.appendChild(totalB);

    // Total Time in Route
    totalRow.appendChild(document.createTextNode(" | Full ETA: "));
    var travelB = document.createElement('b');
    var travelText = document.createTextNode("00:00:00");
    travelB.appendChild(travelText);
    totalRow.appendChild(travelB);

	//Add onchange events to prefatigues
	for(var i = 0; i < prefatigues.length; i++) {
		prefatigues[i].childNodes[2].onchange = df_doCalcsUpdate;
		prefatigues[i].childNodes[4].onchange = df_doCalcsUpdate;
		prefatigues[i].childNodes[6].onchange = df_doCalcsUpdate;
		prefatigues[i].childNodes[8].onchange = df_doCalcsUpdate;
	}

    // --- Add Independent Button Div Below the Table ---
    var btnContainer = document.createElement('div');
    btnContainer.style.textAlign = "center";
    btnContainer.style.paddingTop = "10px";
    btnContainer.style.paddingBottom = "10px";

    // Button 1: Min Fatigue on ALL jumps
    var btnMinAll = document.createElement('button');
    btnMinAll.type = "button";
    btnMinAll.innerHTML = "Min Fatigue (All Jumps)";
    btnMinAll.style.padding = "6px 12px";
    btnMinAll.style.cursor = "pointer";
    btnMinAll.style.fontWeight = "bold";
    btnMinAll.style.backgroundColor = "#e0e0e0";
    btnMinAll.style.color = "#333";
    btnMinAll.style.border = "1px solid #aaa";
    btnMinAll.style.borderRadius = "4px";
    btnMinAll.style.marginRight = "10px";
    btnMinAll.onclick = function(e) {
        e.preventDefault();
        df_applyWaits(df_calculateStrategyWaits('min_all'));
    };

    // Button 2: Rush, then Min Fatigue on LAST jump
    var btnRushMin = document.createElement('button');
    btnRushMin.type = "button";
    btnRushMin.innerHTML = "Rush, Min Fatigue on Last";
    btnRushMin.style.padding = "6px 12px";
    btnRushMin.style.cursor = "pointer";
    btnRushMin.style.fontWeight = "bold";
    btnRushMin.style.backgroundColor = "#e0e0e0";
    btnRushMin.style.color = "#333";
    btnRushMin.style.border = "1px solid #aaa";
    btnRushMin.style.borderRadius = "4px";
    btnRushMin.style.marginRight = "10px";
    btnRushMin.onclick = function(e) {
        e.preventDefault();
        df_applyWaits(df_calculateStrategyWaits('rush_then_min'));
    };

    // Button 3: Reset to Minimums (Mandatory Reactivation Timers Only)
    var btnResetMin = document.createElement('button');
    btnResetMin.type = "button";
    btnResetMin.innerHTML = "Reset to Minimums";
    btnResetMin.style.padding = "6px 12px";
    btnResetMin.style.cursor = "pointer";
    btnResetMin.style.fontWeight = "bold";
    btnResetMin.style.backgroundColor = "#e0e0e0";
    btnResetMin.style.color = "#333";
    btnResetMin.style.border = "1px solid #aaa";
    btnResetMin.style.borderRadius = "4px";
    btnResetMin.onclick = function(e) {
        e.preventDefault();
        df_applyWaits(df_calculateStrategyWaits('rush_all'));
    };

    btnContainer.appendChild(btnMinAll);
    btnContainer.appendChild(btnRushMin);
    btnContainer.appendChild(btnResetMin);

    // Append the button container as a direct sibling beneath the jump table
    jumptable.parentNode.insertBefore(btnContainer, jumptable.nextSibling);
}


//Re references the global variables for client side updating
function df_rebuildRefs() {
	prefatigues = [];
	postfatigues = [];
	reactivations = [];
	var count = Math.floor((jumptable.rows.length - 1) / 3);
	for(var i = 0; i < count; i++) {
		var row = jumptable.rows[((i+1) * 3)];

		//Prefatigue
		prefatigues.push(row.cells[0]);

		//Postfatigue
		postfatigues.push(row.cells[1].childNodes[1].childNodes[0]);

		//Reactivations
		reactivations.push(row.cells[2].childNodes[1].childNodes[0]);
	}
}


//Performs the initial fatigue calculations
function df_doCalcsInit() {
	//Get starting fatigue
	var fatigue = df_getPrefatigueValue(0);
	var reactivation = 0;
	var total = 0;

	//Iterate through each jump
	for(var i = 0; i < jumps.length; i++) {
		//Calculate Reactivation and Fatigue
		reactivation = Math.max(
			1 + (jumps[i] * fatiguefactor),
			(fatigue * 0.1) / 60
		) * 60;
        total += reactivation;
		fatigue = Math.floor(
			Math.min(
				Math.max(
					10 * (1 + (jumps[i] * fatiguefactor)),
					(fatigue / 60) * (1 + (jumps[i] * fatiguefactor))
				) * 60,
				fatiguecap
			)
		);

		//Update UI
		postfatigues[i].nodeValue = df_formatTime(df_sToT(fatigue), "no_days");
		var react = df_sToT(reactivation);
		reactivations[i].nodeValue = df_formatTime(react, "no_days");

		//Update next wait before with reactivation timer
		df_setPrefatigueValue(i+1, react);
		fatigue -= reactivation;
	}

    // Calculate total time spent in route (sum of waits between jumps)
    var totalTravel = 0;
    for(var j = 1; j < jumps.length; j++) {
        totalTravel += df_getPrefatigueValue(j);
    }

    // Update the UI logic for both lines
    var totalTimeOb = df_formatTime(df_sToT(total), "auto_days");
    var totalTravelOb = df_formatTime(df_sToT(totalTravel), "auto_days");

    var arrFatigueVal = jumps.length > 0 ? postfatigues[jumps.length - 1].nodeValue : "00:00:00";
    var arrReactVal = jumps.length > 0 ? reactivations[jumps.length - 1].nodeValue : "00:00:00";

    var totalRowCell = jumptable.rows[jumptable.rows.length - 1].cells[0];

    // Line 1 mappings (Arrival Stats)
    totalRowCell.childNodes[1].childNodes[0].nodeValue = arrFatigueVal;
    totalRowCell.childNodes[3].childNodes[0].nodeValue = arrReactVal;

    // Line 2 mappings (Totals)
    totalRowCell.childNodes[6].childNodes[0].nodeValue = totalTimeOb;
    totalRowCell.childNodes[8].childNodes[0].nodeValue = totalTravelOb;
}


//Performs fatigue update calculations, same init but without writing changes to the wait boxes
function df_doCalcsUpdate() {
	//Get starting fatigue
	var fatigue = df_getPrefatigueValue(0);
	var reactivation = 0;
	var total = 0;

	//Iterate through each jump
	for(var i = 0; i < jumps.length; i++) {
		//Calculate Reactivation and Fatigue
		reactivation = Math.max(
			1 + (jumps[i] * fatiguefactor),
			(fatigue * 0.1) / 60
		) * 60;
        total += reactivation;
		fatigue = Math.floor(
			Math.min(
				Math.max(
					10 * (1 + (jumps[i] * fatiguefactor)),
					(fatigue / 60) * (1 + (jumps[i] * fatiguefactor))
				) * 60,
				fatiguecap
			)
		);

		//Update UI
		postfatigues[i].nodeValue = df_formatTime(df_sToT(fatigue), "no_days");
		var react = df_sToT(reactivation);
		reactivations[i].nodeValue = df_formatTime(react, "no_days");

		//Update fatigue with the wait before of the next jump
		if(i+1 != jumps.length) {
			fatigue -= df_getPrefatigueValue(i+1);
		}
	}

    // Calculate total time spent in route (sum of waits between jumps)
    var totalTravel = 0;
    for(var j = 1; j < jumps.length; j++) {
        totalTravel += df_getPrefatigueValue(j);
    }

    // Update the UI logic for both lines
    var totalTimeOb = df_formatTime(df_sToT(total), "auto_days");
    var totalTravelOb = df_formatTime(df_sToT(totalTravel), "auto_days");

    var arrFatigueVal = jumps.length > 0 ? postfatigues[jumps.length - 1].nodeValue : "00:00:00";
    var arrReactVal = jumps.length > 0 ? reactivations[jumps.length - 1].nodeValue : "00:00:00";

    var totalRowCell = jumptable.rows[jumptable.rows.length - 1].cells[0];

    // Line 1 mappings (Arrival Stats)
    totalRowCell.childNodes[1].childNodes[0].nodeValue = arrFatigueVal;
    totalRowCell.childNodes[3].childNodes[0].nodeValue = arrReactVal;

    // Line 2 mappings (Totals)
    totalRowCell.childNodes[6].childNodes[0].nodeValue = totalTimeOb;
    totalRowCell.childNodes[8].childNodes[0].nodeValue = totalTravelOb;
}


//Calculates wait times based on a selected strategy
function df_calculateStrategyWaits(strategy) {
    var tempFatigue = df_getPrefatigueValue(0); // Pull starting fatigue
    var waits = [];

    for(var i = 0; i < jumps.length; i++) {
        var tempReactivation = Math.max(
            1 + (jumps[i] * fatiguefactor),
            (tempFatigue * 0.1) / 60
        ) * 60;

        tempFatigue = Math.floor(
            Math.min(
                Math.max(
                    10 * (1 + (jumps[i] * fatiguefactor)),
                    (tempFatigue / 60) * (1 + (jumps[i] * fatiguefactor))
                ) * 60,
                fatiguecap
            )
        );

        // Calculate the wait times before the *next* jump
        if (i < jumps.length - 1) {
            var wait = 0;
            if (strategy === 'min_all') {
                // Wait until fatigue drops to 10 mins (600 seconds) or red timer, whichever is longer
                wait = Math.max(tempReactivation, tempFatigue - 600);
            } else if (strategy === 'rush_then_min') {
                // If it's the very last wait time (before the final jump)
                if (i === jumps.length - 2) {
                    wait = Math.max(tempReactivation, tempFatigue - 600);
                } else {
                    // Otherwise, just wait out the mandatory reactivation red timers
                    wait = tempReactivation;
                }
            } else if (strategy === 'rush_all') {
                // Reset to standard minimum wait time across the board
                wait = tempReactivation;
            }
            waits.push(wait);
            tempFatigue = Math.max(0, tempFatigue - wait);
        }
    }
    return waits;
}

//Applies the calculated array of wait times to the inputs and updates the UI
function df_applyWaits(waits) {
    for (var i = 0; i < waits.length; i++) {
        df_setPrefatigueValue(i + 1, df_sToT(waits[i]));
    }
    df_doCalcsUpdate();
}

function df_formatTime(obj, mode) {
	function format(muhint) {
		if(muhint < 10) {
			return "0" + Math.floor(muhint);
		} else {
			return "" + Math.floor(muhint);
		}
	}

	var s = "";
    // Only show days if allowed by mode AND the day count is actively above 0
    if (mode === "auto_days" && obj.days > 0) {
        s += obj.days + "D ";
    }

    s += format(obj.hours) + ":" + format(obj.minutes) + ":" + format(obj.seconds);
	return s;
}


function df_getPrefatigueValue(i) {
	//Get starting fatigue
	var fatigue = prefatigues[i];

	var timer = {};

	timer.days = parseInt(fatigue.childNodes[2].value)
	timer.hours = parseInt(fatigue.childNodes[4].value)
	timer.minutes = parseInt(fatigue.childNodes[6].value)
	timer.seconds = parseInt(fatigue.childNodes[8].value);

	return df_tToS(timer);
}


function df_setPrefatigueValue(i, obj) {
	if(i < prefatigues.length) {
		var prefatigue = prefatigues[i];
		prefatigue.childNodes[2].value = Math.floor(obj.days);
		prefatigue.childNodes[4].value = Math.floor(obj.hours);
		prefatigue.childNodes[6].value = Math.floor(obj.minutes);
		prefatigue.childNodes[8].value = Math.floor(obj.seconds);
	}
}


//Convert seconds to a time object
function df_sToT(seconds) {
	var ret = {days: 0, hours: 0, minutes: 0, seconds: 0};
	ret.days = Math.floor(seconds / 86400);
	ret.hours = Math.floor((seconds % 86400) / 60 / 60);
	ret.minutes = Math.floor((seconds % 3600) / 60)
	ret.seconds = seconds % 60;
	return ret;
}


function df_sToM(seconds) {
	return seconds / 60;
}


function df_mToS(minutes) {
	return minutes * 60;
}


//Convert a time object to seconds
function df_tToS(obj) {
	var ret = (obj.days * 86400) + (obj.hours * 3600) + (obj.minutes * 60) + obj.seconds;
	return ret;
}


//Read jump data
df_readJumps();

//Add extra rows to table
df_buildTableAdditions();

//Run the initial calcs
df_doCalcsInit();

//Test run the ref rebuild
df_rebuildRefs();

df_doCalcsUpdate();