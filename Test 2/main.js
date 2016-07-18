var startCpu = Game.cpu.getUsed();
var _ = require('lodash');
var profiler = require('screeps-profiler');
var roomDefense = require('room.defense');
var Mem = require('get.memory');
var Transfer = require('action.transfer');
var CreepBuilder = require('creep.builder');
var MonMan = require('job.monman');

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

    if((Memory.tenCounter == undefined )|| (Memory.tenCounter < Game.time)){ //10 ticks counter
        Memory.tenCounter = Game.time + 10;
        //MonMan.TerritoryMonitor();
        MonMan.SpawnCreep();
    }
    if((Memory.fiftyCounter == undefined) || (Memory.fiftyCounter < Game.time)){ //50 ticks counter
        Memory.fiftyCounter = Game.time + 50;
    }
    if((Memory.hourCounter == undefined) || (Memory.hourCounter < Game.time)){ //hour counter
        Memory.hourCounter = Game.time + (3600/2.5);
    }

    //MonMan.TerritoryManager();
    for(var name in Game.spawns){ // Try to include All code except for FarmRoom code in this loop. Maybe multiple rooms can be controlled in this way.
		    var SpawnName = name;
        var MyRoom = Game.spawns[SpawnName].room.name;    //Then offcourse make everything depend from variable MyRoom(mostly the case)
        var AvailableEnergy = 0;
        AvailableEnergy = Game.rooms[MyRoom].energyAvailable;
        var buildInfra = false;

        if((Memory.weekCounter == undefined) || (Memory.weekCounter < Game.time)){ //weekly counter
            Memory.weekCounter = Game.time + ((3600*24*7)/2.5);
            MonMan.ConsiderTerritory(MyRoom);
        }//will only execute for first loop

        var EcenterName = MyRoom+'EnergyCenter';

        if(!Game.flags.MyRoom){
          Game.rooms[MyRoom].createFlag(25, 25, MyRoom);
        } //place flag for each room

        if(!Memory.rooms[MyRoom]){
            Memory.rooms[MyRoom] = {};
        }

        if(!Memory.rooms[MyRoom].RoomInfo){ ///Use this method to save on CPU, try to add as much variables as possible without getting into memory problems.
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
        //extractors = Mem.run(Memory.rooms[MyRoom].RoomInfo.Extractors);
        //terminals = Mem.run(Memory.rooms[MyRoom].RoomInfo.Terminals);
        //labs = Mem.run(Memory.rooms[MyRoom].RoomInfo.Labs);

        var Sites = Game.rooms[MyRoom].find(FIND_CONSTRUCTION_SITES);
        var structs = Game.rooms[MyRoom].find(FIND_STRUCTURES);
        var drops = Game.rooms[MyRoom].find(FIND_DROPPED_RESOURCES);

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
            if(Game.rooms[MyRoom].controller.level == 2){
                Memory.rooms[MyRoom].Eticks = Game.time + 500;
            }else{
                Memory.rooms[MyRoom].Eticks = Game.time + 3;
            }
            Mem.reset(MyRoom);
        }

        if((Memory.rooms[MyRoom].Eticks - Game.time) > 0){ //spread more tasks over longer period
                var Ecenter = Game.flags[EcenterName];
                buildInfra = true;
                if((Memory.rooms[MyRoom].Eticks - Game.time) > 490){
                    console.log('setting up defenses and energycenter');
                    if((Memory.rooms[MyRoom].Eticks - Game.time) > 495){
                        energyCenter(Ecenter);
                        SourceStorage();
                    }else{
                        SetupDefense();
                    }
                }
                if((Memory.rooms[MyRoom].Eticks - Game.time) < 3){
                    energyCenter(Ecenter);
                }
        }

        function SourceStorage(){ //jep, this works :) automated container building @ sources
          for(id in sources){ // Look for link near sources
              var creepTemp = sources[id].pos.findInRange(FIND_MY_CREEPS,2);
              var containerTemp = sources[id].pos.findInRange(STRUCTURE_CONTAINER,2);
              var creepTemp = sources[id].pos.findClosestByRange(creepTemp);//always returns 1 creep this way
              console.log(containerTemp.length);
              if(containerTemp.length < 1){
                console.log(creepTemp.pos);
                Game.rooms[MyRoom].createConstructionSite(creepTemp.pos,STRUCTURE_CONTAINER);
              }

          }
        }

        //SourceStorage();
        function energyCenter(FlagPos){ //change loop order
            //console.log(FlagPos.pos.x);
            var BuildPosX = FlagPos.pos.x;
            var BuildPosY = FlagPos.pos.y;
            var c = 0;
            var BuildingToggle = true; //true is positive, false is negative
            var NoEx = 5;
            if(Game.rooms[MyRoom].controller.level > 2){
                NoEx = (NoEx*2)*(Game.rooms[MyRoom].controller.level-2);
            }
            for (var j = 0; j < (NoEx/5); j++){
                for(i = 0 ; i < 9; i++){
                    if(BuildingToggle){
                        BuildingToggle = false;
                        Game.rooms[MyRoom].createConstructionSite(BuildPosX,BuildPosY,STRUCTURE_EXTENSION);
                    }else{
                        Game.rooms[MyRoom].createConstructionSite(BuildPosX,BuildPosY,STRUCTURE_ROAD);
                        BuildingToggle = true;
                    }
                    c +=1;
                    BuildPosX -= 1;
                }
                BuildPosX = FlagPos.pos.x;
            BuildPosY += 1;
            }
        }

        var linkFrom = 0;
        if(storages.length > 0){ // Rewrite Link-code, maybe put it in own Module, at least make it use the memory ID's.
            var linkController = 0;
            var linkTower = 0;

            var linkTo = Game.rooms[MyRoom].storage.pos.findInRange(links,2);

            for(id in sources){ // Look for link near sources
                var linkTemp = sources[id].pos.findInRange(links,2);

                if(linkTemp.length > 0){
                    linkFrom = linkTemp[0];
                } // if link is found near a source, designate it as a linkFrom
            }

            if(Game.rooms[MyRoom].controller.pos.findInRange(links, 2)){ //look for link near controller
                linkController = Game.rooms[MyRoom].controller.pos.findInRange(links, 2);
            }

            if(towers.length > 0){  //look for links near towers
                 for(var id in towers){
                    var linkTemp = towers[id].pos.findInRange(links, 2);
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


        var hostiles = 0;//Game.spawns[SpawnName].pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        var healer = Game.spawns[SpawnName].pos.findClosestByRange(FIND_HOSTILE_CREEPS, {  // <-----------------------that's how we find stuff in the room, check code for occurance.
                        filter: function(object) {
                            return object.getActiveBodyparts(HEAL) != 0;
                        }
                    });

        if(healer){
            hostiles = healer;
        }



        MonMan.manager(MyRoom,drops,buildInfra,AvailableEnergy,Sites,sources);
        MonMan.monitor(MyRoom);

        if(towers.length > 0){
            var damagedStructures = roads.concat(walls,ramparts,containers);
            var structHp = Math.pow((10-Game.rooms[MyRoom].controller.level),(10-Game.rooms[MyRoom].controller.level)/2)

            var damagedStructures = _.filter(damagedStructures, function(structure){return (structure.hits < structure.hitsMax/structHp); });

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
    if(Memory.roomdb == undefined){
      Memory.roomdb = [];
      MonMan.ConsiderTerritory('W18S4');//change to MyRoom for online implementation
    }
    var shortage = MainLoop-Game.cpu.limit;
    if(shortage > 0){
        var message = 'CPU usage-limit='+shortage+'     - CPU:'+MainLoop+'  ; Bucket:'+Game.cpu.bucket+'; TickLimit:'+Game.cpu.tickLimit+' ;happened at tick: '+Game.time;
        console.log(message);
        Game.notify(message, 720);
    }else{
        console.log('TickTime: '+Game.time+' ;Used CPU: '+MainLoop+' ; CPU to Bucket:'+Math.abs(shortage)+' ; BucketVolume:'+Game.cpu.bucket);
    }


    //if(TargetRoom.room != undefined && TargetRoom.room.controller.reservation != undefined && TargetRoom.room.controller.reservation.username == 'Kwabratseur'){

    }
    });
    //Game.profiler.profile(10);
}
