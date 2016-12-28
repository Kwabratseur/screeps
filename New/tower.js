var tower = {}

tower.run = function(MyRoom,towers,ramparts,containers,hostiles){

  if(towers.length > 0 && towers[0] != null){

      var damagedStructures = ramparts;
      var structHp = Math.pow((11-Game.rooms[MyRoom].controller.level),(11-Game.rooms[MyRoom].controller.level)/2)

      var damagedStructures = _.filter(damagedStructures, function(structure){return (structure.hits < 300000); });
      //var damagedStructures = damagedStructures.concat(roads,towers,Game.spawns[SpawnName])
      damagedStructures.concat(containers);
      var c = 0;
      for (i = 0; i < damagedStructures.length; i++){
          if(damagedStructures[i].hits < damagedStructures[c].hits){
              c = i;
          }
      }

      for(var id in towers){
          var tower = towers[id];
          if(damagedStructures[c] && tower.energy > tower.energyCapacity*0.89){
            tower.repair(damagedStructures[c]);
          }
          if(hostiles) {
              tower.attack(hostiles);
          }
      }
  }
}
module.exports = tower;
