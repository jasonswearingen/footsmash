
/** our simple game engine for FOOTSMASH!   
 * creates two players that can jump and divekick, all being controlled by a single button.
 * after you create this, you need to call the .pumpUpdate() method in a [forever] block
  */
class EntryPoint {

    public p1StartPos = WALL_LEFT + 22;
    public p2StartPos = WALL_RIGHT - 22;
    
    /** players are put against the walls */
    public p1: Player;// = new Player(true, this.p1StartPos );
    public p2: Player;// = new Player(false, this.p2StartPos);

    /** store the last time the [pumpUpdate()] ran, used for calculating elapsed time between called */
    private lastUpdateTimestamp: number;

    constructor() {
        this.lastUpdateTimestamp = game.runtime();
        this.p1 = new Player(true, this.p1StartPos);
        this.p2 = new Player(false, this.p2StartPos);
        this.newRound();

        this. koSprite = sprites.create(assets.image`ko`);
        this.headshotSprite = sprites.create(assets.image`headshot`);
        this.doubleKoSprite = sprites.create(assets.image`doubleko`);
        this.koSprite.setPosition(-100, -100);
        this.headshotSprite.setPosition(-100, -100);
        this.doubleKoSprite.setPosition(-100, -100);
    }
//sprites.create(assets.image`Body1`, PlayerSpriteKind.P1_Body);
    private koSprite:Sprite;
    private headshotSprite: Sprite
    private doubleKoSprite: Sprite

    public newRound(judgement?:undefined| "KO" | "HEADSHOT" | "DOUBLE_KO") {
        switch (judgement) {
            case "KO":
                this.koSprite.setPosition(80,30);
                setTimeout(() => this.koSprite.setPosition(-100,-100),1000);
                break;
            case "HEADSHOT":
                this.headshotSprite.setPosition(80, 30);
                setTimeout(() => this.headshotSprite.setPosition(-100, -100), 1000);
                break;
            case "DOUBLE_KO":
                this.doubleKoSprite.setPosition(80, 30);
                setTimeout(() => this.doubleKoSprite.setPosition(-100, -100), 1000);
                break;
            default:
                //THROW_ERROR("invalid switch " + judgement);
        }
        this.p1.SetPositionStand(this.p1StartPos, 0);
        this.p2.SetPositionStand(this.p2StartPos,0);
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