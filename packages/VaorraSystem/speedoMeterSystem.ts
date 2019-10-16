function playerEnteredVehicleHandler(player:any, vehicle:any) {
    const playerName = player.name;
    const vehicleID = vehicle.id;
 
    mp.players.broadcast(`${playerName} got into the car with ID: ${vehicleID}`);
 }
 
 mp.events.add("playerEnteredVehicle", playerEnteredVehicleHandler);






 function playerExitVehicleHandler(player:any, vehicle:any) {
    console.log(`${player.name} when out from vehicle with ID: ${vehicle.id}`);
}

mp.events.add("playerExitVehicle", playerExitVehicleHandler);