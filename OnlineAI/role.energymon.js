var Transfer = require('action.transfer');

var roleEnergyMon = {

    run: function(creep,No) {
        var Moveto = require('move.to');
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
                        return (structure.structureType == STRUCTURE_TOWER );
                    }
            });
        var storages = creep.room.storage
        
        if(storages != undefined){
            var link = storages.pos.findInRange(FIND_MY_STRUCTURES, 2,
                {filter: {structureType: STRUCTURE_LINK}})[0]
        }

        //Transfer.to(creep.room.name,Storages,RESOURCE_ENERGY,0);
        //same here, link.length will return 0 because ^^^ element No. 0 is taken. (first result of findInRange)
        if(link != undefined && link.energy > 0 && No == 0){
            if(creep.carry.energy == 0){ // if creep is empty
                if(link.transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                    Moveto.move(creep,link);
                }
            }else{
                if(!Transfer.to(creep,creep.room.name,"Storages",RESOURCE_ENERGY,'zero')){
                    
                }

            }
        }else if(_.sum(storages.store) > 0){ //if storage is not empty
            if(creep.carry.energy == 0){ // if creep is empty
                Transfer.from(creep,creep.room.name,"Storages",RESOURCE_ENERGY,'unfilled');
            }else if(spawn.length > 0){ //if spawn is not full
                if(creep.transfer(spawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ spawn
                    Moveto.move(creep,spawn[0]);
                }
            }else if(extensions_Empty.length > 0){ // if spawn is full and extensions are not
                if(!Transfer.to(creep,creep.room.name,"Extensions",RESOURCE_ENERGY,'unfilled')){
                }
            }else{ 
                if(creep.transfer(towers[No], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ tower
                    Moveto.move(creep,towers[No]);
                }
            }
        }else{ // if storage is empty
            if(spawn.length > 0){ //if spawn is not full
                if(creep.carry.energy == 0){ //if creep is empty
                    if(extensions_Full.length > 0){
                        if(extensions_Full[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ full extensions
                            Moveto.move(creep,extensions_Full[0]);
                        }
                }}else{
                    if(creep.transfer(spawn[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ spawn
                        Moveto.move(creep,spawn[0]);
                    }
                }
            }else{
                if(creep.transfer(extensions_Empty[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ empty extension
                    Moveto.move(creep,extensions_Empty[0]);
                }
            }
        }
        
        
                    
        
    }
};

module.exports = roleEnergyMon;
