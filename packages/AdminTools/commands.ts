import * as vstatic from "./static";
import users from "./users.json";

mp.events.addCommand("spawnveh", (player, fullText, vehicleName, dimension) => {

    for (const user of users){
        if((player.name.indexOf(user) !== -1)){
            if(vehicleName === undefined) return player.outputChatBox(vstatic.prefix + "Syntax: /spawnveh <VehicleName> [Dimension]");

            const vehicleHash = mp.joaat(vehicleName);

            if(vehicleHash === undefined) return player.outputChatBox(vstatic.prefix + "The vehicle with the given name doesn't exists!");

            const vehicle = mp.vehicles.new(vehicleHash, player.position, {
                dimension: parseInt(dimension) || 0
            });

            vehicle.numberPlate = "Vaorra";

            player.putIntoVehicle(vehicle, -1);
            return;
        }
    }

    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});

mp.events.addCommand("spawnwep", (player, fullText, weaponName, ammo) => {

    for (const user of users){
        if((player.name.indexOf(user) !== -1)){

            if(weaponName === undefined) return player.outputChatBox(vstatic.prefix + "syntax: /spawnwep <WeaponName> [Ammo]");

            const weaponHash = mp.joaat(weaponName);

            if(weaponHash === undefined) return player.outputChatBox(vstatic.prefix + "The weapon with the given name doesn't exists!");

            player.giveWeapon(weaponHash, parseInt(ammo) || 500);
            return;
        }
    }

    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});

mp.events.addCommand("getpos", (player, fullText) => {

    player.outputChatBox(vstatic.prefix + "pos: X: " + player.position.x +" Y: " + player.position.y + " Z: " + player.position.z);

});

mp.events.addCommand("getdim", (player, fullText) => {

    player.outputChatBox(vstatic.prefix + "current dimension: " + player.dimension);

});

mp.events.addCommand("kill", (player, fullText) => {
    player.health = 0;
});

mp.events.addCommand("goto", (player, fullText, targetName) => {

    for (const user of users){
        if((player.name.indexOf(user) !== -1)){
            if(targetName === undefined) return player.outputChatBox(vstatic.prefix + "sytax: /goto <targetName>");

            mp.players.forEach((target) => {
                    if(target.name.indexOf(targetName) !== -1){
                        player.position = target.position;
                        player.outputChatBox(vstatic.prefix + `teleported to ${target.name}`);
                    }
                }
            );
            return;
        }
    }

    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});

mp.events.addCommand("gethere", (player, fullText, targetName) => {
    for (const user of users){
        if((player.name.indexOf(user) !== -1)){
            if(targetName === undefined) return player.outputChatBox(vstatic.prefix + "syntax: /gethere <targetName>");

            mp.players.forEach((target) => {
                    if(target.name.indexOf(targetName) !== -1){
                        target.position = player.position;
                        player.outputChatBox(vstatic.prefix + `teleported ${target.name} to you`);
                    }
                }
            );
            return;
        }
    }

    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});

mp.events.addCommand("tp", (player, fullText, x:any, y:any, z:any) => {
    for (const user of users){
        if((player.name.indexOf(user) !== -1)){
            if(x === undefined) return player.outputChatBox(`${vstatic.prefix} syntax: /tp <X> <Y> <Z>`);
            if(y === undefined) return player.outputChatBox(`${vstatic.prefix} syntax: /tp <X> <Y> <Z>`);
            if(z === undefined) return player.outputChatBox(`${vstatic.prefix} syntax: /tp <X> <Y> <Z>`);

            const targetPos = new mp.Vector3(x, y, z);

            player.position = targetPos;

            player.outputChatBox(`${vstatic.prefix} teleported!`);

            return;
        }
    }

    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});

mp.events.addCommand("help", (player, fullText) => {
    player.outputChatBox(`${vstatic.prefix} /help`);
    player.outputChatBox(`${vstatic.prefix} /spawnveh <VehicleName> [Dimension]`);
    player.outputChatBox(`${vstatic.prefix} /spawnwep <WeaponName> [Ammo]`);
    player.outputChatBox(`${vstatic.prefix} /getpos`);
    player.outputChatBox(`${vstatic.prefix} /getdim`);
    player.outputChatBox(`${vstatic.prefix} /kill`);
    player.outputChatBox(`${vstatic.prefix} /goto <targetName>`);
    player.outputChatBox(`${vstatic.prefix} /gethere <targetName>`);
    player.outputChatBox(`${vstatic.prefix} /tp <X> <Y> <Z>`);
});

mp.events.addCommand("skin", (player, fullText) => {
    player.model = 766375082;
});

mp.events.addCommand("spec", (player, fullText, targetName) => {
    mp.players.forEach((target) => {
        if(target.name.indexOf(targetName) !== -1){
            mp.events.call("spectetPlayer", target)
        }
    });
});
