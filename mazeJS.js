/* FOR CISC 282
Title: mazeJS.js
Author: Andy Wang
Description: Runs the basic dungeon crawler for CISC 282 assignment 1
*/

var playerStats = [1, 10, 0, 0];

//This function displays all of the player stats in the table at the beginning of the game
window.onload = function(){
	document.getElementById("levelCell").innerHTML=playerStats[0];
	document.getElementById("hpCell").innerHTML=playerStats[1];
	document.getElementById("expCell").innerHTML=playerStats[2];
	document.getElementById("goldCell").innerHTML=playerStats[3];
	disableButtons();
}
//Simulates rolling of a 20-sided die. Used for the majority of RNG in the game
function d20() {
	var diceRoll = Math.floor((Math.random()*20) + 1);
	//document.getElementById("roll").value = diceRoll;
	return diceRoll;
}

//Adds textString to the "output" textArea
function addText(textString){
	var textarea = document.getElementById("output");
	textarea.value += textString + "\n";
	textarea.scrollTop = textarea.scrollHeight;
}

//Disables fight and run buttons out of combat and enables continue and quit buttons
function disableButtons(){
	document.getElementById("fight").disabled = true;
	document.getElementById("run").disabled = true;
	document.getElementById("continue").disabled = false;
	document.getElementById("quit").disabled = false;
}

/*
* Enables "fight" and "run" buttons and changes button text depending on room type
* Also disables continue and quit buttons
*/
function enableButtons(enableType){
	if (enableType == 0){
		document.getElementById("fight").innerText = "Open";
		document.getElementById("run").innerText = "Leave";
	} else if (enableType == 1){
		document.getElementById("fight").innerText = "Fight";
		document.getElementById("run").innerText = "Run";
	}
	document.getElementById("fight").disabled = false
	document.getElementById("run").disabled = false;
	document.getElementById("continue").disabled = true;
	document.getElementById("quit").disabled = true;
}

/*
* Checks for death and level up and performs the necessary changes.
* Updates player stat display after actions in the dungeon.
*/
function updateStats(){
	if (playerStats[1] <= 0){
		quitGame();
	}
	var expChart = [5, 7, 10, 15, 20, 25, 30, 40, 50];
	if (playerStats[2] >= expChart[playerStats[0] - 1]) {
		var extraEXP = playerStats[2] - expChart[playerStats[0] - 1];
		addText("\nLevel up! You are now level " + (playerStats[0] + 1) + "!\nHP has increased by 2, combat rolls are boosted by one.\n" + (expChart[playerStats[0]] - extraEXP) + " exp to the next level.");
		playerStats[0] += 1;
		playerStats[1] = 10 + (playerStats[0] - 1)*2;
		playerStats[2] = extraEXP;
		document.getElementById("totalhpCell").innerHTML = "/" + (10 + (playerStats[0] - 1)*2);
		document.getElementById("totalexpCell").innerHTML = "/" + (expChart[playerStats[0]-1]);
	}
	document.getElementById("levelCell").innerHTML = playerStats[0];
	document.getElementById("hpCell").innerHTML = playerStats[1];
	document.getElementById("expCell").innerHTML = playerStats[2];
	document.getElementById("goldCell").innerHTML = playerStats[3];
}

// Ends currrent game. Used for both game overs and manual quits
function quitGame(){
	document.getElementById("continue").disabled = true;
	if (playerStats[1] <= 0){
		addText("\nYou died.\nGame over.\nFinal level: " + playerStats[0] + "\nFinal gold: " + playerStats[3]);
	} else {
		addText("\nSometimes, discretion is the better part of valour.\nYou decide to leave the dungeon while you still can.\nGame over.\nFinal level: " + playerStats[0] + "\nFinal gold: " + playerStats[3]);
	}
	document.getElementById("quit").innerText = "Restart";
	document.getElementById("quit").onclick = function() {resetGame();};
}

// Resets game to the beginning state. Only accessible after quitGame()
function resetGame(){
	playerStats[0] = 1;
	playerStats[1] = 10;
	playerStats[2] = 0;
	playerStats[3] = 0;
	updateStats();
	disableButtons();
	document.getElementById("quit").innerText = "Quit";
	document.getElementById("quit").onclick = function() {quitGame();};
	document.getElementById("totalhpCell").innerText = "/" + 10;
	document.getElementById("totalexpCell").innerText = "/" + 5;
	document.getElementById("output").value = "Welcome to this simple dungeon crawl.\nTry to collect as much gold as you can before leaving or dying.\nYou are currently in the dungeon entrance.";
}

/*
* Determines type of the next room.
* If player enters a monster room, function also determines monster difficulty
* Restriction of monster difficulty by player level is handled here.
*/
function roomType() {
	var roomRoll = d20();
    if (roomRoll == 1) {
			addText("\nYou fall into a pit of spikes. Take 5 damage.");
			playerStats[1] -= 5;
			updateStats();
	} else if (roomRoll > 1 && roomRoll <= 15) {
		var monsterRoll = d20(); 
		addText("\nYou enter a monster room.");
		if (playerStats[0] >= 5 && monsterRoll > 15){
			addText("Encountered an impossible foe.");
			monsterRoom(3);
		} else if (monsterRoll > 10 && playerStats[0] > 2 || monsterRoll > 5 && playerStats[0] >= 5) {
			addText("Encountered a difficult foe.");
			monsterRoom(2);
		} else if ((playerStats[0] > 2 && monsterRoll <= 10) || (playerStats[0] <= 2 &&  monsterRoll > 10)) {
			addText("Encountered a moderate foe.");
			monsterRoom(1);
		} else if ((playerStats[0] <= 2 && monsterRoll <= 10)) {
			addText("Encountered an easy foe.");
			monsterRoom(0);
		}
	} else {
		addText("\nYou enter a treasure room.");
		treasureRoom();
	}	
}

// Handles player interaction in monster rooms
function monsterRoom(type) {
	var reqRoll = [7 - playerStats[0], 14 - playerStats[0], 19 - playerStats[0], 25 - playerStats[0]];
	addText("You must roll " + reqRoll[type]  + " or higher to defeat the monster.\nWould you like to fight or run?");
	enableButtons(1);
	document.getElementById("fight").onclick = function() {fightMonster(type);};
	document.getElementById("run").onclick = function() {runMonster(type);};
}

// Determines outcome for combat with monster
function fightMonster(type) {
	disableButtons();
	var reqRoll = [7 - playerStats[0], 14 - playerStats[0], 19 - playerStats[0], 25 - playerStats[0]];
	var goldReward = [5, 15, 30, 150];
	var expReward = [1, 3, 5, 10];
	var fightRoll = d20();
	addText("You have chosen to fight. You rolled a " + fightRoll + ".");
	if (fightRoll == 1) {
		addText("Catastrophic defeat! Take 5 damage.");
		playerStats[1] -= 5;
	} else if (fightRoll < reqRoll[type]) {
		addText("Defeat! Take " + (1 + type) + " damage.");
		playerStats[1] -= (1 + type);
	} else if (fightRoll < 20 || (playerStats[0] >= 5 && type == 3)){
		addText("Victory! You gain " + goldReward[type] + " gold and " + expReward[type] + " exp!");
		playerStats[2] += expReward[type];
		playerStats[3] += goldReward[type];
	} else {
		addText("Dominating victory! You gain 20 gold and 5 exp!");
		playerStats[2] += 5;
		playerStats[3] += 20;		
	}
	updateStats();
}

// Determines outcome for running from monster
function runMonster(type){
	disableButtons();
	var runRoll = d20();
	addText("You attempt to run! You must roll 5 or higher.\nYou rolled a " + runRoll + ".");
	if (runRoll == 1) {
		addText("The monster fatally wounds you as you attempt to escape.");
		playerStats[1] = 0;
	} else if (runRoll < 5) {
		addText("You are injured as you attempt to escape. Take " + (2 + type) + " damage.");
		playerStats[1] -= (2 + type);
	} else {
		addText("You manage to escape! You gain 1 exp.");
		playerStats[2] += 1;
	}
	updateStats();
}

// Handles player interaction in treasure rooms
function treasureRoom() {
	var treType = d20();
	enableButtons(0);
	document.getElementById("fight").onclick = function() {openTreasure(treType);};
	document.getElementById("run").onclick = function() {leaveTreasure(treType);};
	addText("You spot a treasure chest ahead.\nWould you like to open it or leave?");
}

// Determines outcome for opening chests
function openTreasure(treType){
	disableButtons();
	if (treType <= 15) {
		var trapRoll = d20();
		addText("The chest contains a trap!");
		if (trapRoll == 1) {
			addText("You trigger the trap and take severe damage! Take 5 damage.");
			playerStats[1] -= 5;
		} else if (trapRoll <= 15) {
			addText("You trigger the trap but only receive a scratch. Take 1 damage.");
			playerStats[1] -= 1;
		} else {
			addText("You manage to disarm the trap! You gain 50 gold and 3 exp.");
			playerStats[2] += 3;
			playerStats[3] += 50;
		}
	} else {
		var randHeal = Math.floor((Math.random()*4) + 1);
		addText("The treasure chest contains 30 gold and a potion that recovers " + randHeal + " HP.");
		playerStats[1] += randHeal;
		playerStats[3] += 30;
	} 
	updateStats();
}

// Continues game after leaving chest
function leaveTreasure(){
	addText("You decide to leave the treasure chest alone.");
	disableButtons();
	updateStats();
}