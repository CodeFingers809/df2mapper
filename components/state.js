import { proxy } from "valtio";

const state = proxy({
  todaysMissions: [],
  routeArr: [],
  routeLines: [],
  filteredArr: [],
  filter: {
    "Find Person": false,
    "Find Item": false,
    "Bring Item": false,
    Exterminate: false,
    "Blood Samples": false,
    "Escape Stalker": false,
    "Kill Boss": false,
    "Human Remains": false,
  },
  cityFilter: {
    "Ravenwall Heights": false,
    Dallbow: false,
    "West Moledale": false,
    "Albandale Park": false,
    Coopertown: false,
    Dawnhill: false,
    Overwood: false,
    "Richbow Hunt": false,
    Haverbrook: false,
    Greywood: false,
    Duntsville: false,
    "South Moorhurst": false,
    Lerwillbury: false,
    Archbrook: false,
    Wolfstable: false,
  },
  sortBy:"none",
  minLvl:0,
  maxLvl:50,
  showdropdown1:false,
  showdropdown2:false,
  showGridLines:true,
});

export default state;
