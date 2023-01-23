
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