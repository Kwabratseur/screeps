

var roleEnergyMon = {

    /** @param {Creep} creep **/
    run: function(creep,No) { ////*************CHANGED****
        var spawn = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN ) && structure.energy < structure.energyCapacity;
                    }
            });
        var extensions_Full = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ) && structure.energy == structure.energyCapacity;
                    }
            });
        var extensions_Empty = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ) && structure.energy < structure.energyCapacity;
                    }
            });
        var towers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER ); //***********CHANGED****************
                    }
            });
        var storages = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) > 0) ;
                    }
            });
        var link = storages[0].pos.findInRange(FIND_MY_STRUCTURES, 2,
            {filter: {structureType: STRUCTURE_LINK}})[0];

        if(link.energy > 0 && No == 0){
            if(creep.carry.energy == 0){ // if creep is empty
                if(link.transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                    creep.moveTo(link);
                }
            }else{
                if(creep.transfer(storages[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(storages[0])
                }
            }
        }else if(storages.length > 0){ //if storage is not empty
            if(creep.carry.energy == 0){ // if creep is empty
                    if(storages[0].transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                        creep.moveTo(storages[0]);
                    }
            }else if(spawn.length > 0){ //if spawn is not full
                if(creep.transfer(spawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ spawn
                    creep.moveTo(spawn[0]);
                }
            }else if(extensions_Empty.length > 0){ // if spawn is full and extensions are not
                if(creep.transfer(extensions_Empty[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ empty extension
                    creep.moveTo(extensions_Empty[0]);
                }
            }else{ // if spawn and  extensions are full
                //var c = 0;
                if(towers){   //*****************CHANGED, ADD TO NEW CODE!***********
                    /*if(towers[0].energy >= 800 && towers[0].energy >= towers[1].energy){
                        c = 1;
                    }*/
                    if(creep.transfer(towers[No], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ tower
                        creep.moveTo(towers[No]);
                    }
                }
            }
        }else{ // if storage is empty
            if(spawn.length > 0){ //if spawn is not full
                if(creep.carry.energy == 0){ //if creep is empty
                    if(extensions_Full.length > 0){
                        if(extensions_Full[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ full extensions
                            creep.moveTo(extensions_Full[0]);
                        }
                }}else{
                    if(creep.transfer(spawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ spawn
                        creep.moveTo(spawn[0]);
                    }
                }
            }
        }
        
        
                    
        
    }
};

module.exports = roleEnergyMon;