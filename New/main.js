var Mem = require('get.memory');
var Cbuilder = require('creep.builder');
var Jobs = require('creep.jobs');
var Randfcn = require('rand');
var roleTransporter = require('role.transporter');
var roleFarmer = require('role.farmer');
var roleBuilder = require('role.builder');
var roleArmy = require('role.army');
var Towercode = require('tower');

module.exports.loop = function(){
    
    var Execute = true;
    if(Execute){
    var timer = Randfcn.initTimers();
    var MyRooms = [];

    if(timer[0]||timer[1]||timer[2]){
        console.log('ten:'+timer[0]+', five:'+timer[1]+', fifty:'+timer[2]); //timers
    }

    for(var name in Game.spawns){
        var MyRoom = Game.spawns[name].room.name;
        var RoomStat = [];
        var hostiles = Game.spawns[name].pos.findClosestByRange(Jobs.FindHostile(MyRoom));
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
        var structs = Game.rooms[MyRoom].find(FIND_STRUCTURES);
        var towers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Towers);
        var containers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Containers);
        var ramparts = Mem.run(Memory.rooms[MyRoom].RoomInfo.Ramparts);
        
        Towercode.run(MyRoom,towers,ramparts,containers,hostiles);
        
        RoomStat = Cbuilder.CreepDemand(MyRoom,Game.rooms[MyRoom].controller.level,Memory.SpawnActivityLt,hostiles,sources,buffer,spawn,links,true);
        MyRooms.push(MyRoom);
        
        if(timer[2]){
            Cbuilder.ReconsiderJobs(MyRoom,drops,Sites)
        }
        
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
    
    //calculate creepdemand @ non-owned rooms -> write seperate creepDemand for such situations(filter possible owned rooms!)
    //add non-owned rooms to MyRooms 

    
    for(var name in Memory.roomdb){
        Cbuilder.ExtCreepDemand(Memory.roomdb[name])
        MyRooms.push(name);
    }
    
    if(Game.time%2==0){
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
      if(creep.memory.role == 'worker') {

              roleBuilder.run(creep);
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
    console.log('------CPU:'+Game.cpu.getUsed()+'-----Per creep:'+(Game.cpu.getUsed()/totalCreeps)+'----Bucket:'+Game.cpu.bucket);
    }
}