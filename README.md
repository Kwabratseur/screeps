
My code for managing two room with 2 farms, flags can be placed to send workers and transporters. 
If enemies are detected, warriors and healers are dispatched.

I've tried to implement different forms of scaling for example the amount of creeps, and the size of them.
Creep bodies are generated based on the amount of energy available, they will grow as the civilization grows.
The number of creeps will be adjusted throughout development to keep a somewhat optimum energy production.

Currently I'm working on automated build scripts which place buildings when the controller is levelled up.
The number of creeps is mostly based on the buildings in the room, so automating the building process really automates the development of the rooms.

The currently active code is placed in the Test2 folder. 

I'm only Control level 5 and GCL 2 so the code is working with all buildings up to this point. Multiple rooms with spawns can be handled.

List of Flags:
 - Flag1 - Mandatory, inactive Healers/Defenders/Claimers are sent here.
 - Flag2 - Optional, Attack marker, Defenders/Healers are dispatched here and destroy everything within 10 squares.
 - Flag3 - Mandatory, inactive builders/upgraders/harvesters are sent here when they are not allowed to pick-up or drop energy
 - FarmFlag/FarmFlag2 - Optional, Dispatch farmers + truckers to farm and transport energy from this room. 
                      - When constructionsites are detected, truckers are not dispatched but builders, they use the resources to build.
                      - There is a ClearRoom variable in farm.tile which sends an army to defend your creeps/ clear the room.
 - AttackController/ClaimController/ReserveController - Optional, place this in the room where you want to dispatch claimers with the flagname goal. Claimers are created when the flags are detected.
 - EnergyCenter - Experimental, Place this in a free area of 9x - 11y, a road-grid will be generated and extensions.
                - needs further improvement.
 - Dismantle - Dispatches all builders to the area of the flag and dismantle all buildings in a range around the flag.
 - All these functions will be replaced with similar names but in flag memory, this allows of defining multiple goals in different rooms. For now, the flags are the same for all rooms.
