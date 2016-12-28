var roleArmy = {

    /** @param {Creep} creep **/
    run: function(creep) {
      try{
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs')
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,new RoomPosition(25, 25, creep.memory.destRoom));
	    }else{
          creep.memory.destRoom = creep.memory.roomTo;
	        if(creep.pos.inRangeTo(Game.flags[creep.memory.destRoom],15)){
                Jobs[creep.memory.jobs[0]](creep);
              }else{
	            Moveto.move(creep,Game.flags[creep.memory.destRoom].pos);
	        }
	    }
    }
    catch(err){
      console.log('error in army: '+err);
    }
  }
};

module.exports = roleArmy;
//old defender Jobs['Attack'](creep);
//make rangers through this module and maybe healers.
