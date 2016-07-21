/*
TODO:
Optimize finding of object by putting it in memory

Create spawn queue  +  amount desired body parts

put the target and source in creep memory and recalculate when needed

Room Object can be updated once in 20 ticks or so
*/

var startCpu = Game.cpu.getUsed();
var _ = require('lodash');
var profiler = require('screeps-profiler');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleWorker = require('role.worker');
var roleDefender = require('role.defender');
var roomDefense = require('room.defense');
var farmTile = require('farm.tile');
var roleEnergyMon = require('role.energymon');
var roleHealer = require('role.healer');
var roleClaimer = require('role.claimer');
var Mem = require('get.memory');
var Transfer = require('action.transfer');
var CreepBuilder = require('creep.builder');

//use profiler with Game.profiler.profile(ticks) || .email || .stream

/*
Protip:

given creep has roomTo and roomFrom and any initial destRoom
if(destRoom != creep.pos.roomName) { changeRoom(); return; }
// ELSE
if( flag==1 ) doStuff1();
if( flag==2 ) doStuff2();
if( stuff1Done ) { destRoom = roomTo;  flag= 2; }
if( stuff2Done ) { destRoom = roomFrom;  flag=1; }

*/

profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {
    var LogLength = 20;
    //var MyRoom = Game.spawns.Spawn1.room.name;
    
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    
    var oneLoop = false;
    var twoLoop = false;
    
    


    //
    for(var name in Game.spawns){ // Try to include All code except for FarmRoom code in this loop. Maybe multiple rooms can be controlled in this way.
		var SpawnName = name;
        var MyRoom = Game.spawns[SpawnName].room.name;    //Then offcourse make everything depend from variable MyRoom(mostly the case)
        var AvailableEnergy = 0;
        AvailableEnergy = Game.rooms[MyRoom].energyAvailable;

        if(!Memory.rooms[MyRoom] || !Memory.rooms[MyRoom].RoomInfo){ ///Use this method to save on CPU, try to add as much variables as possible without getting into memory problems.
            Mem.set(MyRoom,SpawnName);
            console.log('Setting memory for room: '+MyRoom);
        }


        var containers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Containers);
        var towers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Towers);
        var storages = Mem.run(Memory.rooms[MyRoom].RoomInfo.Storages); // that's it! this can save a lot of CPU of done everywhere.
        var links = Mem.run(Memory.rooms[MyRoom].RoomInfo.Links);
        var sources = Mem.run(Memory.rooms[MyRoom].RoomInfo.Sources);
        var extensions = Mem.run(Memory.rooms[MyRoom].RoomInfo.Extensions);
        var walls = Mem.run(Memory.rooms[MyRoom].RoomInfo.Walls);
        var ramparts = Mem.run(Memory.rooms[MyRoom].RoomInfo.Ramparts);
        var roads = Mem.run(Memory.rooms[MyRoom].RoomInfo.Roads);

        var Sites = Game.rooms[MyRoom].find(FIND_CONSTRUCTION_SITES);
        var structs = Game.rooms[MyRoom].find(FIND_STRUCTURES);
        //extractors = Mem.run(Memory.rooms[MyRoom].RoomInfo.Extractors);
        //terminals = Mem.run(Memory.rooms[MyRoom].RoomInfo.Terminals);    
        //labs = Mem.run(Memory.rooms[MyRoom].RoomInfo.Labs);
        /*console.log(containers == false);
        console.log(towers == false);
        console.log(links == false);
        console.log(storages == false);
        console.log(sources == false);
        console.log(extensions == false);
        console.log(walls == false);
        console.log(ramparts == false);
        console.log(roads == false);*/
        //console.log('links[0]: '+(Memory.rooms[MyRoom].RoomInfo.Links[0] == null));

 
        var harvester = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.Home == MyRoom));
        var builder = _.filter(Game.creeps, (creep) => (creep.memory.role == 'builder') && (creep.memory.Home == MyRoom));
        var upgrader = _.filter(Game.creeps, (creep) => (creep.memory.role == 'upgrader') && (creep.memory.Home == MyRoom));
        var worker = _.filter(Game.creeps, (creep) => (creep.memory.role == 'worker') && (creep.memory.Home == MyRoom));
        var defender = _.filter(Game.creeps, (creep) => (creep.memory.role == 'defender') && (creep.memory.Home == MyRoom));
        var energymon = _.filter(Game.creeps, (creep) => (creep.memory.role == 'energymon') && (creep.memory.Home == MyRoom));
        var healers = _.filter(Game.creeps, (creep) => (creep.memory.role == 'healer'));
        var claimer = _.filter(Game.creeps, (creep) => (creep.memory.role == 'claimer'));
        
        var SetupDefense = (function() {
        var executed = false;
        return function () {
            if (!executed) {
                executed = true;
               var ExitCoords = Game.rooms[MyRoom].find(FIND_EXIT);
               roomDefense.run(ExitCoords,MyRoom);
            }
        };
        })();    
        
            
        if(Game.rooms[MyRoom].memory.Level == undefined || Game.rooms[MyRoom].controller.level != Game.rooms[MyRoom].memory.Level){
            Memory.rooms[MyRoom].Level = Game.rooms[MyRoom].controller.level;
            Game.notify('Room: '+MyRoom+' Just leveled up to'+Game.rooms[MyRoom].controller.level);
            console.log('Room: '+MyRoom+' Just leveled up to'+Game.rooms[MyRoom].controller.level);
            Memory.rooms[MyRoom].Eticks = 3;
            Mem.reset(MyRoom);
        }
        
        if(Memory.rooms[MyRoom].Eticks > 0){ //spread more tasks over longer period
                var Ecenter = Game.flags.EnergyCenter;
                //SetupDefense();
                //energyCenter(Ecenter);
                Memory.rooms[MyRoom].Eticks -= 1;
        }
        
        function energyCenter(FlagPos){ //change loop order
            //console.log(FlagPos.pos.x);
            var BuildPosX = FlagPos.pos.x;
            var BuildPosY = FlagPos.pos.y;
            var c = 0;
            var BuildingToggle = true; //true is positive, false is negative
            for (var j = 0; j < 8; j++){
                for(i = 0 ; i < 11; i++){
                    if(BuildingToggle){
                        BuildingToggle = false;
                        Game.rooms[MyRoom].createConstructionSite(BuildPosX,BuildPosY,STRUCTURE_EXTENSION);
                    }else{
                        Game.rooms[MyRoom].createConstructionSite(BuildPosX,BuildPosY,STRUCTURE_ROAD);
                        BuildingToggle = true;
                    }
                    c +=1;
                    BuildPosY += 1;
                }
                BuildPosY = FlagPos.pos.y;
            BuildPosX -= 1;
            }
        }
        
        var linkFrom = 0;
        if(storages.length > 0){ // Rewrite Link-code, maybe put it in own Module, at least make it use the memory ID's. 
            
            var linkController = 0;
            var linkTower = 0;
            
            var linkTo = Game.rooms[MyRoom].storage.pos.findInRange(FIND_MY_STRUCTURES, 2,
            {filter: {structureType: STRUCTURE_LINK}})[0];
            
            for(id in sources){ // Look for link near sources
                var linkTemp = sources[id].pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: {structureType: STRUCTURE_LINK}});
                
                if(linkTemp.length > 0){
                    linkFrom = linkTemp[0];
                } // if link is found near a source, designate it as a linkFrom
            }
            
            if(Game.rooms[MyRoom].controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: {structureType: STRUCTURE_LINK}})){ //look for link near controller
                linkController = Game.rooms[MyRoom].controller.pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: {structureType: STRUCTURE_LINK}});
            }
            
            if(towers.length > 0){  //look for links near towers
                 for(var id in towers){
                    var linkTemp = towers[id].pos.findInRange(FIND_MY_STRUCTURES, 2, {filter: {structureType: STRUCTURE_LINK}});
                    if(linkTemp.length > 0){
                        linkTower = linkTemp;
                    }
                     
                 }
            }
            
            if(linkTo != undefined){ //if controller || tower links are defined and empty, prioritize them over the storage link.
                if(linkController.pos != undefined && linkController.energy == 0){
                    linkTo = LinkController[0];
                }else if(linkTower.pos != undefined && linkTower.energy == 0){
                    linkTo = linkTower[0];
                }
                if(linkFrom.energy == linkFrom.energyCapacity && linkTo.energy == 0 && linkFrom.cooldown == 0){
                    linkFrom.transferEnergy(linkTo); //then send the energy
                }
            }
        }
        
    
        var hostiles = Game.spawns[SpawnName].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        
        var healer = Game.spawns[SpawnName].pos.findClosestByRange(FIND_HOSTILE_CREEPS, {  // <-----------------------that's how we find stuff in the room, check code for occurance.
                        filter: function(object) {
                            return object.getActiveBodyparts(HEAL) != 0;
                        }
                    });
                    
        if(healer){
            hostiles = healer;
        }

        function NoCreeps(buil,upgr,work,harv,kill,AvailableEnergy,Hostiles){
            var Nbuil = 2;
            var Nupgr = 1;
            var Nwork = 2;
            var Nharv = 2;
            var Nkill = 0;
            var NEMon = 0;
            if(Game.rooms[MyRoom].controller.level < 4){
                Nupgr = 4;
            }
            if(Game.rooms[MyRoom].energyCapacityAvailable < 600){
                Nharv = 3;
                Nbuil = 3;
            }
            if(storages.length > 0){
                NEMon = 2;
                if(_.sum(storages[0].store) > 60000){
                    Nupgr += Math.round((_.sum(storages[0].store)-60000)/10000)
                }
            }
            if(linkFrom.pos != undefined){
                    Nharv = 1;
            }
            if(buil >= Nbuil && work >= Nwork && harv >= Nharv && AvailableEnergy > (Game.rooms[MyRoom].energyCapacityAvailable-300)) {
               Nkill = 1;
               if(Game.flags.Flag2 != undefined){
                   //Nkill += 1;
               }
            if(Hostiles){
                        //Nkill += 1;
                        }
            }      
            return [Nbuil,Nupgr,Nwork,Nharv,Nkill,NEMon];
        }
        
        
        var Nos = NoCreeps(builder.length,upgrader.length,worker.length,harvester.length,defender.length,AvailableEnergy,hostiles);

        //console.log(Math.pow((10-Game.rooms[MyRoom].controller.level),(10-Game.rooms[MyRoom].controller.level)/2));
        
        if(towers.length > 0){
            var damagedStructures = roads.concat(walls,ramparts,containers);
            var structHp = Math.pow((10-Game.rooms[MyRoom].controller.level),(10-Game.rooms[MyRoom].controller.level)/2)
           // console.log(damagedStructures);
            var damagedStructures = _.filter(damagedStructures, function(structure){return ((structure != null) && (structure.hits < structure.hitsMax/structHp)); });
            
            var c = 0;
            for (i = 0; i < damagedStructures.length; i++){
                if(damagedStructures[i].hits < damagedStructures[c].hits){
                    c = i;
                }
            }
            for(var id in towers){
                var tower = towers[id];
                    var closestDamagedStructure = tower.pos.findClosestByRange(damagedStructures);
                    if(closestDamagedStructure && !hostiles) {
                        tower.repair(damagedStructures[c]);
                    }
                    if(hostiles) {
                        tower.attack(hostiles);
                    }
            }
        }
  
        //this should be replaced with a spawnqueue in-memory with priorities. Harvesters+workers+Energymanagers have highest priority. If invasion, one set of harvester+worker+energymanager get higher priority then defence
        //also involve buffered amount in the priorities. A creep body size should also be taken into account, wait untill the harvested energy is available somewhere then spawn the creep and write the desired data to memory.
        //make it possible to create creeps for other rooms with the spawn of the other room
        
        if(((Game.flags.AttackController != undefined) || (Game.flags.ClaimController != undefined) || (Game.flags.ReserveController != undefined)) && claimer.length < 1 && Game.rooms[MyRoom].energyCapacityAvailable > 1200){
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy,0,"Claim");
			var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'claimer'});
            console.log('Attack/Claim/Reserve Target Controller with creep: '+newName+ ' in room '+MyRoom);
        }
        
        if(harvester.length < Nos[3]) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy,12,"Transport");
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'harvester',Home: MyRoom});
            console.log('Spawning new harvester: ' + newName+ ' in room '+MyRoom);
        }
        
        if(worker.length < Nos[2]) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable,AvailableEnergy,4,"Work"); 
            console.log(Layout);
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'worker',Home: MyRoom});
            console.log('Spawning new worker: ' + newName+ ' in room '+MyRoom);
        } 
        
        if(energymon.length < Nos[5]) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable,AvailableEnergy,10,"Transport");
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'energymon',Home: MyRoom});
            console.log('Spawning new EnergyManager: ' + newName+ ' in room '+MyRoom);
        }
        
        if(defender.length < Nos[4] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
            if(_.sum(storages[0].store) > 2000){
                var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable,AvailableEnergy,40,"Army"); 
                var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'defender',Home: MyRoom});
            }else{
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable,AvailableEnergy/3,40,"Army"); 
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'defender',Home: MyRoom});
            }
            console.log('Spawning new defender: ' + newName+ ' in room '+MyRoom);
        }
        if(healers.length < 1 && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy,20,"Heal");
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'healer',Home: MyRoom}); // <---- look for spawn in for loop and insert here with Game.spawns[SpawnName]
            console.log('Spawning new healer: ' + newName+ ' in room '+MyRoom);
        }
        if(Game.rooms[MyRoom].energyCapacityAvailable < 800){
            
            if(builder.length < Nos[0] && harvester.length >= Nos[3] && worker.length >= Nos[2] ) {
                var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/5,AvailableEnergy,10,"Build");
                var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'builder',Home: MyRoom});
                console.log('Spawning new builder: ' + newName+ ' in room '+MyRoom);
            }
        }else{
            if(builder.length < Nos[0] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
                var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy/4,30,"Build"); 
                var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'builder',Home: MyRoom});
                console.log('Spawning new builder: ' + newName+ ' in room '+MyRoom);
            }
        }
    
        if(upgrader.length < Nos[1] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy/3,30,"Build");
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'upgrader',Home: MyRoom});
            console.log('Spawning new upgrader: ' + newName+ ' in room '+MyRoom);
        }
        
        
        var IDCounter = 0;
        var SourceToggle = 0;
        var WorkCounter = 0;
        var HarvesterCounter = 0;
        var BuildCounter = 0;
        var AmountWorkMain = 0;
        var AmountHarvMain = 0;
        var Creephit = false;
        var EmonCounter = 0;
        
        var Sites = Game.rooms[MyRoom].find(FIND_CONSTRUCTION_SITES);
        var drops = Game.rooms[MyRoom].find(FIND_DROPPED_RESOURCES);
        
        
        for(var name in Game.creeps) { //get rid of this, also stop looping the rooms?
            var creep = Game.creeps[name];
            
            if(creep.memory.role == 'claimer'){
				roleClaimer.run(creep);
			}
			
            if(creep.memory.Home == MyRoom){
                if(creep.hits < creep.hitsMax){
                    Creephit = true;
                    Game.notify('A creep has been attacked in '+creep.pos.roomName+' at: '+creep.pos+ ' in room '+MyRoom);
                }
                if(Creephit){
                    if(healers == undefined || healers.length < 3){
                        var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy,20,"Heal");
                        var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'healer',Home: MyRoom}); // <---- look for spawn in for loop and insert here with Game.spawns[SpawnName]
                        console.log('Spawning new Healer, under attack!: ' + newName+ ' in room '+MyRoom);
                    }
                }
                if(creep.memory.role == 'healer'){
                        roleHealer.run(creep);
                    }
        
                if(creep.memory.role == 'harvester') {
                    
                    if(HarvesterCounter >= drops.length){
                        HarvesterCounter =0;
                        
                    }
        
                    roleHarvester.run(creep,AmountHarvMain);
                    AmountHarvMain+=1;
                    if(AmountHarvMain == 5){
                        AmountHarvMain =0;
                    }
                    HarvesterCounter +=1;
                }
                if(creep.memory.role == 'upgrader') {
                    roleUpgrader.run(creep,AvailableEnergy);
                }
                if(creep.memory.role == 'defender') {
                    roleDefender.run(creep,hostiles);
                }
                if(creep.memory.role == 'builder') {
                    roleBuilder.run(creep,AvailableEnergy,BuildCounter,Sites);
                    BuildCounter +=1;
                }
                if(creep.memory.role == 'worker') {
                    SourceToggle = Math.abs(SourceToggle - 1);
                    if(AmountWorkMain < 5){
                        creep.memory.sourceID = sources[SourceToggle].id;
                        AmountWorkMain+=1;
                        if(WorkCounter >= sources.length){
                            WorkCounter = 0;
                        }
                    roleWorker.run(creep);
                    }
                    
                WorkCounter +=1;
                }
                if(creep.memory.role == 'energymon'){
                    roleEnergyMon.run(creep,EmonCounter);
                    EmonCounter += 1;
                }
                if(creep.ticksToLive < 3){
                    console.log('creep:'+creep.name+' died, function: '+creep.memory.role+', left:'+creep.carry.energy);
                    creep.drop(RESOURCE_ENERGY);
                    
                }
            }
        }
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
        if(Game.flags.FarmFlag != undefined && !oneLoop){
            startCpu = Game.cpu.getUsed();
            if(Game.rooms[MyRoom].energyCapacityAvailable > 1000){
                farmTile.run(Game.flags.FarmFlag,Game.spawns[SpawnName],AvailableEnergy,Game.rooms[MyRoom].energyCapacityAvailable,false);
                oneLoop = true;
                
            }
        }
        
        if(Game.flags.FarmFlag2 != undefined && !twoLoop){
            if(Game.rooms[MyRoom].energyCapacityAvailable > 1000){
                farmTile.run(Game.flags.FarmFlag2,Game.spawns[SpawnName],AvailableEnergy,Game.rooms[MyRoom].energyCapacityAvailable,true);
                twoLoop = true;
            }
    
         }
        }
    
    //Game.profiler.email(1800);
    //Game.profiler.profile(10);
    
    var MainLoop = Game.cpu.getUsed();
        if(!Memory.CpuStats){
            Memory.CpuStats = {
                TickCounter: 0,
                AggregatedAverage: MainLoop,
                
            };
        }
        
    if(Memory.CpuStats.TickCounter > LogLength){
        console.log('Aggregated average :'+Memory.CpuStats.AggregatedAverage+' collected over '+LogLength+' loops.');
        Game.notify('Aggregated average :'+Memory.CpuStats.AggregatedAverage+' collected over '+LogLength+' loops.', 720);
        Memory.CpuStats.TickCounter = 0;
        Memory.CpuStats.AggregatedAverage = MainLoop;
        Game.profiler.profile(5);
    }else{
        Memory.CpuStats.AggregatedAverage = (Memory.CpuStats.AggregatedAverage + MainLoop)/2;
        
    }
    Memory.CpuStats.TickCounter += 1;

    var shortage = MainLoop-Game.cpu.limit;
    if(shortage > 0){
        var message = 'CPU usage-limit='+shortage+'     - CPU:'+MainLoop+'  ; Bucket:'+Game.cpu.bucket+'; TickLimit:'+Game.cpu.tickLimit+' ;happened at tick: '+Game.time;
        console.log(message);
        Game.notify(message, 720);
    }else{
        console.log('TickTime: '+Game.time+' ;Used CPU: '+MainLoop+' ; CPU to Bucket:'+Math.abs(shortage)+' ; BucketVolume:'+Game.cpu.bucket);
    }
   /* var flagarray = [];
    for(var flags in Game.flags){
      if(Game.rooms[flags] != undefined && ((Game.rooms[flags].controller.reservation != undefined && Game.rooms[flags].controller.reservation.username == 'Kwabratseur') || Game.rooms[flags].controller.level == 0)){
        console.log(Game.rooms[flags]);
        flagarray.unshift(Game.rooms[flags].name);
        if(Game.rooms[flags].controller.my){

        }

        }
      }
      Memory.roomdb = flagarray;*/
    
    });
    //Game.profiler.profile(10);
}
