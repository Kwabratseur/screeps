var Transfer = {};
var Struct = require('get.memory');
var Moveto = require('move.to');

function ReturnObjects(object,MyRoom){
    var temp = null;
    switch(object) {
		case 'Containers':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Containers);
		break;
		case 'Storages': // call looks like: Transfer.to(creep,creep.room.name,"Storages",RESOURCE_ENERGY,0);
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Storages);
		break;
		case 'Spawns':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Spawns);
		break;
		case 'Extensions':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Extensions);
		break;
		case 'Links':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Links);
		break;
		case 'Labs':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Labs);
		break;
		case 'Towers':
			temp = Struct.run(Memory.rooms[MyRoom].RoomInfo.Towers);
		break;
		case 'Controllers':
			temp = Game.rooms[MyRoom].controller;
		break;
	}
	return temp;
};

Transfer.FilterObjects = function(creep,MyRoom,object,resource,n){
    var temp1 = ReturnObjects(object,MyRoom);
    var temp = null;
    switch(n){
        case 'zero':
            temp = temp1;
        break;
        case 'unfilled':
            if(object == 'Extensions' || object == 'Spawns' || object == 'Links' || object == 'Towers'){
                temp = _.filter(temp1, function(structure){return structure.energy < structure.energyCapacity; });
            }else{
                temp = _.filter(temp1, function(structure){return structure.store[RESOURCE_ENERGY] < structure.storeCapacity; });
            }
        break;
        case 'filled':
            if(object == 'Extensions' || object == 'Spawns' || object == 'Links' || object == 'Towers'){
                temp = _.filter(temp1, function(structure){return structure.energy > 0; });
            }else{
                temp = _.filter(temp1, function(structure){return structure.store[RESOURCE_ENERGY] > 50; });
            }
        break;
    }
    return creep.pos.findClosestByRange(temp);

}

                //temp = _.filter(temp1, function(structure){return structure.energy < structure.energyCapacity; }); //returns undefined if not true
                //test = _.filter(temp1, function(structure){return structure.store[RESOURCE_ENERGY] < structure.storeCapacity; });

Transfer.to = function(creep,MyRoom,object,resource = RESOURCE_ENERGY,n = 'zero'){//creep,
    var temp = Transfer.FilterObjects(creep,MyRoom,object,resource,n);
	if(!temp){
	    return true;
	}else{
	    if(creep.transfer(temp,resource) == ERR_NOT_IN_RANGE){
    	    Moveto.move(creep,temp)
    	}
	}
}
Transfer.from = function(creep,MyRoom,object,resource = RESOURCE_ENERGY,n = 'zero'){//creep,
    var temp = Transfer.FilterObjects(creep,MyRoom,object,resource,n);
	if(!temp){
	    return true;
	}else{
    	if(creep.withdraw(temp, resource) == ERR_NOT_IN_RANGE) { //withdraw @ storage
          Moveto.move(creep,temp);
      }
	}
}

module.exports = Transfer;
