var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep,No,buildInfra) {
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs');

      if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity) {
          creep.memory.destRoom = creep.memory.roomFrom
          creep.memory.harvesting = false;
          creep.say('Bye mate!', true);
            
	    }
	    if(!creep.memory.harvesting && creep.carry.energy == 0) {
          creep.memory.destRoom = creep.memory.roomTo;
	        creep.memory.harvesting = true;
	        creep.say('Energiez!', true);
	    }
      /*for(var i in Jobs){
        console.log(Jobs[i](creep));
      }*/ //Nice! creep jobs can be accesed as name like this. let's try!
      if(creep.memory.destRoom != creep.room.name){
          Moveto.move(creep,Game.flags[creep.memory.destRoom]);
      } else{//everything from here should be put in a creepJob module jobname: Gather, preferavly split it in two.
    	    if(creep.memory.harvesting) {
              Jobs[creep.memory.jobs[0]](creep); // <- this allows the AI to pick a Job for a creep of certain type.
              //by putting the JobName in a variable in the function. Or in creep-memory.
              //This may be better, in this way the AI only needs to edit the creep memory
              //for changing it's behaviour.
              //also the creep-body may be standardized further in this manor.
              //this file is a good example for that
          }

          else {
              Jobs[creep.memory.jobs[1]](creep,buildInfra); //mind different input variables per job.
	          }
          }
        }
};

module.exports = roleTransporter;

//jobs: GatherEnergy, FillStructures, (old harvester)
//jobs: GetEnergy, FillStructures, EmptyLink (old EnergyManager)
//jobs: GatherEnergy, FillStructures + RoomFrom, RoomTo -> old trucker
//jobs: GetEnergy, FillStructures + RoomFrom, RoomTo -> equalizer, transport between rooms
