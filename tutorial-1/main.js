(function () {
var Mem = require('get.memory');
var Cbuilder = require('creep.builder');
var Jobs = require('creep.jobs');
var Randfcn = require('rand');
var roleTransporter = require('role.transporter');
var roleFarmer = require('role.farmer');
var roleBuilder = require('role.builder');
var roleArmy = require('role.army');
var Towercode = require('tower');


if((Memory.stats.HostilesInterritory == undefined || Memory.stats.HostilesInterritory > 0) && Memory.stats.RegenBucket == 1){
    console.log('Regenerating Bucket:'+Game.cpu.bucket);
    if(Game.cpu.bucket > 9995){
        Memory.stats.RegenBucket = 0;
    }
}else{

module.exports.loop = function(){

    if(Game.cpu.bucket < 8000){
        Memory.stats.RegenBucket = 1;
    }

    var timer = Randfcn.initTimers();
    var MyRooms = [];
    var Hostiles = 0;
    if(timer[0]||timer[1]||timer[2]){
        console.log('ten:'+timer[0]+', five:'+timer[1]+', fifty:'+timer[2]); //timers
    }

    for(var name in Game.spawns){
        var MyRoom = Game.spawns[name].room.name;
        var RoomStat = [];
        var hostiles = Game.spawns[name].pos.findClosestByRange(Jobs.FindHostile(MyRoom));
        if(hostiles){
            Hostiles += hostiles.length;
        }

        if(!Memory.rooms[MyRoom]){
            Memory.rooms[MyRoom] = {};
        }
        if(!Memory.rooms[MyRoom].RoomInfo){
            Mem.set(MyRoom,name);
            console.log('No Roominfo');
        }
        var sources = Mem.run(Memory.rooms[MyRoom].RoomInfo.Sources);
        var buffer = Mem.run(Memory.rooms[MyRoom].RoomInfo.Storages);
        var links = Mem.run(Memory.rooms[MyRoom].RoomInfo.Links);
        var spawn = Mem.run(Memory.rooms[MyRoom].RoomInfo.Spawns);
        var Sites = Game.rooms[MyRoom].find(FIND_CONSTRUCTION_SITES);
        var drops = Game.rooms[MyRoom].find(FIND_DROPPED_RESOURCES);

        var towers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Towers);
        var containers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Containers);
        var ramparts = Mem.run(Memory.rooms[MyRoom].RoomInfo.Ramparts);
        //Game.rooms['W17N73'].controller.progressTotal
        Memory.stats["room." + MyRoom + ".progressTotal"] = Game.rooms[MyRoom].controller.progressTotal;
        Memory.stats["room." + MyRoom + ".progress"] = Game.rooms[MyRoom].controller.progress;
        Memory.stats["room." + MyRoom + ".ticksToDowngrade"] = Game.rooms[MyRoom].controller.ticksToDowngrade;
        Towercode.run(MyRoom,towers,ramparts,containers,hostiles);


        MyRooms.push(MyRoom);

        if(timer[2]){
            Cbuilder.ReconsiderJobs(MyRoom,drops,Sites)
        }

        if(Game.time%2==0){ //every 2 ticks
        var structs = Game.rooms[MyRoom].find(FIND_STRUCTURES);
        RoomStat = Cbuilder.CreepDemand(MyRoom,Game.rooms[MyRoom].controller.level,Memory.SpawnActivityLt,hostiles,sources,buffer,spawn,links,true);
        /***--- Memory Cleanup ---***///
        if((!Memory.rooms[MyRoom].Sites || (Memory.rooms[MyRoom].Sites != Sites.length)) && (Sites.length > 0)){
            Memory.rooms[MyRoom].Sites = Sites.length;
            console.log('Building structure /making build queue in room'+MyRoom+', BuildingSites:'+Sites.length);
            Mem.reset(MyRoom);
        }
        if(!Memory.rooms[MyRoom].structs || (Memory.rooms[MyRoom].structs != structs.length)){
            Memory.rooms[MyRoom].structs = structs.length;
            console.log('Building Destroyed/built in '+MyRoom+', Buildings:'+structs.length);
            Mem.reset(MyRoom);
        }
        }

    }

    //calculate creepdemand @ non-owned rooms -> write seperate creepDemand for such situations(filter possible owned rooms!)
    //add non-owned rooms to MyRooms




    if(Game.time%2==0){

        for(var name in Memory.roomdb){
            Cbuilder.ExtCreepDemand(Memory.roomdb[name])
            MyRooms.push(name);
        }
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
        for(var i in MyRooms){
            Cbuilder.AutoQueue(MyRooms[i]);
        }
    }

    if(timer[0]){
        Cbuilder.SpawnCreep();
    }

    var AmountHarvMain = 0;
    totalCreeps = 0;
    for(var name in Game.creeps) { //make creeps independent! they determine which source! not in this loop
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

    if(timer[2]){
        //for(var name in Game.rooms){
       //     Mem.reset(name);
        //}
    Randfcn.FlagScan();
    }

    Memory.stats.HostilesInTerritory = Hostiles;
    Memory.stats.HighestEnergy = Memory.HighestEnergy;
    Memory.stats.Spawning = Memory.Spawning;
    Memory.stats.SpawnActivity = Memory.SpawnActivityLt[0];
    Memory.stats.HighestFillDegree = Memory.BestFilled;
    Memory.stats.CPU = Game.cpu.getUsed();
    Memory.stats.TotalCreeps = totalCreeps;
    Memory.stats.CPUbucket = Game.cpu.bucket;
    Memory.stats.CPUPC = (Game.cpu.getUsed()/totalCreeps);

    console.log('------CPU:'+Game.cpu.getUsed()+'-----Per creep:'+(Game.cpu.getUsed()/totalCreeps)+'----Bucket:'+Game.cpu.bucket+'----Ticklimit:'+Game.cpu.tickLimit);
}
}
;
define("main", function(){});

var Transfer = {};
var Struct = require('get.memory');
var Moveto = require('move.to');

function ReturnObjects(object,MyRoom){
    var temp = null;
    switch(object) {
		case 'Containers':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Containers);
		break;
		case 'Storages': // call looks like: Transfer.to(creep,creep.room.name,"Storages",RESOURCE_ENERGY,0);
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Storages);
		break;
		case 'Spawns':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Spawns);
		break;
		case 'Extensions':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Extensions);
		break;
		case 'Links':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Links);
		break;
		case 'Labs':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Labs);
		break;
		case 'Towers':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Towers);
		break;
		case 'Controllers':
			temp = Game.rooms[MyRoom].controller;
		break;
	}
	return temp;
};

function ReturnExtObjects(object,MyRoom){
    var temp = null;
    switch(object) {
		case 'Containers':
			temp = Struct.run(Memory.roomdb[MyRoom].RoomInfo.Containers);
		break;
		case 'Storages': // call looks like: Transfer.to(creep,creep.room.name,"Storages",RESOURCE_ENERGY,0);
			temp = Struct.run(Memory.roomdb[MyRoom].RoomInfo.Storages);
		break;
		case 'Spawns':
			temp = Struct.run(Memory.roomdb[MyRoom].RoomInfo.Spawns);
		break;
		case 'Extensions':
			temp = Struct.run(Memory.roomdb[MyRoom].RoomInfo.Extensions);
		break;
		case 'Links':
			temp = Struct.run(Memory.roomdb[MyRoom].RoomInfo.Links);
		break;
		case 'Labs':
			temp = Struct.run(Memory.roomdb[MyRoom].RoomInfo.Labs);
		break;
		case 'Towers':
			temp = Struct.run(Memory.roomdb[MyRoom].RoomInfo.Towers);
		break;
	}
	return temp;
};

Transfer.FilterObjects = function(creep,MyRoom,object,resource,n){
    if((Game.rooms[MyRoom].controller == undefined) || (Game.rooms[MyRoom].controller.owner == undefined)){
      var temp1 = ReturnExtObjects(object,MyRoom);
    }else{
      var temp1 = ReturnObjects(object,MyRoom);
    }

    var temp = null;
    switch(n){
        case 'zero':
            temp = temp1;
        break;
        case 'unfilled':
            if(object == 'Extensions' || object == 'Spawns' || object == 'Links'){
                temp = _.filter(temp1, function(structure){return structure.energy < structure.energyCapacity; });
            }else if(object == 'Towers'){
                temp = _.filter(temp1, function(structure){return structure.energy < structure.energyCapacity; });
            }else{
                temp = _.filter(temp1, function(structure){return structure.store[RESOURCE_ENERGY] < structure.storeCapacity; });
            }
        break;
        case 'filled':
            if(object == 'Extensions' || object == 'Spawns' || object == 'Links' || object == 'Towers'){
                temp = _.filter(temp1, function(structure){return structure.energy > 0; });
            }else{
                  temp = _.filter(temp1, function(structure){return structure.store[RESOURCE_ENERGY] > creep.carryCapacity/2; });
                  temp.sort((a, b)=>a.store[RESOURCE_ENERGY]-b.store[RESOURCE_ENERGY]);

                    //if(temp[0].store[RESOURCE_ENERGY] > temp[temp.length - 1].store[RESOURCE_ENERGY]*0.5){
                //    temp = temp[0];
                //}else{
                //    temp = temp[temp.length - 1];
                //}

                //return temp;
            }
        break;
    }
    return creep.pos.findClosestByRange(temp);

}

                //temp = _.filter(temp1, function(structure){return structure.energy < structure.energyCapacity; }); //returns undefined if not true
                //test = _.filter(temp1, function(structure){return structure.store[RESOURCE_ENERGY] < structure.storeCapacity; });

Transfer.to = function(creep,MyRoom,object,resource = RESOURCE_ENERGY,n = 'zero'){//creep,
    var temp = Transfer.FilterObjects(creep,MyRoom,object,resource,n);
	if(!temp){
	    return true;
	}else{
	    if(creep.transfer(temp,resource) == ERR_NOT_IN_RANGE){
    	    Moveto.move(creep,temp)
    	}
	}
}
Transfer.from = function(creep,MyRoom,object,resource = RESOURCE_ENERGY,n = 'zero'){//creep,
    var temp = Transfer.FilterObjects(creep,MyRoom,object,resource,n);
	if(!temp){
	    return true;
	}else{
    	if(creep.withdraw(temp, resource) == ERR_NOT_IN_RANGE) { //withdraw @ storage
          Moveto.move(creep,temp);
      }
	}
}

module.exports = Transfer;

define("action.transfer", function(){});

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
  if(Hostiles){
    army =  Math.round(1.2*Hostiles);
  }
  if(RCL < 3){
    transporters = 0;
      //console.log('Room'+MyRoom+'Control level:'+RCL);
    if(Game.rooms[spawn[0].room.name].energyCapacityAvailable > 500 && SAlt[0] < 50){
          //console.log('Spawning extra workers, energycap:'+Game.rooms[spawn[0].room.name].energyCapacityAvailable);
        workers = 5;
    }else{
        workers = 3;
    }

  }
  else if((RCL < 4)&&(RCL > 2)){
      workers = 5; //4 workers if low CL
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
  var travelconst = 25;
  if(TravelLoss > 200){
    travelconst = 70;
  }
  transporters += Math.round(TravelLoss/travelconst);
  //console.log('Travelloss:'+TravelLoss+', Travelconst:'+travelconst+', transporters: '+transporters);    
    
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
      Mem.setroomcreep(MyRoom,farmers,transporters,workers,army,1,1,0.3,Math.round(army/2))
  }
  a = [EnergyCycle,MinCarryParts]
  return a;

}

Build.ExtCreepDemand = function(MyRoom){

  if(Game.rooms[MyRoom.roomName] == undefined && Memory.roomdb[MyRoom.roomName].RoomInfo == undefined){
    if(Game.map.isRoomAvailable(MyRoom.roomName)){
      Memory.roomdb[MyRoom.roomName].scout = true;
      //console.log('Roomname:'+MyRoom.roomName+', x-Pos:'+MyRoom.x+', y-Pos:'+MyRoom.y+'. No creep in room And available -> scout ='+Memory.roomdb[MyRoom.roomName].scout);
      Mem.setroomcreep(MyRoom.roomName,0,0,0,1,1,1,1,0);
    }

  }else{ //creep in room?
    Memory.roomdb[MyRoom.roomName].scout = false;
    Mem.setExt(MyRoom.roomName);
    if(Memory.roomdb[MyRoom.roomName].RoomInfo == undefined){
      //console.log('Creep arrived in:'+MyRoom.roomName+'. Setting RoomInfo');


    }else if(Memory.roomdb[MyRoom.roomName].RoomInfo.Hostiles.length == 0){
      Mem.setroomcreep(MyRoom.roomName,Memory.roomdb[MyRoom.roomName].RoomInfo.Sources.length,Memory.roomdb[MyRoom.roomName].RoomInfo.Sources.length,0,1,1,1,1,1);
      //console.log('Room is safe! no hostiles');

    }else if(Memory.roomdb[MyRoom.roomName].RoomInfo.Hostiles.length > 0){
      console.log('HOSTILES!!!! in:'+MyRoom.roomName);
      Mem.setroomcreep(MyRoom.roomName,0,0,0,Math.round(1.2*Memory.roomdb[MyRoom.roomName].RoomInfo.Hostiles.length),1,1,1,1,Math.round((1.2*Memory.roomdb[MyRoom.roomName].RoomInfo.Hostiles.length)/2));
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
  var healDemand = 0;
    //console.log('Undefined test controller:'+(Game.rooms[MyRooms] == undefined));
    //console.log('Owner test controller:'+(Game.rooms[MyRooms].controller.owner.username != 'kwabratseur'));
    //was in for loop before! check if this works!!
    var PresentCreeps = Mem.CreepsInRoom(MyRooms);
    if((Game.rooms[MyRooms] == undefined) || (Game.rooms[MyRooms].controller.owner == undefined) || (Game.rooms[MyRooms].controller.owner.username != 'Kwabratseur')){ //rooms which are not formally owned!
      var CreepDemand = Memory.roomdb[MyRooms].creepInfo
      var BestRoom = Memory.BestRoom;
      var dest = MyRooms;
      var to = MyRooms;
      var from = BestRoom;
      var flag = MyRooms;
      var currentEnergy = Memory.HighestEnergy
      var energyCap = currentEnergy/Memory.BestFilled;
    }else{ //rooms which are mine!
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
    healDemand = CreepDemand.Army[1];
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
          priority = 0.12;
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
          if((ArmyPresent[0].length+armyInQueue)%2 == 0){
              Mem.AddtoQueue(0.8,Build.Layout(energyCap/1.5,currentEnergy,15,"Heal"),'army',dest,to,from,flag,jobArmy);
              console.log('adding Army:healer to queue for '+MyRooms);
          }else{
              Mem.AddtoQueue(0.8,Build.Layout(energyCap/1.5,currentEnergy,15,"Army"),'army',dest,to,from,flag,jobArmy);
              console.log('adding Army:fighter to queue for '+MyRooms);
          }
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
        console.log('Tried to spawn: '+CreeptoSpawn[2]+' but theres not enough energy:'+availableEnergies[j]+', creepcost:'+Build.Cost(body)+'. One bodypart will be removed.');
      }
    }else{
        console.log('Spawning: '+CreeptoSpawn+' at '+MyRoom[j]);
        Memory.WithdrawLight = true;


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

define("creep.builder", function(){});

var jobs = {};
var Transfer = require('action.transfer');
var Moveto = require('move.to');
var Mem = require('get.memory');



jobs.GatherEnergy = function(creep){ // first empty containers, then drops.
    var drops = creep.room.find(FIND_DROPPED_RESOURCES);
    //console.log(drops[0].energy);
    if(!Transfer.from(creep,creep.room.name,"Containers",RESOURCE_ENERGY,'filled')){
      //console.log('Harvester '+creep.name+' is Transfering energy From Container');
    }
    else if(drops.length>0){
      //console.log('Harvester '+creep.name+' is Transfering energy From drops');
        Moveto.move(creep,drops[0]);
        creep.pickup(drops[0]);
    }else if(creep.memory.jobs[0] == 'GatherEnergy'){
      if(!Transfer.from(creep,creep.room.name,"Storages",RESOURCE_ENERGY,'zero')){
        //console.log('Harvester '+creep.name+' is Transfering energy From Storage');
      }
    }
}

//_.filter(hostileBuildings, function(structure){return (structure.structureType == STRUCTURE_TOWER); });

jobs.FindHostile = function(room){
    var temp = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
    if(Memory.Allies != undefined){
        for(var i in Memory.Allies){
            temp = _.filter(temp, function(creeps){return (creeps.owner.username != Memory.Allies[i]); });
        }
    }
    return temp;
}

jobs.FindHostileStructure = function(room){
    var temp = Game.rooms[room].find(FIND_HOSTILE_STRUCTURES);
    if(Memory.Allies != undefined){
        for(var i in Memory.Allies){
            temp = _.filter(temp, function(structure){return (structure.owner.username != Memory.Allies[i]); });
        }
    }
    return temp;
}

jobs.FillStructures = function(creep,buildInfra){ //fill structures

  if(!Transfer.to(creep,creep.room.name,"Spawns",RESOURCE_ENERGY,'unfilled')){
      //console.log('Harvester '+creep.name+' is Transfering energy to Spawn');
  }else if(!Transfer.to(creep,creep.room.name,"Extensions",RESOURCE_ENERGY,'unfilled')){
      //console.log('Harvester '+creep.name+' is Transfering energy to Extension');
  }else if(!Transfer.to(creep,creep.room.name,"Towers",RESOURCE_ENERGY,'unfilled') && creep.memory.jobs[0] != 'GatherEnergy'){ //this replaces 50 lines of code :)
      //console.log('Harvester '+creep.name+' is Transfering energy to Tower');
  }else if(!Transfer.to(creep,creep.room.name,"Storages",RESOURCE_ENERGY,'unfilled')){ //this indicates the priority of filling. Undefineds are skipped automatically
      //console.log('Harvester '+creep.name+' is Transfering energy to Storage');
  }
  if(buildInfra){
      creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
  }
}

jobs.MineEnergy = function(creep){ // mines the sourceID in-memory of creep. Will drop resources in link or container if possible

  if(Memory.rooms[creep.room.name] == undefined){
    var Containers = Mem.run(Memory.roomdb[creep.memory.destRoom].RoomInfo.Containers)
  }else{
    var Containers = Mem.run(Memory.rooms[creep.memory.destRoom].RoomInfo.Containers);
  }
  var containers = creep.pos.findClosestByRange(Containers);
  if(Containers[0] != undefined && creep.pos != containers.pos && Math.abs(creep.pos.x-containers.pos.x) < 3 && Math.abs(creep.pos.y-containers.pos.y) < 3){
      Moveto.move(creep,containers);
  }if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {
          Moveto.move(creep,Game.getObjectById(creep.memory.sourceID));
          creep.memory.work += 1;
  }
  if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_ENOUGH_RESOURCES){
    creep.memory.work += 1;
  }
  if(creep.memory.work > 30){
    delete creep.memory.sourceID;
    delete creep.memory.work;
    creep.say('Workless',true);
  }
  else {
    if(Memory.rooms[creep.room.name] == undefined){
      var Links = Mem.run(Memory.roomdb[creep.memory.destRoom].RoomInfo.Links);
      var linkSend = creep.pos.findInRange(Links, 2)[0];
      var sources = Mem.run(Memory.roomdb[creep.memory.destRoom].RoomInfo.Sources);
    }else{
      var Links = Mem.run(Memory.rooms[creep.memory.destRoom].RoomInfo.Links);
      var linkSend = creep.pos.findInRange(Links, 2)[0];
      var sources = Mem.run(Memory.rooms[creep.memory.destRoom].RoomInfo.Sources);
    }

    if(linkSend != undefined && creep.carryCapacity != 0){
        if(creep.carry.energy == creep.carryCapacity){
            if(creep.transfer(linkSend, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            }else{
                Moveto.move(creep,linkSend);
            }
        }
    }else{
        creep.drop(RESOURCE_ENERGY);
        if((Game.time % 2)==0){
            creep.say('OM',true);
        }else{
            creep.say('NOM',true);
        }
    }
  }
  try{
    if(!creep.memory.sourceID){
        var c = 0;
      for(var i in sources){
        if(sources[c].pos.findInRange(FIND_MY_CREEPS,1).length > sources[i].pos.findInRange(FIND_MY_CREEPS,1).length){
          c = i;
        }
      }
    creep.memory.sourceID = sources[c].id;
    }
  }
  catch(err){
    console.log('MineError, farmcreeps: '+err);
  }

}

jobs.Build = function(creep){
  var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
  if(targets.length > 0) {
      if(creep.build(creep.pos.findClosestByRange(targets)) == ERR_NOT_IN_RANGE) {
          Moveto.move(creep,creep.pos.findClosestByRange(targets));

      }
      return true;
  }else{
    return false;
  }
}

jobs.Repair = function(creep){
  var walls = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Walls);
  var ramparts = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Ramparts);
  var roads = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Roads);
  var containers = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Containers);
  var towers = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Towers);
  var Spawns = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Spawns);
  var damagedStructures2 = walls.concat(ramparts,containers);
  var structHp = Math.pow((12-creep.room.controller.level),(12-creep.room.controller.level)/2)
  var damagedStructures2 = _.filter(damagedStructures2, function(structure){return (structure != null && structure.hits < 300000); });
  var damagedStructures = _.filter(damagedStructures2.concat(roads,towers,Spawns,containers), function(structure){return (structure.hits < structure.hitsMax*0.9); });

  var numberDamaged = damagedStructures.length;
  var ClosestDamagedStructure = creep.pos.findClosestByRange(damagedStructures);

  var c = 0;
            for (i = 0; i < damagedStructures2.length; i++){
                if(damagedStructures2[i].hits < damagedStructures2[c].hits){
                    c = i;
                }
            }
  if(numberDamaged > 0){
      //console.log('Most damaged structure:'+damagedStructures2[c]+', hp:'+damagedStructures2[c].hits+', repairHP:'+(damagedStructures2[c].hitsMax/structHp))
      if(damagedStructures2[c].hits < damagedStructures2[c].hitsMax/structHp){
        if(creep.repair(damagedStructures2[c])  == ERR_NOT_IN_RANGE) {
            Moveto.move(creep,damagedStructures2[c]);
            creep.say(damagedStructures2[c].hits, true);
        }
        //console.log('test');
      }else{
        if(creep.repair(ClosestDamagedStructure)  == ERR_NOT_IN_RANGE) {
            Moveto.move(creep,ClosestDamagedStructure);
            creep.say(ClosestDamagedStructure.hitsMax, true);
        }
      }

      //console.log(ClosestDamagedStructure.structureType+' Will be repaired to: '+(ClosestDamagedStructure.hitsMax/structHp)+', current HP: '+ClosestDamagedStructure.hits);
      //console.log(creep.repair(ClosestDamagedStructure));
      return true;
      }else{
        return false;
      }
}

jobs.Upgrade = function(creep){
    //console.log(creep);
  if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
      Moveto.move(creep,creep.room.controller);
  }
  return true;
}

jobs.Retreat = function(creep){
  creep.say('RETREAT!',true); //<- retreat code
  creep.memory.destRoom = creep.memory.roomFrom;//<- retreat code
}

jobs.Attack = function(creep){
  var hostiles = creep.pos.findClosestByRange(jobs.FindHostile(creep.room.name));
  var hostileBuildings = creep.pos.findClosestByRange(jobs.FindHostileStructure(creep.room.name));
  //console.log(hostileBuildings);
  
  
  if(creep.getActiveBodyparts(ATTACK) != 0){
    if(hostiles != undefined){
        creep.say('I see you ',true);
        if(creep.attack(hostiles) == ERR_NOT_IN_RANGE) {
            Moveto.move(creep,hostiles);
        }
    }else{
      if(creep.attack(hostileBuildings) == ERR_NOT_IN_RANGE) {
          Moveto.move(creep,hostileBuildings);
      }
    }  
  }/*else if(creep.getActiveBodyparts(WORK) != 0){
    console.log(JSON.stringify(hostileBuildings));
    if(creep.dismantle(hostileBuildings) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,hostileBuildings);
    }
  }*/else if(creep.getActiveBodyparts(HEAL) != 0){
    var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                 filter: function(object) {
                     return object.hits < object.hitsMax;
                 }
    });
    if(creep.heal(target) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,target);
    }
  }/*else if(creep.getActiveBodyparts(RANGED_ATTACK) != 0){
    if(hostiles != undefined){
        creep.say('I see you ',true);
        if(creep.rangedAttack(hostiles) == ERR_NOT_IN_RANGE) {
            Moveto.move(creep,hostiles);
        }
    }else{
      if(creep.rangedAttack(hostileBuildings) == ERR_NOT_IN_RANGE) {
          Moveto.move(creep,hostileBuildings);
      }
    }
  }*/
}
/*
jobs.brickwall = function(creep){
  var hostiles = creep.pos.findClosestByRange(jobs.FindHostile(creep.room));
  var hostileBuildings = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_WALL}});
  //console.log(hostileBuildings);
  if(creep.getActiveBodyparts(ATTACK) != 0){
    if(creep.attack(hostileBuildings) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,hostileBuildings);
    }
  }else if(creep.getActiveBodyparts(WORK) != 0){
    //console.log(JSON.stringify(hostileBuildings));
    if(creep.dismantle(hostileBuildings) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,hostileBuildings);
    }
  }else if(creep.getActiveBodyparts(HEAL) != 0){
    var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                 filter: function(object) {
                     return object.hits < object.hitsMax;
                 }
    });
    if(creep.heal(target) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,target);
    }
  }if(creep.getActiveBodyparts(RANGED_ATTACK) != 0){
    if(hostiles != undefined){
        if(creep.rangedAttack(hostiles) == ERR_NOT_IN_RANGE) {
            Moveto.move(creep,hostiles, {reusePath: 50});
        }
      }
  }
}

jobs.War = function(creep){ //All different strategie/tactics should be included here.
  var hostiles = creep.pos.findClosestByRange(jobs.FindHostile(creep.room));
  var hostileBuildings = creep.pos.findClosestByRange(jobs.FindHostileStructure(creep.room));
  if(creep.getActiveBodyparts(ATTACK) != 0){
    if(hostiles != undefined){
        creep.say('I see you ',true);
        if(creep.attack(hostiles) == ERR_NOT_IN_RANGE) {
            Moveto.move(creep,hostiles, {reusePath: 50});
        }
    }
  }else if(creep.getActiveBodyparts(WORK) != 0){
    if(creep.dismantle(hostileBuildings) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,hostileBuildings);
    }
  }else if(creep.getActiveBodyparts(HEAL) != 0){
    if(creep.heal(target) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,target);
    }
  }else if(creep.getActiveBodyparts(RANGED_ATTACK) != 0){
      //jobranger
  }else if(creep.getActiveBodyparts(CLAIM) != 0){
      //jobclaimer
  }else if(creep.getActiveBodyparts(TOUGH) != 0 && (creep.getActiveBodyparts(ATTACK) == 0 && creep.getActiveBodyparts(RANGED_ATTACK) == 0)){
      //jobtoughguy
  }
}
*/
jobs.GetEnergy = function(creep){ //get energy at storage first, then at extensions+spawns. Needs conditional to block picking up.
  try{
    var storages = creep.room.storage;
    var extensions = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Extensions);
    var spawns = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Spawns);
    var tower = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Towers);
    tower = _.filter(tower, function(structure){return (structure.energy != structure.energyCapacity); });
    var Sources = extensions.concat(spawns,extensions);
    var amountFull = extensions.concat(spawns,extensions).length;
    Sources = _.filter(Sources, function(structure){return (structure.energy != 0); });
    var Source = creep.pos.findClosestByRange(Sources);
      if(storages != undefined){
              if(amountFull != Sources.length || creep.memory.role == 'worker' || tower.length > 0){
                  if(storages.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                      Moveto.move(creep,storages);
                 }
              }
          else{
              jobs.EmptyLink(creep);

          }
      }else if(Memory.WithdrawLight == true && (creep.room.energyAvailable > creep.room.energyCapacityAvailable*0.3) && creep.memory.role == 'worker'){
          if(Source.transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ extensions, spawns
              Moveto.move(creep,Source);
          }
      }
  }
  catch(err){
    console.log('Error in job.getEnergy '+err);
    jobs.GatherEnergy(creep);
  }
}

jobs.EmptyLink = function(creep){
  var Links = Mem.run(Memory.rooms[creep.memory.destRoom].RoomInfo.Links);
  //console.log(Game.rooms[creep.memory.destRoom].storage.pos);
  var link = Game.rooms[creep.memory.destRoom].storage.pos.findInRange(Links, 6)[0];
    if(Links.length > 1){
      //var link = linkSend.pos.findInRange(FIND_MY_STRUCTURES, 2)[0]
      if(link != undefined && link.energy > 0){
          if(creep.carry.energy != creep.carryCapacity){ // if creep is empty
              //creep.say('The egg is cracked',true);
              if(link.transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                  Moveto.move(creep,link);
              }
          }/*else{
            if(creep.transfer(Target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //deposit @ storage
                Moveto.move(creep,Target);
            }
          }*/
        }else{
          //console.log('trying to gather through emptylink');
          jobs.GatherEnergy(creep);
        }
    }
}


module.exports = jobs;

define("creep.jobs", function(){});

var Memstructures = {};

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('get.memory');
 * mod.thing == 'a thing'; // true
 */



Memstructures.run = function(MemoryPointer){ //use this function to retrieve buildings from a type from memory. Like this var test = Memstructures(Memory.rooms[MyRoom].RoomInfo.Sources);
    var returnresult = [];
    for(i in MemoryPointer){
        returnresult.push(Game.getObjectById(MemoryPointer[i]));
        if(Game.getObjectById(MemoryPointer[i]) == undefined && MemoryPointer.length == 0){
            console.log("Causing error: "+MemoryPointer[0]);
            console.log('error @ '+Game.getObjectById(MemoryPointer[i]));
            returnresult = false;
            break;
        }
    }
        return returnresult;

    //console.log('returned:'+(returnresult == false));
}

Memstructures.reset = function(MyRoom){
  try{
    delete Memory.rooms[MyRoom].RoomInfo;
  }
  catch(err){
    console.log('Error in resetting RoomInfo '+err);
  }
}

Memstructures.resetroomcreep = function(MyRoom){
    delete Memory.rooms[MyRoom].creepInfo;
}

Memstructures.setroomcreep = function(MyRoom,farmers,transporters,workers,army,P1,P2,P3,P4){
  if(Memory.rooms[MyRoom] == undefined){
    Memory.roomdb[MyRoom].creepInfo ={
      Farmers: [farmers,P1],
      Transporters: [transporters,P2],
      Workers: [workers,P3],
      Army: [army,P4]
    };
  }else{
    Memory.rooms[MyRoom].creepInfo ={
      Farmers: [farmers,P1],
      Transporters: [transporters,P2],
      Workers: [workers,P3],
      Army: [army,P4]
    };
  }


}

Memstructures.CreepsInRoom = function(MyRoom){ //returns living creeps in a room
  var memcreeps = Memory.creeps;
  var RoomCreeps = _.filter(memcreeps, (creep) => (creep.roomTo == MyRoom)); //creeps destination in this room
  var FarmersPresent = _.filter(RoomCreeps, (creep) => (creep.role == 'farmer'));
  var HarvestersPresent = _.filter(RoomCreeps, (creep) => (creep.role == 'harvester'));
  var WorkersPresent = _.filter(RoomCreeps, (creep) => (creep.role == 'worker'));
  var ArmyPresent = _.filter(RoomCreeps, (creep) => (creep.role == 'army'));
  
  return [RoomCreeps,FarmersPresent,HarvestersPresent,WorkersPresent,ArmyPresent];
}

Memstructures.InQueue = function(MyRoom,Role){ //returns number of creeps in the spawnqueue of a certain role
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
  //console.log(Role+creepInQueue);
  return creepInQueue;
}else{
  return 0;
}
}

Memstructures.AddtoQueue = function(priority,layout,role,destination,To,From,Flag,jobarray){
  var creep = [priority,layout,role,destination,To,From,Flag,jobarray];
  if(Memory.SpawnQueue == undefined){
    Memory.SpawnQueue = [];
  }
  Memory.SpawnQueue.unshift(creep);
  Memory.SpawnQueue.sort()
}

Memstructures.ReturnCreep = function(){
  return Memory.SpawnQueue.shift()
}

Memstructures.set = function(MyRoom,SpawnName2){ //use this function to retrieve buildings from a type from memory. Like this var test = Memstructures(Memory.rooms[MyRoom].RoomInfo.Sources);
            var sourcess = [];
            var towerss = [];
            var storagess = [];
            var containerss = [];
            var linkss = [];
            var extensionss = [];
            var labss = [];
            var wallss = [];
            var rampartss = [];
            var roadss = [];
            var extractorss = [];
            var terminalss = [];
            var spawnss = [];

            var sources = Game.rooms[MyRoom].find(FIND_SOURCES);
            var towers = Game.rooms[MyRoom].find(FIND_MY_STRUCTURES, {
                            filter: { structureType: STRUCTURE_TOWER
                            }
                    });
            var storages = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_STORAGE );
                            }
                    });
            var containers = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_CONTAINER );
                            }
                    });
            var links = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_LINK );
                            }
                    });
            var extensions = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION );
                            }
                    });
            var labs = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_LAB );
                            }
                    });
            var walls = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_WALL );
                            }
                    });
            var ramparts = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_RAMPART );
                            }
                    });
            var roads = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_ROAD );
                            }
                    });
            var extractors = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTRACTOR );
                            }
                    });
            var terminals = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_TERMINAL );
                            }
                    });
            var Roomspawns = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN );
                            }
                    });

            for(var i in sources){ //iterate through object and stor Id's for Game.getObjedtById();
                sourcess.push(sources[i].id);
            }

            for(var i in towers){ //iterate through object and stor Id's for Game.getObjedtById();
                towerss.push(towers[i].id);
            }

            for(var i in storages){ //iterate through object and stor Id's for Game.getObjedtById();
                storagess.push(storages[i].id);
            }

            for(var i in containers){ //iterate through object and stor Id's for Game.getObjedtById();
                containerss.push(containers[i].id);
            }

            for(var i in links){ //iterate through object and stor Id's for Game.getObjedtById();
                linkss.push(links[i].id);
            }

            for(var i in extensions){ //iterate through object and stor Id's for Game.getObjedtById();
                extensionss.push(extensions[i].id);
            }

            for(var i in labs){ //iterate through object and stor Id's for Game.getObjedtById();
                labss.push(labs[i].id);
            }

            for(var i in walls){ //iterate through object and stor Id's for Game.getObjedtById();
                wallss.push(walls[i].id);
            }

            for(var i in ramparts){ //iterate through object and stor Id's for Game.getObjedtById();
                rampartss.push(ramparts[i].id);
            }

            for(var i in roads){ //iterate through object and stor Id's for Game.getObjedtById();
                roadss.push(roads[i].id);
            }

            for(var i in extractors){ //iterate through object and stor Id's for Game.getObjedtById();
                extractorss.push(extractors[i].id);
            }

            for(var i in terminals){ //iterate through object and stor Id's for Game.getObjedtById();
                terminalss.push(terminals[i].id);
            }

            for(var i in Roomspawns){ //iterate through object and stor Id's for Game.getObjedtById();
                spawnss.push(Roomspawns[i].id);
            }
            Memory.rooms[MyRoom].RoomInfo = {
                SpawnName: SpawnName2, //do this different, get the object ID's push them in an array and insert them in memory. saves memory and we need Game.getObjectById() to do game actions. methods don't work with memory ofc
                RoomName: Game.spawns[SpawnName2].room.name,
                Sources:  sourcess,
                Towers: towerss,
                Storages: storagess,
                Containers: containerss,
                Links: linkss,
                Extensions: extensionss,
                Labs: labss,
                Terminals: terminalss,
                Extractors: extractorss,
                Roads: roadss,
                Walls: wallss,
                Ramparts: rampartss,
                Spawns: spawnss
            };
}

Memstructures.setExt = function(MyRoom){ //use this function to retrieve buildings from a type from memory. Like this var test = Memstructures(Memory.rooms[MyRoom].RoomInfo.Sources);
            var sourcess = [];
            var towerss = [];
            var storagess = [];
            var containerss = [];
            var linkss = [];
            var extensionss = [];
            var labss = [];
            var wallss = [];
            var rampartss = [];
            var roadss = [];
            var extractorss = [];
            var terminalss = [];
            var spawnss = [];
            var hostiless = [];

            var sources = Game.rooms[MyRoom].find(FIND_SOURCES);
            var towers = Game.rooms[MyRoom].find(FIND_MY_STRUCTURES, {
                            filter: { structureType: STRUCTURE_TOWER
                            }
                    });
            var storages = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_STORAGE );
                            }
                    });
            var containers = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_CONTAINER );
                            }
                    });
            var links = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_LINK );
                            }
                    });
            var extensions = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION );
                            }
                    });
            var labs = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_LAB );
                            }
                    });
            var walls = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_WALL );
                            }
                    });
            var ramparts = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_RAMPART );
                            }
                    });
            var roads = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_ROAD );
                            }
                    });
            var extractors = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTRACTOR );
                            }
                    });
            var terminals = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_TERMINAL );
                            }
                    });
            var Roomspawns = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN );
                            }
                    });

            var hostiles = Game.rooms[MyRoom].find(FIND_HOSTILE_CREEPS);
            for (var i in hostiles){
                hostiless.push(hostiles[i].id);
            }
            for(var i in sources){ //iterate through object and stor Id's for Game.getObjedtById();
                sourcess.push(sources[i].id);
            }

            for(var i in towers){ //iterate through object and stor Id's for Game.getObjedtById();
                towerss.push(towers[i].id);
            }

            for(var i in storages){ //iterate through object and stor Id's for Game.getObjedtById();
                storagess.push(storages[i].id);
            }

            for(var i in containers){ //iterate through object and stor Id's for Game.getObjedtById();
                containerss.push(containers[i].id);
            }

            for(var i in links){ //iterate through object and stor Id's for Game.getObjedtById();
                linkss.push(links[i].id);
            }

            for(var i in extensions){ //iterate through object and stor Id's for Game.getObjedtById();
                extensionss.push(extensions[i].id);
            }

            for(var i in labs){ //iterate through object and stor Id's for Game.getObjedtById();
                labss.push(labs[i].id);
            }

            for(var i in walls){ //iterate through object and stor Id's for Game.getObjedtById();
                wallss.push(walls[i].id);
            }

            for(var i in ramparts){ //iterate through object and stor Id's for Game.getObjedtById();
                rampartss.push(ramparts[i].id);
            }

            for(var i in roads){ //iterate through object and stor Id's for Game.getObjedtById();
                roadss.push(roads[i].id);
            }

            for(var i in extractors){ //iterate through object and stor Id's for Game.getObjedtById();
                extractorss.push(extractors[i].id);
            }

            for(var i in terminals){ //iterate through object and stor Id's for Game.getObjedtById();
                terminalss.push(terminals[i].id);
            }

            for(var i in Roomspawns){ //iterate through object and stor Id's for Game.getObjedtById();
                spawnss.push(Roomspawns[i].id);
            }
            Memory.roomdb[MyRoom].RoomInfo = {
                RoomName: MyRoom,
                Sources:  sourcess,
                Towers: towerss,
                Storages: storagess,
                Containers: containerss,
                Links: linkss,
                Extensions: extensionss,
                Labs: labss,
                Terminals: terminalss,
                Extractors: extractorss,
                Roads: roadss,
                Walls: wallss,
                Ramparts: rampartss,
                Spawns: spawnss,
                Hostiles: hostiless
            };
}

Memstructures.Allies = function(Name){
  if(Memory.Allies == undefined){
    Memory.Allies = [];
  }
  Memory.Allies.unshift(Name);
}

Memstructures.CreepToWar = function(creep,n){
  var Inband = false;
  for(var j in Memory.Warband){
    Wb = Memory.Warband[j];
    for(var i in Wb.Names){
      if(creep.name == Wb.Names[i]){
        Inband = true;
      }
    }
  }
  if(!Inband){
    Memory.Warband[n].Names.unshift(creep.name);
    creep.memory.destRoom = Memory.Warband[n].Flag;
    creep.memory.roomFrom = Memory.Warband[n].Flag2;
    creep.memory.Warband = n;
    console.log('creep: '+creep.name+' Was dispatched to warband '+n);
  }
}

Memstructures.WarStats = function(n,towers,mode,SpawningDef,NoArmy,AvgSize,NoCreeps,kills,death,Route){
  Memory.Warband[n].Mode = {
    Mode:mode,
    Towers:towers,
    Spawningdef:SpawningDef,
    TotalEnemies: NoCreeps,
    TotalArmy: NoArmy,
    AttackRoute:Route,
    AvgArmy: AvgSize,
    HisLos: kills,
    MyLos: death
  }

}

Memstructures.DeleteWarband = function(Room,mode){
  var c = 0;
  for(var i in Memory.Warband){
    if(Memory.Warband.Flag == Room && (Memory.Warband.Mode == mode || Memory.Warband.Mode.Mode == mode)){
      c = i;
    }
  }
  delete Memory.Warband[c];
}

Memstructures.initWarband = function(type,flag,flag2,mode,names,soldier,range,heal,tough,work,claim){
  if(Memory.Warband == undefined){
    Memory.Warband = [];
  }

  Memory.Warband.push({
    Type:type,
    Flag:flag,
    Flag2:flag2,
    Mode:mode,
    Names:names,
    S:soldier,
    R:range,
    H:heal,
    T:tough,
    W:work,
    C:claim
  });
}


module.exports = Memstructures;

define("get.memory", function(){});

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('move.to');
 * mod.thing == 'a thing'; // true
 */
var Moveto = {

    move:function(creep,target){

      if((Game.cpu.tickLimit - Game.cpu.getUsed()) > (10)) {//Game.cpu.tickLimit - 100
              creep.moveTo(target);//, {reusePath: 60}creep.moveTo(target, {avoid: creep.room.find(STRUCTURE_ROAD)});
      }else{
        creep.moveTo(target, {noPathFinding: true});
      }
        // Perform pathfinding only if we have enough CPU

    }
}
module.exports = Moveto;

define("move.to", function(){});

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

module.exports = random;

define("rand", function(){});

var roleArmy = {

    /** @param {Creep} creep **/
    run: function(creep) {
      try{
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs')
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,new RoomPosition(25, 25, creep.memory.destRoom));
	    }else{
          creep.memory.destRoom = creep.memory.roomTo;
	        if(creep.pos.inRangeTo(Game.flags[creep.memory.destRoom],25)){
                Jobs[creep.memory.jobs[0]](creep);
              }else{
	            Moveto.move(creep,Game.flags[creep.memory.destRoom].pos);
	        }
	    }
    }
    catch(err){
      console.log('error in army: '+err);
    }
  }
};

module.exports = roleArmy;
//old defender Jobs['Attack'](creep);
//make rangers through this module and maybe healers.
;
define("role.army", function(){});


var roleBuilder = {

    run: function(creep) {
        try{
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs')
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

            if(Jobs[creep.memory.jobs[0]](creep)) {
                //console.log(creep.name+' Executing '+creep.memory.jobs[0]);
            }else if(Jobs[creep.memory.jobs[1]](creep)){
                //console.log(creep.name+' Executing '+creep.memory.jobs[1]);
	        }else if(Jobs[creep.memory.jobs[2]](creep)){
	            //console.log(creep.name+' Executing '+creep.memory.jobs[2]);
            }
    }else{
	        if(Game.flags.Dismantle != undefined){
  	            if(creep.pos.inRangeTo(Game.flags.Dismantle,6)){
  	               Jobs[creep.memory.jobs[3]](creep);
	            }else{
	                Moveto.move(creep,Game.flags.Dismantle.pos);
	            }
	        }else{

	            if(creep.room.storage == undefined || _.sum(creep.room.storage.store) > BufferThreshold) {
                Jobs[creep.memory.jobs[4]](creep);
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

//jobs: Build, Repair, Attack, GetEnergy (old builder)(shift through Jobs??)
//jobs: Upgrade, GetEnergy (old upgrader)
//jobs: Build, GatherEnergy + RoomFrom & RoomTo == claimed/non-owned room(old external builder)
;
define("role.builder", function(){});

var roleFarmer = {

    /** @param {Creep} creep **/
    run: function(creep) {
      try{
        var Moveto = require('move.to');
        var Jobs = require('creep.jobs');
        if(creep.memory.destRoom != creep.room.name){
	            Moveto.move(creep,Game.flags[creep.memory.destRoom]);
	      }else{
            creep.memory.destRoom = creep.memory.roomTo;
            Jobs[creep.memory.jobs[0]](creep);
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
;
define("role.farmer", function(){});

var roleHealer = {

    /** @param {Creep} creep **/
    run: function(creep) {
      try{
        var Moveto = require('move.to');
        var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                     filter: function(object) {
                         return object.hits < object.hitsMax;
                     }
        });
        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                Moveto.move(creep,target);
            }
        }else{
            if(Game.flags.Flag2 != undefined){
                if(creep.pos.inRangeTo(Game.flags.Flag2,10)){

                }else{
                    Moveto.move(creep,Game.flags.Flag2.pos);
                }
            }else{
                Moveto.move(creep,Game.rooms[creep.memory.Home].controller.pos);
            }
        }
    }
  catch(err){
    console.log('error in healer: '+err);
  }
}};

module.exports = roleHealer;

define("role.healer", function(){});

var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep,No,buildInfra) {
        try{
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
	        creep.say('! Energiez!', true);
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
      catch(err){
        console.log('error in transporter: '+err);
      }
}
};

module.exports = roleTransporter;

//jobs: GatherEnergy, FillStructures, (old harvester)
//jobs: GetEnergy, FillStructures, EmptyLink (old EnergyManager)
//jobs: GatherEnergy, FillStructures + RoomFrom, RoomTo -> old trucker
//jobs: GetEnergy, FillStructures + RoomFrom, RoomTo -> equalizer, transport between rooms
;
define("role.transporter", function(){});

var tower = {}

tower.run = function(MyRoom,towers,ramparts,containers,hostiles){

  if(towers.length > 0 && towers[0] != null){

      var damagedStructures = ramparts;
      var structHp = Math.pow((11-Game.rooms[MyRoom].controller.level),(11-Game.rooms[MyRoom].controller.level)/2)

      var damagedStructures = _.filter(damagedStructures, function(structure){return (structure.hits < 300000); });
      //var damagedStructures = damagedStructures.concat(roads,towers,Game.spawns[SpawnName])
      damagedStructures.concat(containers);
      var c = 0;
      for (i = 0; i < damagedStructures.length; i++){
          if(damagedStructures[i].hits < damagedStructures[c].hits){
              c = i;
          }
      }

      for(var id in towers){
          var tower = towers[id];
          if(damagedStructures[c] && tower.energy > tower.energyCapacity*0.89){
            tower.repair(damagedStructures[c]);
          }
          if(hostiles) {
              tower.attack(hostiles);
          }
      }
  }
}
module.exports = tower;

define("tower", function(){});

