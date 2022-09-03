import { useEffect, useState } from "react";
import axios from "axios";
import redBoxCoords from "../public/redBoxCoords.json";
import greenBoxCoords from "../public/greenBoxCoords.json";
import { JSDOM } from "jsdom";

export default function Plot({ dbData, df2profiler }) {
  const [todaysMissions, setTodaysMissions] = useState([]);

  const [routeArr, setRouteArr] = useState([]);
  const [drawRoute, setDrawRoute] = useState(true);
  const [routeLines, setRouteLines] = useState([]);

  const getOffset = (el) => {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.pageXOffset,
      top: rect.top + window.pageYOffset,
      width: rect.width || el.offsetWidth,
      height: rect.height || el.offsetHeight,
    };
  };

  const connectLine = (div1, div2, thickness) => {
    const off1 = getOffset(div1);
    const off2 = getOffset(div2);

    const x1 = off1.left + off1.width / 2;
    const y1 = off1.top + off1.height / 2;

    const x2 = off2.left + off2.width / 2;
    const y2 = off2.top + off2.height / 2;

    const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

    const cx = (x1 + x2) / 2 - length / 2;
    const cy = (y1 + y2) / 2 - thickness / 2;

    const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);
    return {
      left: cx,
      top: cy,
      length,
      angle,
    };
  };
  useEffect(() => {
    const parser = new DOMParser();
    const profilerDoc = parser.parseFromString(df2profiler, "text/html");
    let listOfObj = [];
    [...profilerDoc.querySelectorAll("#missions > span")]
      .filter((e) => {
        return !e.innerHTML.includes("(Outpost Leader)");
      })
      .forEach((o, index) => {
        let obj = {
          "Mission Type": o.querySelector("strong").innerText,
          Details: "-",
          complete: false,
          ID: index + 1,
          guide: "Add Guide",
        };
        //deatils in find item
        if (
          obj["Mission Type"] === "Find Item" &&
          o.getAttribute("data-place") !== "Open World" &&
          !o.innerHTML.includes("Human Remains") &&
          !o.innerHTML.includes("Blood Sample")
        ) {
          obj["Details"] = o.innerText.substring(
            o.innerText.indexOf("item(s):") + 8,
            o.innerText.indexOf("Building:")
          );
        }
        //hr
        if (
          obj["Mission Type"] === "Find Item" &&
          o.innerHTML.includes("Human Remains")
        ) {
          obj["Mission Type"] = "Human Remains";
          obj["Details"] = "Human Remains";
        }
        //find person
        if (obj["Mission Type"] === "Locate / Contact Person") {
          obj["Mission Type"] = "Find Person";
          obj["Details"] = o.innerText.substring(
            o.innerText.indexOf("contact ") + 8,
            o.innerText.indexOf(" in ")
          );
        }
        //bring item
        if (
          obj["Mission Type"] === "Find Item" &&
          o.getAttribute("data-place") === "Open World"
        ) {
          obj["Mission Type"] = "Bring Item";
          obj["Details"] = o.innerText.substring(
            o.innerText.lastIndexOf(":") + 1,
            o.innerText.length
          );
        }
        //details of 3boss
        if (
          obj["Mission Type"] === "Kill Boss" &&
          o.getAttribute("data-place") === "Open World"
        ) {
          obj["Details"] = "Kill 3 Boss Zombie";
        }
        //details of sm
        if (
          obj["Mission Type"] === "Escape Stalker" &&
          o.getAttribute("data-place") === "Open World"
        ) {
          obj["Details"] = "Escape 1 Stalker";
        }
        //details of ext
        if (obj["Mission Type"] === "Exterminate") {
          obj["Details"] = "Clear building of all zombies";
        }
        //bs
        if (
          obj["Mission Type"] === "Find Item" &&
          o.innerHTML.includes("Blood Sample")
        ) {
          obj["Mission Type"] = "Blood Samples";
          obj["Details"] = o.innerText.substring(
            o.innerText.indexOf("item(s):") + 8,
            o.innerText.indexOf("Building:")
          );
        }
        //open world mission
        if (o.getAttribute("data-place").trim() === "Open World") {
          obj["Mission Building"] = o.innerHTML
            .split("(")[1]
            .split(")")[0]
            .split(",")[0]
            .trim();
          obj["Mission City"] = o.innerHTML
            .split("(")[1]
            .split(")")[0]
            .split(",")[1]
            .trim();
        } else {
          obj["Mission Building"] = o.getAttribute("data-place").split(", ")[0];
          obj["Mission City"] = o.getAttribute("data-place").split(", ")[1];
        }

        listOfObj.push(obj);
      });
    // const tempLocs = [];
    //       [...parser.parseFromString(``,"text/html").querySelectorAll("#map > tbody > tr > td")].forEach((td,i)=>{
    //   const tempObj = {
    //     x:td.getAttribute("data-xcoord"),
    //     y:td.getAttribute("data-ycoord"),
    //     city:td.getAttribute("data-district"),
    //     level:td.getAttribute("data-level"),
    //     bldgs:td.getAttribute("data-buildings")===""?[]:td.getAttribute("data-buildings").split(","),
    //   }
    //   tempLocs.push(tempObj)
    // })
    // console.log(JSON.stringify(tempLocs))
    setFilteredArr(listOfObj);
    setTodaysMissions(listOfObj);
  }, []);

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

  //filtered missions arr
  const [filteredArr, setFilteredArr] = useState(todaysMissions);
  //dropdown state
  const [showdropdown1, setShowdropdown1] = useState(false);
  const [showdropdown2, setShowdropdown2] = useState(false);
  //changing the filter
  const filterTheArr = () => {
    const filters = Object.keys(filter).filter((o) => filter[o]);
    const cityfilters = Object.keys(cityFilter).filter((o) => cityFilter[o]);
    setFilteredArr((c) => {
      if (
        (cityfilters.length === 0 || cityfilters.length === 15) &&
        (filters.length === 0 || filters.length === 7)
      ) {
        return todaysMissions.filter((o, i) => {
          const foundPlc = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          );
          if (!foundPlc) return false;
          const missionLvl = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          ).level;
          return missionLvl >= minLvl && missionLvl <= maxLvl;
        });
      } else if (
        (cityfilters.length === 0 || cityfilters.length === 15) &&
        !(filters.length === 0 || filters.length === 7)
      ) {
        return todaysMissions.filter((o, i) => {
          const foundPlc = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          );
          if (!foundPlc) return false;
          const missionLvl = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          ).level;
          return (
            filters.includes(o["Mission Type"]) &&
            missionLvl >= minLvl &&
            missionLvl <= maxLvl
          );
        });
      } else if (
        !(cityfilters.length === 0 || cityfilters.length === 15) &&
        (filters.length === 0 || filters.length === 7)
      ) {
        return todaysMissions.filter((o, i) => {
          const foundPlc = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          );
          if (!foundPlc) return false;
          const missionLvl = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          ).level;
          return (
            cityfilters.includes(o["Mission City"]) &&
            missionLvl >= minLvl &&
            missionLvl <= maxLvl
          );
        });
      } else {
        return todaysMissions.filter((o, i) => {
          const foundPlc = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          );
          if (!foundPlc) return false;
          const missionLvl = dbData.find(
            (e) =>
              e.bldgs.includes(o["Mission Building"]) &&
              e.city === o["Mission City"]
          ).level;
          return (
            filters.includes(o["Mission Type"]) &&
            cityfilters.includes(o["Mission City"]) &&
            missionLvl >= minLvl &&
            missionLvl <= maxLvl
          );
        });
      }
    });
  };
  const handleChangeFilter = (e) => {
    setRouteArr([]);
    setRouteLines([]);
    const changedFilter = filter;
    changedFilter[e.target.getAttribute("data-filter-name")] = e.target.checked;
    setFilter(changedFilter);
    filterTheArr();
  };
  const handleChangeCity = (e) => {
    setRouteArr([]);
    setRouteLines([]);
    const changedFilter = cityFilter;
    changedFilter[e.target.getAttribute("data-filter-name")] = e.target.checked;
    setCityFilter(changedFilter);
    filterTheArr();
  };
  //setting complete missions
  const handleComplete = (e, id) => {
    let temp = [...todaysMissions];
    temp[id - 1].complete = !temp[id - 1].complete;
    setTodaysMissions(temp);
    filterTheArr();
  };
  //drawing route lines
  const handleRouteClick = (e) => {
    if (routeArr[routeArr.length - 1] === e.target.id) return;
    setRouteArr((c) => [...c, e.target.id]);
  };
  useEffect(() => {
    if (routeArr.length < 2) return;
    for (let i = 0; i < routeArr.length - 1; i++) {
      const d1 = document.getElementById(routeArr[i]);
      const d2 = document.getElementById(routeArr[i + 1]);
      setRouteLines([...routeLines, connectLine(d1, d2, 2)]);
    }
  }, [routeArr]);

  useEffect(() => {
    if (minLvl && maxLvl) {
      filterTheArr();
    }
  }, [minLvl, maxLvl]);
  return (
    <div className="min-h-screen py-8 w-full">
      <div className="tableDiv ml-8 mt-2 mr-2 flex flex-wrap justify-center lg:flex-nowrap lg:items-start">
        <table className='mx-2 mr-4 mb-4 w-[350px] sm:w-[500px] md:w-[750px] aspect-[5/3] bg-[url("https://df2profiler.com/gamemap/map_background.png")] bg-no-repeat bg-cover table-fixed'>
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
                        onClick={handleRouteClick}
                        className={`border border-gray-700 hover:shadow-[inset_0_0_0_3px_#4b5563] relative group ${
                          x % 6 === 0 && x !== 30 ? "border-r-gray-400" : ""
                        } ${
                          y % 6 === 0 && y !== 18
                            ? "border-b-gray-400"
                            : "selection:"
                        }`}
                        style={
                          filteredArr.find(
                            (o) =>
                              cellData.bldgs.includes(
                                o["Mission Building"].trim()
                              ) && o["Mission City"].trim() === cellData.city
                          ) &&
                          filteredArr.find(
                            (o) =>
                              cellData.bldgs.includes(
                                o["Mission Building"].trim()
                              ) &&
                              o["Mission City"].trim() === cellData.city &&
                              o.complete === false
                          )
                            ? { backgroundColor: "#05966960" }
                            : {
                                backgroundColor: isRed
                                  ? "#dc262670"
                                  : isGreen
                                  ? "#ffff0040"
                                  : "transparent",
                              }
                        }
                      >
                        {/* adding col nums */}
                        {x === 1 ? (
                          <p className="absolute text-zinc-300 text-center -translate-x-full top-0 left-0 border border-gray-300 border-r-0 bg-zinc-700 w-full h-full box-content pointer-events-none sm:text-[10px] md:text-[16px] text-[5px]">
                            {i + 1}
                          </p>
                        ) : (
                          ""
                        )}
                        {/* adding row nums */}
                        {y === 1 ? (
                          <p className="absolute text-zinc-300 text-center -translate-y-full top-0 left-0 border border-gray-300 border-b-0 bg-zinc-700 w-full box-content pointer-events-none sm:text-[10px] md:text-[16px] text-[5px]">
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
                                          ? "text-red-600"
                                          : filteredArr.find(
                                              (o) =>
                                                o["Mission Building"].trim() ===
                                                  bldg &&
                                                o["Mission City"].trim() ===
                                                  cellData.city
                                            ) &&
                                            filteredArr.find(
                                              (o) =>
                                                o["Mission Building"].trim() ===
                                                  bldg &&
                                                o["Mission City"].trim() ===
                                                  cellData.city
                                            ).complete === false
                                          ? "text-emerald-600"
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
        <div className="lg:-mt-5 flex justify-center flex-wrap lg:block flex-1">
          <div className="mb-4 flex flex-wrap justify-center">
            <button
              className="text-white focus:ring-4 focus:outline-nonefont-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center bg-green-600 hover:bg-green-700 focus:ring-green-800 mr-4"
              type="button"
              onClick={() => {
                setRouteArr([]);
              }}
            >
              Break Route
            </button>
            <button
              className="text-white focus:ring-4 focus:outline-nonefont-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center bg-red-600 hover:bg-red-700 focus:ring-red-800 mr-4"
              type="button"
              onClick={() => {
                setRouteArr([]);
                setRouteLines([]);
              }}
            >
              Clear Route Lines
            </button>
            <button
              className="text-white focus:ring-4 focus:outline-nonefont-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center bg-violet-600 hover:bg-violet-700 focus:ring-violet-800 mr-4"
              type="button"
              onClick={() => {
                setRouteArr(routeArr.slice(0,routeArr.length-1));
                setRouteLines(routeLines.slice(0, routeLines.length-2));
              }}
            >
              Undo Route
            </button>
            <div className="mt-4">
              <label htmlFor="minlvl" className="text-white">Min LvL</label>
              <input
                type="number"
                id="minlvl"
                className="border text-sm rounded-lg p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 mr-4 w-10"
                min={0}
                max={50}
                value={minLvl}
                onClick={(e)=>e.target.select()}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (e.target.value.length===0 || val < 0 || val > 50) return;
                  setMinLvl(parseInt(val));
                }}
              />
                <label htmlFor="maxlvl" className="text-white">Max LvL</label>
              <input
                type="number"
                id="maxlvl"
                className="border text-sm rounded-lg p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 mr-4 w-10"
                min={0}
                max={50}
                value={maxLvl}
                onClick={(e)=>e.target.select()}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (e.target.value.length===0 || val < 0 || val > 50) return;
                  setMaxLvl(parseInt(val));
                }}
              />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-white bg-zinc-700 border-b-2 border-zinc-500">
                <th className="rounded-tl-xl">Done</th>
                <th className="relative mb-4 text-start">
                  <button
                    id="dropdownButton"
                    data-dropdown-toggle="dropdownDefaultCheckbox"
                    className="text-white text-sm px-4 py-2 selection:text-center inline-flex items-center bg-zinc-700 hover:bg-zinc-800"
                    type="button"
                    onClick={() => setShowdropdown1(!showdropdown1)}
                  >
                    Type
                  </button>

                  {showdropdown1 && (
                    <div
                      id="dropdownMenu"
                      className="z-10 w-44 rounded divide-y shadow bg-gray-700 divide-gray-600 block"
                      data-popper-reference-hidden=""
                      data-popper-escaped=""
                      data-popper-placement="bottom"
                      style={{
                        position: "absolute",
                        inset: "0px auto auto 0px",
                        margin: "10px 0px",
                        top: "100%",
                      }}
                    >
                      <ul
                        className="p-3 space-y-3 text-sm text-gray-200"
                        aria-labelledby="dropdownCheckboxButton"
                      >
                        {Object.keys(filter).map((missionType, i) => {
                          return (
                            <li key={missionType}>
                              <div className="flex items-center p-2 rounded hover:bg-gray-600">
                                <input
                                  data-filter-name={missionType}
                                  checked={filter[missionType]}
                                  type="checkbox"
                                  onChange={handleChangeFilter}
                                  className="w-4 h-4 text-blue-600 rounded  focus:ring-blue-600 ring-offset-gray-700 focus:ring-2 bg-gray-600 border-gray-500 outline-none cursor-pointer"
                                />
                                <label
                                  htmlFor={missionType}
                                  className="ml-2 w-full text-sm font-medium text-gray-200"
                                >
                                  {missionType}
                                </label>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </th>
                <th>Building</th>
                <th className="relative mb-4">
                  <button
                    id="dropdownButton2"
                    data-dropdown-toggle="dropdownDefaultCheckbox"
                    className="text-white text-sm px-4 py-2 selection:text-center inline-flex items-center bg-zinc-700 hover:bg-zinc-800"
                    type="button"
                    onClick={() => setShowdropdown2(!showdropdown2)}
                  >
                    City
                  </button>

                  {showdropdown2 && (
                    <div
                      id="dropdownMenu"
                      className="z-50 h-96 overflow-y-auto w-52 rounded divide-y shadow bg-gray-700 divide-gray-600 block"
                      data-popper-reference-hidden=""
                      data-popper-escaped=""
                      data-popper-placement="bottom"
                      style={{
                        position: "absolute",
                        inset: "0px auto auto 0px",
                        margin: "10px 0px",
                        top: "100%",
                      }}
                    >
                      <ul
                        className="p-3 space-y-3 text-sm text-gray-200"
                        aria-labelledby="dropdownCheckboxButton"
                      >
                        {Object.keys(cityFilter).map((cityType, i) => {
                          return (
                            <li key={cityType}>
                              <div className="flex items-center p-2 rounded hover:bg-gray-600">
                                <input
                                  data-filter-name={cityType}
                                  checked={filter[cityType]}
                                  type="checkbox"
                                  onChange={handleChangeCity}
                                  className="w-4 h-4 text-blue-600 rounded  focus:ring-blue-600 ring-offset-gray-700 focus:ring-2 bg-gray-600 border-gray-500 outline-none cursor-pointer"
                                />
                                <label
                                  htmlFor={cityType}
                                  className="ml-2 w-full text-sm font-medium text-gray-200"
                                >
                                  {cityType}
                                </label>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </th>
                <th>(Col,Row)</th>
                <th>Details</th>
                <th className="rounded-tr-xl">Guide</th>
              </tr>
            </thead>
            <tbody>
              {filteredArr.map((o, i) => {
                const foundDoc = dbData.find(
                  (c) =>
                    c.bldgs.includes(o["Mission Building"].trim()) &&
                    c.city === o["Mission City"].trim()
                );
                return (
                  <tr
                    key={"mission" + o.ID}
                    className={`text-[10px] xl:text-xs 2xl:text-sm border-b border-zinc-700 ${
                      o.complete
                        ? "text-zinc-500 bg-zinc-700"
                        : "text-zinc-300 bg-zinc-800"
                    }`}
                  >
                    <td className="text-center px-2">
                      <input
                        onChange={(e) => {
                          handleComplete(e, o.ID);
                        }}
                        checked={todaysMissions[o.ID - 1].complete}
                        type="checkbox"
                        value={o.ID}
                        className="w-3 xl:w-4 h-3 xl:h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-2">{o["Mission Type"]}</td>
                    <td className="px-2">{o["Mission Building"]}</td>
                    <td className="px-2">{o["Mission City"]}</td>
                    <td className="px-2">
                      ({foundDoc ? foundDoc.x : "-"},{" "}
                      {foundDoc ? foundDoc.y : "-"})
                    </td>
                    <td className="px-2">{o.Details}</td>
                    <td className="p-[3px_4px_0px_0px]">
                      <textarea
                        cols="10"
                        rows="2"
                        placeholder="Add Guide"
                        className="outline-none border-none bg-zinc-700 text-[10px] leading-[10px] xl:text-xs xl:leading-3 font-semibold text-zinc-200 p-0 xl:p-1 m-0 rounded "
                      ></textarea>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        {routeLines.map((e, i) => {
          return (
            <div
              key={e}
              style={{
                padding: "0px",
                margin: "0px",
                height: "1px",
                backgroundColor: "white",
                lineHeight: "1px",
                position: "absolute",
                left: e.left,
                top: e.top,
                width: e.length + "px",
                transform: `rotate(${e.angle}deg)`,
                WebkitTransform: `rotate(${e.angle}deg)`,
                msTransform: `rotate(${e.angle}deg)`,
                MozTransformStyle: `rotate(${e.angle}deg)`,
                opacity: "70%",
              }}
              className="routeLine pointer-events-none"
            ></div>
          );
        })}
      </div>
      <p className="text-white text-center font-bold mt-6">
        Big thanks to DF2Profiler for all the mission data!
        <br />
        You can use an extension called GoFullPage to take screenshots of the
        entire page if you want to share your guide with others!!
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
