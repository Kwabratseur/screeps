/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('move.to');
 * mod.thing == 'a thing'; // true
 */
var Moveto = {
    
    move:function(creep,target){
        creep.moveTo(target, {noPathFinding: true});
    
        // Perform pathfinding only if we have enough CPU
        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 50) {
                creep.moveTo(target);
        }
    }
}
module.exports = Moveto;