/*
TODO:
Optimize finding of object by putting it in memory

Create spawn queue  +  amount desired body parts

Optimize moveTo like:
// Execute moves by cached paths at first 
for(var name in Game.creeps) {
    Game.creeps[name].moveTo(target, {noPathFinding: true});
}

// Perform pathfinding only if we have enough CPU
if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
    for(var name in Game.creeps) {
        Game.creeps[name].moveTo(target);
    }
}

put the target and source in creep memory and recalculate when needed

Room Object can be updated once in 20 ticks or so

Optimize work boundaries, creeps may only pickup resources when threshold is met. Should not be blocked to work

if storage is empty, mind the link!



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
    
    for(var name in Game.spawns){ // Try to include All code except for FarmRoom code in this loop. Maybe multiple rooms can be controlled in this way.
		var SpawnName = name;
        var MyRoom = Game.spawns[SpawnName].room.name;    //Then offcourse make everything depend from variable MyRoom(mostly the case)
        var AvailableEnergy = 0;
        AvailableEnergy = Game.rooms[MyRoom].energyAvailable;
        
        //console.log(CreepBuilder.Layout(0,AvailableEnergy,4,"Work")); //Nice!! this works, wrap all creepbuildfunctions in 1 module :)
        

        if(!Memory.rooms[MyRoom] || !Memory.rooms[MyRoom].RoomInfo){ ///Use this method to save on CPU, try to add as much variables as possible without getting into memory problems.
            Mem.set(MyRoom,SpawnName);
        }

        containers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Containers);
        towers = Mem.run(Memory.rooms[MyRoom].RoomInfo.Towers);
        storages = Mem.run(Memory.rooms[MyRoom].RoomInfo.Storages); // that's it! this can save a lot of CPU of done everywhere.
        links = Mem.run(Memory.rooms[MyRoom].RoomInfo.Links);
        sources = Mem.run(Memory.rooms[MyRoom].RoomInfo.Sources);
        extensions = Mem.run(Memory.rooms[MyRoom].RoomInfo.Extensions);
        //labs = Mem.run(Memory.rooms[MyRoom].RoomInfo.Labs);
        walls = Mem.run(Memory.rooms[MyRoom].RoomInfo.Walls);
        ramparts = Mem.run(Memory.rooms[MyRoom].RoomInfo.Ramparts);
        roads = Mem.run(Memory.rooms[MyRoom].RoomInfo.Roads);
        //extractors = Mem.run(Memory.rooms[MyRoom].RoomInfo.Extractors);
        //terminals = Mem.run(Memory.rooms[MyRoom].RoomInfo.Terminals);
 
        
        //var test = Memstructures(Memory.rooms[MyRoom].RoomInfo.Sources);
        //var test2 = Memstructures(Memory.rooms[MyRoom].RoomInfo.Storages);
        //test.push(test2);   <<--- use this trick to create groups of buildings
        //console.log(Struct.run(Memory.rooms[MyRoom].RoomInfo.Sources)); use this with the import!

                //storages.push(containers,towers)
                //console.log(roads.length);
                //roads = roads.concat(walls);
                //console.log(roads.length);
                //roads = roads.concat(ramparts);
                //console.log(roads.length);
                //var test = _.filter(extensions, (structure) => (structure.energy < structure.energyCapacity)); //returns undefined if not true
                //console.log(test.energy);
                //_.filter(Game.creeps, function(creep){ return creep.memory.role == unitType && creep.ticksToLive > 12; })
                //inplace filtering! very important if memory is to be used fully.

        //console.log(ids.length);
        //console.log(Game.getObjectById(Memory.rooms[MyRoom].RoomInfo.Towers[0));
        
        var harvester = _.filter(Game.creeps, (creep) => (creep.memory.role == 'harvester') && (creep.memory.Home == MyRoom));
        var builder = _.filter(Game.creeps, (creep) => (creep.memory.role == 'builder') && (creep.memory.Home == MyRoom));
        var upgrader = _.filter(Game.creeps, (creep) => (creep.memory.role == 'upgrader') && (creep.memory.Home == MyRoom));
        var worker = _.filter(Game.creeps, (creep) => (creep.memory.role == 'worker') && (creep.memory.Home == MyRoom));
        var defender = _.filter(Game.creeps, (creep) => (creep.memory.role == 'defender') && (creep.memory.Home == MyRoom));
        var energymon = _.filter(Game.creeps, (creep) => (creep.memory.role == 'energymon') && (creep.memory.Home == MyRoom));
        var healer = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
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
        
        if(Memory.rooms[MyRoom].Eticks > 0){
                var Ecenter = Game.flags.EnergyCenter;
                //SetupDefense();
                //energyCenter(Ecenter);
                Memory.rooms[MyRoom].Eticks -= 1;
        }

        function energyCenter(FlagPos){
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
        


        //var linktest = Game.rooms[MyRoom].find(FIND_MY_STRUCTURES, // testvar for fixing bug with link detection when storages are present.
        //    {filter: {structureType: STRUCTURE_LINK}})[0]; // put the array in the variable!
        //console.log(linktest);
        //console.log(linktest != undefined);  //then test if the first element is defined!
            //this reports true if there is a link, and false if there is no link in the room.
        
        
        var linkFrom = 0;
        if(storages.length > 0){ // Make code look for links near sources and near storage/spawn and transfer from-links to the to-link
            
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
            
            //linkTo.pos etc. has been used because this returns undefined. Because the zero'th element is chosen (LinkTemp[0]), length will always return 0.
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
                   Nkill += 4;
               }
            if(Hostiles){
                        Nkill += 3;
                        }
            }      
            return [Nbuil,Nupgr,Nwork,Nharv,Nkill,NEMon];
        }
        
        
        var Nos = NoCreeps(builder.length,upgrader.length,worker.length,harvester.length,defender.length,AvailableEnergy,hostiles);

        //console.log(Math.pow((10-Game.rooms[MyRoom].controller.level),(10-Game.rooms[MyRoom].controller.level)/2));
        if(towers.length > 0){
            var WallHp = 0.00001;
            var RampHp = 0.01;
            var RoadHp = 0.7;
            //var structHp = Math.pow((10-room.controller.level),(10-room.controller.level)/2)
            if(towers[0].room.controller.level > 3){
                WallHp = 0.0003;
                RampHp = 0.01;
                RoadHp = 0.9;
            }
            if(towers[0].room.controller.level > 6){
                WallHp = 0.5;
                RampHp = 1;
                RoadHp = 1;
            }
            var mostbadlydamaged = towers[0].room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                                        return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*WallHp ||
                                                 structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*RampHp ||
                                                 (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*RoadHp) ||
                                                 structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                                    }
                    });
            var c = 0;
            for (i = 0; i < mostbadlydamaged.length; i++){
                if(mostbadlydamaged[i].hits < mostbadlydamaged[c].hits){
                    c = i;
                }
            }
    
            for(var id in towers){
                var tower = towers[id];
                

                    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                                        return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*WallHp ||
                                                 structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*RampHp ||
                                                 (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*RoadHp) ||
                                                 structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                                    }
                    });
                    if(closestDamagedStructure && !hostiles) {
                        tower.repair(mostbadlydamaged[c]);
                    }
            
                    if(hostiles) {
                        tower.attack(hostiles);
                    }
            }
        }
    
        /* New CreepLayoutBuild functions:
            var BuildLayout = CreepBuilder.Layout(0,AvailableEnergy,4,"Work"); //(max 5x work, 2x carry, 3x move)
            CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy,12,"Transport");  //harvester
            CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy,0,"Claim");
            CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,20,"Army"); 
            CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,20,"Ranged_Army"); 
            CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,20,"Healer"); 
            CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,10,"Transport"); //energymon
            CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,30,"Builder"); //Upgrader/builder/externalbuilder
            CreepBuilder.cost(BuildLayout); //get enegycosts of a certain layout
        */
        
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
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/2,AvailableEnergy,4,"Work"); 
            console.log(Layout);
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'worker',Home: MyRoom});
            console.log('Spawning new worker: ' + newName+ ' in room '+MyRoom);
        } 
        
        if(energymon.length < Nos[5]) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,10,"Transport");
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'energymon',Home: MyRoom});
            console.log('Spawning new EnergyManager: ' + newName+ ' in room '+MyRoom);
        }
        
        if(defender.length < Nos[4] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,20,"Army"); 
            var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'defender',Home: MyRoom});
            console.log('Spawning new defender: ' + newName+ ' in room '+MyRoom);
        }
        if(Game.rooms[MyRoom].energyCapacityAvailable < 800){
            
            if(builder.length < Nos[0] && harvester.length >= Nos[3] && worker.length >= Nos[2] ) {
                var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/5,AvailableEnergy,10,"Build");
                var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'builder',Home: MyRoom});
                console.log('Spawning new builder: ' + newName+ ' in room '+MyRoom);
            }
        }else{
            if(builder.length < Nos[0] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
                var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,30,"Build"); 
                var newName = Game.spawns[SpawnName].createCreep(Layout, undefined, {role: 'builder',Home: MyRoom});
                console.log('Spawning new builder: ' + newName+ ' in room '+MyRoom);
            }
        }
    
        if(upgrader.length < Nos[1] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
            var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,30,"Build");
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
                    if(healer == undefined || healer.length < 3){
                        var Layout = CreepBuilder.Layout(Game.rooms[MyRoom].energyCapacityAvailable/4,AvailableEnergy,20,"Heal");
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
    });
    //Game.profiler.profile(10);
}
