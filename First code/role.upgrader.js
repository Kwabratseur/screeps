var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy) {
        var moresources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN);
                    }
            });
            
	    if(creep.carry.energy == 0) {
	        
	        var storages = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE) ;
                }
            });
            
            if(_.sum(storages[0].store) > 1000){
    	        if(storages[0].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                    creep.moveTo(storages[0], {reusePath: 10});
                }
            }else{
	            var sources = creep.room.find(FIND_SOURCES);
	            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {reusePath: 5});
                }
	        }
        }
        else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {reusePath: 50});
            }
        }
	}
};

module.exports = roleUpgrader;