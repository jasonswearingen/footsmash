
/** Manages the logic for a player.  called every engine.update() to check for player input and switch between FSM states. */
class Player {

    /** when jumping, how fast/far we spring upwards.  38.0 is about full screen vertical distance */
    public jumpVelocity = 250.0;
    public diveVelocityX = 100.0;
    public diveVelocityY = 100.0;

    /** height above ground.  private so things outside our class can not modify this directly. */
    private _height = 0;
    /** 
     * lets code outside this Player class read the height variable without being able to change it.
     * changing has to be done via one of the methods like .SetPositionStand()
     * 
     * get/set properties in typescript: https://www.typescriptlang.org/docs/handbook/2/classes.html#getters--setters
     */
    public get height() { return this._height; }


    /** sprites used by this player.  WILL BE CHANGED LATER to support multiple costumes for each. (idle animations, etc) 
     *  TODO: move to animation subsystem
    */
    public head: Sprite;
    public body: Sprite;
    public foot: Sprite;
    public diveBody: Sprite;

    /** a flag, tracks collision detection of our player foot sprite vs opponent.  
     * if a collision occurs, this is set to TRUE along with the related bodypart (such as [isFootHittingHead])
     * the [DiveState] is in charge of reading/clearing this flag.
     */
    public isFootHitting: boolean = false;
    public isFootHittingHead: boolean = false;
    public isFootHittingBody: boolean = false;
    public isFootHittingFoot: boolean = false;

    /** when this changes, sprites will be flipped direction  TODO: move to animation subsystem*/
    public isFacingRight: boolean = true;

    /** the button that controls this player. */
    public actionButton: controller.Button;

    public info: info.PlayerInfo;

    /** the FSM dealing with player activity states
     * The <Player> means that the owner is always a Player object
     */
    public currentActivityState: PlayerActivityFsm.IState<Player>;

    /** the constructor is automatically called when the Player object is created ([new] called) */
    constructor(/**true if player1, false if player2 */public isP1: boolean,/** players current X position */ public xPos: number) {

        /** set different sprites/button for each player */
        if (isP1) {
            this.info = info.player1;

            this.body = sprites.create(assets.image`Body1`, PlayerSpriteKind.P1_Body);
            this.diveBody = sprites.create(assets.image`DiveBody1`, PlayerSpriteKind.P1_Body);
            this.head = sprites.create(assets.image`Head1`, PlayerSpriteKind.P1_Head);
            this.foot = sprites.create(assets.image`Foot1`, PlayerSpriteKind.P1_Foot);

            //if this player's foot sprite overlaps with opponent, store a variable saying that.
            sprites.onOverlap(PlayerSpriteKind.P1_Foot, PlayerSpriteKind.P2_Head, function (sprite: Sprite, otherSprite: Sprite) {
                this.isFootHitting = true;
                this.isFootHittingHead = true;
            })
            sprites.onOverlap(PlayerSpriteKind.P1_Foot, PlayerSpriteKind.P2_Body, function (sprite: Sprite, otherSprite: Sprite) {
                this.isFootHitting = true;
                this.isFootHittingBody = true;

            })
            sprites.onOverlap(PlayerSpriteKind.P1_Foot, PlayerSpriteKind.P2_Foot, function (sprite: Sprite, otherSprite: Sprite) {
                this.isFootHitting = true;
                this.isFootHittingFoot = true;
            })
            

            this.actionButton = controller.B;
        } else {
            this.info = info.player2;

            this.body = sprites.create(assets.image`Body2`, PlayerSpriteKind.P2_Body);
            this.diveBody = sprites.create(assets.image`DiveBody2`, PlayerSpriteKind.P2_Body);
            this.head = sprites.create(assets.image`Head2`, PlayerSpriteKind.P2_Head);
            this.foot = sprites.create(assets.image`Foot2`, PlayerSpriteKind.P2_Foot);

            sprites.onOverlap(PlayerSpriteKind.P2_Foot, PlayerSpriteKind.P1_Head, function (sprite: Sprite, otherSprite: Sprite) {
                this.isFootHitting = true;
                this.isFootHittingHead = true;
            })
            sprites.onOverlap(PlayerSpriteKind.P2_Foot, PlayerSpriteKind.P1_Body, function (sprite: Sprite, otherSprite: Sprite) {
                this.isFootHitting = true;
                this.isFootHittingBody = true;
            })
            sprites.onOverlap(PlayerSpriteKind.P2_Foot, PlayerSpriteKind.P1_Foot, function (sprite: Sprite, otherSprite: Sprite) {
                this.isFootHitting = true;
                this.isFootHittingFoot = true;
            })

            this.actionButton = controller.A;
        }

        //hide the dive body sprite, as it's not used to start with   TODO: move to animation subsystem
        this.diveBody.setPosition(-100, -100);

        //set position, starting Y is always on the ground;
        this.SetPositionStand(xPos, 0);
        //set the default player activity to IDLE
        this.currentActivityState = new PlayerActivityFsm.IdleState();
    }

    /** called every engine.update(), lets the player check input, calculate state changes, animate, etc */
    public update(elapsedSec: number) {
        //updates the player activity FSM, which will return whatever State
        //that should be run next update (maybe the same state)
        this.currentActivityState = this.currentActivityState.update(elapsedSec, this);
        //update animations
        this._updateSpriteDirections();
    }
    /**  TODO: move to animation subsystem */
    private _updateSpriteDirections() {
        //get/update facing direction of this player
        {
            let newIsFacingRight = false;
            //first get facing of p1
            if (myGame.p1.xPos < myGame.p2.xPos) {
                newIsFacingRight = true;
            } else {
                newIsFacingRight = false;
            }
            if (this.isP1 === false) {
                //if actually p2, just switch facing
                newIsFacingRight = !newIsFacingRight;
            }

            //if our facing just flipped, update sprites and store the new facing value
            if (newIsFacingRight != this.isFacingRight) {
                this.isFacingRight = newIsFacingRight;
                //flip all sprites
                this.head.image.flipX();
                this.body.image.flipX();
                this.foot.image.flipX();
                this.diveBody.image.flipX();
            }
        }
    }

    /** helper to easily get the opponent */
    public get enemy(): Player {
        if (this.isP1 === true) {
            return myGame.p2;
        } else {
            return myGame.p1;
        }
    }

    /** change the players position and set to standing (idle) sprites */
    public SetPositionStand(xPos: number, height: number): void {
        this.xPos = xPos;
        this._height = height;

        let y = GROUND - height;

        this.head.setPosition(xPos, y - 35);
        this.body.setPosition(xPos, y - 20);
        this.foot.setPosition(xPos, y - 5);
    }
    /** set character to standing, only passing in a height */
    public SetPositionStandY(height: number): void {
        //just call the other Stand method, passing in the existing xPos
        this.SetPositionStand(this.xPos, height);
    }
    public SetPositionDive(newX: number, newHeight: number, diveDirection: "LEFT" | "RIGHT") {
        //THROW_ERROR("need to implement");
        this.SetPositionStand(newX, newHeight);
    }

    public WinRound(judgement: "KO" | "HEADSHOT" | "DOUBLE_KO") {

        switch (judgement) {
            case "KO":
                this.info.changeScoreBy(1);
                break;
            case "HEADSHOT":
                this.info.changeScoreBy(2);
                break;
            case "DOUBLE_KO":
                this.info.changeScoreBy(1);
                this.enemy.info.changeScoreBy(1);
                break;
            default:
                THROW_ERROR("invalid switch " + judgement);
        }
        game.showDialog(judgement,"winnah!")
        //game.showLongText("woo",DialogLayout.Center);
        
        myGame.newRound(judgement);

        //THROW_ERROR(`need to implement: ${this.isP1 ? "p1" : "p2"} win! ${judgement}`);






    }
}