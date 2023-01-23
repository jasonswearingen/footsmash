

/** FOOT SMASH GAME!  a clone of DiveKick, but uses only one button per player (A or B) */


//this section executes when this file is loaded up, acting as the "entry point" into the game.
//actual code is split into files, in the [./footsmash/] folder

/** create a instance of our little footsmash game */
let myGame = new EntryPoint();
// hooks into the makecode arcade engine to get an update loop
game.onUpdate( () =>{
    myGame.pumpUpdate();
})


// let lastTime = 0;
// game.onUpdate(() => {

//     let newTime = game.runtime();
//     let elapsedMs = newTime - lastTime;
//     lastTime = newTime;
//     console.log(`current time is ${newTime}  elapsed is ${elapsedMs}`);

// });

// //normal function
// function myFunction():void{
//     console.log("hi");
// }
// //func (lambda)
// let myfunc = ()=>{ 
//     console.log("bye")
//     }
// //another func, super short
// let get2 = ()=>2+2-2;

// get2();