var roleHealer = {

    /** @param {Creep} creep **/
    run: function(creep) {
      try{
        var Moveto = require('move.to');
        var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                     filter: function(object) {
                         return object.hits < object.hitsMax;
                     }
        });
        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                Moveto.move(creep,target);
            }
        }else{
            if(Game.flags.Flag2 != undefined){
                if(creep.pos.inRangeTo(Game.flags.Flag2,10)){

                }else{
                    Moveto.move(creep,Game.flags.Flag2.pos);
                }
            }else{
                Moveto.move(creep,Game.rooms[creep.memory.Home].controller.pos);
            }
        }
    }
  catch(err){
    console.log('error in healer: '+err);
  }
}};

module.exports = roleHealer;
