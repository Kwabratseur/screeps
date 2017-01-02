

if((Memory.stats.HostilesInterritory == undefined || Memory.stats.HostilesInterritory == 0) && Memory.stats.RegenBucket == 1){
    var jobs = require('creep.jobs');
    var random = require('rand');
    var Hostiles = 0;
    var hostile = 0;
    for(var name in Game.rooms){
        hostile = Game.rooms[name].controller.pos.findClosestByRange(jobs.FindHostile(name));
        if(hostile){
            Hostiles += hostile.length;
        }
    }
    if(Game.cpu.bucket > 9995){
        Memory.stats.RegenBucket = 0;
    }
    Memory.stats.HostilesInTerritory = Hostiles;
    random.ExecCreeps(3);
    console.log('Hostiles present: '+Hostiles+', used: '+Game.cpu.getUsed()+', Regenerating Bucket:'+Game.cpu.bucket);
}else{

var Memstructures = require('get.memory');
var Build = require('creep.builder');
var jobs = require('creep.jobs');
var random = require('rand');
var tower = require('tower');
var msg = '';

module.exports.loop = function(){

    if(Game.cpu.bucket < 8000){
        Memory.stats.RegenBucket = 1;
    }

    var timer = random.initTimers();
    var MyRooms = [];
    var Hostiles = 0;
    if(timer[0]||timer[1]||timer[2]){
        console.log('ten:'+timer[0]+', five:'+timer[1]+', fifty:'+timer[2]); //timers
    }

    for(var name in Game.spawns){
        var MyRoom = Game.spawns[name].room.name;
        var RoomStat = [];
        var hostiles = Game.spawns[name].pos.findClosestByRange(jobs.FindHostile(MyRoom));
        if(hostiles){
            Hostiles += hostiles.length;
        }

        if(!Memory.rooms[MyRoom]){
            Memory.rooms[MyRoom] = {};
        }
        if(!Memory.rooms[MyRoom].RoomInfo){
            Memstructures.set(MyRoom,name);
            console.log('No Roominfo');
        }
        var sources = Memstructures.run(Memory.rooms[MyRoom].RoomInfo.Sources);
        var buffer = Memstructures.run(Memory.rooms[MyRoom].RoomInfo.Storages);
        var links = Memstructures.run(Memory.rooms[MyRoom].RoomInfo.Links);
        var spawn = Memstructures.run(Memory.rooms[MyRoom].RoomInfo.Spawns);
        var Sites = Game.rooms[MyRoom].find(FIND_CONSTRUCTION_SITES);
        var drops = Game.rooms[MyRoom].find(FIND_DROPPED_RESOURCES);

        var towers = Memstructures.run(Memory.rooms[MyRoom].RoomInfo.Towers);
        var containers = Memstructures.run(Memory.rooms[MyRoom].RoomInfo.Containers);
        var ramparts = Memstructures.run(Memory.rooms[MyRoom].RoomInfo.Ramparts);
        //Game.rooms['W17N73'].controller.progressTotal
        Memory.stats["room." + MyRoom + ".progressTotal"] = Game.rooms[MyRoom].controller.progressTotal;
        Memory.stats["room." + MyRoom + ".progress"] = Game.rooms[MyRoom].controller.progress;
        Memory.stats["room." + MyRoom + ".ticksToDowngrade"] = Game.rooms[MyRoom].controller.ticksToDowngrade;
        tower.run(MyRoom,towers,ramparts,containers,hostiles);


        MyRooms.push(MyRoom);

        if(timer[2]){
            Build.ReconsiderJobs(MyRoom,drops,Sites)
        }

        if(Game.time%2==0){ //every 2 ticks
        var structs = Game.rooms[MyRoom].find(FIND_STRUCTURES);
        RoomStat = Build.CreepDemand(MyRoom,Game.rooms[MyRoom].controller.level,Memory.SpawnActivityLt,hostiles,sources,buffer,spawn,links,true);
        /***--- Memory Cleanup ---***///
        if((!Memory.rooms[MyRoom].Sites || (Memory.rooms[MyRoom].Sites != Sites.length)) && (Sites.length > 0)){
            Memory.rooms[MyRoom].Sites = Sites.length;
            console.log('Building structure /making build queue in room'+MyRoom+', BuildingSites:'+Sites.length);
            Memstructures.reset(MyRoom);
        }
        if(!Memory.rooms[MyRoom].structs || (Memory.rooms[MyRoom].structs != structs.length)){
            Memory.rooms[MyRoom].structs = structs.length;
            console.log('Building Destroyed/built in '+MyRoom+', Buildings:'+structs.length);
            Memstructures.reset(MyRoom);
        }
        }

    }

    //calculate creepdemand @ non-owned rooms -> write seperate creepDemand for such situations(filter possible owned rooms!)
    //add non-owned rooms to MyRooms




    if(Game.time%2==0){
        for(var name in Memory.roomdb){
            Build.ExtCreepDemand(Memory.roomdb[name])
            MyRooms.push(name);
        }
        for(var i in Memory.creeps) {
            if(!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
        for(var i in MyRooms){
            Build.AutoQueue(MyRooms[i]);
        }
    }

    if(timer[1] && Memory.SpawnQueue.length > 0){
        Build.SpawnCreep();
    }

    if(timer[2]){
        random.FlagScan();
    }
    var totalCreeps = random.ExecCreeps();
    Memory.stats.HostilesInTerritory = Hostiles;
    Memory.stats.HighestEnergy = Memory.HighestEnergy;
    Memory.stats.Spawning = Memory.Spawning;
    Memory.stats.SpawnActivity = Memory.SpawnActivityLt[0];
    Memory.stats.HighestFillDegree = Memory.BestFilled;
    Memory.stats.CPU = Game.cpu.getUsed();
    Memory.stats.TotalCreeps = totalCreeps;
    Memory.stats.CPUbucket = Game.cpu.bucket;
    Memory.stats.CPUPC = (Game.cpu.getUsed()/totalCreeps);
    msg = '---net-CPU:'+(Game.cpu.limit-Game.cpu.getUsed())+'-----Per creep:'+(Game.cpu.getUsed()/totalCreeps)+'----Bucket:'+Game.cpu.bucket+'----Ticklimit:'+Game.cpu.tickLimit;
    console.log(msg);
}
}
