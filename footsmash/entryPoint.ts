
/** our simple game engine for FOOTSMASH!   
 * creates two players that can jump and divekick, all being controlled by a single button.
 * after you create this, you need to call the .pumpUpdate() method in a [forever] block
  */
 class EntryPoint {
    /** players are put against the walls */
    public p1 = new Player(true, WALL_LEFT + 22);
    public p2 = new Player(false, WALL_RIGHT - 22);

    /** store the last time the [pumpUpdate()] ran, used for calculating elapsed time between called */
    private lastUpdateTimestamp: number;

    constructor() {
        this.lastUpdateTimestamp = game.runtime();
    }

    /** updates the different "systems" of the game.
     * This is done in discrete steps, each taking a small (but variable) amount of time, about 33ms (1/30th of a second).
     * because this amount of time is so small, we can move things across the screen or look for player presses, 
     * and it seems to happen smoothly (for moving sprites) or instantly (reacting to player input) * 
     */
    public pumpUpdate() {
        //calculate time since last call to this function
        let currentTimestamp = game.runtime();
        let elapsedMs = currentTimestamp - this.lastUpdateTimestamp;
        /**this is how many seconds since last call to [pumpUpdate]*/
        let elapsedSec = (elapsedMs / 1000.0);
        //apply a game speed modifier to make the game seem faster.  
        //this is needed because the game's clock seems slow.  maybe runs 1/10 normal.
        elapsedSec *= GAME_SPEED;

        //update our various systems with this calculated [elapsedSec]
        this.update(elapsedSec);

        //store our update time for calculation next loop
        this.lastUpdateTimestamp = currentTimestamp;
    }

    private update(elapsedSec: number) {
        //let our players update themselves  
        //(pick what state they should be in, update their animations, physics, collision detection, etc)
        this.p1.update(elapsedSec);
        this.p2.update(elapsedSec);
    }
}