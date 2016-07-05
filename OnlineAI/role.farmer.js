var roleFarmer = {

    /** @param {Creep} creep **/
    run: function(creep,No) {
        var Moveto = require('move.to');
        if(creep.memory.HarvestTile != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.FlagName]);
	    }else{
            var sources = creep.room.find(FIND_SOURCES);

            if(creep.harvest(sources[No]) == ERR_NOT_IN_RANGE) {
                    Moveto.move(creep,sources[No]);
                }
            else {
                //console.log(creep.harvest(Game.getObjectById(creep.memory.sourceID)));
                creep.drop(RESOURCE_ENERGY);
            }
	    }
    }
};

module.exports = roleFarmer;