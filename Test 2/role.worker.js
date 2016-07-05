var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs');
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.Flag]);
	      }else{
            Jobs.MineEnergy(creep)
        }
  }
};

module.exports = roleWorker;
