/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('rand');
 * mod.thing == 'a thing'; // true
 */


var random = {};

random.initTimers = function(){
    var ten = false;
    var fifty = false;
    var five = false;
    if(!Memory.stats){
        Memory.stats = {};
    }
    if(!Memory.SpawnQueue){
        Memory.SpawnQueue = [];
    }

    if(Memory.SpawnActivity == undefined){
        Memory.SpawnActivity = [];
    }
    if(Memory.Spawning == undefined){
        Memory.Spawning = 0; // now using quotient
    }
    if(Memory.SpawnActivityLt == undefined){
        Memory.SpawnActivityLt = [];
    }

    var length = Memory.SpawnActivity.unshift(Memory.Spawning);

    if(Memory.SpawnActivity.length > 2999){
        Memory.SpawnActivity.pop();
    }

    if(Memory.SpawnActivityLt.length > 99){
        Memory.SpawnActivityLt.pop();
    }

    var SpawnActivity = 0;
    for(i in Memory.SpawnActivity){
        SpawnActivity += Memory.SpawnActivity[i];
    }
    if(Memory.roomdb == undefined){
      Memory.roomdb = {};
    }
    Memory.SpawnActivityLt.unshift((SpawnActivity/length)*100);

    if((Memory.tenCounter == undefined )|| (Memory.tenCounter < Game.time)){ //10 ticks counter
        console.log('SpawnActivity 100 ticks ago: '+Memory.SpawnActivityLt[Memory.SpawnActivityLt.length - 1]+'%, Spawnactivity Now: '+Memory.SpawnActivityLt[0]+'%');
        Memory.tenCounter = Game.time + 10;
        ten = true;
    }

    if((Memory.fiveCounter == undefined )|| (Memory.fiveCounter < Game.time)){ //5 ticks counter
        Memory.fiveCounter = Game.time + 5;
        five = true;
    }

    if((Memory.fiftyCounter == undefined) || (Memory.fiftyCounter < Game.time)){ //50 ticks counter
        Memory.fiftyCounter = Game.time + 50;
        if((Memory.failedSpawn == undefined) || (Memory.failedSpawn > 0)){
          Memory.failedSpawn = 0;
        }

        fifty = true;
    }

    a = [ten,five,fifty];
    if(!Memory.rooms){
        Memory.rooms = {};
    }
    return a;
}

random.FlagScan = function(){
  for(var name in Game.flags){
    if(Game.rooms[Game.flags[name].pos.roomName]==undefined && Memory.roomdb[name]==undefined && name.length <= 6){
      Rpos = Game.flags[name].pos
      console.log('Adding flag:'+name+'to roomdb with coords: '+Rpos)
      Memory.roomdb[name] = Rpos;
    }
  }
}

random.ExecCreeps = function(execLim = 0){
    var roleTransporter = require('role.transporter');
    var roleFarmer = require('role.farmer');
    var roleBuilder = require('role.builder');
    var roleArmy = require('role.army');
    var AmountHarvMain = 0;
    var totalCreeps = 0;
    for(var name in Game.creeps) { //make creeps independent! they determine which source! not in this loop
      if((execLim == 0) || (execLim != 0 && Game.cpu.getUsed() < execLim)){
      totalCreeps +=1;
      var creep = Game.creeps[name];
      
      if(creep.memory.role == 'worker') {

              roleBuilder.run(creep);
       }
       
      if(creep.memory.role == 'harvester') {
            roleTransporter.run(creep,AmountHarvMain,false); //last argument:build infrastructure
            AmountHarvMain+=1;
            if(AmountHarvMain == 5){
                AmountHarvMain =0;
            }
        }
      if(creep.memory.role == 'farmer') {
          roleFarmer.run(creep);
      }

       
       if(creep.memory.role == 'army') { // healers can be built with this rolename.
              roleArmy.run(creep);
         }
    }
    }
    return totalCreeps;
}

module.exports = random;
