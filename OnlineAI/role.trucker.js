var roleTrucker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var buildInfra = false;
        var Moveto = require('move.to');
        
        if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.carry.energy == 0) {
	        creep.memory.harvesting = true;
	    }
	    if(creep.memory.harvesting) {
	        
	        if(creep.memory.HarvestTile != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.FlagName]);
	        }else if(creep.memory.HarvestTile == creep.room.name){
    	        var drops = creep.room.find(FIND_DROPPED_RESOURCES);
    	        var c = 0;
    	        for(i = 1; i < drops.length; i++ ) {
    	            if(drops[i].amount > drops[c].amount){
    	                c = i;
    	            }
    	        }
    	        if(drops.length){
        	        Moveto.move(creep,drops[c]);
        	        creep.pickup(drops[c]);
    	        } 
	        }
	    }
        
        else {//
            
            var RoomVar = 0;
            for(var name in Game.spawns){
        		var SpawnName = name;
        		var CurrentRoom = Game.spawns[SpawnName].room;
        		if(RoomVar == 0 || CurrentRoom.energyAvailable/CurrentRoom.energyCapacityAvailable < Game.rooms[RoomVar].energyAvailable/Game.rooms[RoomVar].energyCapacityAvailable){
        		    RoomVar = Game.spawns[SpawnName].room.name;
        		}
            }

            var targets = Game.rooms[RoomVar].find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE);
                    }
            });
                if(buildInfra == true){
                    var Road = false;
                    var Site = false;
                    var Sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
                    creep.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_ROAD } })
                        .forEach((ext) => {  
                                            if(creep.pos.inRangeTo(ext, 0)){
                                                Road = true;
                                            }
                        });
                    creep.room.find(FIND_MY_CONSTRUCTION_SITES).forEach((ext) => {  
                                            if(creep.pos.inRangeTo(ext, 0)){
                                                Site = true;
                                            }
                        });
                }
                if(targets == ""){
                    targets = Game.rooms[RoomVar].find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_STORAGE) && structure.energy < structure.energyCapacity;
                    }
                });
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    Moveto.move(creep,targets[0]);
                }
                }else{
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        //console.log('near road '+creep.pos.inRangeTo(nearRoad,1));
                        //console.log('near ConstructionSite '+creep.pos.inRangeTo(constructionsites,1));
                        if(buildInfra == true){
                            if(Road == true || Site == true){
                                //console.log('road= '+Road +creep.name);
                                //console.log('Csite= '+Site +creep.name);
                            }
                            else{
                                if(Sites.length < 30){
                                    creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);//uncomment to build roads on most used paths
                                }
                            }
                        }
                        Moveto.move(creep,targets[0]);
                    }
                }
             /*if(container.length == 0   ) {
                        Game.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                        
                    }*/
        }
	}
};

module.exports = roleTrucker;