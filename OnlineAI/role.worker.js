var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var Moveto = require('move.to');
        var Transfer = require('action.transfer');
        var Mem = require('get.memory');
        
        Containers = Mem.run(Memory.rooms[creep.memory.Home].RoomInfo.Containers);
        var containers = creep.pos.findClosestByRange(Containers);
        
        
        
        if(containers != undefined && creep.pos != containers.pos && Math.abs(creep.pos.x-containers.pos.x) < 3 && Math.abs(creep.pos.y-containers.pos.y) < 3){
            Moveto.move(creep,containers);
        }if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {
                Moveto.move(creep,Game.getObjectById(creep.memory.sourceID));
        }
            
        else {
            var linkSend = creep.pos.findInRange(FIND_MY_STRUCTURES, 2,
            {filter: {structureType: STRUCTURE_LINK}})[0];
            if(linkSend != undefined){
                if(creep.carry.energy == creep.carryCapacity){
                    if(creep.transfer(linkSend, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    }else{
                        Moveto.move(creep,linkSend);
                    }
                }
            }else{
                //console.log(creep.harvest(Game.getObjectById(creep.memory.sourceID)));
                creep.drop(RESOURCE_ENERGY);
            }
        }
    }
};

module.exports = roleWorker;