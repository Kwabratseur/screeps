var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep,AvailableEnergy) {
        var Jobs = require('creep.jobs')
	    if(creep.carry.energy == 0) {
          Jobs.GetEnergy(creep);
        }
        else {
          Jobs.Upgrade(creep);
        }
	}
};

module.exports = roleUpgrader;
