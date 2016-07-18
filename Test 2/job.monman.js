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

MonMan.InQueue = function(MyRoom,Role){
  var creepInQueue = 0;
  var InQueue = Memory.SpawnQueue;
  if(InQueue != undefined){
    for(i = 0; i < InQueue.length;i++){
      if(InQueue[i][3] == MyRoom ){
        if(InQueue[i][2] == Role){
          creepInQueue +=1;
      }
    }
  }
  return creepInQueue;
}else{
  return 0;
}
}

MonMan.CreepsInRoom = function(MyRoom){
  var RoomCreeps = _.filter(Game.rooms[MyRoom].find(FIND_MY_CREEPS), (creep) => (creep.memory.destRoom == MyRoom)); //creeps destination in this room
  var FarmersPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'farmer'));
  var HarvestersPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'harvester'));
  var WorkersPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'worker'));
  var ArmyPresent = _.filter(RoomCreeps, (creep) => (creep.memory.role == 'army'));

  return [RoomCreeps,FarmersPresent,HarvestersPresent,WorkersPresent,ArmyPresent];
}

MonMan.monitor = function(MyRoom){

    var PresentCreeps = MonMan.CreepsInRoom(MyRoom);
    var RoomCreeps = PresentCreeps[0]; //creeps destination in this room
    var farmersPresent = PresentCreeps[1];
    var HarvestersPresent = PresentCreeps[2];
    var WorkersPresent = PresentCreeps[3];
    var ArmyPresent = PresentCreeps[4];
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
    farmerInQueue = MonMan.InQueue(MyRoom,'farmer');
    workerInQueue = MonMan.InQueue(MyRoom,'worker');
    harvesterInQueue = MonMan.InQueue(MyRoom,'harvester');;
    armyInQueue = MonMan.InQueue(MyRoom,'army');;

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

    //console.log('Room: '+MyRoom+'. Farmers: '+farmers+' ,Transport: '+transporters+' ,Workers: '+workers+' ,Army: '+army+'. Ticks for Pickup and drop: '+TravelLoss+' ,Energy produced per cycle: '+EnergyCycle+' ,Minimum inventory needed: '+MinCarryParts);
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
    var body = CreepBuilder.Rebuild(CreeptoSpawn[1],0);
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

MonMan.manager = function(MyRoom,drops,buildInfra,AvailableEnergy,Sites,sources){
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
  //console.log('Desired Gatherers:'+Dgatherer+', Distributors:'+Ddistributor+', Workers:'+Dworker+', Upgraders:'+Dupgrader+', Fixers:'+Dfixer);

 //manager will setup creep jobs and see if there is a possible better distribution
  for(var name in Game.creeps) {
      var creep = Game.creeps[name];
      if(creep.memory.destRoom == MyRoom){ //controls creeps with this room as destination
        if(creep.memory.jobs && (creep.memory.roomFrom == MyRoom) && (creep.memory.roomTo == MyRoom)){ //redistributes creeps active in this room
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
  }
  if(Dgatherer != gatherer || Dworker != worker){
    MonMan.Redistribute(MyRoom,Dgatherer,Ddistributor,Dworker,Dupgrader,Dfixer);
  }
  //console.log('Total Gatherers:'+gatherer+', Distributors:'+distributor+', Workers:'+worker+', Upgraders:'+upgrader+', Fixers:'+fixer);
}



MonMan.EditDestination = function(RoomTo,Amount,Role){
  var WorkingCreeps = 0;
  var CreepDemand = 0;
  for(var room in Memory.rooms){
    CreepDemand += (Memory.rooms[room].creepInfo.Farmers[0]+Memory.rooms[room].creepInfo.Transporters[0]+Memory.rooms[room].creepInfo.Workers[0]+Memory.rooms[room].creepInfo.Army[0]);
    if(Memory.creeps.length > 0){
    for(var name in Memory.creeps){
      creep = Game.creeps[name];
      if(creep.memory.destRoom == room){
        WorkingCreeps +=1;

        //if(creep.memory.destRoom == RoomTo)
      }
    }
  }
  }
  var creepInQueue = MonMan.InQueue(RoomTo,Role);
  if(creepInQueue != undefined){
    Amount -= creepInQueue;
  }
  if((WorkingCreeps > CreepDemand*0.8) && (Amount > 0)){

    for(var name in Memory.creeps){
      if(Memory.creeps[name].destRoom == RoomTo){
        Amount -=1; //also remove if the creep already exists
      }
      if(Memory.creeps[name].role == Role){
        Memory.creeps[name].roomTo == RoomTo;
        Amount -= 1;
      }
    }
    console.log('Working creeps:'+WorkingCreeps+' CreepDemand:'+CreepDemand);
  }
  if(Amount == 0){
    return true;
  }else{
    return false;
  }
}


MonMan.TerritoryMonitor = function(){
  //console.log(Memory.roomdb);
  //add variables for creeps and count them in spawnqueue and in game.creeps.
  //add these values to the array: [rooms[0],false,1,0,0,0,0,0]     0                       7
  //look at considerTerritory function, already initializes [Territory[i],false,0,0,0,0,0,0]).
  // #######################################################Roomname,farmflag,stateflag,farmers, transporters,workers,army, killed amount.

  //console.log('TerritoryManager is runned');
  var filldegrees = [];
  var energyAvailable = [];
  var StorageSum = 0;
  var StorageEnergy = [];
  var c = 0;
  var Ownedrooms = [];
  console.log('testy');
  //####Initialization of information about owned rooms, is used to determine target rooms for resources
  for(var i in Game.rooms){
    Ownedrooms.push(Game.rooms[i].name);
    var OwnedRooms = Game.rooms[i].name;
    var storages = Mem.run(Memory.rooms[OwnedRooms].RoomInfo.Storages);
    filldegrees.push(Game.rooms[OwnedRooms].energyAvailable/Game.rooms[OwnedRooms].energyCapacityAvailable);
    energyAvailable.push(Game.rooms[OwnedRooms].energyAvailable);
    if(energyAvailable[i] > energyAvailable[c]){
      c = i;
    }
    if(storages.length > 0){
      StorageEnergy.push(_.sum(storages[0].store)); //use this info for redistributing.
      StorageSum += (_.sum(storages[0].store));
      //(storageEnergy[i]/Storagesum *100), if more then x % deviation between highest and lowest, transfer. Use terminal if possible.
    }
  }
  var target = 0;
  var beststorage = 0;
  if(StorageEnergy.length > 0){
    for(var i in StorageEnergy){
      if((storageEnergy[i]/StorageSum) < (storageEnergy[target]/StorageSum)){
        target = i;
      }else{
        beststorage = i;
      }
    }
    if(((storageEnergy[beststorage]/StorageSum)-(storageEnergy[target]/StorageSum))*100 > 20 ){
      if(MonMan.EditDestination(Ownedrooms[target],1,'transporter')){//needs additional work to make sure the correct job is present in this creep
      }
    }
  }
  //####End of Initialization


  //###Looping through surrounding rooms, dispatching scouts and claim free rooms as farms.
  //###If npc/players are detected, they will be attacked. If they kill more then 20 creeps within X turns, we leave them alone.
  for(var i in Memory.roomdb){
    var rooms = Memory.roomdb[i];
    var creeps = MonMan.CreepsInRoom(rooms[0]);//RoomCreeps,FarmersPresent,HarvestersPresent,WorkersPresent,ArmyPresent
    if(!rooms[1] && rooms[2] != 2){
    //if room is flagged false and not in red state

      if(rooms[6] < 1){
      //if no scouts are dispatched
        rooms[6] += 1;
        if(MonMan.EditDestination(rooms[0],1,'army')){
        }else{           //priority,layout,role,destination,To,From,Flag,jobarray
          //Mem.AddtoQueue(0.9,CreepBuilder.Layout(energyAvailable[c],energyAvailable[c],4,"Army"),'army',rooms[0],rooms[0],rooms[0],rooms[0],jobArmy);
            console.log('adding scout for '+rooms[0]+' to queue');
        }
      }

      if(Game.rooms[rooms[0]] != undefined){

      //if scouts arive
        if(!Game.flags.rooms[0]){
        //place flag because object is accessible now
        var sourcess = [];
          Game.rooms[rooms[0]].createFlag(25,25,rooms[0]);
          var sources = Game.rooms[rooms[0]].find(FIND_SOURCES);
          for(var i in sources){ //iterate through object and stor Id's for Game.getObjedtById();
              sourcess.push(sources[i].id);
          }
          Memory.roomdb[i].sources = sourcess
        }

        if(Game.rooms[room[0]].controller.level == 0 || rooms[7] < 20){
        //if controller is reserved or not owned
          if(Game.rooms[room[0]].pos.findClosestByRange(FIND_HOSTILE_CREEPS)){
          //if hostile creeps are present (player or npc)
            rooms[1] = false; //keep it in this loop
            rooms[2] = 1; //orange state
            rooms[3] = 0;
            rooms[4] = 0;
            rooms[5] = 0;
            Memory.roomdb[i] = rooms; //orange state, NPC's
            //try to clear the room, count amount of killed creeps and don't exceed x.
          }else{
            rooms[1] = true;
            rooms[2] = 0;
            rooms[3] = Memory.roomdb[i].sources.length
            rooms[6] = 1;
            Memory.roomdb[i] = rooms; //green state, send farmers
          }
        }else{
          //if room is controlled by a player, or more then 20 creeps are killed within x ticks
          rooms[1] = false;
          rooms[2] = 2;
          Memory.roomdb[i] = rooms; //red state, don't farm.
        }
      }else{

        Memory.roomdb[i] = rooms;
      }
    }
    if(rooms[1] && (rooms[2] == 0)){
    //if room is safe and farmable
      if(Game.rooms[room[0]].pos.findClosestByRange(FIND_HOSTILE_CREEPS)){
        rooms[2] = 1; //set to orange state if it is a farm and enemies are detected.
      }
      if(rooms[4] == 0){
        var travelLoss = Activerooms.sources[0].pos.getRangeTo(Game.rooms[Ownedrooms].controller)*2;
      //set amount of harvesters, based on one source distance to room with lowest percentage filled storage.
        rooms[4] = Math.round(TravelLoss/200);
      }

      if(creeps[1].length < rooms[3]){
      //build /redistribute creeps farmer job.
        if(MonMan.EditDestination(rooms[0],rooms[3],'farmer')){
        }else if(MonMan.InQueue(rooms[0], 'farmer') < 1){           //priority,layout,role,destination,To,From,Flag,jobarray
          Mem.AddtoQueue(0.6,CreepBuilder.Layout(energyAvailable[c],energyAvailable[c],3,"Work"),'farmer',rooms[0],rooms[0],rooms[0],rooms[0],jobMiner);
          console.log('adding farmer for '+rooms[0]+' to queue');
        }
      }
      if(creeps[2].length < rooms[4]){
      //build /redistribute creeps harvester job.
        if(MonMan.EditDestination(rooms[0],rooms[3],'transporter')){
        }else if(MonMan.InQueue(rooms[0], 'transporter') < 1){           //priority,layout,role,destination,To,From,Flag,jobarray
          var FarmParts = 0;
          var CarryParts = 0;
          var travelLoss = rooms.sources[0].pos.getRangeTo(Game.rooms[Ownedrooms[target]].controller)*2;
          for(var i in creeps[1]){
            //FarmParts += creeps[1][i].getActiveBodyparts(WORK);
          }
          CarryParts = Math.round((FarmParts*travelLoss)/150)+1;
          Mem.AddtoQueue(0.6,CreepBuilder.Layout(energyAvailable[c],energyAvailable[c],CarryParts,"Transport"),'transporter',rooms[0],rooms[0],Ownedrooms[target],rooms[0],jobGatherer);
          console.log('adding transporter for '+rooms[0]+' to queue');
        }
      }
    Memory.roomdb[i] = rooms;
    }
    if(rooms[2] != 0){
    //if room is not safe
      if(rooms[2] == 1){
      //if creeps are present upon entry and controller level == 0
        if(rooms[7] > 5){
          //more aggresive defend/attack code

        }

    }


  }
  }
}



/*

-Add function which checks the energydistribution in different rooms and sends external harvesters to the best destination
-Also include editing destinations to make harvesters transport energy between rooms
-control all creeps which are not controlled by MonMan.manager with this function
-manage the amount of creeps in the rooms(non-fighters and fighters), try to reuse functions
-add warband code in here. attack & heal creeps stay within x squares of eachother
--> add memory entry with 1st creep-name as warband name, wait for the creeps to regroup(2 healers, 4 attackers, 1 tank, 1 worker)
--> make additional job for commanding these creeps
-maybe add tank-creep which consists of only tough-move parts. Send this one in first to tank dumb-coded rooms?

*/


//this function puts all adjacent tiles to [roomtest] in roomdb memory. This will trigger
MonMan.ConsiderTerritory = function(roomtest){
  var alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  var x = 'A';
  var xNo = [];
  var y = 'A';
  var yNo = [];
  var temp = [];
  var c = 2;
  var Territory = [];
  for(i in alphabet){
      if(roomtest.charAt(0) == alphabet[i]){
          x = alphabet[i]
      }
      if(roomtest.charAt(2) == alphabet[i] || roomtest.charAt(3) == alphabet[i]){
          y = alphabet[i]
      }

  }
  temp = roomtest.split(y);
  yNo[0] = temp[1];
  yNo[1] = (yNo[0])++;
  yNo[2] = (temp[1])-1;
  xNo[0] = temp[0].split(x)[1];
  xNo[1] = (xNo[0])-1;
  xNo[2] = (xNo[0])++;

  for(var i in yNo){
    for(var j in xNo){

      Territory.push(x+xNo[j]+y+yNo[i]);
    }
  }
  console.log(Territory);
  for(var i in Territory){
  //
    if(Game.rooms[Territory[i]] != undefined){
        console.log(Territory[i]);
        console.log(Game.rooms[Territory[i]].createFlag(25, 25, Territory[i]));
        Memory.roomdb.unshift([Territory[i],true,0,0,0,0,0,0]); //0 == green, 1 == NPC's, orange 2== player, red. true means it is a farmed tile.
    }else{
      Memory.roomdb.unshift([Territory[i],false,0,0,0,0,0,0]);// 0 == scout if false, 1 == hostile, attack and farm
    }
  }
}

MonMan.Redistribute = function(MyRoom,Gatherer,Distributor,Worker,Upgrader,Fixer){
  for(var name in Game.creeps) {
      var creep = Game.creeps[name];
      if(creep.memory.destRoom == MyRoom){
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
}

module.exports = MonMan;
