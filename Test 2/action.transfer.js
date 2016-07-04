var Transfer = {};
var Struct = require('get.memory');
var Moveto = require('move.to');

function ReturnObjects(object,MyRoom,n){
    var temp = null;
    switch(object) {
		case 'Containers':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Containers)[n];
		break;
		case 'Storages': // call looks like: Transfer.to(creep,creep.room.name,"Storages",RESOURCE_ENERGY,0);
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Storages)[n];
		break;
		case 'Spawns':
			temp = Game.spawns
		break;
		case 'Extensions':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Extensions)[n];
		break;
		case 'Links':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Links)[n];
		break;
		case 'Labs':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Labs)[n];
		break;
		case 'Towers':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Towers)[n];
		break;
		case 'Controllers':
			temp = Game.rooms[MyRoom].controller;
		break;
	}
	return temp;
};

Transfer.to = function(creep,MyRoom,object,resource = RESOURCE_ENERGY,n = 0){//creep,
    var temp = ReturnObjects(object,MyRoom,n);
	if(creep.transfer(temp,resource) == ERR_NOT_IN_RANGE){
	    Moveto.move(creep,temp)
	}
}
Transfer.from = function(creep,MyRoom,object,resource = RESOURCE_ENERGY,n = 0){//creep,
    var temp = ReturnObjects(object,MyRoom,n);

    switch(object) {// call looks like: Transfer.from(creep,creep.room.name,"Storages",RESOURCE_ENERGY,0);
		case 'Containers': case 'Storages': case 'Labs': case 'Controllers':
		    if(temp.transfer(creep, resource) == ERR_NOT_IN_RANGE) { //withdraw @ storage
                Moveto.move(creep,temp);
            }
		break;

		case 'Extensions': case 'Spawns': case 'Links': case 'Towers':
            if(temp.transferEnergy(creep) == ERR_NOT_IN_RANGE){
                Moveto.move(creep,temp)
            }
	    break;
	}
}

module.exports = Transfer;
