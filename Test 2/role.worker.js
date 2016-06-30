var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        /*var container = creep.room.find(FIND_STRUCTURES, {
            
        });*/
        
        //creep.drop(RESOURCE_ENERGY);
        //console.log(Game.getObjectById('576a9c0357110ab231d88555'));
        if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.sourceID));
            }
        else {
            var linkSend = creep.pos.findInRange(FIND_MY_STRUCTURES, 2,
            {filter: {structureType: STRUCTURE_LINK}})[0];
            if(linkSend){
                if(creep.carry.energy == creep.carryCapacity){
                    if(creep.transfer(linkSend, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    }else{
                        creep.moveTo(linkSend);
                    }
                }
            }else{
                var containers = creep.pos.findClosestByRange(FIND_STRUCTURES,{
                    filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER)
                }
                });
                //console.log(containers)
                creep.moveTo(containers);
                //console.log(creep.harvest(Game.getObjectById(creep.memory.sourceID)));
                creep.drop(RESOURCE_ENERGY);
            }
        }
    }
};

module.exports = roleWorker;