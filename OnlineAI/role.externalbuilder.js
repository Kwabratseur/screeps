var roleExternalBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //console.log(creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES));
        var Moveto = require('move.to');
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
	         if(creep.memory.HarvestTile != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.FlagName]);
	        }else{
    	        targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        Moveto.move(creep,targets[0]);
                    }
                }
	        }
	    
        }else {
            if(creep.memory.HarvestTile != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.FlagName]);
	        }else{
    	        var drops = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
    	        Moveto.move(creep,drops);
        	    creep.pickup(drops);
	        }
	    }
        
    }
    
};

module.exports = roleExternalBuilder;