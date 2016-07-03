/*
TODO:
Optimize finding of object by putting it in memory

Create spawn queue per room +  amount desired body parts

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


    
    
    
    for(var name in Game.spawns){ // Try to include All code except for FarmRoom code in this loop. Maybe multiple rooms can be controlled in this way.
		var SpawnName = name;
        var MyRoom = Game.spawns[SpawnName].room.name;    //Then offcourse make everything depend from variable MyRoom(mostly the case)
        var sources = Game.rooms[MyRoom].find(FIND_SOURCES);
        
        var towers = Game.rooms[MyRoom].find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
        });
        
        var AvailableEnergy = 0;
        var storages = 0;
        var containers = 0;

        
        AvailableEnergy = Game.rooms[MyRoom].energyAvailable;
        storages = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_STORAGE );
                        }
                });    
        containers = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER );
                        }
                });
        var links = containers = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_LINK );
                        }
                });
        
        if(!Memory.rooms[MyRoom].RoomInfo){ ///Use this method to save on CPU, try to add as much variables as possible without getting into memory problems.
            Memory.rooms[MyRoom].RoomInfo = {
                SpawnName: name,
                RoomName: Game.spawns[SpawnName].room.name,
                Sources:  Game.rooms[MyRoom].find(FIND_SOURCES),
                Towers: towers,
                storages: storages,
                containers: containers,
                Links: links
            };
        }
        
        
        //console.log('Room: '+MyRoom+'Spawn:'+name);
        //console.log('Room: '+Game.rooms[MyRoom].controller.my);
        
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
    
        function TransportCreep(remainder,BodySize){ //<<<<----!!! good way for building creeps with a for loop. This will scale them nicely if you know which parts are needed in which numbers
            var Layout = [MOVE,CARRY,MOVE];
            var cost = 0;
            var target = AvailableEnergy;
            if(remainder != 0){
                target = remainder;
            }
            for(i = 0; i < BodySize; i++ ) {
                cost = CreepCost(Layout);
                if((cost > target) || (cost > AvailableEnergy)){   
                    Layout = Layout.slice(0,Layout.length-1); //**********CHANGED
                    break; 
                }
                if((i % 2) == 0){ Layout.push(CARRY); }
                else{ Layout.push(MOVE); }
    	    }
            return Layout;
        }
        
        function BuildCreep(remainder){
            var Layout = [CARRY,MOVE,WORK,CARRY];
            var cost = 0;
            var target = AvailableEnergy;
            var c = 0;
            if(remainder != 0){
                target = remainder;
            }
            for(i = 0; i < 30; i++ ) {
                cost = CreepCost(Layout);
                if((cost > target) || (cost > AvailableEnergy)){   
                    Layout = Layout.slice(0,Layout.length-1); //**********CHANGED
                    break; 
                }
                if(c > 2){ c = 0; }
                if(c == 0){ Layout.push(CARRY); }
                if(c == 1 && (i%3) == 1){ Layout.push(MOVE); } // this one will be added twice in a row of 9
                if(c == 2){ Layout.push(WORK); }
                c+=1;
    	    }
            return Layout;
        }
        
        function WorkCreep(remainder){
            var Layout = [WORK,MOVE,WORK];
            var cost = 0;
            var target = AvailableEnergy;
            var c = 0;
            if(remainder != 0){
                target = remainder;
            }
            for(i = 0; i < 5; i++ ) {
                cost = CreepCost(Layout);

                if((cost > target) || (cost > AvailableEnergy)){   
                    Layout = Layout.slice(0,Layout.length-1); //**********CHANGED
                    break; 
                }
                else{
                if(c > 1){ c = 0; }
                if(c == 0){ Layout.push(WORK); }
                if(c == 1 && (i%3) == 1){ Layout.push(MOVE); } // this one will be added twice in a row of 9
                c+=1;
                }
            }
    	    if(linkFrom){
                Layout.push(CARRY);
                Layout.push(CARRY);
    	    }
            return Layout;
        }
        
        function ClaimCreep(remainder){
            var Layout = [CLAIM,MOVE,CLAIM];
            var cost = 0;
            var target = AvailableEnergy;
            var c = 0;
            if(remainder != 0){
                target = remainder;
            }
            for(i = 0; i < 0; i++ ) {
                cost = CreepCost(Layout);

                if((cost > target) || (cost > AvailableEnergy)){   
                    Layout = Layout.slice(0,Layout.length-1); //**********CHANGED
                    break; 
                }
                else{
                if(c > 1){ c = 0; }
                if(c == 0){ Layout.push(CLAIM); }
                if(c == 1 && (i%3) == 1){ Layout.push(MOVE); } // this one will be added twice in a row of 9
                c+=1;
                }
            }
            return Layout;
        }
        
        function HealCreep(remainder){ //<<<<----!!! good way for building creeps with a for loop. This will scale them nicely if you know which parts are needed in which numbers
            var Layout = [HEAL,MOVE,HEAL];
            var cost = 0;
            var target = AvailableEnergy;
            if(remainder != 0){
                target = remainder;
            }
            for(i = 0; i < 20; i++ ) {
                cost = CreepCost(Layout);
                if((cost > target) || (cost > AvailableEnergy)){   
                    Layout = Layout.slice(0,Layout.length-1); //**********CHANGED
                    break; 
                }
                if((i % 2) == 0){ Layout.push(HEAL); }
                else{ Layout.push(MOVE); }
            }
            return Layout;
        }
        
        function ArmyCreep(remainder){
            var Layout = [TOUGH,MOVE,ATTACK,TOUGH];
            var cost = 0;
            var target = AvailableEnergy;
            var c = 0;
            if(remainder != 0){
                target = remainder;
            }
            for(i = 0; i < 20; i++ ) {
                cost = CreepCost(Layout);
                if((cost > target) || (cost > AvailableEnergy)){   
                    Layout = Layout.slice(0,Layout.length-1); //**********CHANGED
                    break; 
                }
                if(c > 2){ c = 0; }
                if(c == 0){ Layout.push(TOUGH); }
                if(c == 1 && (i%2) == 1){ Layout.push(MOVE); }// this one will be added twice in a row of 9
                else{ Layout.push(ATTACK); }
                if(c == 2){ Layout.push(ATTACK); }
                c+=1;
    	    }
            return Layout;
        }
        
        function RangedArmyCreep(remainder){
            var Layout = [TOUGH,MOVE,RANGED_ATTACK,TOUGH];
            var cost = 0;
            var target = AvailableEnergy;
            var c = 0;
            if(remainder != 0){
                target = remainder;
            }
            for(i = 0; i < 20; i++ ) {
                cost = CreepCost(Layout);
                if((cost > target) || (cost > AvailableEnergy)){   
                    Layout = Layout.slice(0,Layout.length-1); //**********CHANGED
                    break; 
                }
                if(c > 2){ c = 0; }
                if(c == 0){ Layout.push(TOUGH); }
                if(c == 1 && (i%2) == 1){ Layout.push(MOVE); }// this one will be added twice in a row of 9
                else{ Layout.push(RANGED_ATTACK); }
                if(c == 2){ Layout.push(RANGED_ATTACK); }
                c+=1;
    	    }
            return Layout;
        }
        
        /*console.log('TransportCreepLayout: '+TransportCreep(0,8));//Game.rooms[MyRoom].energyCapacityAvailable/2)
        console.log('BuildCreepLayout: '+BuildCreep(0));
        console.log('WorkCreepLayout: '+WorkCreep(0));
        console.log('HealCreepLayout: '+HealCreep(0));
        console.log('ArmyCreepLayout: '+ArmyCreep(0));
        console.log('RangedArmyCreepLayout: '+RangedArmyCreep(0));*/ //That's how the creepscripts work
        
        
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
        //console.log('builders '+Nos[0]+'upgraders '+Nos[1]+'workers '+Nos[2]+'harvesters '+Nos[3])
        
        function CreepCost(Layout){
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
        
        
        
        if(towers.length > 0){
            var WallHp = 0.00001;
            var RampHp = 0.01;
            var RoadHp = 0.7;
            if(towers[0].room.controller.level > 3){
                WallHp = 0.0003;
                RampHp = 0.01;
                RoadHp = 0.9;
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
                //console.log(tower);
                    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    var healer = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                        filter: function(object) {
                            return object.getActiveBodyparts(HEAL) != 0;
                        }
                    });
    
                    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                                        return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*WallHp ||
                                                 structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*RampHp ||
                                                 (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*RoadHp) ||
                                                 structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                                    }
                    });
                    if(closestDamagedStructure && !closestHostile) {
                        tower.repair(mostbadlydamaged[c]);
                    }
            
                    if(healer){
                        tower.attack(healer);
                    }
                    else if(closestHostile) {
                        tower.attack(closestHostile);
                    }
            }
        }
    
        
        
        if(((Game.flags.AttackController != undefined) || (Game.flags.ClaimController != undefined) || (Game.flags.ReserveController != undefined)) && claimer.length < 1 && Game.rooms[MyRoom].energyCapacityAvailable > 1200){
			var newName = Game.spawns[SpawnName].createCreep(ClaimCreep(0), undefined, {role: 'claimer'});
            console.log('Attack/Claim/Reserve Target Controller with creep: '+newName+ ' in room '+MyRoom);
        }
        
        if(harvester.length < Nos[3]) {
            var newName = Game.spawns[SpawnName].createCreep(TransportCreep(Game.rooms[MyRoom].energyCapacityAvailable/2,12), undefined, {role: 'harvester',Home: MyRoom});
            console.log('Spawning new harvester: ' + newName+ ' in room '+MyRoom);
        }
        
        if(worker.length < Nos[2]) {
            var newName = Game.spawns[SpawnName].createCreep(WorkCreep(0), undefined, {role: 'worker',Home: MyRoom});
            console.log('Spawning new worker: ' + newName+ ' in room '+MyRoom);
        } 
        
        if(energymon.length < Nos[5]) {
            var newName = Game.spawns[SpawnName].createCreep(TransportCreep(0,10), undefined, {role: 'energymon',Home: MyRoom});
            console.log('Spawning new EnergyManager: ' + newName+ ' in room '+MyRoom);
        }
        
        if(defender.length < Nos[4] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
            var newName = Game.spawns[SpawnName].createCreep(ArmyCreep(Game.rooms[MyRoom].energyCapacityAvailable/4), undefined, {role: 'defender',Home: MyRoom});
            console.log('Spawning new defender: ' + newName+ ' in room '+MyRoom);
        }
        if(Game.rooms[MyRoom].energyCapacityAvailable < 800){
            
            if(builder.length < Nos[0] && harvester.length >= Nos[3] && worker.length >= Nos[2] ) {
                var newName = Game.spawns[SpawnName].createCreep(BuildCreep(0), undefined, {role: 'builder',Home: MyRoom});
                console.log('Spawning new builder: ' + newName+ ' in room '+MyRoom);
            }
        }else{
            if(builder.length < Nos[0] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
                var newName = Game.spawns[SpawnName].createCreep(BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), undefined, {role: 'builder',Home: MyRoom});
                console.log('Spawning new builder: ' + newName+ ' in room '+MyRoom);
            }
        }
    
        if(upgrader.length < Nos[1] && harvester.length >=Nos[3] && worker.length >= Nos[2] ) {
            var newName = Game.spawns[SpawnName].createCreep(BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), undefined, {role: 'upgrader',Home: MyRoom});
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
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'claimer'){
				roleClaimer.run(creep);
			}
            if(creep.memory.Home == MyRoom){
                
                var Sites = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(creep.hits < creep.hitsMax){
                    Creephit = true;
                    Game.notify('A creep has been attacked in '+creep.pos.roomName+' at: '+creep.pos+ ' in room '+MyRoom);
                }
                if(Creephit){
                    if(healer == undefined || healer.length < 3){
                        var newName = Game.spawns[SpawnName].createCreep(HealCreep(Game.rooms[MyRoom].energyCapacityAvailable-200), undefined, {role: 'healer',Home: MyRoom}); // <---- look for spawn in for loop and insert here with Game.spawns[SpawnName]
                        console.log('Spawning new Healer, under attack!: ' + newName+ ' in room '+MyRoom);
                    }
                    
                }
                if(creep.memory.role == 'healer'){
                        roleHealer.run(creep);
                    }
        
                if(creep.memory.role == 'harvester') {
                    var drops = creep.room.find(FIND_DROPPED_RESOURCES);
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
                    roleBuilder.run(creep,AvailableEnergy,BuildCounter);
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
        if(Game.flags.FarmFlag != undefined){
            startCpu = Game.cpu.getUsed();
            if(Game.rooms[MyRoom].energyCapacityAvailable > 1000){
                farmTile.run(Game.flags.FarmFlag,Game.spawns[SpawnName],ArmyCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), WorkCreep(0), TransportCreep(Game.rooms[MyRoom].energyCapacityAvailable/2,16),BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2),false);
                oneLoop = Game.cpu.getUsed() - startCpu;
                
            }
        }
        
        if(Game.flags.FarmFlag2 != undefined){
            if(Game.rooms[MyRoom].energyCapacityAvailable > 1000){
                farmTile.run(Game.flags.FarmFlag2,Game.spawns[SpawnName],ArmyCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), WorkCreep(0), TransportCreep(Game.rooms[MyRoom].energyCapacityAvailable/2,16),BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2),false);
                twoLoop = Game.cpu.getUsed() - startCpu;
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
        var oneLoop = 0;
        var twoLoop = 0;
        var shortage = MainLoop-Game.cpu.limit;
        if(shortage > 0){
            var message = 'CPU usage-limit='+shortage+'     - Main:'+MainLoop+ ' Farm1:'+oneLoop+' Farm2:'+twoLoop+' ; Bucket:'+Game.cpu.bucket+'; TickLimit:'+Game.cpu.tickLimit+' ;happened at tick: '+Game.time;
            console.log(message);
            Game.notify(message, 720);
        }else{
            console.log('TickTime: '+Game.time+' ;Used CPU: '+MainLoop+' ; CPU to Bucket:'+Math.abs(shortage)+' ; BucketVolume:'+Game.cpu.bucket);
        }
    });
    //Game.profiler.profile(10);
}
