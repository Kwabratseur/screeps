
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy,No) {
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs')
        var BufferThreshold = 10000;

        if(creep.memory.building == undefined){
          creep.memory.building = true;
        }
	    if(creep.memory.building && creep.carry.energy == 0) {
          creep.memory.destRoom = creep.memory.roomFrom
          creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
          creep.memory.destRoom = creep.memory.roomTo;
	        creep.memory.building = true;
	    }
        if(creep.memory.destRoom != creep.room.name){
            Moveto.move(creep,Game.flags[creep.memory.flag]);
        } else{
	    if(creep.memory.building) {

            if(Jobs['Build'](creep)) {
            }else if(Jobs['Repair'](creep)){
	          }else if(Jobs['Upgrade'](creep)){
            }
    }else{
	        if(Game.flags.Dismantle != undefined && No == 0){
  	            if(creep.pos.inRangeTo(Game.flags.Dismantle,6)){
  	               Jobs['Attack'](creep);
	            }else{
	                Moveto.move(creep,Game.flags.Dismantle.pos);
	            }
	        }else{
	            if(AvailableEnergy > creep.room.energyCapacityAvailable*0.5 && (creep.room.storage == undefined || _.sum(creep.room.storage.store) > BufferThreshold)) {
                Jobs['GetEnergy'](creep);
	            }
	        }
        }
    }
}};
module.exports = roleBuilder;

//jobs: Build, Repair, Attack, GetEnergy (old builder)(shift through Jobs??)
//jobs: Upgrade, GetEnergy (old upgrader)
//jobs: Build, GatherEnergy + RoomFrom & RoomTo == claimed/non-owned room(old external builder)
