

var roleEnergyMon = {

    /** @param {Creep} creep **/
    run: function(creep) {
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
                        return (structure.structureType == STRUCTURE_TOWER ) && structure.energy < structure.energyCapacity;
                    }
            });
        var storages = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) > 0) ;
                    }
            });
/*
    - This creepy creep does the following:
    if storage fuller than empty:
        1.first Move energy from storage to spawn
        2.then Move energy from storage to extensions
    if storage empty and spawn not
        1.Move energy from extensions to spawn
*/            
        if(storages.length > 0){ //if storage is not empty
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
                if(creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ tower
                    creep.moveTo(towers[0]);
                }
            }
        }else{ // if storage is empty
            if(spawn.length > 0){ //if spawn is not full
                if(creep.carry.energy == 0){ //if creep is empty
                    if(extensions_Full[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ full extensions
                        creep.moveTo(extensions_Full[0]);
                    }
                }else{
                    if(creep.transfer(spawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ spawn
                        creep.moveTo(spawn[0]);
                    }
                }
            }
        }
        
        
                    
        
    }
};

module.exports = roleEnergyMon;