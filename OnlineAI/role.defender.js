var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep, Target) {
        Target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(creep.getActiveBodyparts(ATTACK) == 0){
            creep.moveTo(Game.rooms['W17S32'].controller.pos);
        }else{
        if(Target != undefined){
            if(creep.attack(Target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Target);
                }
        }
        else {
            if(Game.flags.Flag2 != undefined){
                if(creep.pos.inRangeTo(Game.flags.Flag2,20)){
                    var hostiles = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    var hostileBuildings = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                    if(hostiles != null){
                        if(creep.attack(hostiles) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(hostiles);
                        }
                    }else if(hostileBuildings != null){
                        if(creep.attack(hostileBuildings) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(hostileBuildings);
                        }
                    }else{
                        creep.moveTo(Game.flags[creep.memory.Home].pos);
                    }
                    
            }else{
                creep.moveTo(Game.flags.Flag2.pos);
            }
            }
            else{
                creep.moveTo(Game.flags[creep.memory.Home].pos);
            }
        }
    }
    }
};

module.exports = roleDefender;
