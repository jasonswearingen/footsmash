
/** how fast the game runs.  increase to simulate "turbo mode"
 * if your algorithms are done properly, changing this should not impact physics simulation / gameplay logic
 * apply a game speed modifier to make the game seem faster.
 * this is needed because the game's clock seems slow.  maybe runs 1/10 normal.
 *  */
let GAME_SPEED = 1.0 //default normal = 1.0
/** y position where the game's "ground" should be */
let GROUND = 120
/** screen x position of the left game border */
let WALL_LEFT = 5;
/** screen x position of the game border  */
let WALL_RIGHT = 155;
/** constant acceleration when jumping */
let GRAVITY = -300.0

/** helper to throw an error (for debugging purposes) 
 * and still see the proper line number in the stack trace at the bottom of the IDE.
 * This is needed because if you just [throw "your err msg";] it won't show the line number so debugging is annoying.  */
function THROW_ERROR(message: string) {
    throw message;
}