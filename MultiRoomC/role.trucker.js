var roleTrucker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var buildInfra = false;

        if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.carry.energy == 0) {
	        creep.memory.harvesting = true;
	    }
	    if(creep.memory.harvesting) {
	        
	        if(creep.memory.HarvestTile != creep.room.name){
	            creep.moveTo(Game.flags[creep.memory.FlagName], {reusePath: 50});
	        }else if(creep.memory.HarvestTile == creep.room.name){
    	        var drops = creep.room.find(FIND_DROPPED_RESOURCES);
    	        var c = 0;
    	        for(i = 1; i < drops.length; i++ ) {
    	            if(drops[i].amount > drops[c].amount){
    	                c = i;
    	            }
    	        }
    	        if(drops.length){
        	        creep.moveTo(drops[c], {reusePath: 50});
        	        creep.pickup(drops[c]);
    	        } 
	        }
	    }
        
        else {//
            var targets = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE);
                    }
            });
            if(targets.length > 0) {
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
                if(Game.spawns.Spawn1.room.energyAvailable < 600){
                    var targets = Game.spawns.Spawn1.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_STORAGE) && structure.energy < structure.energyCapacity;
                    }
                });
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {reusePath: 5});
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
                        creep.moveTo(targets[0], {reusePath: 20});
                    }
                }
             /*if(container.length == 0   ) {
                        Game.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                        
                    }*/
            }
        }
	}
};

module.exports = roleTrucker;