var Build = {};


function CreepType(Creepy,n,b,c){
    var BodyPart = null;
    switch(Creepy) {
    case'Transport':
        if((n % 2) == 0){ BodyPart = CARRY;}
        else{ BodyPart = MOVE; }
    break;

    case'Tough':
        if((n % 2) == 0){ BodyPart = TOUGH;}
        else{ BodyPart = MOVE; }
    break;

    case'Build':
        if(c == 0){ BodyPart = CARRY; }
        if(c == 1 && b == 0 ){ BodyPart = MOVE; } // this one will be added twice in a row of 9
        if(c == 2 && b == 0){ BodyPart = WORK; }
    break;

    case'Work':
        BodyPart = WORK;
        if(n > 5){
          if((n % 2) == 0){ BodyPart = MOVE;}
          else{ BodyPart = WORK};
        }
    break;

    case'Claim':
        if(b == 0){ BodyPart = CLAIM; }
        if(b == 1 && (n%3) == 1){ BodyPart = MOVE; }
    break;

    case'Heal':
        if((n % 2) == 0){ BodyPart = HEAL; }
        else{ BodyPart = MOVE; }
    break;

    case'Army':
        if(c == 0){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = ATTACK; }
        }
        if(c == 1){ BodyPart = MOVE; }// this one will be added twice in a row of 9
        if(c == 2){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = ATTACK; }
        }
    break;

    case'Ranged_Army':
        if(c == 0){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = RANGED_ATTACK; }
        }
        if(c == 1){ BodyPart = MOVE; }// this one will be added twice in a row of 9
        if(c == 2){
            if(Math.random()*10 < 3 ){ BodyPart = TOUGH; }
            else{ BodyPart = RANGED_ATTACK; }
        }
    break;
    }
    return BodyPart;
}

function CreepTypeInit(Creepy,BodySize){
    var BodyParts = [];
    switch(Creepy) {
    case'Transport':
        BodyParts =[MOVE,CARRY,MOVE];
    break;

    case'Transport':
        BodyParts =[MOVE,TOUGH,MOVE];
    break;

    case'Build':
        BodyParts =[CARRY,MOVE,WORK,CARRY];
    break;

    case'Work':
        if(BodySize > 3){
            BodyParts =[WORK,MOVE,CARRY,CARRY];
        }else if(BodySize > 5){
            BodyParts =[WORK,MOVE,WORK,WORK,MOVE,MOVE];
        }else{
            BodyParts =[WORK,MOVE,WORK];
        }
    break;

    case'Claim':
        BodyParts =[CLAIM,MOVE,CLAIM];
    break;

    case'Heal':
        BodyParts =[HEAL,MOVE,HEAL];
    break;

    case'Army':
        BodyParts =[TOUGH,MOVE,ATTACK,TOUGH];
    break;

    case'Ranged_Army':
        BodyParts =[TOUGH,MOVE,RANGED_ATTACK,TOUGH];
    break;
    }
    return BodyParts;
}

Build.Cost = function(Layout){
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
Build.Rebuild = function(Layout){
    var GoodLayout = [];
    var temp = 0;
    for(var items in Layout) {
        if(Layout[items] == 'move'){ temp = MOVE}
        if(Layout[items] == 'carry'){ temp = CARRY;}
        if(Layout[items] == 'work'){ temp = WORK; }
        if(Layout[items] == 'attack'){ temp = ATTACK; }
        if(Layout[items] == 'ranged_attack'){ temp = RANGED_ATTACK; }
        if(Layout[items] == 'heal'){ temp = HEAL; }
        if(Layout[items] == 'claim'){ temp = CLAIM; }
        if(Layout[items] == 'tough'){ temp = TOUGH; }
        GoodLayout.unshift(temp);
    }
    return GoodLayout;
}
//<<<<----!!! good way for building creeps with a for loop. This will scale them nicely if you know which parts are needed in which numbers

function orderCost(Type){
    var cost = 0;
    if(Type == MOVE ){cost = 9; }
    if(Type == CARRY){cost = 2; }
    if(Type == WORK){ cost = 1; }
    if(Type == ATTACK){ cost = 3; }
    if(Type == RANGED_ATTACK){ cost = 5; }
    if(Type == HEAL){ cost = 4; }
    if(Type == CLAIM){ cost = 8; }
    if(Type == TOUGH){ cost = 0; }
    return cost;
}

Build.Layout = function(remainder,AvailableEnergy,BodySize,Type){
    var Layout = CreepTypeInit(Type,BodySize);
    var cost = 0;
    var target = AvailableEnergy;
    var c = 0;
    var b = 0;
    var stop = false;
    if(remainder != 0){
        target = remainder;
    }
    for(i = 0; i < BodySize; i++ ) {
        if(!stop){
            cost = Build.Cost(Layout);
            c+=1;
            b+=1;
            if(c > 2){ c = 0; }
            if(b > 1){ b = 0; }

        if((cost >= target) || (cost >= AvailableEnergy)){
            //Layout.slice(0,Layout.length);
            Layout.pop();
            console.log('Cost:'+cost+' Layout: '+Layout+' Target:'+target+' Remainder:'+AvailableEnergy);
            stop = true;
        }
        if(CreepType(Type,i,b,c) != undefined){
            Layout.push(CreepType(Type,i,b,c));
        }
        }


    }

    return Layout.sort((a, b)=>orderCost(a)-orderCost(b));//(a, b)=>orderCost(a)-orderCost(b)
    //return Layout.sort();//ATTACK,MOVE,TOUGH(a, b) -> orderCost(a) < orderCost(b)
}

module.exports = Build;
