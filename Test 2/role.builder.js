
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy,No) {
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs')
        var BufferThreshold = 10000;

	    if(creep.memory.building && creep.carry.energy == 0) {
          creep.memory.destRoom = creep.memory.roomFrom
          creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
          creep.memory.destRoom = creep.memory.roomTo;
	        creep.memory.building = true;
	    }
        if(creep.memory.destRoom != creep.room.name){
            Moveto.move(creep,Game.flags[creep.memory.flag]);
        } else{
	    if(creep.memory.building) {

	          var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    Moveto.move(creep,targets[0]);
                }
            }else{
              Jobs.Repair(creep);
	    }
    }
	        if(Game.flags.Dismantle != undefined && No == 0){
  	            if(creep.pos.inRangeTo(Game.flags.Dismantle,6)){
  	               Jobs.attack(creep);
	            }else{
	                Moveto.move(creep,Game.flags.Dismantle.pos);
	            }
	        }else{
	            if(AvailableEnergy > creep.room.energyCapacityAvailable*0.5 && (creep.room.storage == undefined || _.sum(creep.room.storage.store) > BufferThreshold)) {
                Jobs.GetEnergy(creep);
	            }
	        }

                //creep.drop(RESOURCE_ENERGY) //drop i u want it to help start

    }
}};

module.exports = roleBuilder;
