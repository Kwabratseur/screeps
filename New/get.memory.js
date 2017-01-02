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
