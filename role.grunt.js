var roleGrunt = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.state == 1) {
            var target = Game.getObjectById(creep.memory.target);
            var enemies = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (enemy) => enemy.pos.getRangeTo(creep.memory.pos.x, creep.memory.pos.y) <= 15});
            if(target != null ) {
                if(target.pos.getRangeTo(creep.memory.pos.x, creep.memory.pos.y) > 10 || target.hits == 0) {
                    if(enemies.length){
                        creep.memory.target = enemies[0].id;
                        target = enemies[0];
                    }
                    else {
                        creep.memory.target = null;
                    }
                }
                else (creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }        
            else {
                if(enemies.length) {
                    creep.memory.target = enemies[0].id;
                    target = enemies[0]
                    if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                }
                else if(creep.pos.getRangeTo(creep.memory.pos.x, creep.memory.pos.y) > 5) {
                    creep.moveTo(creep.memory.pos.x, creep.memory.pos.y, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleGrunt;