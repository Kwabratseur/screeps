var roleDefender = {

    /** @param {Creep} creep **/
    run: function(creep, Target) {
        Target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(Target != undefined){
            if(creep.attack(Target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Target, {reusePath: 50});
                }
        }
        else {
            if(Game.flags.Flag2 != undefined){
                if(creep.pos.inRangeTo(Game.flags.Flag2,7)){
                    var hostiles = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    var hostileBuildings = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
                    if(hostiles != null){
                        if(creep.attack(hostiles) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(hostiles, {reusePath: 50});
                        }
                    }else if(hostileBuildings != null){
                        if(creep.attack(hostileBuildings) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(hostileBuildings, {reusePath: 50});
                        }
                    }
                    
            }else{
                creep.moveTo(Game.flags.Flag2.pos, {reusePath: 50});
            }
            }
            else{
                creep.moveTo(Game.rooms[creep.memory.Home].controller.pos);
            }
        }
    }
};

module.exports = roleDefender;
