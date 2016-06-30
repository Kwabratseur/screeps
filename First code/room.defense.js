var roomDefense = {
    /** @param {Creep} creep **/
    run: function(ExitCoords,MyRoom) {
        var Coords = Game.rooms[MyRoom].find(FIND_EXIT);
        var HQ = Game.rooms[MyRoom];
        var GateCounter = 0;
        console.log('Defense Script Running '+Coords.length);
        for(var No in ExitCoords){
            //Game.rooms.sim.find(FIND_EXIT)[0].x
            //Game.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
            
            if(Coords[No].x == 0 ) {
                GateCounter +=1;
                if(GateCounter == 1){
                    //console.log('X:'+(Coords[No].x + 1)+' Y:'+(Coords[No].y - 2));
                    HQ.createConstructionSite((Coords[No].x + 1), (Coords[No].y - 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x + 2)+' Y:'+(Coords[No].y - 2));
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y - 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x + 2)+' Y:'+(Coords[No].y - 1));
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y - 1),STRUCTURE_WALL );
                }
                if(Coords[No+1] > 0 &&
                    Coords[No+1].x != Coords[No].x){
                    //console.log('X:'+(Coords[No].x + 1)+' Y:'+(Coords[No].y + 2)); //STRUCTURE_WALL
                    HQ.createConstructionSite((Coords[No].x + 1), (Coords[No].y + 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x + 2)+' Y:'+(Coords[No].y + 2));
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y + 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x + 2)+' Y:'+(Coords[No].y + 1));
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y + 1),STRUCTURE_WALL );
                    GateCounter = 0;
                }
                if(GateCounter ==3){
                    HQ.createConstructionSite((Coords[No].x + 2), Coords[No].y, STRUCTURE_RAMPART );
                    //console.log('X:'+(Coords[No].x + 2)+' Y:'+Coords[No].y+ 'gate?');//STRUCTURE_RAMPART
                }
                    //console.log('X:'+(Coords[No].x + 2)+' Y:'+Coords[No].y);
                    HQ.createConstructionSite((Coords[No].x + 2), Coords[No].y, STRUCTURE_WALL );
            }
            
            if(Coords[No].x == 49 ) {
                GateCounter +=1;
                if(GateCounter == 1){
                    //console.log('X:'+(Coords[No].x - 1)+' Y:'+(Coords[No].y - 2));
                    HQ.createConstructionSite((Coords[No].x - 1), (Coords[No].y - 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x - 2)+' Y:'+(Coords[No].y - 2));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y - 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x - 2)+' Y:'+(Coords[No].y - 1));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y - 1),STRUCTURE_WALL );
                }
                if(Coords[No+1] > 0 &&
                Coords[No+1].x != Coords[No].x){
                    //console.log('X:'+(Coords[No].x - 1)+' Y:'+(Coords[No].y + 2)); //STRUCTURE_WALL
                    HQ.createConstructionSite((Coords[No].x - 1), (Coords[No].y + 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x - 2)+' Y:'+(Coords[No].y + 2));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y + 2),STRUCTURE_WALL );
                    //console.log('X:'+(Coords[No].x - 2)+' Y:'+(Coords[No].y + 1));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y + 1),STRUCTURE_WALL );
                    
                    GateCounter = 0;
                }
                if(GateCounter ==3){
                    //console.log('X:'+(Coords[No].x - 2)+' Y:'+Coords[No].y+ 'gate?');//STRUCTURE_RAMPART
                    HQ.createConstructionSite((Coords[No].x - 2), Coords[No].y ,STRUCTURE_RAMPART );
                }
                    //console.log('X:'+(Coords[No].x - 2)+' Y:'+Coords[No].y);
                    HQ.createConstructionSite((Coords[No].x - 2), Coords[No].y ,STRUCTURE_WALL );
            }
            
            if(Coords[No].y == 0 ) {
                GateCounter +=1;
                if(GateCounter == 1){
                    //console.log('Y:'+(Coords[No].y + 1)+' X:'+(Coords[No].x - 2));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y + 1),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y + 2)+' X:'+(Coords[No].x - 2));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y + 2),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y + 2)+' X:'+(Coords[No].x - 1));
                    HQ.createConstructionSite((Coords[No].x - 1), (Coords[No].y + 2),STRUCTURE_WALL );
                }
                if(Coords[No+1] > 0 &&
                    Coords[(No+1)].y != Coords[No].y){
                    //console.log('Y:'+(Coords[No].y + 1)+' X:'+(Coords[No].x + 2)); //STRUCTURE_WALL
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y + 1),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y + 2)+' X:'+(Coords[No].x + 2));
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y + 2),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y + 2)+' X:'+(Coords[No].x + 1));
                    HQ.createConstructionSite((Coords[No].x + 1), (Coords[No].y + 2),STRUCTURE_WALL );
                    
                    GateCounter = 0;
                }
                if(GateCounter ==3){
                    //console.log('Y:'+(Coords[No].y + 2)+' X:'+Coords[No].x+ 'gate?');//STRUCTURE_RAMPART
                    HQ.createConstructionSite(Coords[No].x , (Coords[No].y + 2),STRUCTURE_RAMPART );
                }
                    //console.log('Y:'+(Coords[No].y + 2)+' X:'+Coords[No].x);
                    HQ.createConstructionSite(Coords[No].x , (Coords[No].y + 2),STRUCTURE_WALL );
            }
            
            if(Coords[No].y == 49 ) {
                GateCounter +=1;
                if(GateCounter == 1){
                    //console.log('Y:'+(Coords[No].y - 1)+' X:'+(Coords[No].x - 2));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y - 1),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y - 2)+' X:'+(Coords[No].x - 2));
                    HQ.createConstructionSite((Coords[No].x - 2), (Coords[No].y - 2),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y - 2)+' X:'+(Coords[No].x - 1));
                    HQ.createConstructionSite((Coords[No].x - 1), (Coords[No].y - 2),STRUCTURE_WALL );
                }
                if(Coords[No+1] > 0 &&
                Coords[No+1].y != Coords[No].y){
                    //console.log('Y:'+(Coords[No].y - 1)+' X:'+(Coords[No].x + 2)); //STRUCTURE_WALL
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y - 1),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y - 2)+' X:'+(Coords[No].x + 2));
                    HQ.createConstructionSite((Coords[No].x + 2), (Coords[No].y - 2),STRUCTURE_WALL );
                    //console.log('Y:'+(Coords[No].y - 2)+' X:'+(Coords[No].x + 1));
                    HQ.createConstructionSite((Coords[No].x + 1), (Coords[No].y - 2),STRUCTURE_WALL );
                    
                    GateCounter = 0;
                }
                if(GateCounter ==3){
                    //console.log('Y:'+(Coords[No].y - 2)+' X:'+Coords[No].x+ 'gate?');//STRUCTURE_RAMPART
                    HQ.createConstructionSite(Coords[No].x, (Coords[No].y - 2),STRUCTURE_RAMPART );
                }
                    //console.log('Y:'+(Coords[No].y - 2)+' X:'+Coords[No].x);
                    HQ.createConstructionSite(Coords[No].x , (Coords[No].y - 2),STRUCTURE_WALL );
            }
        }
    }
};
module.exports = roomDefense;


