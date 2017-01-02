var roleFarmer = {

    /** @param {Creep} creep **/
    run: function(creep) {
      try{
        var Moveto = require('move.to');
        var jobs = require('creep.jobs');
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.destRoom]);
	      }else{
            creep.memory.destRoom = creep.memory.roomTo;
            jobs[creep.memory.jobs[0]](creep);
              //if(creep.pos.findInRange(FIND_MY_CREEPS,1).length > 1){
              //    creep.say('Hi mate',true);
              //}
        }
  }
  catch(err){
    console.log('error in farmer: '+err);
  }
}
};

module.exports = roleFarmer;
//jobs: MineEnergy (old worker, name it farmer!)
//jobs: MineEnergy + RoomFrom, RoomTo -> old farmer
