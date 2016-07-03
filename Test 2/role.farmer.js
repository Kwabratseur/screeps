var roleFarmer = {

    /** @param {Creep} creep **/
    run: function(creep,No) {
        if(creep.memory.HarvestTile != creep.room.name){
	            creep.moveTo(Game.flags[creep.memory.FlagName], {reusePath: 10});
	    }else{
            var sources = creep.room.find(FIND_SOURCES);

            if(creep.harvest(sources[No]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[No], {reusePath: 5});
                }
            else {
                //console.log(creep.harvest(Game.getObjectById(creep.memory.sourceID)));
                creep.drop(RESOURCE_ENERGY);
            }
	    }
    }
};

module.exports = roleFarmer;