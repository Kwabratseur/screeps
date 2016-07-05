var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy) {
        var Moveto = require('move.to');
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
                        Moveto.move(creep,storages[0]);
                    }
                }
            }else{
                if(creep.room.energyAvailable > creep.room.energyCapacityAvailable/2){
                    if(moresources[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                            Moveto.move(creep,moresources[0]);
                        }
                }
                
	        }
        }
        else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                Moveto.move(creep,creep.room.controller);
            }
        }
	}
};

module.exports = roleUpgrader;