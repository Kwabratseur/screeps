var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy,No) {
        var BufferThreshold = 10000;
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(AvailableEnergy > creep.room.energyCapacityAvailable*0.5 && (creep.room.storage != undefined && _.sum(creep.room.storage.store) > BufferThreshold)) {
                    if(creep.build(targets[No]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[No]);
                    }
                }
            
            }
            else{
                var ClosestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*0.0003 ||
                                     structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*0.01 ||
                                     (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*0.9) ||
                                     structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                        }
                });
                var NoDamaged = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*0.0003 ||
                                     structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*0.01 ||
                                     (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*0.9) ||
                                     structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                        }
                });
                if(AvailableEnergy > creep.room.energyCapacityAvailable*0.5 && (creep.room.storage != undefined && _.sum(creep.room.storage.store) > BufferThreshold)) {
                    if(NoDamaged.length > 10){
                        if(creep.repair(ClosestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(ClosestDamagedStructure);
                    }
                    }else{
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
                            creep.moveTo(creep.room.controller);
                        }
                    }
                    //
                }
                else{
                    creep.moveTo(Game.flags.Flag3.pos);
                }
            }
	    }
	    
	    else {
	        if(Game.flags.Dismantle != undefined){
	            if(creep.pos.inRangeTo(Game.flags.Dismantle,6)){
	            var target = creep.pos.findClosestByRange(FIND_STRUCTURES);
                    if(target) {
                        if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);    
                        }
                    }   
	            }else{
	                creep.moveTo(Game.flags.Dismantle.pos);
	            }
	        }else{
	        var storages = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) ;
                    }
                });

	            var Sources = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_EXTENSION) ;
                    }
                });
                if(storages[0] != undefined){
                    
        	            if(storages[0].transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                                creep.moveTo(storages[0], {reusePath: 10});
                           }
                    
                }else if(Game.spawns.Spawn1.room.energyAvailable > 260){
                    if(Sources[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                            creep.moveTo(Sources[0], {reusePath: 10});
                        }
                }
	        }
                //creep.drop(RESOURCE_ENERGY) //drop i u want it to help start up
	        
	    }
}};

module.exports = roleBuilder;