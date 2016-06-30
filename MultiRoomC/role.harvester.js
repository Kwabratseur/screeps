var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep,No) {
        var buildInfra = true;

        if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.harvesting = false;
	    }
	    if(!creep.memory.harvesting && creep.carry.energy == 0) {
	        creep.memory.harvesting = true;
	    }
	    if(creep.memory.harvesting) {
	        var drops = creep.room.find(FIND_DROPPED_RESOURCES);
	        var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER);
                    }
	        });
	        //console.log('drops:'+(containers.length));
	        var c = 0;
	        for(i = 1; i < drops.length; i++ ) {
	            if(drops[i].amount > drops[c].amount){
	                c = i;
	            }
	        }
	        if(containers[0] != undefined){
	        var k = 0;
	        for(i = 1; i < containers.length; i++ ) {
	            if(_.sum(containers[i].store) > _.sum(containers[k].store)){
	                k = i;
	            }
	        }
	        if(_.sum(containers[k].store) != 0){
	            if(_.sum(containers[No].store) < 200){
	                No = k;
	            }
	            if(containers[No].transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
	                creep.moveTo(containers[No], {reusePath: 40});
	                
	            }else{
	                containers[No].transfer(creep,RESOURCE_ENERGY);
	            }
	        }else if(drops.length>0){
    	            creep.moveTo(drops[0]);
    	            creep.pickup(drops[0]);
	        }
	        }else if(drops.length>0){
    	            creep.moveTo(drops[0], {reusePath: 20});
    	            creep.pickup(drops[0]);
	        } 
            /*else {
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            } */   
	    }else {//
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE);
                }   
            });
            if(targets[0] == null){
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

                        targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                                    }
                        });
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            if(buildInfra == true){
                                if(Road == true || Site == true){
                                    //console.log('road= '+Road +creep.name);
                                    //console.log('Csite= '+Site +creep.name);
                                }else{
                                    if(Sites.length < 10){
                                        creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);//uncomment to build roads on most used paths
                                    }
                                }
                            }
                            creep.moveTo(targets[0], {reusePath: 5});
                        }
                    
                }else{
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {reusePath: 20});
                    }
                }
            
	    }
    }
};

module.exports = roleHarvester;