var roleArmy = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs')
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.flag]);
	    }else{
          creep.memory.destRoom = creep.memory.roomTo;
	        if(creep.pos.inRangeTo(Game.flags[creep.memory.flag],20)){
                Jobs.Attack(creep);
              }else{
	            Moveto.move(creep,Game.flags[creep.memory.flag].pos);
	        }
	    }
    }
};

module.exports = roleArmy;
//old defender Jobs['Attack'](creep);
//make rangers through this module and maybe healers.
