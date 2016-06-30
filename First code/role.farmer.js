var roleFarmer = {

    /** @param {Creep} creep **/
    run: function(creep,No) {
        if(creep.memory.HarvestTile != creep.room.name){
	            creep.moveTo(Game.flags[creep.memory.FlagName]);
	    }else{
            var sources = creep.room.find(FIND_SOURCES);

            if(creep.harvest(sources[No]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[No]);
                }
            else {
                //console.log(creep.harvest(Game.getObjectById(creep.memory.sourceID)));
                creep.drop(RESOURCE_ENERGY);
            }
	    }
    }
};

module.exports = roleFarmer;