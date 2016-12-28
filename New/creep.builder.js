var Build = {};
var Mem = require('get.memory');

//4 types of creeps in 1 role and 2 jobs!
var jobGatherer = ['GatherEnergy','FillStructures']; //dest == to -> Gatherer, dest != to -> trucker
var jobDistributor = ['GetEnergy','FillStructures']; //dest == to -> Emon, dest != to -> distributor
//harvester jobs
var jobMiner = ['MineEnergy']; //dest == to -> Miner, dest != to -> external room Miner
//Miner jobs
var jobWorker = ['Build','Upgrade','Repair','Attack','GetEnergy'];
var jobExtWorker = ['Build','Repair','Upgrade','Attack','GatherEnergy']; // set dest , To, From to a non-owned room with this job array to give it the old ExternalBuilder behaviour
var jobUpgrader = ['Upgrade','Build','Repair','Attack','GetEnergy'];
var jobFixer = ['Repair','Build','Upgrade','Attack','GetEnergy'];
var jobIdle = [''];
//worker jobs
var jobArmy = ['Attack'];
//army jobs

function CreepType(Creepy,n,b,c){ // returns
    var BodyPart = null;
    switch(Creepy) {
    case'Transport':
        if((n % 2) == 0){ BodyPart = CARRY;}
        else{ BodyPart = MOVE; }
    break;

    case'Tough':
        if((n % 2) == 0){ BodyPart = TOUGH;}
        else{ BodyPart = MOVE; }
    break;

    case'Build':
        if(c == 0){ BodyPart = CARRY; }
        if(c == 1 && b == 0 ){ BodyPart = MOVE; } // this one will be added twice in a row of 9
        if(c == 2 && b == 0){ BodyPart = WORK; }
    break;

    case'Work':
        BodyPart = WORK;
        if(n > 5){
          if((n % 2) == 0){ BodyPart = MOVE;}
          else{ BodyPart = WORK};
        }
    break;

    case'Claim':
        if(b == 0){ BodyPart = CLAIM; }
        if(b == 1 && (n%3) == 1){ BodyPart = MOVE; }
    break;

    case'Heal':
        if((n % 2) == 0){ BodyPart = HEAL; }
        else{ BodyPart = MOVE; }
    break;

    case'Army':
        if(c == 0){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = ATTACK; }
        }
        if(c == 1){ BodyPart = MOVE; }// this one will be added twice in a row of 9
        if(c == 2){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = ATTACK; }
        }
    break;

    case'Ranged_Army':
        if(c == 0){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = RANGED_ATTACK; }
        }
        if(c == 1){ BodyPart = MOVE; }// this one will be added twice in a row of 9
        if(c == 2){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = RANGED_ATTACK; }
        }
    break;
    }
    return BodyPart;
}

function CreepTypeInit(Creepy,BodySize){//initialize the bodies, can't be smaller then definitions here.
    var BodyParts = [];
    switch(Creepy) {
    case'Transport':
        BodyParts =[MOVE,CARRY,MOVE];
    break;

    case'Transport':
        BodyParts =[MOVE,TOUGH,MOVE];
    break;

    case'Build':
        BodyParts =[CARRY,MOVE,WORK,CARRY];
    break;

    case'Work':
        if(BodySize > 3){
            BodyParts =[WORK,MOVE,CARRY,CARRY];
        }else if(BodySize > 5){
            BodyParts =[WORK,MOVE,WORK,WORK,MOVE,MOVE];
        }else{
            BodyParts =[WORK,MOVE,WORK];
        }
    break;

    case'Claim':
        BodyParts =[CLAIM,MOVE,CLAIM];
    break;

    case'Heal':
        BodyParts =[HEAL,MOVE,HEAL];
    break;

    case'Army':
        BodyParts =[TOUGH,MOVE,ATTACK,TOUGH];
    break;

    case'Ranged_Army':
        BodyParts =[TOUGH,MOVE,RANGED_ATTACK,TOUGH];
    break;
    }
    return BodyParts;
}

Build.Cost = function(Layout){ //return the build cost of a creep with certain layout
    var cost = 0;
    for(var items in Layout) {
        if(Layout[items] == MOVE ||
           Layout[items] == CARRY){
               cost += 50;
           }
        if(Layout[items] == WORK){ cost += 100; }
        if(Layout[items] == ATTACK){ cost += 80; }
        if(Layout[items] == RANGED_ATTACK){ cost += 150; }
        if(Layout[items] == HEAL){ cost += 250; }
        if(Layout[items] == CLAIM){ cost += 600; }
        if(Layout[items] == TOUGH){ cost += 10; }
    }
    return cost;
}

Build.Rebuild = function(Layout){ //changes order of bodyparts to be logical
    var GoodLayout = [];
    var temp = 0;
    for(var items in Layout) {
        if(Layout[items] == 'move'){ temp = MOVE}
        if(Layout[items] == 'carry'){ temp = CARRY;}
        if(Layout[items] == 'work'){ temp = WORK; }
        if(Layout[items] == 'attack'){ temp = ATTACK; }
        if(Layout[items] == 'ranged_attack'){ temp = RANGED_ATTACK; }
        if(Layout[items] == 'heal'){ temp = HEAL; }
        if(Layout[items] == 'claim'){ temp = CLAIM; }
        if(Layout[items] == 'tough'){ temp = TOUGH; }
        GoodLayout.unshift(temp);
    }
    return GoodLayout;
}

function orderCost(Type){//calculates the 'cost' for the order of bodyparts
    var cost = 0;
    if(Type == MOVE ){cost = 9; }
    if(Type == CARRY){cost = 2; }
    if(Type == WORK){ cost = 1; }
    if(Type == ATTACK){ cost = 3; }
    if(Type == RANGED_ATTACK){ cost = 5; }
    if(Type == HEAL){ cost = 4; }
    if(Type == CLAIM){ cost = 8; }
    if(Type == TOUGH){ cost = 0; }
    return cost;
}

Build.Layout = function(remainder,AvailableEnergy,BodySize,Type){//wraps above functions
    var Layout = CreepTypeInit(Type,BodySize);
    var cost = 0;
    var target = AvailableEnergy;
    var c = 0;
    var b = 0;
    var stop = false;
    if(remainder != 0){
        target = remainder;
    }
    for(i = 0; i < BodySize; i++ ) {
        if(!stop){
            cost = Build.Cost(Layout);
            c+=1;
            b+=1;
            if(c > 2){ c = 0; }
            if(b > 1){ b = 0; }

        if((cost >= target) || (cost >= AvailableEnergy)){
            //Layout.slice(0,Layout.length);
            Layout.pop();
            console.log('Cost:'+cost+' Layout: '+Layout+' Target:'+target+' Remainder:'+AvailableEnergy);
            stop = true;
        }
        if(CreepType(Type,i,b,c) != undefined){
            Layout.push(CreepType(Type,i,b,c));
        }
        }


    }

    return Layout.sort((a, b)=>orderCost(a)-orderCost(b));//(a, b)=>orderCost(a)-orderCost(b)
    //return Layout.sort();//ATTACK,MOVE,TOUGH(a, b) -> orderCost(a) < orderCost(b)
}

Build.CreepDemand = function(MyRoom,RCL,SAlt,Hostiles,sources,buffer,spawn,links,NewCreepDemand){// Function returns energy/cycle and mincarryparts. Also sets room creeps if NewCreepDemand=true.
  var workers = 0;
  var transporters = 0;
  var farmers = 0;
  var army = 0;
  var FarmParts = 5;
  var farmersPresent, HarvestersPresent, WorkersPresent, ArmyPresent = Mem.CreepsInRoom(MyRoom);

  var FarmableEnergy = 0;
  var TravelLoss = 0;
  if(RCL < 3){
    transporters = 1;
    if(Game.rooms[spawn[0].room.name].energyCapacityAvailablee > 500 && SAlt[0] < 50){
        workers = 5;
    }else{
        workers = 3;
    }

  }
  if(Hostiles){
    army = 2;
  }
  else if(RCL < 4){
      workers = 6; //4 workers if low CL
      army = 0; // no stationary army if low CL
      if(Hostiles){
        army = 2;
      }
  }else{
      workers = 3; //roulate priorities of buildjobs per creep
      army = 2;
      //army = Math.round(Game.rooms[MyRoom].controller.level/2); //stationary army uncomment later!
  }
  if(buffer[0] != undefined){
      if(_.sum(buffer[0].store) > 60000 && RCL > 3){
          workers += Math.round((_.sum(buffer[0].store)-60000)/10000);
      }
    transporters += 1;
  }
  for(var i in sources){ //again, roulate jobs per creep(energymon/gatherer)
    FarmableEnergy += sources[i].energyCapacity;
    TravelLoss += (sources[i].pos.getRangeTo(spawn[0])+1)*2;
    farmers +=1;//farmers are determined by amount of sources
  }
  var travelconst = 20;
  if(TravelLoss > 200){
    travelconst = 70;
  }
  transporters += Math.round(TravelLoss/travelconst);

  if(links[0]){
    transporters -= 1;
    WorkSize = 4;
  }

  for(var i in HarvestersPresent){
    CarryParts += HarvestersPresent[i].getActiveBodyparts(CARRY);
  }
  if(farmersPresent > 1){
    farmParts += 5;
  }

  var EnergyCycle = FarmParts*TravelLoss; // energy produced in one pickup and drop cycle
  var MinCarryParts = Math.round((EnergyCycle)/50)+1; //min carry parts to displace all mined energy+1
  if(NewCreepDemand){
      Mem.setroomcreep(MyRoom,farmers,transporters,workers,army,1,1,0.3,1)
  }
  a = [EnergyCycle,MinCarryParts]
  return a;

}

Build.ExtCreepDemand = function(MyRoom){

  if(Game.rooms[MyRoom.roomName] == undefined && Memory.roomdb[MyRoom.roomName].RoomInfo == undefined){
    if(Game.map.isRoomAvailable(MyRoom.roomName)){
      Memory.roomdb[MyRoom.roomName].scout = true;
      //console.log('Roomname:'+MyRoom.roomName+', x-Pos:'+MyRoom.x+', y-Pos:'+MyRoom.y+'. No creep in room And available -> scout ='+Memory.roomdb[MyRoom.roomName].scout);
      Mem.setroomcreep(MyRoom.roomName,0,0,0,1,1,1,1,1);
    }

  }else{ //creep in room?
    Memory.roomdb[MyRoom.roomName].scout = false;

    if(Memory.roomdb[MyRoom.roomName].RoomInfo == undefined){
      //console.log('Creep arrived in:'+MyRoom.roomName+'. Setting RoomInfo');
      Mem.setExt(MyRoom.roomName);

    }else if(Memory.roomdb[MyRoom.roomName].RoomInfo.Hostiles.length == 0){
      Mem.setroomcreep(MyRoom.roomName,Memory.roomdb[MyRoom.roomName].RoomInfo.Sources.length,Memory.roomdb[MyRoom.roomName].RoomInfo.Sources.length,0,1,1,1,1,1);
      //console.log('Room is safe! no hostiles');

    }else if(Memory.roomdb[MyRoom.roomName].RoomInfo.Hostiles.length > 0){
      console.log('HOSTILES!!!! in:'+MyRoom.roomName);
      Mem.setroomcreep(MyRoom.roomName,0,0,0,2*Memory.roomdb[MyRoom.roomName].RoomInfo.Hostiles.length,1,1,1,1);
    }
    //console.log('Roomname:'+MyRoom.roomName+', x-Pos:'+MyRoom.x+', y-Pos:'+MyRoom.y+'. has a creep!!!');
  } //use creep to scan! and fill memory of room with info, if i'm correct, this will work correct with resetting the db every 50 ticks. because there is a creep when worked.
}

Build.AutoQueue = function(MyRooms){
  //console.log('Running AutoQueue for:'+MyRooms);
  var farmerInQueue = 0;
  var harvesterInQueue = 0;
  var workerInQueue = 0;
  var armyInQueue = 0;
  var farmersPresent = [];
  var HarvestersPresent = [];
  var WorkersPresent = [];
  var ArmyPresent = [];
  var WorkDemand = 0;
  var FarmDemand = 0;
  var TransportDemand = 0;
  var ArmyDemand = 0;
    //console.log('Undefined test controller:'+(Game.rooms[MyRooms] == undefined));
    //console.log('Owner test controller:'+(Game.rooms[MyRooms].controller.owner.username != 'kwabratseur'));
    //was in for loop before! check if this works!!
    var PresentCreeps = Mem.CreepsInRoom(MyRooms);
    if((Game.rooms[MyRooms] == undefined) || (Game.rooms[MyRooms].controller.owner == undefined)){ //rooms which are not formally owned!
      var CreepDemand = Memory.roomdb[MyRooms].creepInfo
      var BestRoom = Memory.BestRoom;
      var dest = MyRooms;
      var to = MyRooms;
      var from = BestRoom;
      var flag = MyRooms;
      var currentEnergy = Memory.HighestEnergy
      var energyCap = currentEnergy/Memory.BestFilled;
    }else{ //rooms which are mine!
      var PresentCreeps = Mem.CreepsInRoom(MyRooms);
      var energyCap = Game.rooms[MyRooms].energyCapacityAvailable;
      var currentEnergy = Game.rooms[MyRooms].energyAvailable;
      var dest = MyRooms;
      var to = MyRooms;
      var from = MyRooms;
      var flag = MyRooms;
      var CreepDemand = Memory.rooms[MyRooms].creepInfo //if(Game.rooms[MyRooms])
    }

    //console.log(CreepDemand.Workers[0],CreepDemand.Farmers[0],CreepDemand.Transporters[0],CreepDemand.Army[0]);
    WorkDemand = CreepDemand.Workers[0];
    FarmDemand = CreepDemand.Farmers[0];
    TransportDemand = CreepDemand.Transporters[0];
    ArmyDemand = CreepDemand.Army[0];
    farmersPresent.push(PresentCreeps[1]);
    HarvestersPresent.push(PresentCreeps[2]);
    WorkersPresent.push(PresentCreeps[3]);
    ArmyPresent.push(PresentCreeps[4]);
    farmerInQueue = Mem.InQueue(MyRooms,'farmer');
    harvesterInQueue = Mem.InQueue(MyRooms,'harvester');
    workerInQueue = Mem.InQueue(MyRooms,'worker');
    armyInQueue = Mem.InQueue(MyRooms,'army');

  if(Memory.Spawning == 0){
      if((farmersPresent[0].length + farmerInQueue) < FarmDemand){
        console.log('adding farmer to queue for '+MyRooms);                      //role,destination,To,From,Flag,jobarray
        Mem.AddtoQueue(0.1,Build.Layout(energyCap,energyCap,3,"Work"),'farmer',dest,to,from,flag,jobMiner);
      }
      if((HarvestersPresent[0].length + harvesterInQueue ) < TransportDemand){
        var priority = 0.3;
        if(HarvestersPresent[0].length + harvesterInQueue  == 0){
          priority = 0.08;
          if(farmersPresent[0].length > 0){
            priority = 0.08;
          }
        }
        Mem.AddtoQueue(priority,Build.Layout(energyCap,currentEnergy,15,"Transport"),'harvester',dest,to,from,flag,jobGatherer);
          console.log('adding harvester to queue for '+MyRooms);
      }
      if((WorkersPresent[0].length + workerInQueue ) < WorkDemand){
        Mem.AddtoQueue(0.5,Build.Layout(energyCap,currentEnergy,20,"Build"),'worker',dest,to,from,flag,jobWorker);
          console.log('adding worker to queue for '+MyRooms);
      }
      if((ArmyPresent[0].length + armyInQueue ) < ArmyDemand){
        Mem.AddtoQueue(0.8,Build.Layout(energyCap/1.5,currentEnergy,15,"Army"),'army',dest,to,from,flag,jobArmy);
          console.log('adding Army to queue for '+MyRooms);
      }
  }

}

Build.SpawnCreep = function(){
  var availableEnergies = [];
  var FillDegree = [];
  var MyRoom = [];
  var CreeptoSpawn = Memory.SpawnQueue.shift();
  var inactive = 0;
  var active = 0;

  for(var name in Game.spawns){ // Try to include All code except for FarmRoom code in this loop. Maybe multiple rooms can be controlled in this way.
    MyRoom.unshift(Game.spawns[name].room.name);    //Then offcourse make everything depend from variable MyRoom(mostly the case)
    if(Game.spawns[name].spawning == null){
      inactive +=1;
    }else{
      active += 1;
    }
    availableEnergies.unshift(Game.rooms[MyRoom].energyAvailable);
    FillDegree.unshift(Game.rooms[MyRoom].energyAvailable/Game.rooms[MyRoom].energyCapacityAvailable);
  }
  Memory.Spawning = ((active)/(active+inactive));
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
    var body = Build.Rebuild(CreeptoSpawn[1],0);
    //console.log(body);
    var newName = -11;
    if(MyRoom.length > 0){
        newName = Mem.run(Memory.rooms[MyRoom[j]].RoomInfo.Spawns)[0].createCreep(body, undefined, {role: CreeptoSpawn[2],destRoom: CreeptoSpawn[3],roomTo: CreeptoSpawn[4],roomFrom: CreeptoSpawn[5],flag: CreeptoSpawn[6],jobs: CreeptoSpawn[7]});
    }
    if(newName == -4){
        Memory.Spawning = true;
    }
    if(newName == -6){
      Memory.failedSpawn += 1;
      Memory.WithdrawLight = false; // if this is set to false, no energy may be picked up at any extension or spawn.
      if(Memory.failedSpawn > 3 && CreeptoSpawn[1].length > 3 && Build.Cost(body) > 300){
        CreeptoSpawn[1].shift();
      }
    }
    if(newName == -10){//purges corrupt creeps from memory
        console.log('Corrupt creep body: '+CreeptoSpawn[1]+', Purging SpawnQueue.');
    }else if(newName < 0){
      if(CreeptoSpawn != undefined){
        Memory.SpawnQueue.unshift(CreeptoSpawn);
        console.log('Tried to spawn: '+CreeptoSpawn[2]+' but theres not enough energy:'+availableEnergies[j]+'. One bodypart will be removed.');
      }
    }else{
        console.log('Spawning: '+CreeptoSpawn+' at '+MyRoom[j]);
        Memory.WithdrawLight = true;
        Memory.Spawning = true;

    }
  }else{
        console.log('Nothing to spawn.');
        Memory.WithdrawLight = true;
  }
  Memory.HighestEnergy = availableEnergies[j];
  Memory.BestRoom = MyRoom[j];
  Memory.BestFilled = FillDegree[c]; // Available/Capacity = filldegree -> Available/Filldegree = Capacity
}

Build.ReconsiderJobs = function(MyRoom,drops,Sites){
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
    Memory.rooms[MyRoom].creepInfo.Workers[1] = 0.8;//80% worker if more than 5 buildingsites are available
  }else{
    Memory.rooms[MyRoom].creepInfo.Workers[1] = 0.4;
  }
  if(Game.rooms[MyRoom].controller.ticksToDowngrade < 200){
    Memory.rooms[MyRoom].creepInfo.Workers[1] = 0.1;
    console.log('Upgrading controller to prevent downgrade!');
  }
  var Dgatherer = Math.round(Memory.rooms[MyRoom].creepInfo.Transporters[0]*Memory.rooms[MyRoom].creepInfo.Transporters[1]);
  var Ddistributor = Memory.rooms[MyRoom].creepInfo.Transporters[0]-Dgatherer;
  var Dworker = Math.round(Memory.rooms[MyRoom].creepInfo.Workers[0]*Memory.rooms[MyRoom].creepInfo.Workers[1]);
  var Dupgrader = Math.round(0.3*(Memory.rooms[MyRoom].creepInfo.Workers[0])); //30% of remainder is upgrader


  if(Memory.rooms[MyRoom].creepInfo.Workers[0] > (Dupgrader+Dworker)){
    var Dfixer = Memory.rooms[MyRoom].creepInfo.Workers[0] - (Dupgrader+Dworker);// remaining 70% is fixer, repairs stuff.
  }else{
    var Dfixer = 0;
  }
  //console.log('work'+Dworker+'upgr'+Dupgrader+'fixr'+Dfixer);


 //manager will setup creep jobs and see if there is a possible better distribution
  for(var name in Game.creeps) {
      var creep = Game.creeps[name];
      if(creep.memory.roomTo == MyRoom && creep.memory.Warband == undefined){ //controls creeps with this room as destination
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
  }
}
  if(Dgatherer != gatherer || Ddistributor != distributor || Dworker != worker || Dfixer != fixer){
    Build.Redistribute(MyRoom,Dgatherer,Ddistributor,Dworker,Dupgrader,Dfixer);
    console.log('Desired Gatherers:'+Dgatherer+', Distributors:'+Ddistributor+', Workers:'+Dworker+', Upgraders:'+Dupgrader+', Fixers:'+Dfixer);
    console.log('Total Gatherers:'+gatherer+', Distributors:'+distributor+', Workers:'+worker+', Upgraders:'+upgrader+', Fixers:'+fixer);
  }
  //console.log('Desired Gatherers:'+Dgatherer+', Distributors:'+Ddistributor+', Workers:'+Dworker+', Upgraders:'+Dupgrader+', Fixers:'+Dfixer);
  //console.log('Total Gatherers:'+gatherer+', Distributors:'+distributor+', Workers:'+worker+', Upgraders:'+upgrader+', Fixers:'+fixer);
}

Build.Redistribute = function(MyRoom,Gatherer,Distributor,Worker,Upgrader,Fixer){
  for(var name in Game.creeps) {
      var creep = Game.creeps[name];
      if(creep.memory.roomTo == MyRoom){
        if(creep.memory.role == 'harvester') {
          if(Distributor > 0){
            creep.memory.jobs = jobDistributor;
            Distributor -=1;
          }else if(Gatherer > 0){
            creep.memory.jobs = jobGatherer;
            Gatherer -= 1;
          }
        }

        if(creep.memory.role == 'worker') {
          if(Worker > 0){
            creep.memory.jobs = jobWorker;
            Worker -= 1;
          }else if(Upgrader > 0){
            creep.memory.jobs = jobUpgrader;
            Upgrader -=1;
          }else if(Fixer > 0){
            creep.memory.jobs = jobFixer;
            Fixer -=1;
          }
        }
    }
    }
}

Build.EditDestination = function(RoomTo,Amount,Role){
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

module.exports = Build;
