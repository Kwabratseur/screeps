var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep, Target) {
        if(creep.attack(Target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Target);
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
                    }
                    
            }else{
                creep.moveTo(Game.flags.Flag2.pos);
            }
            }
            else{
                creep.moveTo(Game.flags.Flag1.pos)
            }
        }
    }
};

module.exports = roleDefender;