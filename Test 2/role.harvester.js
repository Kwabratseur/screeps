var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep,No,buildInfra) {
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs');

      if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
          creep.memory.destRoom = creep.memory.roomFrom
          creep.memory.harvesting = false;

	    }
	    if(!creep.memory.harvesting && creep.carry.energy == 0) {
          creep.memory.destRoom = creep.memory.roomTo;
	        creep.memory.harvesting = true;
	    }

      if(creep.memory.destRoom != creep.room.name){
          Moveto.move(creep,Game.flags[creep.memory.flag]);
      } else{//everything from here should be put in a creepJob module jobname: Gather, preferavly split it in two.
    	    if(creep.memory.harvesting) {
              Jobs.GatherEnergy(creep);
          }

          else {
              Jobs.FillStructures(creep,buildInfra);
	          }
          }
        }
};

module.exports = roleHarvester;
