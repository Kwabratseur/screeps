var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var containers = creep.pos.findClosestByRange(FIND_STRUCTURES,{
                    filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER)
                }
        });
        
        if(containers != undefined && creep.pos != containers.pos && Math.abs(creep.pos.x-containers.pos.x) < 3 && Math.abs(creep.pos.y-containers.pos.y) < 3){
            creep.moveTo(containers)
        } if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.sourceID));
        }
            
        else {
            var linkSend = creep.pos.findInRange(FIND_MY_STRUCTURES, 2,
            {filter: {structureType: STRUCTURE_LINK}})[0];
            if(linkSend != undefined){
                if(creep.carry.energy == creep.carryCapacity){
                    if(creep.transfer(linkSend, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    }else{
                        creep.moveTo(linkSend);
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