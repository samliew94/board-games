import settingService from "./setting-service";

// initialize empty map
const map: WorldMap = {};

interface WorldMap {
  [room: string]: {
    shipPos: number;
  };
}

/** will only init once per room, so don't worry on successive calls */
function initOrFindWorldMap(room: string) {
  if (map[room]) return map[room]; // ensures we only init once

  const settings = settingService.findSettingsByRoom(room);

  if (!settings) {
    console.error(
      `failed to init world-map-service. settingsService couldn't find room ${room}`
    );
    return;
  }

  map[room] = {
    shipPos: 16,
  };

  return map[room]
}

function findWorldMapByRoom(room: string) {
  return map[room];
}

export default { initOrFindWorldMap, findWorldMapByRoom };
