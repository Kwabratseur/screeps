var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy,No,targets) {
        
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
	        targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[No]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[No]);
                }
            
            }
            else{
                if(AvailableEnergy > (creep.room.energyCapacityAvailable*0.5)) {
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
                        creep.moveTo(creep.room.controller);
                    }
                    //
                }
                else{
                    creep.moveTo(Game.flags.Flag3.pos);
                }
                /*var ClosestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_WALL ||
                                     structure.structureType == RAMPART)&& structure.hits < structure.hitsMax*0.00001 ||
                                     structure.structureType == STRUCTURE_ROAD ||
                                     structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax;
                        }
                });
                if(creep.repair(ClosestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(ClosestDamagedStructure);
                }
                creep.repair(ClosestDamagedStructure);*/
            }
	    }
	    
	    else {
	            var storages = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) ;
                    }
                });
	            if(storages[0].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                        creep.moveTo(storages[0], {reusePath: 10});
                    }
                //creep.drop(RESOURCE_ENERGY) //drop i u want it to help start up
	        
	    }
}};

module.exports = roleBuilder;