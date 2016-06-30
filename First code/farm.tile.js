/* ##
 * This module is going to need a flag named FarmTile# where # is flag No
 * this module will do the following:
    - Check No creeps and No hostiles
    - if hostiles send army
    - if hostile buildings kill buildings (both at same time)
        * this needs a new defend/attack creep which takes the target(creep/building)
    - else if energy can be missed
        - dispatch workers
        - send harvesters
 */
var farmTile = {
    

    /** @param {Creep} creep **/
    //input: Game.flags.*FlagName*.room.roomname
    run: function(TargetRoom, KillerLayout, WorkLayout, HarvestLayout,BuildLayout,clearRoom) {
        var roleFarmer = require('role.farmer');
        var roleTrucker = require('role.trucker');
        var roleArmy = require('role.army');
        var roleExternalBuilder = require('role.externalbuilder')
        
        var farmer = _.filter(Game.creeps, (creep) => (creep.memory.role == 'farmer') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        var trucker = _.filter(Game.creeps, (creep) => (creep.memory.role == 'trucker') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        var externalbuilder = _.filter(Game.creeps, (creep) => (creep.memory.role == 'externalbuilder') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        var army = _.filter(Game.creeps, (creep) => (creep.memory.role == 'army') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        
        var farmerC = 0;
        //var Hostiles = Game.rooms[TargetRoom].find(FIND_HOSTILE_CREEPS);
        //var HostileBuildings = Game.rooms[TargetRoom].find(FIND_HOSTILE_STRUCTURES);
        
        if(Game.spawns.Spawn1.room.energyAvailable > Game.spawns.Spawn1.room.energyCapacityAvailable*0.8){
            if(army.length < 4 && clearRoom == true){
                var newName = Game.spawns.Spawn1.createCreep(KillerLayout, undefined, {role: 'army', HarvestTile: TargetRoom.pos.roomName, FlagName: TargetRoom.name});
            }

            if(farmer.length < 2 ) {
                var newName = Game.spawns.Spawn1.createCreep(WorkLayout, undefined, {role: 'farmer', HarvestTile: TargetRoom.pos.roomName, FlagName: TargetRoom.name});
                
                console.log('Spawning new farmer: ' + newName);
            }
                
            if(trucker.length < 2) {
                var newName = Game.spawns.Spawn1.createCreep(HarvestLayout, undefined, {role: 'trucker', HarvestTile: TargetRoom.pos.roomName, FlagName: TargetRoom.name});
            console.log('Spawning new Trucker: ' + newName+ 'to truck goods from: '+TargetRoom);
            }
            if(TargetRoom.room != undefined){
                if(TargetRoom.room.find(FIND_CONSTRUCTION_SITES).length > 0){
                    if(externalbuilder.length < 2) {
                        var newName = Game.spawns.Spawn1.createCreep(BuildLayout, undefined, {role: 'externalbuilder', HarvestTile: TargetRoom.pos.roomName, FlagName: TargetRoom.name});
                        console.log('dispatch builder' + newName+ 'to fix stuff in: '+TargetRoom);
                    }
                    
                }
            }
        }
        //console.log(TargetRoom.room.find(FIND_SOURCES).length);//Game.flags.FarmFlag.room.find(FIND_CONSTRUCTION_SITES);
        var FarmNo = 0;
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if((creep.memory.HarvestTile == TargetRoom.pos.roomName) || (creep.room == Game.spawns.Spawn1.room)){
                if(creep.memory.HarvestTile == TargetRoom.pos.roomName){
                    var NoSources = TargetRoom.room.find(FIND_SOURCES).length;
                }
                if(creep.memory.role == 'army') {
                    roleArmy.run(creep);
                }
                if(creep.memory.role == 'farmer') {
                    
                    if(FarmNo == NoSources){
                        FarmNo = 0;
                    }
                    roleFarmer.run(creep,FarmNo);
                    FarmNo+=1;
                }
                if(creep.memory.role == 'trucker') {
                    roleTrucker.run(creep);
                }
                if(creep.memory.role == 'externalbuilder') {
                    roleExternalBuilder.run(creep);
                }
            }
        }
        /*var container = creep.room.find(FIND_STRUCTURES, {
        //Target source ID in memory at creation.!!
        
        });*/
        
        //creep.drop(RESOURCE_ENERGY);
        //console.log(Game.getObjectById('576a9c0357110ab231d88555'));
        //if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {

    }
};

module.exports = farmTile;