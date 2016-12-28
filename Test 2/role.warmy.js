var roleWArmy = {

  //Mem.WarStats(n,towers,mode,SpawningDef,NoArmy,AvgSize,NoCreeps,kills,death)
  //Warband.Type Flag Flag2 Mode Names S R H T W
run: function(creep,Warband) { //add arguments tactics, not nesecarry as creep contains warband numbr
  var Moveto = require('move.to');
  var Jobs = require('creep.jobs');
  var Warmates = [];

  if(Warband.Mode.Mode != undefined){
    var mode = Warband.Mode.Mode;
  }else{
    var mode = Warband.mode;
  }

  for(var name in Warband.Names){ //lookup mates
    Warmates.unshift(Warband.Names[name]);
  }
  //if creep was retreating and is fully healed, let it fight again.
  if(creep.memory.retreating == undefined){
    creep.memory.retreating = false;
  }
  if(creep.memory.retreating && creep.hits == creep.hitsMax){
    creep.memory.retreating = false;
  }
  //console.log(Game.creeps[Warmates[0]]);
  //console.log(Warband.Names[0]);
  if(creep.name == Warband.Names[0]){
    creep.say('Follow Me!');
  }
  if(creep.memory.destRoom != creep.room.name){// destRoom will contain rally point
    if(creep.name != Warmates[0] && !creep.pos.inRangeTo(Game.creeps[Warband.Names[0]],4)){
      Moveto.move(creep,Game.creeps[Warmates[0]])
    }else{
      Moveto.move(creep,new RoomPosition(25, 25, creep.memory.destRoom));
    }

  }else{
    if(creep.memory.retreating){
      Jobs['Retreat'](creep);
    }

    //if warband is regrouped succesfully at vantage point:
    if(creep.pos.inRangeTo(Game.flags[Warband.Flag2],8)){
      Jobs['Attack'](creep);
      creep.memory.roomFrom = creep.memory.destRoom; //fallback point in prev room
      creep.memory.destRoom = Warband.Flag; //next vantage point
      creep.say('Camping',true);
    }else{ //look for walls to brick as loas the flag is not reached.
  //    creep.say(creep.memory._move.dest.x+', '+creep.memory._move.dest.y);
        //Jobs['brickwall'](creep);
    }


  }

  //blue is vantage point
  //red is attackpoint



  switch(Warband.Type){
    case'Light':

    break;

    case 'Medium':

    break;

    case 'Heavy':

    break;
  }

  switch(mode){ //construct above, with Mem.warstats the loc in mem changes.
    case 'Offensive':

    break;

    case 'Defensive':

    break;

    case 'Claim':

    break;

    case 'Reserve':

    break;
  }

  switch(creep.memory.role){

  case 'tough':
    if(creep.getActiveBodyparts(TOUGH) == 0){
      creep.memory.retreating = true;
    }
  break;

  case 'healer':
    if(creep.getActiveBodyparts(HEAL) == 0){
      creep.memory.retreating = true;
    }
  break;

  case 'ranger':
  if(creep.getActiveBodyparts(RANGED_ATTACK) == 0){
    creep.memory.retreating = true;
  }
  break;

  case 'soldier':
  if(creep.getActiveBodyparts(ATTACK) == 0){
    creep.memory.retreating = true;
  }
  break;

  case 'demolisher':
  if(creep.getActiveBodyparts(WORK) == 0){
    creep.memory.retreating = true;
  }
  break;

  case 'claimer':
  if(creep.getActiveBodyparts(CLAIM) == 0){
    creep.memory.retreating = true;
  }
  break;
  }

}
};

module.exports = roleWArmy;

//roles: tough,healer,ranger,soldier,demolisher,claimer
