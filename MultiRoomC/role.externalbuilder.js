var roleExternalBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //console.log(creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES));
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
	         if(creep.memory.HarvestTile != creep.room.name){
	            creep.moveTo(Game.flags[creep.memory.FlagName], {reusePath: 50});
	        }else{
    	        targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
	        }
	    
        }else {
            if(creep.memory.HarvestTile != creep.room.name){
	            creep.moveTo(Game.flags[creep.memory.FlagName], {reusePath: 50});
	        }else{
    	        var drops = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
    	        creep.moveTo(drops);
        	    creep.pickup(drops);
	        }
	    }
        
    }
    
};

module.exports = roleExternalBuilder;