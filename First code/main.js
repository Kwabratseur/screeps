var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleWorker = require('role.worker');
var roleDefender = require('role.defender');
var roomDefense = require('room.defense');
var farmTile = require('farm.tile');
var roleEnergyMon = require('role.energymon');


module.exports.loop = function () {
    var startCpu = Game.cpu.getUsed();
    var harvester = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var worker = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');
    var defender = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender');
    var energymon = _.filter(Game.creeps, (creep) => creep.memory.role == 'energymon');

    var MyRoom = Game.spawns.Spawn1.room.name;
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
    
    function NoCreeps(buil,upgr,work,harv,kill,AvailableEnergy,Hostiles){
        var Nbuil = 2;
        var Nupgr = 1;
        var Nwork = 3;
        var Nharv = 3;
        var Nkill = 0;
        var NEMon = 0;
        if(Hostiles){
            Nkill = 3;
        }
        if(buil >= Nbuil &&
           upgr >= Nupgr &&
           work >= Nwork &&
           harv >= Nharv &&
           AvailableEnergy > 500) {
               Nharv = 4;
               Nwork = 4;
               Nupgr = 2;
               Nkill = 1;
               if(storages.length > 0){
                   NEMon = 2;
               }
               if(AvailableEnergy > (Game.rooms[MyRoom].energyCapacityAvailable-100)){
                   Nbuil = 4;
               }
               if(Game.rooms[MyRoom].find(FIND_MY_CONSTRUCTION_SITES).length > 10){
                   Nbuil = 5;
               }
               
           }
         
        
        return [Nbuil,Nupgr,Nwork,Nharv,Nkill,NEMon];
    }
    function TransportCreep(){ //<<<<----!!! good way for building creeps with a for loop. This will scale them nicely if you know which parts are needed in which numbers
        var Layout = [CARRY,MOVE];
        var cost = 0;
        
        for(i = 0; i < 14; i++ ) {
            cost = CreepCost(Layout);
            if(cost > AvailableEnergy){
                break;
            }
            if((i % 2) == 0){       //here u can do several things, this selects carry/move because its a transporter. Do something with c +=1 and reset on 3 when u need 3 parts
                Layout.push(CARRY); // u can further work with modulos upon these dividents 
            }else{
                Layout.push(MOVE);
            }
	    }
	        
        //CreepCost
        return Layout;
    }
    
    //console.log(TransportCreep());
    
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
    

    var WorkLayout1 = [WORK, WORK, WORK, MOVE];
    var HarvestLayout1 = [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
    var BuildLayout1 = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    var UpgradeLayout1 = [WORK, WORK, CARRY, CARRY, MOVE];
    var KillerLayout1 = [ATTACK,ATTACK,MOVE,MOVE,TOUGH];
    //if(Game.rooms[MyRoom].controller.level > 2){
    var HarvestLayout = [CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,CARRY,MOVE,CARRY,MOVE];
    var WorkLayout = [WORK,WORK,WORK,WORK,MOVE,MOVE];
    var BuildLayout2 = [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE];
    var BuildLayout = [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,WORK,CARRY,MOVE,WORK];
    var UpgradeLayout = [WORK,WORK,WORK,CARRY,CARRY,CARRY,WORK,CARRY,MOVE,MOVE];
    var KillerLayout = [TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE];
    //}
    //Dynamic Layout Scaler

    
    if(AvailableEnergy < (CreepCost(WorkLayout))) { //Worker scaling
        WorkLayout = WorkLayout1;
        if(AvailableEnergy < (CreepCost(WorkLayout))){
            WorkLayout = [WORK,WORK,MOVE];
        }
    }
    if(AvailableEnergy < (CreepCost(HarvestLayout)) &&
                          worker.length > 0) { //harvester scaling
        HarvestLayout = HarvestLayout1;
        if(AvailableEnergy < (CreepCost(HarvestLayout))){
            HarvestLayout = [CARRY,CARRY,MOVE];
        }
    } 
    if(AvailableEnergy < (CreepCost(BuildLayout))) { //builder scaling
        BuildLayout = BuildLayout2;
        if(AvailableEnergy < (CreepCost(BuildLayout))){
            BuildLayout = BuildLayout1;
            if(AvailableEnergy < (CreepCost(BuildLayout))){
                BuildLayout = [WORK,CARRY,MOVE];
            }
        }
    }
    if(AvailableEnergy < (CreepCost(UpgradeLayout))) { //upgrader scaling
        UpgradeLayout = UpgradeLayout1;
        if(AvailableEnergy < (CreepCost(UpgradeLayout))){
            UpgradeLayout = [WORK,CARRY,MOVE];
        }
    }
    if(AvailableEnergy < (CreepCost(KillerLayout))) { //upgrader scaling
        KillerLayout = KillerLayout1;
        if(AvailableEnergy < (CreepCost(KillerLayout))){
            KillerLayout = [ATTACK,TOUGH,MOVE];
        }
    }
    
    var tower = Game.getObjectById('576e411cc568f7a8783e6c33');
    if(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_WALL&& structure.hits < structure.hitsMax*0.0001 ||
                                     structure.structureType == STRUCTURE_RAMPART && structure.hits < structure.hitsMax*0.03 ||
                                     (structure.structureType == STRUCTURE_ROAD && structure.hits < structure.hitsMax*0.9) ||
                                     structure.structureType == STRUCTURE_CONTAINER)&& structure.hits < structure.hitsMax);
                        }
        });
        if(closestDamagedStructure && !closestHostile) {
            tower.repair(closestDamagedStructure);
        }

       
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    if(energymon.length < Nos[5]) {
        var newName = Game.spawns.Spawn1.createCreep(HarvestLayout, undefined, {role: 'energymon'});
        console.log('Spawning new EnergyManager: ' + newName);
    }
    
    if(defender.length < Nos[4]) {
        var newName = Game.spawns.Spawn1.createCreep(KillerLayout, undefined, {role: 'defender'});
        console.log('Spawning new defender: ' + newName);
    }
    
    if(builder.length < Nos[0]) {
        var newName = Game.spawns.Spawn1.createCreep(BuildLayout, undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }

    if(upgrader.length < Nos[1]) {
        var newName = Game.spawns.Spawn1.createCreep(UpgradeLayout, undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    
    if(worker.length < Nos[2]) {
        var newName = Game.spawns.Spawn1.createCreep(WorkLayout, undefined, {role: 'worker'});
        console.log('Spawning new worker: ' + newName);
        }
    
    if(harvester.length < Nos[3]) {
        var newName = Game.spawns.Spawn1.createCreep(HarvestLayout, undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
    var IDCounter = 0;
    var SourceToggle = 0;
    var WorkCounter = 0;
    var HarvesterCounter = 0;
    var BuildCounter = 0;
    var AmountWorkMain = 0;
    var AmountHarvMain = 0;
    
    for(var name in Game.creeps) {
        //console.log(name);
        var creep = Game.creeps[name];
        var sources = creep.room.find(FIND_SOURCES);
        var drops = creep.room.find(FIND_DROPPED_RESOURCES);
        var Sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(creep.hits < creep.hitsMax){
            console.log('we need a medic!');
        }
        //console.log(' controller: '+creep.room.controller.level)
        //console.log(' amount of sources: '+sources.length)
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
            var No = 0;
            if(BuildCounter >= (builder.length/2)){
                No = 0;//Sites.length -1
            }
            roleBuilder.run(creep,AvailableEnergy,No,Sites);
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
                roleWorker.run(creep,sources[SourceToggle]);
            }
            
        WorkCounter +=1;
        }
        if(creep.memory.role == 'energymon'){
            roleEnergyMon.run(creep);
        }
        if(creep.ticksToLive < 3){
            console.log('creep:'+creep.name+' died, function: '+creep.memory.role+', left:'+creep.carry.energy);
            creep.drop(RESOURCE_ENERGY);
            
        }
    }
    var MainLoop = Game.cpu.getUsed() - startCpu;
    startCpu = Game.cpu.getUsed();
    
    farmTile.run(Game.flags.FarmFlag,KillerLayout, WorkLayout, HarvestLayout,BuildLayout,false);
    var oneLoop = Game.cpu.getUsed() - startCpu;
    startCpu = Game.cpu.getUsed();
    
    farmTile.run(Game.flags.FarmFlag2,KillerLayout, WorkLayout, HarvestLayout,BuildLayout,false);
    var twoLoop = Game.cpu.getUsed() - startCpu;
    startCpu = Game.cpu.getUsed();
    var shortage = ((MainLoop+oneLoop+twoLoop)-Game.cpu.limit)
    if(shortage > 0){
        console.log('CPU usage-limit='+shortage+'     - Main:'+MainLoop+ ' Farm1:'+oneLoop+' Farm2:'+twoLoop+' ; Bucket:'+Game.cpu.bucket+'; TickLimit:'+Game.cpu.tickLimit);
    }
}