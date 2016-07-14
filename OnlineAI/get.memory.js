var Memstructures = {};

/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('get.memory');
 * mod.thing == 'a thing'; // true
 */


Memstructures.run = function(MemoryPointer){ //use this function to retrieve buildings from a type from memory. Like this var test = Memstructures(Memory.rooms[MyRoom].RoomInfo.Sources);
    var returnresult = [];
    for(i in MemoryPointer){
        returnresult.push(Game.getObjectById(MemoryPointer[i]));
        if(Game.getObjectById(MemoryPointer[i]) == undefined && MemoryPointer.length == 0){
            console.log("Causing error: "+MemoryPointer[0]);
            console.log('error @ '+Game.getObjectById(MemoryPointer[i]));
            returnresult = false;
            break;
        }
    }
        return returnresult;

    //console.log('returned:'+(returnresult == false));
}

Memstructures.reset = function(MyRoom){
    delete Memory.rooms[MyRoom].RoomInfo;
}

Memstructures.set = function(MyRoom,SpawnName2){ //use this function to retrieve buildings from a type from memory. Like this var test = Memstructures(Memory.rooms[MyRoom].RoomInfo.Sources);
            var sourcess = [];
            var towerss = [];
            var storagess = [];
            var containerss = [];
            var linkss = [];
            var extensionss = [];
            var labss = [];
            var wallss = [];
            var rampartss = [];
            var roadss = [];
            var extractorss = [];
            var terminalss = [];
            var spawnss = [];

            var sources = Game.rooms[MyRoom].find(FIND_SOURCES);
            var towers = Game.rooms[MyRoom].find(FIND_MY_STRUCTURES, {
                            filter: { structureType: STRUCTURE_TOWER
                            }
                    });
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
            var links = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_LINK );
                            }
                    });
            var extensions = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTENSION );
                            }
                    });
            var labs = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_LAB );
                            }
                    });
            var walls = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_WALL );
                            }
                    });
            var ramparts = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_RAMPART );
                            }
                    });
            var roads = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_ROAD );
                            }
                    });
            var extractors = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_EXTRACTOR );
                            }
                    });
            var terminals = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_TERMINAL );
                            }
                    });
            var Roomspawns = Game.rooms[MyRoom].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType == STRUCTURE_SPAWN );
                            }
                    });

            for(var i in sources){ //iterate through object and stor Id's for Game.getObjedtById();
                sourcess.push(sources[i].id);
            }

            for(var i in towers){ //iterate through object and stor Id's for Game.getObjedtById();
                towerss.push(towers[i].id);
            }

            for(var i in storages){ //iterate through object and stor Id's for Game.getObjedtById();
                storagess.push(storages[i].id);
            }

            for(var i in containers){ //iterate through object and stor Id's for Game.getObjedtById();
                containerss.push(containers[i].id);
            }

            for(var i in links){ //iterate through object and stor Id's for Game.getObjedtById();
                linkss.push(links[i].id);
            }

            for(var i in extensions){ //iterate through object and stor Id's for Game.getObjedtById();
                extensionss.push(extensions[i].id);
            }

            for(var i in labs){ //iterate through object and stor Id's for Game.getObjedtById();
                labss.push(labs[i].id);
            }

            for(var i in walls){ //iterate through object and stor Id's for Game.getObjedtById();
                wallss.push(walls[i].id);
            }

            for(var i in ramparts){ //iterate through object and stor Id's for Game.getObjedtById();
                rampartss.push(ramparts[i].id);
            }

            for(var i in roads){ //iterate through object and stor Id's for Game.getObjedtById();
                roadss.push(roads[i].id);
            }

            for(var i in extractors){ //iterate through object and stor Id's for Game.getObjedtById();
                extractorss.push(extractors[i].id);
            }

            for(var i in terminals){ //iterate through object and stor Id's for Game.getObjedtById();
                terminalss.push(terminals[i].id);
            }

            for(var i in Roomspawns){ //iterate through object and stor Id's for Game.getObjedtById();
                spawnss.push(Roomspawns[i].id);
            }
            Memory.rooms[MyRoom].RoomInfo = {
                SpawnName: SpawnName2, //do this different, get the object ID's push them in an array and insert them in memory. saves memory and we need Game.getObjectById() to do game actions. methods don't work with memory ofc
                RoomName: Game.spawns[SpawnName2].room.name,
                Sources:  sourcess,
                Towers: towerss,
                Storages: storagess,
                Containers: containerss,
                Links: linkss,
                Extensions: extensionss,
                Labs: labss,
                Terminals: terminalss,
                Extractors: extractorss,
                Roads: roadss,
                Walls: wallss,
                Ramparts: rampartss,
                Spawns: spawnss
            };
}



module.exports = Memstructures;