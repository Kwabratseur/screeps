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
                
                if(AvailableEnergy > creep.room.energyCapacityAvailable*0.5 && (creep.room.storage == undefined || _.sum(creep.room.storage.store) > BufferThreshold)) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {reusePath: 50});
                    }
                }
            
            }
            else{
                var WallHp = 0.00001;
                var RampHp = 0.01;
                var RoadHp = 0.7;
                var numberDamaged = 0;
                if(creep.room.controller.level > 3){
                    numberDamaged = 10;
                    WallHp = 0.0003;
                    RampHp = 0.01;
                    RoadHp = 0.9;
                }
                var ClosestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*WallHp ||
                                     structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*RampHp ||
                                     (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*RoadHp) ||
                                     structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                        }
                });
                var NoDamaged = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*WallHp ||
                                     structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*RampHp ||
                                     (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*RoadHp) ||
                                     structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                        }
                });
                if(AvailableEnergy > creep.room.energyCapacityAvailable*0.5 && (creep.room.storage == undefined || _.sum(creep.room.storage.store) > BufferThreshold)) {
                    if(No == 0 && NoDamaged.length > numberDamaged){
                        //if(NoDamaged.length > numberDamaged){
                            if(creep.repair(ClosestDamagedStructure) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(ClosestDamagedStructure, {reusePath: 50});
                            }
                        //}
                    }else{
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
                            creep.moveTo(creep.room.controller, {reusePath: 20});
                        }
                    }
                    //
                }
                else{
                    creep.moveTo(Game.flags.Flag3.pos, {reusePath: 20});
                }
            }
	    }
	    
	    else {
	        if(Game.flags.Dismantle != undefined && No == 0){
	            if(creep.pos.inRangeTo(Game.flags.Dismantle,6)){
	            var target = creep.pos.findClosestByRange(FIND_STRUCTURES);
                    if(target) {
                        if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {reusePath: 50});    
                        }
                    }   
	            }else{
	                creep.moveTo(Game.flags.Dismantle.pos, {reusePath: 10});
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
                    
                }else if(creep.room.energyAvailable > creep.room.energyCapacityAvailable/2){
                    if(Sources[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                            creep.moveTo(Sources[0], {reusePath: 10});
                        }
                }
	        }
                //creep.drop(RESOURCE_ENERGY) //drop i u want it to help start up
	        
	    }
}};

module.exports = roleBuilder;