//completely get rid of this, will be handled central with flagmonitor + manager
var farmTile = {


    run: function(TargetRoom,SpawnName, AvailableEnergy,EnergyCap,clearRoom) {
        var roleFarmer = require('role.farmer');
        var roleTrucker = require('role.trucker');
        var roleArmy = require('role.army');
        var roleExternalBuilder = require('role.externalbuilder')
        var CreepBuilder = require('creep.builder');

        var farmer = _.filter(Game.creeps, (creep) => (creep.memory.role == 'farmer') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        var trucker = _.filter(Game.creeps, (creep) => (creep.memory.role == 'trucker') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        var externalbuilder = _.filter(Game.creeps, (creep) => (creep.memory.role == 'externalbuilder') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        var army = _.filter(Game.creeps, (creep) => (creep.memory.role == 'army') && (creep.memory.HarvestTile == TargetRoom.pos.roomName));
        var Tno = 2;
        var farmerC = 0;


        if(TargetRoom.room != undefined && TargetRoom.room.controller.reservation != undefined && TargetRoom.room.controller.reservation.username == 'Kwabratseur'){
            Tno = 4; //more truckers if room is reserved
        }

        if(SpawnName.room.energyAvailable > SpawnName.room.energyCapacityAvailable*0.8){
            if(army.length < 2 && clearRoom == true){
                var Layout = CreepBuilder.Layout(EnergyCap/4,AvailableEnergy,20,"Army");
                var newName = SpawnName.createCreep(Layout, undefined, {role: 'army', destRoom: TargetRoom.pos.roomName, Flag: TargetRoom.name});
                console.log('Spawning new warrior: ' + newName+' for: '+TargetRoom);
            }

            if(farmer.length < 2 ) {
                var Layout = CreepBuilder.Layout(0,AvailableEnergy,3,"Work");
                var newName = SpawnName.createCreep(Layout, undefined, {role: 'farmer', destRoom: TargetRoom.pos.roomName, Flag: TargetRoom.name});

                console.log('Spawning new farmer: ' + newName+' for: '+TargetRoom);
            }
            if(TargetRoom.room != undefined){
                if(TargetRoom.room.find(FIND_CONSTRUCTION_SITES).length > 0){
                    if(externalbuilder.length < 2) {
                        var Layout = CreepBuilder.Layout(EnergyCap/4,AvailableEnergy,30,"Build");
                        var newName = SpawnName.createCreep(Layout, undefined, {role: 'externalbuilder', destRoom: TargetRoom.pos.roomName, Flag: TargetRoom.name});
                        console.log('Room '+TargetRoom.pos.roomName+' is reserved for: '+TargetRoom.room.controller.reservation.ticksToEnd+' ticks');
                        Game.notify('Room '+TargetRoom.pos.roomName+' is reserved for: '+TargetRoom.room.controller.reservation.ticksToEnd+' ticks',720);
                        console.log('dispatch builder' + newName+ 'to fix stuff in: '+TargetRoom);
                    }
                Tno = 0;
                }
            }
            if(trucker.length < Tno) {
                var Layout = CreepBuilder.Layout(EnergyCap/3,AvailableEnergy,16,"Transport");
                var newName = SpawnName.createCreep(Layout, undefined, {role: 'trucker', destRoom: TargetRoom.pos.roomName, Flag: TargetRoom.name});
            console.log('Spawning new Trucker: ' + newName+ 'to truck goods from: '+TargetRoom);
            }
        }
        //console.log(TargetRoom.room.find(FIND_SOURCES).length);//Game.flags.FarmFlag.room.find(FIND_CONSTRUCTION_SITES);
        var FarmNo = 0;
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if((creep.memory.HarvestTile == TargetRoom.pos.roomName) || (creep.room == SpawnName.room)){
                if(creep.pos.roomName == TargetRoom.pos.roomName){
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
