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
            if(storages[0] != undefined){
                if(_.sum(storages[0].store) > 3000){
        	        if(storages[0].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                        creep.moveTo(storages[0], {reusePath: 10});
                    }
                }
            }else{
                if(creep.room.energyAvailable > creep.room.energyCapacityAvailable/2){
                    if(moresources[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                            creep.moveTo(moresources[0], {reusePath: 10});
                        }
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