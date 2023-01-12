namespace FootSmash {
    //a namespace is like a box, containing other things (code, variables, classes, other namespaces)
    //everything inside a namespace (box) can see everything else inside. 
    //but nothing outside can see any of the contents unless the [export] keyword is used.   
    //[export] is basically the same thing as [public] but for namespaces.


    /** how fast the game runs.  increase to simulate "turbo mode"
     * if your algorithms are done properly, changing this should not impact physics simulation / gameplay logic
     *  */
    let GAME_SPEED = 10.0 //default normal = 5.0
    /** y position where the game's "ground" should be */
    let GROUND = 120
    /** screen x position of the left game border */
    let WALL_LEFT = 5;
    /** screen x position of the game border  */
    let WALL_RIGHT = 155;
    /** constant acceleration when jumping */
    let GRAVITY = -9.8

    /** helper to throw an error (for debugging purposes) 
     * and still see the proper line number in the stack trace at the bottom of the IDE.
     * This is needed because if you just [throw "your err msg";] it won't show the line number so debugging is annoying.  */
    function THROW_ERROR(message: string) {
        throw message;
    }

    /** sprites categoriezed by player+body part.  used for core divekick mechanics
     * when foot hits a sprite of kind "Head", it's a HEADSHOT
     * when foot hits body it's a KO
     * when foot hits foot, and opponent was DIVING state, it's a DOUBLE KO, otherwise just normal KO.
      */
    namespace PlayerSpriteKind {
        export const P1_Head = SpriteKind.create()
        export const P1_Body = SpriteKind.create()
        export const P1_Foot = SpriteKind.create()
        export const P2_Head = SpriteKind.create()
        export const P2_Body = SpriteKind.create()
        export const P2_Foot = SpriteKind.create()
    }

    /** simple "finite state machine" (FSM) used for splitting up the player's game mechanics up into their own modular parts
     * more on FSM: https://www.youtube.com/watch?v=-ZP2Xm-mY4E   and http://gameprogrammingpatterns.com/state.html
      */
    namespace PlayerFSM {

        /** A State holds all the variables and decisions (logic and state) for the owner when they are in that state.         * 
         * This IState is the minimum functionality we need to have a full FSM.
         *          
         * See the IdleState and JumpingState for examples 
         * 
         * an interface is an "example", saying what functions a class needs to have when it "implements" the interface.  
         * * The <TOwner> is a "generic", letting the class that implements pick the class that TOwner is.   In our game TOwner is always "Player"
         * */
        export interface IState<TOwner> {
            /** update the state, pasing in it's owner if outside data is required.  
             * should return itself or whatever state that should be transitioned into */
            update(
                /** seconds elapsed since last update loop.  eg: 0.03 = 30ms */
                elapsedSec: number,
                /**the owner of this state, passed every update so it's simple to find and use */
                owner: TOwner
            ): IState<TOwner>;
        }


        /** Active when player is standing on the ground.
         * This is the "Brains" of the player when they are Idle.
         * In this Idle, we make sure we are on the ground, and check when it's time to JUMP.
         */
        export class IdleState implements IState<Player>{
            public update(elapsedSec: number, owner: Player): IState<Player> {

                //if player below ground, teleport to ground
                if (owner.height < 0) {
                    owner.standY(0);
                }
                //if player above ground, start falling to ground
                if (owner.height > 0) {
                    return new JumpingState(owner, 0);
                }

                //if player presses action, JUMP!
                if (owner.actionButton.isPressed() === true) {
                    return new JumpingState(owner, owner.speed);
                }

                //nothings happening, just return ourself so next game update this Idle state runs again
                return this;
            }
        }

        /** Handles when the player is in Jumping (and falling) Mode.
         * inside we calculate physics and check when we DIVE or fall back to the ground and switch to IDLE.
           */
        export class JumpingState implements IState<Player>{

            /** when we transition from IDLE to JUMP state, the action button is pressed.
             * Because it's pressed, we need to track it, so we know when it was unpressed and pressed again.
             * This is because we want the player to DIVE only once they press action a second time. */
            public isJumpStillPressed: boolean;

            /** a constructor is a function that gets executed on the newly created class instance when it
             * is created via the "new" keyword.  eg: [new JumpingState(p1,0);]
             * this lets us do some initialization work, and store values sent by the code that created this instance.
             */
            constructor(owner: Player,
                /** how fast up (or down) we are going when we first transition to JUMP.  
                 * set to 0 and the character will fall to the ground. 
                 * 
                 * the keyword [public] makes this yVelocity also a class "member", which means that it will
                 * be accessable to other functions (or outside code) just like a public function or the isJumpStillPressed property.
                 */
                public yVelocity: number) {

                //we could have set the property to false above (in the class definition) but 
                //we are setting it here just to show how constructors are used a lot: to initialize the class properties
                this.isJumpStillPressed = true;

            }

            public update(elapsedSec: number, owner: Player): IState<Player> {

                //move up/down by gravity
                {
                    //apply velocity to position.  our game only has y (height) velocity.
                    let newHeight = owner.height + (this.yVelocity * elapsedSec);
                    //apply acceleration to velocity
                    this.yVelocity += GRAVITY * elapsedSec;
                    //apply newly calculated position to owner player's state.  (update sprites too)
                    owner.standY(newHeight);

                    //if at or below zero, back to standing
                    if (newHeight <= 0) {
                        owner.standY(0);
                        return new IdleState();
                    }
                }

                if (this.isJumpStillPressed) {
                    //we think player is still pressing the action button (from jumping in IDLE)
                    //lets check if that is still true!
                    if (owner.actionButton.isPressed() === false) {
                        //action released for first time, so make note of that, 
                        //so we can watch for next time action pressed (next update)
                        this.isJumpStillPressed = false;
                    }
                } else {
                    //player wasn't still holding the action button from back in IDLE state.
                    if (owner.actionButton.isPressed() === true) {
                        //pressed the action button again!  now DIVE!         
                        return new DiveState();
                    }
                }
                //done with our jump update.  return ourself so that we can do our state again next update.
                return this;
            }
        }
        /** Was "Jumping" to get here.  no time to dive attack! */
        export class DiveState implements IState<Player>{
            public update(elapsedSec: number, owner: Player): IState<Player> {
                //if we just start diving, need to pick a direction to dive.
                //if we are at either wall, dive towards center of screen.
                //otherwise, dive toward enemy Player

                //do our dive physics calculation

                //if our foot sprite collides with enemy do damage function

                //if our height less than 0, set to 0 and idle.

                //if we hit the wall, transition to jumping (secret ability!) (also easier to code)

                THROW_ERROR("need to implement Dive state");
                return this;




            }
        }

    }
    class Player {

        private _height = 0;
        /** 
         * get/set properties in typescript: https://www.typescriptlang.org/docs/handbook/2/classes.html#getters--setters
         */
        public get height() { return this._height; }

        //private set height(value:number){this._height = value; }
        speed = 38.0;
        public head: Sprite;
        public body: Sprite;
        public foot: Sprite;
        public diveBody: Sprite;
        /** when this changes, sprites will be flipped */
        public isFacingRight: boolean = true;

        public actionButton: controller.Button;

        public currentState: PlayerFSM.IState<Player>;

        constructor(public isP1: boolean, public xPos: number) {

            if (isP1) {
                this.body = sprites.create(assets.image`Body1`, PlayerSpriteKind.P1_Body);
                this.diveBody = sprites.create(assets.image`DiveBody1`, PlayerSpriteKind.P1_Body);
                this.head = sprites.create(assets.image`Head1`, PlayerSpriteKind.P1_Head);
                this.foot = sprites.create(assets.image`Foot1`, PlayerSpriteKind.P1_Foot);


                this.actionButton = controller.B;
            } else {
                this.body = sprites.create(assets.image`Body2`, PlayerSpriteKind.P2_Body);
                this.diveBody = sprites.create(assets.image`DiveBody2`, PlayerSpriteKind.P2_Body);
                this.head = sprites.create(assets.image`Head2`, PlayerSpriteKind.P2_Head);
                this.foot = sprites.create(assets.image`Foot2`, PlayerSpriteKind.P2_Foot);

                this.actionButton = controller.A;
            }

            //hide
            this.diveBody.setPosition(-100, -100);

            //set position;
            this.stand(xPos, 0);

            this.currentState = new PlayerFSM.IdleState();



        }

        public update(elapsedSec: number) {
            this.currentState = this.currentState.update(elapsedSec, this);
            this._updateSpriteDirections();
        }

        private _updateSpriteDirections() {
            //get facing direction of this player
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

        public stand(xPos: number, height: number): void {
            this.xPos = xPos;
            this._height = height;

            let y = GROUND - height;

            this.head.setPosition(xPos, y - 35);
            this.body.setPosition(xPos, y - 20);
            this.foot.setPosition(xPos, y - 5);
        }
        /** set character to standing, only passing in a height */
        public standY(height: number): void {
            this.stand(this.xPos, height);
        }
    }

    export class MyGame {
        public p1 = new Player(true, WALL_LEFT);
        public p2 = new Player(false, WALL_RIGHT);
        private lastUpdateTimestamp: number;

        constructor() {
            this.lastUpdateTimestamp = game.runtime();
        }


        public pumpUpdate() {
            //calculate time since last call to this function
            let currentTimestamp = game.runtime();
            let elapsedMs = currentTimestamp - this.lastUpdateTimestamp;
            let elapsedSec = (elapsedMs / 1000.0) * GAME_SPEED;


            this.update(elapsedSec);


            this.lastUpdateTimestamp = currentTimestamp;
        }

        private update(elapsedSec: number) {
            this.p1.update(elapsedSec);
            this.p2.update(elapsedSec);
        }
    }

}
let myGame = new FootSmash.MyGame();
// hooks into the makecode arcade engine to get an update loop
forever(function () {
    myGame.pumpUpdate();
})
