var jobs = {};
var Transfer = require('action.transfer');
var Moveto = require('move.to');
var Mem = require('get.memory');

jobs.GatherEnergy = function(creep){ // first empty containers, then drops.
    var drops = creep.room.find(FIND_DROPPED_RESOURCES);
    if(!Transfer.from(creep,creep.room.name,"Containers",RESOURCE_ENERGY,'filled')){
      //console.log('Harvester '+creep.name+' is Transfering energy From Container');
    }
    else if(drops.length>0){
        Moveto.move(creep,drops[0]);
        creep.pickup(drops[0]);
    }
}

jobs.FillStructures = function(creep,buildInfra){ //fill structures

  if(!Transfer.to(creep,creep.room.name,"Spawns",RESOURCE_ENERGY,'unfilled')){
      //console.log('Harvester '+creep.name+' is Transfering energy to Spawn');
  }else if(!Transfer.to(creep,creep.room.name,"Extensions",RESOURCE_ENERGY,'unfilled')){
      //console.log('Harvester '+creep.name+' is Transfering energy to Extension');
  }else if(!Transfer.to(creep,creep.room.name,"Towers",RESOURCE_ENERGY,'unfilled')){ //this replaces 50 lines of code :)
      //console.log('Harvester '+creep.name+' is Transfering energy to Tower');
  }else if(!Transfer.to(creep,creep.room.name,"Storages",RESOURCE_ENERGY,'unfilled')){ //this indicates the priority of filling. Undefineds are skipped automatically
      //console.log('Harvester '+creep.name+' is Transfering energy to Storage');
  }
  if(buildInfra){
      creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
  }
}

jobs.MineEnergy = function(creep){ // mines the sourceID in-memory of creep. Will drop resources in link or container if possible
  var Containers = Mem.run(Memory.rooms[creep.memory.destRoom].RoomInfo.Containers);
  var containers = creep.pos.findClosestByRange(Containers);
  if(Containers[0] != undefined && creep.pos != containers.pos && Math.abs(creep.pos.x-containers.pos.x) < 3 && Math.abs(creep.pos.y-containers.pos.y) < 3){
      Moveto.move(creep,containers);
  }if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {
          Moveto.move(creep,Game.getObjectById(creep.memory.sourceID));
  }
  else {
    var Links = Mem.run(Memory.rooms[creep.memory.destRoom].RoomInfo.Links);
    var linkSend = creep.pos.findInRange(Links, 2)[0];
    if(linkSend != undefined){
        if(creep.carry.energy == creep.carryCapacity){
            if(creep.transfer(linkSend, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            }else{
                Moveto.move(creep,linkSend);
            }
        }
    }else{
        creep.drop(RESOURCE_ENERGY);
    }
  }
}

jobs.Build = function(creep){
  var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
  if(targets.length) {
      if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          Moveto.move(creep,targets[0]);

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
  var damagedStructures = roads.concat(walls,ramparts,containers);
  var structHp = Math.pow((10-creep.room.controller.level),(10-creep.room.controller.level)/2)
  var damagedStructures = _.filter(damagedStructures, function(structure){return (structure.hits < structure.hitsMax/structHp); });
  var numberDamaged = damagedStructures.length;
  var ClosestDamagedStructure = creep.pos.findClosestByRange(damagedStructures);
  if(numberDamaged > 10){
      if(creep.repair(ClosestDamagedStructure) == ERR_NOT_IN_RANGE) {
          Moveto.move(creep,ClosestDamagedStructure);

      }
      return true;
      }else{
        return false;
      }
}

jobs.Upgrade = function(creep){
  if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
      Moveto.move(creep,creep.room.controller);
  }
  return true;
}

jobs.Attack = function(creep){
  var hostiles = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  var hostileBuildings = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
  if(creep.getActiveBodyparts(ATTACK) != 0){
    if(hostiles != undefined){
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
  }else{
    if(creep.attack(hostileBuildings) == ERR_NOT_IN_RANGE) {
        Moveto.move(creep,hostileBuildings);
    }
  }
}

jobs.GetEnergy = function(creep){ //get energy at storage first, then at extensions+spawns. Needs conditional to block picking up.
  var storages = creep.room.storage;

  var extensions = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Extensions);
  var spawns = Mem.run(Memory.rooms[creep.room.name].RoomInfo.Spawns);
  var Sources = extensions.concat(spawns,extensions)
    if(storages != undefined){
          jobs.EmptyLink(creep);
          if(storages.transfer(creep,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                    Moveto.move(creep,storages);
               }

    }else if((creep.room.energyAvailable > creep.room.energyCapacityAvailable/2) && Memory.WithdrawLight == true){
        if(Sources[0].transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                Moveto.move(creep,Sources[0]);
            }

    }
}

jobs.EmptyLink = function(creep){
  var Links = Mem.run(Memory.rooms[creep.memory.destRoom].RoomInfo.Links);
  var linkSend = creep.pos.findInRange(Links, 6)[0];
  var Target = linksend.pos.findInRange(FIND_MY_STRUCTURES, 2)[0]
  if(link != undefined && link.energy > 0){
      if(creep.carry.energy == 0){ // if creep is empty
          if(link.transferEnergy(creep) == ERR_NOT_IN_RANGE) { //withdraw @ storage
              Moveto.move(creep,link);
          }
      }else{
        if(creep.transfer(Target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) { //withdraw @ storage
            Moveto.move(creep,Target);
        }
      }
    }
}


module.exports = jobs;
