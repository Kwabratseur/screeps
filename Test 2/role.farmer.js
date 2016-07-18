var roleFarmer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs');
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.destRoom]);
	      }else{
            creep.memory.destRoom = creep.memory.roomTo;
            Jobs[creep.memory.jobs[0]](creep);
        }
  }
};

module.exports = roleFarmer;
//jobs: MineEnergy (old worker, name it farmer!)
//jobs: MineEnergy + RoomFrom, RoomTo -> old farmer
