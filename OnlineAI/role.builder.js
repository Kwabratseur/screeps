
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy,No,targets) {
        var Moveto = require('move.to');
        var Struct = require('get.memory');
        var BufferThreshold = 10000;
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	    }
        //var test = Struct.run(Memory.rooms[creep.memory.Home].RoomInfo.Sources);
        //console.log(test);
	    if(creep.memory.building) {
	        //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    Moveto.move(creep,targets[0]);
                }
            }else{
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
                                Moveto.move(creep,ClosestDamagedStructure);
                            }
                        //}
                    }else{
                        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
                            Moveto.move(creep,creep.room.controller);
                        }
                    }
                    //
                }
                else{
                    Moveto.move(creep,Game.flags.Flag3.pos);
                }
            }
	    }
	    
	    else {
	        if(Game.flags.Dismantle != undefined && No == 0){
	            if(creep.pos.inRangeTo(Game.flags.Dismantle,6)){
	            var target = creep.pos.findClosestByRange(FIND_STRUCTURES);
                    if(target) {
                        if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                            Moveto.move(creep,target);    
                        }
                    }   
	            }else{
	                Moveto.move(creep,Game.flags.Dismantle.pos);
	            }
	        }else{
	            if(AvailableEnergy > creep.room.energyCapacityAvailable*0.5 && (creep.room.storage == undefined || _.sum(creep.room.storage.store) > BufferThreshold)) {
    	            var storages = creep.room.storage;

    	            var Sources = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_SPAWN ||
                                    structure.structureType == STRUCTURE_EXTENSION) ;
                        }
                    });
                    if(storages != undefined){
                        
            	            if(storages.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                                    Moveto.move(creep,storages);
                               }
                        
                    }else if(creep.room.energyAvailable > creep.room.energyCapacityAvailable/2){
                        if(Sources[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                                Moveto.move(creep,Sources[0]);
                            }
                    }
	            }
	        }
                //creep.drop(RESOURCE_ENERGY) //drop i u want it to help start up
	        
	    }
}};

module.exports = roleBuilder;