var roleArmy = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.HarvestTile != creep.room.name){
	            creep.moveTo(Game.flags[creep.memory.FlagName]);
	    }else{
	        if(creep.pos.inRangeTo(Game.flags[creep.memory.FlagName],25)){
                var hostiles = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                var hostileBuildings = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                if(hostiles != undefined){
                    if(creep.attack(hostiles) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(hostiles, {reusePath: 50});
                    }
                }else{
                    if(creep.attack(hostileBuildings) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(hostileBuildings);
                    }
                }
	        }else{
	            creep.moveTo(Game.flags[creep.memory.FlagName].pos, {reusePath: 50});
	        }
	    }
    }
};

module.exports = roleArmy;