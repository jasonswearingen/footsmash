namespace FootSmash { 

    /** how fast the game runs.  increase to simulate "turbo mode"
     * if your algorithms are done properly, changing this should not impact physics simulation / gameplay logic
     *  */
    let GAME_SPEED = 5.0 //default normal = 5.0
    // y position where the game's "ground" should be
    let GROUND = 120
    // constant acceleration when jumping
    let GRAVITY = -9.8


    /** sprites categoriezed by player+body part.  used for core divekick mechanics  */
    namespace PlayerSpriteKind {
        export const P1_Head = SpriteKind.create()
        export const P1_Body = SpriteKind.create()
        export const P1_Foot = SpriteKind.create()
        export const P2_Head = SpriteKind.create()
        export const P2_Body = SpriteKind.create()
        export const P2_Foot = SpriteKind.create()
    }
    
    /** simple finite state machine */
    namespace PlayerStates {
        export interface IState<TOwner> {
            update(elapsedSec: number, owner: TOwner): IState<TOwner>;
        }
        export class Idle implements IState<Player>{
            public update(elapsedSec: number, owner: Player): IState<Player> {
                if (owner.actionButton.isPressed() === false) {
                    return this;
                }
                return new Jumping(owner);
            }
        }

        export class Jumping implements IState<Player>{

            /** we transition from Idle state when the jump button is pressed.  
             * need to wait for player to release jump */
            public isJumpStillPressed: boolean;
            /** how fast up (or down) we are going. */
            public yVelocity: number;
            // public yAccel

            constructor(owner: Player) {
                this.yVelocity = owner.speed;
                this.isJumpStillPressed = true;

            }

            public update(elapsedSec: number, owner: Player): IState<Player> {

                //move up/down by "gravity"
                let newHeight = owner.height + (this.yVelocity * elapsedSec);
                this.yVelocity += GRAVITY * elapsedSec;
                owner.setHeight(newHeight);

                //if at or below zero, back to standing
                if (newHeight <= 0) {
                    owner.setHeight(0);
                    return new Idle();
                }


                if (this.isJumpStillPressed && owner.actionButton.isPressed() === false) {
                    //jump released for first time
                    this.isJumpStillPressed = false;
                } else if (owner.actionButton.isPressed() === true) {
                    //pressed the action button again!  now DIVE!         
                    //return new Dive();
                }

                return this;
            }
        }
        export class Dive implements IState<Player>{
            public update(elapsedSec: number, owner: Player): IState<Player> {

                //return this;
                //not implemented, just return back to Idle
                return new Idle();
            }
        }

    }
    class Player {

        height: number = 0;
        speed = 38.0;
        public head: Sprite;
        public body: Sprite;
        public foot: Sprite;

        public actionButton: controller.Button;

        public currentState: PlayerStates.IState<Player>;

        constructor(public isP1: boolean, public xPos: number) {

            if (isP1) {
                this.head = sprites.create(assets.image`Head1`, PlayerSpriteKind.P1_Head);
                this.body = sprites.create(assets.image`Body1`, PlayerSpriteKind.P1_Body);
                this.foot = sprites.create(assets.image`Foot1`, PlayerSpriteKind.P1_Foot);

                this.actionButton = controller.B;
            } else {
                this.head = sprites.create(assets.image`Head2`, PlayerSpriteKind.P2_Head);
                this.body = sprites.create(assets.image`Body2`, PlayerSpriteKind.P2_Body);
                this.foot = sprites.create(assets.image`Foot2`, PlayerSpriteKind.P2_Foot);
                this.actionButton = controller.A;
            }
            //set position;
            this.stand(xPos, 0);

            this.currentState = new PlayerStates.Idle();
        }

        public update(elapsedSec: number) {
            this.currentState = this.currentState.update(elapsedSec, this);
        }

        public stand(xPos: number, height: number): void {
            this.xPos = xPos;
            this.height = height;

            let y = GROUND - height;
            this.head.setPosition(xPos, y - 40);
            this.body.setPosition(xPos, y - 20);
            this.foot.setPosition(xPos, y - 5);
        }
        public setHeight(height: number): void {
            this.stand(this.xPos, height);
        }
    }

    export class MyGame {
        public p1 = new Player(true, 30);
        public p2 = new Player(false, 130);
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
forever(function () {
    myGame.pumpUpdate();
})
