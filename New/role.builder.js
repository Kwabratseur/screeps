
var roleBuilder = {

    run: function(creep) {
        try{
        var Moveto = require('move.to');
        var jobs = require('creep.jobs')
        var BufferThreshold = 0;

        if(creep.memory.building == undefined){
          creep.memory.building = true;

        }
	    if(creep.memory.building && creep.carry.energy == 0) {
          creep.memory.destRoom = creep.memory.roomFrom
          creep.memory.building = false;
          creep.say('Bye mates!', true);
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
          creep.memory.destRoom = creep.memory.roomTo;
	        creep.memory.building = true;
	    }
        if(creep.memory.destRoom != creep.room.name){
            Moveto.move(creep,Game.flags[creep.memory.destRoom]);
        } else{
	    if(creep.memory.building) {

            if(jobs[creep.memory.jobs[0]](creep)) {
                //console.log(creep.name+' Executing '+creep.memory.jobs[0]);
            }else if(jobs[creep.memory.jobs[1]](creep)){
                //console.log(creep.name+' Executing '+creep.memory.jobs[1]);
	        }else if(jobs[creep.memory.jobs[2]](creep)){
	            //console.log(creep.name+' Executing '+creep.memory.jobs[2]);
            }
    }else{
	        if(Game.flags.Dismantle != undefined){
  	            if(creep.pos.inRangeTo(Game.flags.Dismantle,6)){
  	               jobs[creep.memory.jobs[3]](creep);
	            }else{
	                Moveto.move(creep,Game.flags.Dismantle.pos);
	            }
	        }else{

	            if(creep.room.storage == undefined || _.sum(creep.room.storage.store) > BufferThreshold) {
                jobs[creep.memory.jobs[4]](creep);
	            }else{
	                Moveto.move(creep,Game.flags[creep.memory.destRoom])
	            }
	        }
        }
    }
  }
  catch(err){
    console.log('error in builder: '+err);
  }
}};
module.exports = roleBuilder;

//jobs: Build, Repair, Attack, GetEnergy (old builder)(shift through jobs??)
//jobs: Upgrade, GetEnergy (old upgrader)
//jobs: Build, GatherEnergy + RoomFrom & RoomTo == claimed/non-owned room(old external builder)
