/** simple "finite state machine" (FSM) used for splitting up the player's game mechanics up into their own modular parts
  * more on FSM: https://www.youtube.com/watch?v=-ZP2Xm-mY4E   and http://gameprogrammingpatterns.com/state.html
   */
namespace PlayerActivityFsm {
    //a namespace is like a box, containing other things (code, variables, classes, other namespaces)
    //everything inside a namespace (box) can see everything else inside. 
    //but nothing outside can see any of the contents unless the [export] keyword is used.   
    //[export] is basically the same thing as [public] but for namespaces.

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
                owner.SetPositionStandY(0);
            }
            //if player above ground, start falling to ground
            if (owner.height > 0) {
                return new JumpingState(owner, 0);
            }

            //if player presses action, JUMP!
            if (owner.actionButton.isPressed() === true) {
                return new JumpingState(owner, owner.jumpVelocity);
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

        private totalElapsed = 0;
        public update(elapsedSec: number, owner: Player): IState<Player> {
            this.totalElapsed += elapsedSec;
            //console.log(this.totalElapsed);
            //move up/down by gravity
            {
                //apply velocity to position.  our game only has y (height) velocity.
                let newHeight = owner.height + (this.yVelocity * elapsedSec);
                //apply acceleration to velocity
                this.yVelocity += GRAVITY * elapsedSec;
                //apply newly calculated position to owner player's state.  (update sprites too)
                owner.SetPositionStandY(newHeight);

                //if at or below zero, back to standing
                if (newHeight <= 0) {
                    owner.SetPositionStandY(0);
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
                    return new DiveState(owner);
                }
            }
            //done with our jump update.  return ourself so that we can do our state again next update.
            return this;
        }
    }
    /** Was "Jumping" to get here.  no time to dive attack! */
    export class DiveState implements IState<Player>{

        public diveDirection: null | "LEFT" | "RIGHT";

        constructor(owner: Player) {
            //reset collision flags, so that only collisions that occur while we are in dive state matter
            owner.isFootHitting = false;
            owner.isFootHittingHead = false;
            owner.isFootHittingBody = false;
            owner.isFootHittingFoot = false;
        }

        public _firstLog = true;
        public update(elapsedSec: number, owner: Player): IState<Player> {
            //if we just start diving, need to pick a direction to dive.
            //if we are at either wall, dive towards center of screen.
            //otherwise, dive toward enemy Player

            // console.logValue("diveDirection", this.diveDirection);
            // console.log(this.diveDirection);

            if (this.diveDirection == null) {
                if (owner.xPos <= WALL_LEFT) {
                    this.diveDirection = "RIGHT";
                } else if (owner.xPos >= WALL_RIGHT) {
                    this.diveDirection = "LEFT";
                } else if (owner.xPos < owner.enemy.xPos) {
                    this.diveDirection = "RIGHT";
                } else {
                    this.diveDirection = "LEFT";
                }
            }


            //  console.logValue("diveDirection", this.diveDirection);
            //  console.logValue("owner.xPos <= WALL_LEFT", owner.xPos <= WALL_LEFT);
            //  console.logValue("owner.xPos >= WALL_RIGHT", owner.xPos >= WALL_RIGHT);


            //do our dive physics calculation 
            {
                let dirMult = this.diveDirection === "LEFT" ? -1 : 1;
                let newX = owner.xPos + owner.diveVelocityX * elapsedSec * dirMult;
                let newHeight = owner.height - owner.diveVelocityY * elapsedSec;
                owner.SetPositionDive(newX, newHeight, this.diveDirection);
                //BUG:  the above physics (moving character) seems to take place after the frame is done,
                //which results in the character moving further than the sprite collision detection triggers,
                //when the Dive state finishes.    If we simply move the above physics to the end of 
                //our DiveState's update loop, it will effectively cause the dive state to run for one extra frame,
                //which lets our sprite collision detection "catch up".  resulting in better collision detection.
                //So kids, do that!
            }

            //if our foot sprite collides with enemy do damage function
            //hitting enemy head is HEADSHOT
            //hitting enemy body is KO
            //hitting enemy foot is DOUBLE-KO if enemy is also in dive state, otherwise just KO
            if (owner.isFootHitting) {
                if (owner.isFootHittingHead) {
                    owner.WinRound("HEADSHOT");
                } else if (owner.isFootHittingBody) {
                    owner.WinRound("KO");
                } else if (owner.isFootHittingFoot) {
                    if (owner.enemy.currentActivityState instanceof DiveState) {
                        owner.WinRound("DOUBLE_KO");
                    } else {
                        owner.WinRound("KO");
                    }
                }
                //return shouldn't matter, because match will reset
                return new IdleState();
            }
            //if our height less than 0, set to 0 and idle.
            if (owner.height <= 0) {
                owner.SetPositionStandY(0);
                return new IdleState();
            }

            //if we hit the wall, transition to jumping (secret ability!) (also easier to code)
            if (owner.xPos < WALL_LEFT) {
                owner.xPos = WALL_LEFT;
                return new JumpingState(owner, owner.jumpVelocity);
            }
            if (owner.xPos > WALL_RIGHT) {
                owner.xPos = WALL_RIGHT;
                return new JumpingState(owner, owner.jumpVelocity);
            }

            //keep doing our dive state collision check and physics next frame
            return this;
        }
    }

}