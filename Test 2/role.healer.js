var roleHealer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                     filter: function(object) {
                         return object.hits < object.hitsMax;
                     }
        });
        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }else{
            if(Game.flags.Flag2 != undefined){
                if(creep.pos.inRangeTo(Game.flags.Flag2,10)){
                
                }else{
                    creep.moveTo(Game.flags.Flag2.pos);
                }
            }else{
                creep.moveTo(Game.flags.Flag1.pos);
            }
        }
    }
};

module.exports = roleHealer;