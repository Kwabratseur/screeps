var MonMan = {};
var Mem = require('get.memory');
var CreepBuilder = require('creep.builder');
var roleTransporter = require('role.transporter');
var roleBuilder = require('role.builder');
var roleFarmer = require('role.farmer');
var roleArmy = require('role.army');


//4 types of creeps in 1 role and 2 jobs!
var jobGatherer = ['GatherEnergy','FillStructures']; //dest == to -> Gatherer, dest != to -> trucker
var jobDistributor = ['GetEnergy','FillStructures']; //dest == to -> Emon, dest != to -> distributor
//harvester jobs
var jobMiner = ['MineEnergy']; //dest == to -> Miner, dest != to -> external room Miner
//Miner jobs
var jobWorker = ['Build','Repair','Upgrade','Attack','GetEnergy'];
var jobUpgrader = ['Upgrade','Build','Repair','Attack','GetEnergy'];
var jobFixer = ['Repair','Upgrade','Build','Attack','GetEnergy'];
//worker jobs
var jobArmy = ['Attack'];
//army jobs

MonMan.monitor = function(MyRoom){//add switch to room -> if true creeps may withdraw, else wait (needed for creep BP prioritizing)

    var RoomCreeps = _.filter(Game.rooms[MyRoom].find(FIND_MY_CREEPS), (creep) => (creep.memory.destRoom == MyRoom)); //creeps destination in this room
    var farmersPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'farmer'));
    var HarvestersPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'harvester'));
    var WorkersPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'worker'));
    var ArmyPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'army'));
    var controller = Game.rooms[MyRoom].controller;
    var EnergySpawn = Game.rooms[MyRoom].energyAvailable;
    var Buffer = Game.rooms[MyRoom].storage;
    var sources = Mem.run(Memory.rooms[MyRoom].RoomInfo.Sources);
    var hostiles = 0// Game.rooms[MyRoom].find(FIND_HOSTILE_CREEPS);

    var farmerInQueue = 0;
    var workerInQueue = 0;
    var harvesterInQueue = 0;
    var armyInQueue = 0;



    var FarmDis = 1; //fill in some standard distribution numbers upon creation, fit for starting room.
    var TransDis = 1;
    var WorkDis = 0.5;
    var ArmyDis = 1; //manage this further with manager.
    //var NeededCreeps = Memory.rooms[MyRoom].creepInfo.Farmers

    var farmers = 0; //creep role farmer/externalfarmer
    var transporters = 0; //creep role transporter/harvester/Energymon
    var workers = 0; //creep role Builder/upgrader/externalBuilder
    var army = 0; //creep role Army/defender/healer/ranged_army

    var FarmParts = 0;
    var FarmableEnergy = 0;
    var CarryParts = 0;
    var TravelLoss = 0;

    if(Game.rooms[MyRoom].controller.level < 4){
        workers = 2; //2 workers if low CL
        army = 0; // no stationary army if low CL
        if(hostiles){
          army = 2;
        }
    }else{
        workers = 3; //roulate priorities of buildjobs per creep
        army = Math.round(Game.rooms[MyRoom].controller.level/2); //stationary army
    }
    if(Buffer != undefined && Buffer.length > 0){
        if(_.sum(Buffer[0].store) > 60000 && Game.rooms[MyRoom].controller.level > 3){
            workers += Math.round((_.sum(storages[0].store)-60000)/10000)
        }
    }
    for(var i in sources){ //again, roulate jobs per creep(energymon/gatherer)
      FarmableEnergy += sources[i].energyCapacity;
      TravelLoss += (sources[i].pos.getRangeTo(controller)+1)*2;
      farmers +=1;//farmers are determined by amount of sources
    }
    var travelconst = 20;
    if(TravelLoss > 150){
      travelconst = 50;
    }
    transporters = Math.round(TravelLoss/travelconst);

    if(Mem.run(Memory.rooms[MyRoom].RoomInfo.Links)[0]){
      transporters -= 1;
    }


    for(var i in HarvestersPresent){
      CarryParts += HarvestersPresent[i].getActiveBodyparts(CARRY);
    }
    for(var i in farmersPresent){
      FarmParts += farmersPresent[i].getActiveBodyparts(WORK);
    }

    var EnergyCycle = FarmParts*TravelLoss; // energy produced in one pickup and drop cycle
    var MinCarryParts = Math.round((EnergyCycle)/50)+1; //min carry parts to displace all mined energy+1
    var InQueue = Memory.SpawnQueue;
    if(InQueue != undefined){
      for(i = 0; i < InQueue.length;i++){
        if(InQueue[i][3] == MyRoom ){
          if(InQueue[i][2] == 'farmer'){
            farmerInQueue +=1;
          }if(InQueue[i][2] == 'worker'){
            workerInQueue +=1;
          }if(InQueue[i][2] == 'harvester'){
            harvesterInQueue +=1;
          }if(InQueue[i][2] == 'army'){
            armyInQueue +=1;
          }
        }
      }
    }

    if((farmersPresent.length + farmerInQueue) < farmers ){
      console.log('adding farmer to queue');
      Mem.AddtoQueue(0.1,CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable,Game.rooms[MyRoom].energyAvailable,3,"Work"),'farmer',MyRoom,MyRoom,MyRoom,MyRoom,jobMiner);
    }
    if((HarvestersPresent.length + harvesterInQueue) < transporters ){
      var priority = 0.3;
      if(HarvestersPresent.length + harvesterInQueue == 0){
        priority = 0;
      }
      Mem.AddtoQueue(priority,CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable,Game.rooms[MyRoom].energyCapacityAvailable,(CarryParts-MinCarryParts),"Transport"),'harvester',MyRoom,MyRoom,MyRoom,MyRoom,jobGatherer);
        console.log('adding harvester to queue');
    }
    if((WorkersPresent.length + workerInQueue) < workers ){
      Mem.AddtoQueue(0.5,CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,Game.rooms[MyRoom].energyAvailable,20,"Build"),'worker',MyRoom,MyRoom,MyRoom,MyRoom,jobWorker);
        console.log('adding worker to queue');
    }
    if((ArmyPresent.length + armyInQueue) < army ){
      Mem.AddtoQueue(0.8,CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,Game.rooms[MyRoom].energyAvailable,15,"Army"),'army',MyRoom,MyRoom,MyRoom,MyRoom,jobArmy);
        console.log('adding harvester to queue');
    }
    if(Memory.rooms[MyRoom].creepInfo == undefined || RoomCreeps.length < (farmers+transporters+workers+army)){
      Mem.setroomcreep(MyRoom,farmers,transporters,workers,army,FarmDis,TransDis,WorkDis,ArmyDis);
    }

    console.log('Room: '+MyRoom+'. Farmers: '+farmers+' ,Transport: '+transporters+' ,Workers: '+workers+' ,Army: '+army+'. Ticks for Pickup and drop: '+TravelLoss+' ,Energy produced per cycle: '+EnergyCycle+' ,Minimum inventory needed: '+MinCarryParts);
}


MonMan.SpawnCreep = function(){
  var availableEnergies = [];
  var FillDegree = [];
  var MyRoom = [];
  var CreeptoSpawn = Memory.SpawnQueue.shift();

  for(var name in Game.spawns){ // Try to include All code except for FarmRoom code in this loop. Maybe multiple rooms can be controlled in this way.
    MyRoom.unshift(Game.spawns[name].room.name);    //Then offcourse make everything depend from variable MyRoom(mostly the case)
    availableEnergies.unshift(Game.rooms[MyRoom].energyAvailable);
    FillDegree.unshift(Game.rooms[MyRoom].energyAvailable/Game.rooms[MyRoom].energyCapacityAvailable);
  }
  var c = 0;
  var j = 0;
  for (i = 0; i < FillDegree.length; i++){
      if(FillDegree[i] > FillDegree[c]){
          c = i;
      }
      if(availableEnergies[i] > availableEnergies[j]){
          j = i;
      }
  }
  if(CreeptoSpawn != undefined){
    var body = CreepBuilder.Rebuild(CreeptoSpawn[1]);
    //console.log(body);

    var newName = Mem.run(Memory.rooms[MyRoom[j]].RoomInfo.Spawns)[0].createCreep(body, undefined, {role: CreeptoSpawn[2],destRoom: CreeptoSpawn[3],roomTo: CreeptoSpawn[4],roomFrom: CreeptoSpawn[5],flag: CreeptoSpawn[6],jobs: CreeptoSpawn[7]});
    console.log(newName);
    if(newName == -6){
      Memory.WithdrawLight = false; // if this is set to false, no energy may be picked up at any extension or spawn.
    }else{
      Memory.WithdrawLight = true;
    }if(newName == -10){//purges corrupt creeps from memory

    }else if(newName < 0){
      if(CreeptoSpawn != undefined){
        Memory.SpawnQueue.unshift(CreeptoSpawn);
      }
      //console.log(CreeptoSpawn[7]);
      //console.log(Mem.run(Memory.rooms[MyRoom[j]].RoomInfo.Spawns)[0]);
      console.log(FillDegree);
    }
  }
}


//put memory functions in get.memory module.

MonMan.manager = function(MyRoom,drops,buildInfra,AvailableEnergy,Sites,sources){
//regulate roomswitch for withdraws
if(Memory.rooms[MyRoom].creepInfo == undefined){
  Mem.setroomcreep(MyRoom,0,0,0,0,0,0,0,0);
}
var IDCounter = 0;
var SourceToggle = 0;
var BuildCounter = 0;
var AmountWorkMain = 0;
var AmountHarvMain = 0;
var Creephit = false;
var EmonCounter = 0;

var gatherer = 0;
var distributor = 0;
var miner = 0;
var worker = 0;
var upgrader = 0;
var fixer = 0;
var army = 0;

var dropsamount = 0;
  for(i = 0; i < drops.length; i++){
    dropsamount += drops[i].energy
}
if(dropsamount > 1000){
  Memory.rooms[MyRoom].creepInfo.Transporters[1] = 1;
}else{
  Memory.rooms[MyRoom].creepInfo.Transporters[1] = 0.5;
}

if(Sites.length > 5){
  Memory.rooms[MyRoom].creepInfo.Workers[1] = 1;//100% worker if more than 5 buildingsites are available
}

var Dgatherer = Math.round(Memory.rooms[MyRoom].creepInfo.Transporters[0]*Memory.rooms[MyRoom].creepInfo.Transporters[1]);
var Ddistributor = Memory.rooms[MyRoom].creepInfo.Transporters[0]-Dgatherer;
var Dworker = Math.round(Memory.rooms[MyRoom].creepInfo.Workers[0]*Memory.rooms[MyRoom].creepInfo.Workers[1]);
var Dupgrader = Math.round(0.3*(Memory.rooms[MyRoom].creepInfo.Workers[0] - Dworker)); //30% of remainder is upgrader
var Dfixer = Memory.rooms[MyRoom].creepInfo.Workers[0] - (Dupgrader+Dworker);// remaining 70% is fixer, repairs stuff.
console.log('Desired Gatherers:'+Dgatherer+', Distributors:'+Ddistributor+', Workers:'+Dworker+', Upgraders:'+Dupgrader+', Fixers:'+Dfixer);



 //manager will setup creep jobs and see if there is a possible better distribution
  for(var name in Game.creeps) {
      var creep = Game.creeps[name];
      if(creep.memory.jobs){
        if((jobGatherer[0] == creep.memory.jobs[0]) && (jobGatherer[jobGatherer.length] == creep.memory.jobs[creep.memory.jobs.length])){
          gatherer +=1;
        }if((jobMiner[0] == creep.memory.jobs[0]) && (jobMiner[jobMiner.length] == creep.memory.jobs[creep.memory.jobs.length])){
          miner +=1;
        }if((jobArmy[0] == creep.memory.jobs[0]) && (jobArmy[jobArmy.length] == creep.memory.jobs[creep.memory.jobs.length])){
          army +=1;
        }if((jobDistributor[0] == creep.memory.jobs[0]) && (jobDistributor[jobDistributor.length] == creep.memory.jobs[creep.memory.jobs.length])){
          distributor +=1;
        }if((jobUpgrader[0] == creep.memory.jobs[0]) && (jobUpgrader[jobUpgrader.length] == creep.memory.jobs[creep.memory.jobs.length])){
          upgrader +=1;
        }if((jobWorker[0] == creep.memory.jobs[0]) && (jobWorker[jobWorker.length] == creep.memory.jobs[creep.memory.jobs.length])){
          worker +=1;
        }if((jobFixer[0] == creep.memory.jobs[0]) && (jobFixer[jobFixer.length] == creep.memory.jobs[creep.memory.jobs.length])){
          fixer +=1;
        }
      }


      if(creep.memory.role == 'harvester') {
          roleTransporter.run(creep,AmountHarvMain,buildInfra);
          AmountHarvMain+=1;
          if(AmountHarvMain == 5){
              AmountHarvMain =0;
          }
      }

      if(creep.memory.role == 'farmer') {
          if(AmountWorkMain < sources.length){
              if(!creep.memory.sourceID){
                for(var i in sources){
                  if(sources[i].pos.findInRange(FIND_MY_CREEPS,2).length < 1){
                    creep.memory.sourceID = sources[i].id;
                  }
                }

              }
              AmountWorkMain+=1;
          roleFarmer.run(creep);
        }else{
          AmountWorkMain = 0;
        }
        }
        if(creep.memory.role == 'worker') {

            roleBuilder.run(creep,AvailableEnergy,BuildCounter,Sites);
            BuildCounter +=1;
        }

        if(creep.memory.role == 'army') { // healers can be built with this rolename.
            roleArmy.run(creep);
        }
  }
  if(Dgatherer != gatherer || Dworker != worker){
    MonMan.Redistribute(Dgatherer,Ddistributor,Dworker,Dupgrader,Dfixer);
  }
  console.log('Total Gatherers:'+gatherer+', Distributors:'+distributor+', Workers:'+worker+', Upgraders:'+upgrader+', Fixers:'+fixer);
  //check the room job mem with creep job mem.
  //the first one will be updated every 10 ticks.
  // when a better distribution of jobs is possible, apply it.

}

MonMan.TerritoryManager = function(){
  //console.log(Memory.roomdb);
  for(var i in Memory.roomdb){
    var rooms = Memory.roomdb[i];
    if(!rooms[1]){
      console.log('scouting possible territory, room '+rooms[0]);
    }
    //if(Game.rooms[flags] != undefined && ((Game.rooms[flags].controller.reservation != undefined && Game.rooms[flags].controller.reservation.username == 'Kwabratseur') || Game.rooms[flags].controller.level == 0)){
        //flagarray.unshift(Game.rooms[flags].name);
      //if(Game.rooms[flags].controller.my){

      //}

      //}
    }

}

MonMan.Redistribute = function(Gatherer,Distributor,Worker,Upgrader,Fixer){
  for(var name in Game.creeps) {
      var creep = Game.creeps[name];
      if(creep.memory.role == 'harvester') {
      if(Gatherer != 0){
        creep.memory.jobs = jobGatherer;
        Distributor -= 1;
      }else if(Distributor != 0){
        creep.memory.jobs = jobDistributor;
        Gatherer -=1;
      }
      }

      if(creep.memory.role == 'worker') {
        if(Upgrader != 0){
          creep.memory.jobs = jobUpgrader;
          Upgrader -= 1;
        }else if(Fixer != 0){
          creep.memory.jobs = jobFixer;
          Fixer -=1;
        }else if(Worker != 0){
          creep.memory.jobs = jobWorker;
          Worker -=1;
        }
      }
    }
}

module.exports = MonMan;
