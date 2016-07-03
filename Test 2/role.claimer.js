var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        var target = creep.room.controller
        
        if(Game.flags.AttackController != undefined){
            if(creep.pos.inRangeTo(Game.flags.AttackController,10)){ //AttackController
                if(creep.attackController(target) == ERR_NOT_IN_RANGE) {// decreases counter for claimed/reserved controller. 1 tick per 5x CLAIM parts.
                    creep.moveTo(target, {reusePath: 50});
                }
            }else{
                creep.moveTo(Game.flags.AttackController.pos);
            }
        }
        else if(Game.flags.ReserveController != undefined){
            if(creep.pos.inRangeTo(Game.flags.ReserveController,10)){ // ReserveController
                if(creep.reserveController(target) == ERR_NOT_IN_RANGE) { //RESERVE controller with 1 tick per bodypart per tick executed.
                    creep.moveTo(target, {reusePath: 50});    
                }
            }else{
                creep.moveTo(Game.flags.ReserveController.pos, {reusePath: 50});
            }
        }
        else if(Game.flags.ClaimController != undefined){
            if(creep.pos.inRangeTo(Game.flags.ClaimController,10)){ //ClaimController
                if(creep.claimController(target) == ERR_NOT_IN_RANGE) { //CLAIM controller under your control.
                    creep.moveTo(target, {reusePath: 50});
                }
            }else{
                creep.moveTo(Game.flags.ClaimController.pos, {reusePath: 50});
            }
        }
        
        else{
            creep.moveTo(Game.rooms[creep.memory.Home].controller.pos);
        }
    }
};

module.exports = roleClaimer;