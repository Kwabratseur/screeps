var roleArmy = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var Moveto = require('move.to');
        if(creep.getActiveBodyparts(ATTACK) == 0){
            creep.moveTo(Game.rooms['W17S32'].controller);
        }else{
        if(creep.memory.HarvestTile != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.FlagName]);
	    }else{
	        if(creep.pos.inRangeTo(Game.flags[creep.memory.FlagName],20)){
                var hostiles = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                var hostileBuildings = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                if(hostiles != undefined){
                    if(creep.attack(hostiles) == ERR_NOT_IN_RANGE) {
                        Moveto.move(creep,hostiles, {reusePath: 50});
                    }
                }else{
                    if(creep.attack(hostileBuildings) == ERR_NOT_IN_RANGE) {
                        Moveto.move(creep,hostileBuildings);
                    }
                }
	        }else{
	            Moveto.move(creep,Game.flags[creep.memory.FlagName].pos);
	        }
	    }
    }
    }
};

module.exports = roleArmy;