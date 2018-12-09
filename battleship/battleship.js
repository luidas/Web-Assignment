/* every game has two players, identified by their WebSocket */
var battleship = function (gameID) {
    this.playerA = null;
    this.playerB = null;
    this.playerAboard = null;
    this.playerBboard = null;
    this.id = gameID;
    this.gameState = "0 JOINT"; //"A" means A won, "B" means B won, "ABORTED" means the game was aborted
};

/*
 * The game can be in a number of different states.
 */
battleship.prototype.transitionStates = {};
battleship.prototype.transitionStates["0 JOINT"] = 0;
battleship.prototype.transitionStates["1 JOINT"] = 1;
battleship.prototype.transitionStates["2 JOINT"] = 2;
battleship.prototype.transitionStates["TILE HIT"] = 3;
battleship.prototype.transitionStates["A"] = 4; //A won
battleship.prototype.transitionStates["B"] = 5; //B won
battleship.prototype.transitionStates["ABORTED"] = 6;

/*
 * Not all game states can be transformed into each other;
 * the matrix contains the valid transitions.
 * They are checked each time a state change is attempted.
 */ 
battleship.prototype.transitionMatrix = [
    [0, 1, 0, 0, 0, 0, 0],   //0 JOINT
    [1, 0, 1, 0, 0, 0, 0],   //1 JOINT
    [0, 0, 0, 1, 0, 0, 1],   //2 JOINT (note: once we have two players, there is no way back!)
    [0, 0, 0, 1, 1, 1, 1],   //CHAR GUESSED
    [0, 0, 0, 0, 0, 0, 0],   //A WON
    [0, 0, 0, 0, 0, 0, 0],   //B WON
    [0, 0, 0, 0, 0, 0, 0]    //ABORTED
];

battleship.prototype.isValidTransition = function (from, to) {
    
    console.assert(typeof from == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof from);
    console.assert(typeof to == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof to);
    console.assert( from in battleship.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, from);
    console.assert( to in battleship.prototype.transitionStates == true, "%s: Expecting %s to be a valid transition state", arguments.callee.name, to);


    let i, j;
    if (! (from in battleship.prototype.transitionStates)) {
        return false;
    }
    else {
        i = battleship.prototype.transitionStates[from];
    }

    if (!(to in battleship.prototype.transitionStates)) {
        return false;
    }
    else {
        j = battleship.prototype.transitionStates[to];
    }

    return (battleship.prototype.transitionMatrix[i][j] > 0);
};

battleship.prototype.isValidState = function (s) {
    return (s in battleship.prototype.transitionStates);
};

battleship.prototype.setStatus = function (w) {

    console.assert(typeof w == "string", "%s: Expecting a string, got a %s", arguments.callee.name, typeof w);

    if (battleship.prototype.isValidState(w) && battleship.prototype.isValidTransition(this.gameState, w)) {
        this.gameState = w;
        console.log("[STATUS] %s", this.gameState);
    }
    else {
        return new Error("Impossible status change from %s to %s", this.gameState, w);
    }
};

battleship.prototype.setAboard = function (w) {

    //two possible options for the current game state:
    //1 JOINT, 2 JOINT
    if (this.gameState != "1 JOINT" && this.gameState != "2 JOINT") {
        return new Error("Trying to set board, but game status is %s", this.gameState);
    }
    this.playerAboard = w;
};

battleship.prototype.setbboard = function (w) {

    //two possible options for the current game state:
    //1 JOINT, 2 JOINT
    if (this.gameState != "1 JOINT" && this.gameState != "2 JOINT") {
        return new Error("Trying to set board, but game status is %s", this.gameState);
    }
    this.playerBboard = w;
};

battleship.prototype.getAboard = function(){
    return this.playerAboard;
};

battleship.prototype.getBboard = function(){
    return this.playerBboard;
};

battleship.prototype.hasTwoConnectedPlayers = function () {
    return (this.gameState == "2 JOINT");
};

battleship.prototype.addPlayer = function (p) {

    console.assert(p instanceof Object, "%s: Expecting an object (WebSocket), got a %s", arguments.callee.name, typeof p);

    if (this.gameState != "0 JOINT" && this.gameState != "1 JOINT") {
        return new Error("Invalid call to addPlayer, current state is %s", this.gameState);
    }

    /*
     * revise the game state
     */ 
    var error = this.setStatus("1 JOINT");
    if(error instanceof Error){
        this.setStatus("2 JOINT");
    }

    if (this.playerA == null) {
        this.playerA = p;
        return "A";
    }
    else {
        this.playerB = p;
        return "B";
    }
};

module.exports = battleship;