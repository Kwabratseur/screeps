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

      if((Game.cpu.tickLimit - Game.cpu.getUsed()) > (10)) {//Game.cpu.tickLimit - 100
              creep.moveTo(target);//, {reusePath: 60}creep.moveTo(target, {avoid: creep.room.find(STRUCTURE_ROAD)});
      }else{
        creep.moveTo(target, {noPathFinding: true});
      }
        // Perform pathfinding only if we have enough CPU

    }
}
module.exports = Moveto;
