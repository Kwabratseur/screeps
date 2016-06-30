/*
* Improvements:
*   -   Create and add build scripts
*       * if control level == up -> add possible structures
*       * add extensions at BaseFlag location (added once)
*       * if control level == up again -> logically continue with grid
*       * Buildings: Extensions, Roads, storages, container should be taken into account here
*
*   -   create and add Link scripts ***COMPLETED***
*       * can be used to fill structures/transport energy from range within same room
*
*   -   improve defense script(double wall)
*       * also triggered when control level == up
*       * OR if defenses are destroyed
*       * Also include the Tower placement here
*
*   -   Add Automatic Repair sequence
*       * max hits in ramparts and walls are scaled up with control level
*       * ALWAYS repair the weakest link first, so sort from most damaged to least damaged
*       * Keep in mind that this costs a lot of energy initially! so start SERIOUSLY repairing from control level 4       
*
*   - control level == up should be done with room.memory
*
*   - also add for loop, looping through rooms with spawns
*
*   - Test all this in simulation ofc!!!
*
*   - Add list of flags with given function and routine which places mandatory flags or just to anoy neigbours/autofarm
*/


var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleWorker = require('role.worker');
var roleDefender = require('role.defender');
var roomDefense = require('room.defense');
var farmTile = require('farm.tile');
var roleEnergyMon = require('role.energymon');
var roleHealer = require('role.healer');

module.exports.loop = function () {
    var startCpu = Game.cpu.getUsed();
    var harvester = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var worker = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');
    var defender = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');
    var energymon = _.filter(Game.creeps, (creep) => creep.memory.role == 'energymon');
    var healer = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
    
    var MyRoom = Game.spawns.Spawn1.room.name;
    /*for(var name in Game.spawns){ // Try to include All code except for FarmRoom code in this loop. Maybe multiple rooms can be controlled in this way.
        var MyRoom = Game.spawns[name].room.name    //Then offcourse make everything depend from variable MyRoom(mostly the case)
        //console.log(MyRoom);
    //console.log('Johhny Bigpotatoe!');
    }*/
    //console.log(Game.spawns["Spawn1"].room.name);
    var AvailableEnergy = Game.rooms[MyRoom].energyAvailable;
    //for(var rooms in Game.rooms){
    //    var MyRoom = rooms; 
    //}
    var SetupDefense = (function() {
    var executed = false;
    return function () {
        if (!executed) {
            executed = true;
           var ExitCoords = Game.rooms[MyRoom].find(FIND_EXIT);
           //roomDefense.run(ExitCoords,MyRoom);
        }
    };
    })();
    
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

    if(storages.length > 0){
        var linkFrom = Game.rooms[MyRoom].lookForAt('structure', 35, 40)[0];
        
        var linkTo = Game.rooms[MyRoom].storage.pos.findInRange(FIND_MY_STRUCTURES, 2,
        {filter: {structureType: STRUCTURE_LINK}})[0];
        
        if(linkFrom.energy == linkFrom.energyCapacity && linkTo.energy == 0 && linkFrom.cooldown == 0){
            linkFrom.transferEnergy(linkTo);
        }
    }
    
    //console.log(containers[0].pos);
    //
    //console.log(linkFrom);
    // 
    //
    //console.log(linkTo);
    

    //console.log(storages.length);
    if(Game.rooms[MyRoom].controller.level == 2){
        var SpawnPos = Game.spawns.Spawn1.pos;
        for (i = 1; i < 6; i++){
            var c = 3;
            Game.rooms[MyRoom].createConstructionSite((SpawnPos.x-1),(SpawnPos.y+c-i),STRUCTURE_EXTENSION);
        }
        
        SetupDefense();
    }
    if(Game.rooms[MyRoom].controller.level == 3){
        var SpawnPos = Game.spawns.Spawn1.pos;
        for (i = 1; i < 6; i++){
            var c = 3
            Game.rooms[MyRoom].createConstructionSite((SpawnPos.x-c-i),(SpawnPos.y-1),STRUCTURE_EXTENSION)
        }
        Game.rooms[MyRoom].createConstructionSite((SpawnPos.x-3),(SpawnPos.y-2),STRUCTURE_TOWER);
    }
    //console.log(Game.rooms[MyRoom].find(FIND_MY_CONSTRUCTION_SITES).length)
    
    var hostiles = Game.spawns.Spawn1.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    
    var healer = Game.spawns.Spawn1.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function(object) {
                        return object.getActiveBodyparts(HEAL) != 0;
                    }
                });
    if(healer){
        hostiles = healer;
    }

    function TransportCreep(remainder,BodySize){ //<<<<----!!! good way for building creeps with a for loop. This will scale them nicely if you know which parts are needed in which numbers
        var Layout = [CARRY,MOVE];
        var cost = 0;
        var target = AvailableEnergy;
        if(remainder > 0){
            target = remainder;
        }
        for(i = 0; i < BodySize; i++ ) {
            cost = CreepCost(Layout);
            if((cost > target) || (cost > AvailableEnergy)){ break; }
            if((i % 2) == 0){ Layout.push(CARRY); }
            else{ Layout.push(MOVE); }
	    }
        return Layout;
    }
    
    function BuildCreep(remainder){
        var Layout = [CARRY,MOVE,WORK];
        var cost = 0;
        var target = AvailableEnergy;
        var c = 0;
        if(remainder > 0){
            target = remainder;
        }
        for(i = 0; i < 30; i++ ) {
            cost = CreepCost(Layout);
            if((cost > target) || (cost > AvailableEnergy)){ break; }
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
        var prevLayout = [];
        //prevLayout = Layout.slice(0,Layout.length)
        //var prevlayout = Layout.clone(Layout);
        if(remainder > 0){
            target = remainder;
        }
        for(i = 0; i < 5; i++ ) {
            cost = CreepCost(Layout);
            //console.log(Layout);
            //console.log(prevLayout);
            
            if((cost > target) || (cost > AvailableEnergy)){
                Layout.slice(0,Layout.length-1);            //***************CHANGED*************** PUSH TO OTHER LAYOUT FUNCTIONS!
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
    
    function HealCreep(remainder){ //<<<<----!!! good way for building creeps with a for loop. This will scale them nicely if you know which parts are needed in which numbers
        var Layout = [HEAL,MOVE];
        var cost = 0;
        var target = AvailableEnergy;
        if(remainder > 0){
            target = remainder;
        }
        for(i = 0; i < 20; i++ ) {
            cost = CreepCost(Layout);
            if((cost > target) || (cost > AvailableEnergy)){ break; }
            if((i % 2) == 0){ Layout.push(HEAL); }
            else{ Layout.push(MOVE); }
        }
        return Layout;
    }
    
    function ArmyCreep(remainder){
        var Layout = [TOUGH,MOVE,ATTACK];
        var cost = 0;
        var target = AvailableEnergy;
        var c = 0;
        if(remainder > 0){
            target = remainder;
        }
        for(i = 0; i < 20; i++ ) {
            cost = CreepCost(Layout);
            if((cost > target) || (cost > AvailableEnergy)){ break; }
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
        var Layout = [TOUGH,MOVE,RANGED_ATTACK];
        var cost = 0;
        var target = AvailableEnergy;
        var c = 0;
        if(remainder > 0){
            target = remainder;
        }
        for(i = 0; i < 20; i++ ) {
            cost = CreepCost(Layout);
            if((cost > target) || (cost > AvailableEnergy)){ break; }
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
        var Nharv = 1;
        var Nkill = 0;
        var NEMon = 0;
        if(buil >= Nbuil && upgr >= Nupgr && work >= Nwork && harv >= Nharv && AvailableEnergy > (Game.rooms[MyRoom].energyCapacityAvailable-300)) {
           //Nharv = 3;
           //Nwork = 4;
           Nupgr = 2;
           Nkill = 1;
           if(storages.length > 0){
               NEMon = 2;
           }
           if(Game.flags.Flag2 != undefined){
               Nkill += 4;
           }

        }
        if(Hostiles){
            Nkill += 3;
            }
            if(linkFrom){
                Nharv = 1;
            }
        return [Nbuil,Nupgr,Nwork,Nharv,Nkill,NEMon];
    }
    
    
    var Nos = NoCreeps(builder.length,upgrader.length,worker.length,harvester.length,defender.length,AvailableEnergy,hostiles)
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
    
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
    
    var towers = Game.rooms[MyRoom].find(FIND_MY_STRUCTURES, {
    filter: { structureType: STRUCTURE_TOWER }
    });
    
    //var tower = Game.getObjectById('576e411cc568f7a8783e6c33');
    //console.log(Game.getObjectById(towers[0]));
    //console.log(Game.getObjectById('576e411cc568f7a8783e6c33'));
    if(towers.length > 0){
        var mostbadlydamaged = towers[0].room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                                    return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*0.0003 ||
                                             structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*0.01 ||
                                             (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*0.9) ||
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
            var tower = towers[id]
            //console.log(tower);
                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                var healer = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function(object) {
                        return object.getActiveBodyparts(HEAL) != 0;
                    }
                });

                var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                                    return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*0.0003 ||
                                             structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*0.01 ||
                                             (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*0.9) ||
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

    if(energymon.length < Nos[5]) {
        var newName = Game.spawns.Spawn1.createCreep(TransportCreep(0,10), undefined, {role: 'energymon'});
        console.log('Spawning new EnergyManager: ' + newName);
    }
    
    if(worker.length < Nos[2]) {
        var newName = Game.spawns.Spawn1.createCreep(WorkCreep(0), undefined, {role: 'worker'});
        console.log('Spawning new worker: ' + newName);
        }
    
    if(harvester.length < Nos[3]) {
        var newName = Game.spawns.Spawn1.createCreep(TransportCreep(0,12), undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
    if(defender.length < Nos[4] && harvester.length ==Nos[3] && worker.length == Nos[2] ) {
        var newName = Game.spawns.Spawn1.createCreep(ArmyCreep(Game.rooms[MyRoom].energyCapacityAvailable/3), undefined, {role: 'defender'});
        console.log('Spawning new defender: ' + newName);
    }
    
    if(builder.length < Nos[0] && harvester.length ==Nos[3] && worker.length == Nos[2] ) {
        var newName = Game.spawns.Spawn1.createCreep(BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }

    if(upgrader.length < Nos[1] && harvester.length ==Nos[3] && worker.length == Nos[2] ) {
        var newName = Game.spawns.Spawn1.createCreep(BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    
    
    var IDCounter = 0;
    var SourceToggle = 0;
    var WorkCounter = 0;
    var HarvesterCounter = 0;
    var BuildCounter = 0;
    var AmountWorkMain = 0;
    var AmountHarvMain = 0;
    var Creephit = false;
    var EmonCounter = 0; ////*************CHANGED****
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var Sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(creep.hits < creep.hitsMax){
            Creephit = true;
            Game.notify('A creep has been attacked in '+creep.pos.roomName+' at: '+creep.pos);
        }
        if(Creephit){
            if(healer == undefined || healer.length < 3){
                var newName = Game.spawns.Spawn1.createCreep(HealCreep(Game.rooms[MyRoom].energyCapacityAvailable-200), undefined, {role: 'healer'});
                console.log('Spawning new Healer, under attack!: ' + newName);
            }
            
        }else if(Game.flags.Flag2 != undefined && healer == undefined){
            var newName = Game.spawns.Spawn1.createCreep(HealCreep(Game.rooms[MyRoom].energyCapacityAvailable-200), undefined, {role: 'healer'});
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
            roleBuilder.run(creep,AvailableEnergy,0);
            BuildCounter +=1;
        }
        if(creep.memory.role == 'worker') {
            var sources = creep.room.find(FIND_SOURCES);
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
            roleEnergyMon.run(creep,EmonCounter); ////*************CHANGED****
            EmonCounter+=1;
        }
        if(creep.ticksToLive < 3){
            console.log('creep:'+creep.name+' died, function: '+creep.memory.role+', left:'+creep.carry.energy);
            creep.drop(RESOURCE_ENERGY);
            
        }
    
    
    }
    var MainLoop = Game.cpu.getUsed() - startCpu;
    startCpu = Game.cpu.getUsed();
    var oneLoop = 0;
    var twoLoop = 0;
    if(Game.flags.FarmFlag != undefined){
        farmTile.run(Game.flags.FarmFlag,ArmyCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), WorkCreep(0), TransportCreep(Game.rooms[MyRoom].energyCapacityAvailable/2,16),BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2),false);
        oneLoop = Game.cpu.getUsed() - startCpu;
        startCpu = Game.cpu.getUsed();
    }
    
    if(Game.flags.FarmFlag2 != undefined){
        farmTile.run(Game.flags.FarmFlag2,ArmyCreep(Game.rooms[MyRoom].energyCapacityAvailable/2), WorkCreep(0), TransportCreep(Game.rooms[MyRoom].energyCapacityAvailable/2,16),BuildCreep(Game.rooms[MyRoom].energyCapacityAvailable/2),false);
        twoLoop = Game.cpu.getUsed() - startCpu;
        startCpu = Game.cpu.getUsed();

     }
    var shortage = ((MainLoop+oneLoop+twoLoop)-Game.cpu.limit)
    if(shortage > 0){
        var message = 'CPU usage-limit='+shortage+'     - Main:'+MainLoop+ ' Farm1:'+oneLoop+' Farm2:'+twoLoop+' ; Bucket:'+Game.cpu.bucket+'; TickLimit:'+Game.cpu.tickLimit+' ;happened at tick: '+Game.time;
        console.log(message);
        Game.notify(message, 720);
    }else{
        console.log('TickTime: '+Game.time+' ; CPU to Bucket:'+Math.abs(shortage)+' ; BucketVolume:'+Game.cpu.bucket);
    }
    
}