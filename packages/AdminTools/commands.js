"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vstatic = __importStar(require("./static"));
var users_json_1 = __importDefault(require("./users.json"));
mp.events.addCommand("spawnveh", function (player, vehicleName, dimension) {
    for (var _i = 0, users_1 = users_json_1.default; _i < users_1.length; _i++) {
        var user = users_1[_i];
        if ((player.name.indexOf(user) !== -1)) {
            if (vehicleName === undefined)
                return player.outputChatBox(vstatic.prefix + "Syntax: /spawnveh <VehicleName> [Dimension]");
            var vehicleHash = mp.joaat(vehicleName);
            if (vehicleHash === undefined)
                return player.outputChatBox(vstatic.prefix + "The vehicle with the given name doesn't exists!");
            var vehicle = mp.vehicles.new(vehicleHash, player.position, {
                dimension: parseInt(dimension) || 0
            });
            vehicle.numberPlate = "Vaorra";
            player.putIntoVehicle(vehicle, -1);
            return;
        }
    }
    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});
mp.events.addCommand("spawnwep", function (player, weaponName, ammo) {
    for (var _i = 0, users_2 = users_json_1.default; _i < users_2.length; _i++) {
        var user = users_2[_i];
        if ((player.name.indexOf(user) !== -1)) {
            if (weaponName === undefined)
                return player.outputChatBox(vstatic.prefix + "syntax: /spawnwep <WeaponName> [Ammo]");
            var weaponHash = mp.joaat(weaponName);
            if (weaponHash === undefined)
                return player.outputChatBox(vstatic.prefix + "The weapon with the given name doesn't exists!");
            player.giveWeapon(weaponHash, parseInt(ammo) || 500);
            return;
        }
    }
    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});
mp.events.addCommand("getpos", function (player) {
    player.outputChatBox(vstatic.prefix + "pos: X: " + player.position.x + " Y: " + player.position.y + " Z: " + player.position.z);
});
mp.events.addCommand("getdim", function (player) {
    player.outputChatBox(vstatic.prefix + "current dimension: " + player.dimension);
});
mp.events.addCommand("kill", function (player) {
    player.health = 0;
});
mp.events.addCommand("goto", function (player, targetName) {
    for (var _i = 0, users_3 = users_json_1.default; _i < users_3.length; _i++) {
        var user = users_3[_i];
        if ((player.name.indexOf(user) !== -1)) {
            if (targetName === undefined)
                return player.outputChatBox(vstatic.prefix + "sytax: /goto <targetName>");
            mp.players.forEach(function (target) {
                if (target.name.indexOf(targetName) !== -1) {
                    player.position = target.position;
                    player.outputChatBox(vstatic.prefix + ("teleported to " + target.name));
                }
            });
            return;
        }
    }
    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});
mp.events.addCommand("gethere", function (player, targetName) {
    for (var _i = 0, users_4 = users_json_1.default; _i < users_4.length; _i++) {
        var user = users_4[_i];
        if ((player.name.indexOf(user) !== -1)) {
            if (targetName === undefined)
                return player.outputChatBox(vstatic.prefix + "syntax: /gethere <targetName>");
            mp.players.forEach(function (target) {
                if (target.name.indexOf(targetName) !== -1) {
                    target.position = player.position;
                    player.outputChatBox(vstatic.prefix + ("teleported " + target.name + " to you"));
                }
            });
            return;
        }
    }
    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});
mp.events.addCommand("tp", function (player, x, y, z) {
    for (var _i = 0, users_5 = users_json_1.default; _i < users_5.length; _i++) {
        var user = users_5[_i];
        if ((player.name.indexOf(user) !== -1)) {
            if (x === undefined)
                return player.outputChatBox(vstatic.prefix + " syntax: /tp <X> <Y> <Z>");
            if (y === undefined)
                return player.outputChatBox(vstatic.prefix + " syntax: /tp <X> <Y> <Z>");
            if (z === undefined)
                return player.outputChatBox(vstatic.prefix + " syntax: /tp <X> <Y> <Z>");
            var targetPos = new mp.Vector3(x, y, z);
            player.position = targetPos;
            player.outputChatBox(vstatic.prefix + " teleported!");
            return;
        }
    }
    return player.outputChatBox(vstatic.prefix + "You don't have permissions!");
});
mp.events.addCommand("help", function (player) {
    player.outputChatBox(vstatic.prefix + " /help");
    player.outputChatBox(vstatic.prefix + " /spawnveh <VehicleName> [Dimension]");
    player.outputChatBox(vstatic.prefix + " /spawnwep <WeaponName> [Ammo]");
    player.outputChatBox(vstatic.prefix + " /getpos");
    player.outputChatBox(vstatic.prefix + " /getdim");
    player.outputChatBox(vstatic.prefix + " /kill");
    player.outputChatBox(vstatic.prefix + " /goto <targetName>");
    player.outputChatBox(vstatic.prefix + " /gethere <targetName>");
    player.outputChatBox(vstatic.prefix + " /tp <X> <Y> <Z>");
});
mp.events.addCommand("skin", function (player) {
    player.model = 766375082;
});
