import { useEffect, useState } from "react";
import axios from "axios";
import redBoxCoords from "../public/redBoxCoords.json";
import greenBoxCoords from "../public/greenBoxCoords.json";
import { JSDOM } from "jsdom";

export default function Plot({ dbData, df2profiler }) {
  //mission filter
  const [filter, setFilter] = useState({
    "Find Person": false,
    "Find Item": false,
    "Bring Item": false,
    Exterminate: false,
    "Blood Samples": false,
    "Escape Stalker": false,
    "Kill Boss": false,
    "Human Remains": false,
  });
  const [cityFilter, setCityFilter] = useState({
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
  });
  const [minLvl, setMinLvl] = useState(0);
  const [maxLvl, setMaxLvl] = useState(50);
  const shopTypes = [
    "Ale",
    "Arms",
    "Bar",
    "Bowl",
    "Burger",
    "Cafe",
    "Catch",
    "House",
    "Deli",
    "Diner",
    "Dish",
    "Donuts",
    "Eatery",
    "Emporium",
    "Fork",
    "Head",
    "Hole",
    "Goblet",
    "Grill",
    "Kitchen",
    "Lantern",
    "Market",
    "Mead",
    "Outlet",
    "Pitcher",
    "Plate",
    "Pub",
    "Seat",
    "Shop",
    "Store",
    "Table",
    "Tankard",
    "Tavern",
  ];
  const bigTypes = [
    "Accountancy",
    "Advocacy",
    "Associates",
    "Attorneys",
    "Consultants",
    "Consultancy",
    "Law",
    "Partners",
    "Corp",
    "GmbH",
    "Inc",
    "LLC",
    "Ltd",
    "Plc",
  ];
  const hospTypes = ["Center", "Hospital", "Unit"];
  let shops = [];
  let policeDepts = [];
  let hospitals = [];
  let bigBldgs = [];
  dbData.forEach((o, i) => {
    o.bldgs.forEach((p) => {
      if (shopTypes.find((v) => p.endsWith(v))) {
        shops.push(o);
      } else if (p.endsWith("Police Department")) {
        policeDepts.push(o);
      } else if (hospTypes.find((v) => p.endsWith(v))) {
        hospitals.push(o);
      } else if (bigTypes.find((v) => p.endsWith(v))) {
        if (p !== "Comer and Son Inc") {
          bigBldgs.push(o);
        }
      }
    });
  });
  shops = shops.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.x === value.x && t.y === value.y)
  );
  policeDepts = policeDepts.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.x === value.x && t.y === value.y)
  );
  bigBldgs = bigBldgs.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.x === value.x && t.y === value.y)
  );
  hospitals = hospitals.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.x === value.x && t.y === value.y)
  );
  //shopTypes.find(v=>o.bldgs[j].endsWith(v))
  return (
    <div className="min-h-screen p-9 w-full">
      <table className='w-[960px] aspect-[5/3] bg-[url("https://df2profiler.com/gamemap/map_background.png")] bg-no-repeat bg-cover table-fixed'>
        <tbody>
          {/* generating rows */}
          {[...Array(18).keys()].map((o, i) => {
            return (
              <tr key={"row" + i}>
                {/* generating cols */}
                {[...Array(30).keys()].map((cell, index) => {
                  const x = index + 1;
                  const y = i + 1;
                  const isRed = redBoxCoords.find(
                    (o) => o.x === x && o.y === y
                  );
                  const isGreen = greenBoxCoords.find(
                    (o) => o.x === x && o.y === y
                  );
                  const cellData = dbData.find((o) => o.x === x && o.y === y);
                  return (
                    <td
                      key={"tile" + index}
                      id={"tile" + x + "/" + y}
                      className={`hover:shadow-[inset_0_0_0_3px_#4b5563] relative group `}
                      style={{
                        backgroundColor: isRed
                          ? "#dc262670"
                          : isGreen
                          ? "#ffff0040"
                          : "transparent",
                        boxShadow: `${
                          shops.find((o) => o.x === x && o.y === y)
                            ? "inset 0 0 0 4px #0284c7,inset 0 0 0 5px #000"
                            : ""
                        }${
                          hospitals.find((o) => o.x === x && o.y === y)
                            ? `${
                                shops.find((o) => o.x === x && o.y === y)
                                  ? ","
                                  : ""
                              }` +
                              "inset 0 0 0 7px #65a30d,inset 0 0 0 8px #000"
                            : ""
                        }${
                          policeDepts.find((o) => o.x === x && o.y === y)
                            ? `${
                                shops.find((o) => o.x === x && o.y === y) ||
                                hospitals.find((o) => o.x === x && o.y === y)
                                  ? ","
                                  : ""
                              }` +
                              "inset 0 0 0 10px #dc2626,inset 0 0 0 11px #000"
                            : ""
                        }
                            ${
                              bigBldgs.find((o) => o.x === x && o.y === y)
                                ? `${
                                    shops.find((o) => o.x === x && o.y === y) ||
                                    hospitals.find(
                                      (o) => o.x === x && o.y === y
                                    ) ||
                                    policeDepts.find(
                                      (o) => o.x === x && o.y === y
                                    )
                                      ? ","
                                      : ""
                                  }` + "inset 0 0 0 13px #f59e0b"
                                : ""
                            }
                          `,
                      }}
                    >
                      {/* adding col nums */}
                      {x === 1 ? (
                        <p className="absolute text-zinc-300 text-center -translate-x-full top-0 left-0 border border-gray-300 border-r-0 bg-zinc-700 w-full h-full box-content pointer-events-none text-[16px]">
                          {i + 1}
                        </p>
                      ) : (
                        ""
                      )}
                      {/* adding row nums */}
                      {y === 1 ? (
                        <p className="absolute text-zinc-300 text-center -translate-y-full top-0 left-0 border border-gray-300 border-b-0 bg-zinc-700 w-full box-content pointer-events-none text-[16px]">
                          {index + 1}
                        </p>
                      ) : (
                        ""
                      )}

                      {/* making popup */}
                      <div
                        className={`popup${
                          x + "/" + y
                        } tooltip-text bg-black/60 backdrop-blur-sm text-zinc-300 pointer-events-none rounded hidden group-hover:block absolute left-10 top-0 text-center py-2 px-4 z-50 whitespace-nowrap font-staatliches`}
                      >
                        {isRed && (
                          <p className="text-sm text-red-600">PvP Zone</p>
                        )}
                        {<p className="text-md cityName">{cellData.city}</p>}
                        {
                          <p
                            className="text-xs"
                            style={{
                              color: [
                                "hsl(",
                                ((1 - cellData.level * 0.02) * 120).toString(
                                  10
                                ),
                                ",100%,50%)",
                              ].join(""),
                            }}
                          >
                            Level&nbsp;&nbsp;{cellData.level}
                          </p>
                        }
                        {
                          <p
                            className="bldgNames leading-3"
                            data-tooltip-text-id={`${x + "/" + y}`}
                          >
                            {cellData.bldgs.length !== 0 &&
                              cellData.bldgs.map((bldg) => {
                                return (
                                  <span
                                    key={bldg}
                                    className={`bldgName text-xs ${
                                      bldg === "Comer and Son Inc"
                                        ? "text-purple-500"
                                        : shopTypes.find((o) =>
                                            bldg.endsWith(o)
                                          )
                                        ? "text-sky-600"
                                        : hospTypes.find((o) =>
                                            bldg.endsWith(o)
                                          )
                                        ? "text-lime-600"
                                        : bldg.endsWith("Police Department")
                                        ? "text-red-600"
                                        : bigTypes.find((o) => bldg.endsWith(o))
                                        ? "text-amber-500"
                                        : "text-zinc-400"
                                    }`}
                                  >
                                    {bldg}
                                    <br />
                                  </span>
                                );
                              })}
                          </p>
                        }
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-white text-center font-bold mt-6">
        Big thanks to DF2Profiler for all the mission data!
      </p>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const df2profiler = await axios({
      method: "GET",
      url: "https://df2profiler.com/gamemap/",
    });
    const { document } = new JSDOM(df2profiler.data).window;
    return {
      props: {
        df2profiler: df2profiler.data,
        dbData: [...document.querySelector("#map").querySelectorAll("td")].map(
          (o, i) => {
            return {
              x: parseInt(o.getAttribute("data-xcoord")),
              y: parseInt(o.getAttribute("data-ycoord")),
              bldgs:
                o.getAttribute("data-buildings") === ""
                  ? []
                  : o.getAttribute("data-buildings").split(","),
              level: parseInt(o.getAttribute("data-level")),
              city:
                o.getAttribute("data-district") === "RavenwallHeights"
                  ? "Ravenwall Heights"
                  : o.getAttribute("data-district") === "AlbandalePark"
                  ? "Albandale Park"
                  : o.getAttribute("data-district") === "RichbowHunt"
                  ? "Richbow Hunt"
                  : o.getAttribute("data-district") === "WestMoledale"
                  ? "West Moledale"
                  : o.getAttribute("data-district") === "SouthMoorhurst"
                  ? "South Moorhurst"
                  : o.getAttribute("data-district"),
            };
          }
        ),
      },
    };
  } catch (err) {
    console.log(err);
  }
}
