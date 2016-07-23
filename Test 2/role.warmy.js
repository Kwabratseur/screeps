var roleWArmy = {

    /** @param {Creep} creep **/
    run: function(creep) { //add arguments tactics, not nesecarry as creep contains warband numbr
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs')
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,new RoomPosition(25, 25, creep.memory.destRoom));
	    }else{
          creep.memory.destRoom = creep.memory.roomTo;
	        if(creep.pos.inRangeTo(Game.flags[creep.memory.destRoom],5)){
                Jobs[creep.memory.jobs[0]](creep);
              }else{
	            Moveto.move(creep,Game.flags[creep.memory.destRoom].pos);
	        }
	    }
    }
};

module.exports = roleWArmy;

//roles: tough,healer,ranger,soldier,demolisher,claimer
