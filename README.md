My code for managing one room with 2 farms, flags can be placed to send workers and transporters. 
If enemies are detected, warriors and healers are dispatched.

I've tried to implement different forms of scaling for example the amount of creeps, and the size of them.
Creep bodies are generated based on the amount of energy available, they will grow as the civilization grows.
The number of creeps will be adjusted throughout development to keep a somewhat optimum energy production.

Currently I'm working on automated build scripts which place buildings when the controller is levelled up.
The number of creeps is mostly based on the buildings in the room, so automating the building process really automates the development of the rooms.

Todo's:

* Cleanup code
* 

* Improvements:
*   -   Create and add build scripts
*       * if control level == up -> add possible structures
*       * add extensions at BaseFlag location (added once)
*       * if control level == up again -> logically continue with grid
*       * Buildings: Extensions, Roads, storages, container should be taken into account here
*
*   -   create and add Link scripts ***COMPLETED***
*       * can be used to fill structures/transport energy from range within same room
*
*   -   improve defense script ***DONE***
*       * also triggered when control level == up 
*       * OR if defenses are destroyed
*       * Also include the Tower placement here
*
*   -   Add Automatic Repair sequence
*       * max hits in ramparts and walls are scaled up with control level
*       * ALWAYS repair the weakest link first, so sort from most damaged to least damaged
*       * Keep in mind that this costs a lot of energy initially! so start SERIOUSLY repairing from control level 4       
*
*   - control level == up should be done with room.memory ***DONE***
*
*   - also add for loop, looping through rooms with spawns ***DONE***
*
*   - Test all this in simulation ofc!
*
*   - Add list of flags with given function and routine which places mandatory flags or just to anoy neigbours/autofarm
