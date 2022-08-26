/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";
import redBoxCoords from "../public/redBoxCoords.json";
import greenBoxCoords from "../public/greenBoxCoords.json";
import absoluteUrl from "next-absolute-url";

export default function Plot({ dbData,df2haven,df2profiler, origin }) {
  //loaded state
  const [loaded, setLoaded] = useState(false);
  const [todaysMissions,setTodaysMissions] =useState([])
  const [locations,setLocations] = useState([])
  
  function parseHaven() {
    const parser = new DOMParser();
    const havenDoc = parser.parseFromString(df2haven, "text/html");
    const profilerDoc = parser.parseFromString(df2profiler, "text/html");
    const listOfTexts = [...havenDoc.querySelectorAll("tbody > tr > td")].map(
      (td) => {
        return td.innerText;
      }
    );
    let listOfObj = [];
    let tempLocs = []
    for (let i = 0; i < listOfTexts.length / 15 - 1; i++) {
      const misObj = {
        "Mission Building": listOfTexts[i * 15 + 2],
        "Mission City": listOfTexts[i * 15 + 3],
        "Mission Type": listOfTexts[i * 15 + 4],
        Details: listOfTexts[i * 15 + 5],
      };
      listOfObj.push(misObj);
    }
    console.log(df2profiler);
    [...profilerDoc.querySelectorAll("#missions > span")].filter((e)=>{return !e.innerHTML.includes("(Outpost Leader)")})
      .forEach((o) => {
          let obj = {
            "Mission Type": o.querySelector("strong").innerText,
            Details:"-"
          };
          if(obj["Mission Type"]==="Find Item" && o.innerHTML.includes("Human Remains")){
            obj["Mission Type"]="Human Remains"
          }
          if(o.getAttribute("data-place").trim()==="Open World"){
            obj["Mission Building"]=o.innerHTML
            .split("(")[1]
            .split(")")[0]
            .split(",")[0].trim()
            obj["Mission City"]=o.innerHTML.split("(")[1]
            .split(")")[0]
            .split(",")[1].trim()
          }else{
            obj["Mission Building"]=o.getAttribute("data-place").split(", ")[0]
            obj["Mission City"]=o.getAttribute("data-place").split(", ")[1]
          }
          listOfObj.push(obj);
        
      });
      
  //   [...parser.parseFromString(``,"text/html").querySelectorAll("#map > tbody > tr > td")].forEach((td,i)=>{
  //     const tempObj = {
  //       x:td.getAttribute("data-xcoord"),
  //       y:td.getAttribute("data-ycoord"),
  //       city:td.getAttribute("data-district"),
  //       level:td.getAttribute("data-level"),
  //       bldgs:td.getAttribute("data-buildings")===""?[]:td.getAttribute("data-buildings").split(","),
  //     }
  //     tempLocs.push(tempObj)
  //   })
  //   console.log(JSON.stringify(tempLocs))
    setFilteredArr(listOfObj)
    setTodaysMissions(listOfObj)
  }
  useEffect(parseHaven, []);

  //mission filter
  const [filter, setFilter] = useState({
    "Find Person": false,
    "Find Item": false,
    "Bring Item": false,
    Exterminate: false,
    "Blood Samples": false,
    "Escape Stalker": false,
    "Kill Boss": false,
    "Human Remains":false,
  });

  //filtered missions arr
  const [filteredArr, setFilteredArr] = useState(
    todaysMissions
  );

  //mount the table cells on load
  useEffect(() => {
    if (!loaded) {
      const rows = 18;
      const cols = 30;
      const mapTable = document.createElement("table");
      mapTable.classList.add("mapTable", "w-full", "h-full");
      //generating rows
      for (let i = 0; i < rows; i++) {
        const tableRow = document.createElement("tr");
        tableRow.classList.add("row" + (i + 1), "mapRow");
        //generating cols
        for (let j = 0; j < cols; j++) {
          const tableCol = document.createElement("td");
          tableCol.classList.add(
            "cell" + (j + 1) + "/" + (i + 1),
            "cell",
            "border",
            "border-gray-700",
            "box-border",
            "p-0",
            "group",
            "relative"
          );
          tableCol.setAttribute("data-cell-id", j + 1 + "/" + (i + 1));

          //event listeners for cols
          tableCol.addEventListener("mouseenter", handleCellHover);
          tableCol.addEventListener("mouseleave", removeCellHover);

          //change borders to make the bigger grid lines
          if ((j + 1) % 6 === 0 && j + 1 !== 30) {
            tableCol.classList.add("border-r-gray-100");
          }
          if ((i + 1) % 6 === 0 && i + 1 !== 18) {
            tableCol.classList.add("border-b-gray-100");
          }

          //gen green boxes
          const currentCoords = { x: j + 1, y: i + 1 };
          const isGreenFound = greenBoxCoords.find(
            (o) => o.x === currentCoords.x && o.y === currentCoords.y
          );
          if (isGreenFound) {
            tableCol.classList.add("bg-[rgba(255,255,0,25%)]");
          }
          //gen red boxes
          const isRedFound = redBoxCoords.find(
            (o) => o.x === currentCoords.x && o.y === currentCoords.y
          );
          if (isRedFound) {
            tableCol.classList.add("bg-red-600/50");
          }
          //making popup
          const cellData = dbData.find((o) => o.x === j + 1 && o.y === i + 1);
          var hue = ((1 - cellData.level * 0.02) * 120).toString(10);
          tableCol.innerHTML += `<div class="popup${
            j + 1 + "/" + (i + 1)
          } tooltip-text bg-black/60 backdrop-blur-sm text-zinc-300 pointer-events-none rounded hidden group-hover:block absolute left-10 top-0 text-center py-2 px-4 z-50 whitespace-nowrap font-staatliches">
          ${isRedFound ? '<p class="text-sm text-red-600">PvP Zone</p>' : ""}
          <p class="text-md cityName">${
            cellData.city
          }</p><p class="text-xs" style="color:${[
            "hsl(",
            hue,
            ",100%,50%)",
          ].join("")}">Level&nbsp;&nbsp;${
            cellData.level
          }</p><p class="bldgNames leading-3" data-tooltip-text-id="${
            j + 1 + "/" + (i + 1)
          }"></p></div>`;
          if (cellData.bldgs.length !== 0) {
            cellData.bldgs.forEach((bldg) => {
              tableCol.querySelector(
                ".bldgNames"
              ).innerHTML += `<span class="bldgName text-xs text-zinc-400">${bldg}</span><br />`;
            });
          }
          tableRow.appendChild(tableCol);
        }

        mapTable.appendChild(tableRow);
      }
      if (document.querySelector(".mapDiv").innerHTML !== "")
        document.querySelector(".mapDiv").innerHTML = "";
      document.querySelector(".mapDiv").appendChild(mapTable);

      setLoaded(!loaded);
    }
  }, [loaded]);

  const handleCellHover = (ele) => {
    ele.target.style = "box-shadow:inset 0 0 0 3px rgb(107 114 128)";
  };
  const removeCellHover = (ele) => {
    ele.target.style = "box-shadow:none";
  };
  //dropdown state
  const [showdropdown, setShowdropdown] = useState(false);
  //options
  const missionTypes = [
    "Find Person",
    "Find Item",
    "Bring Item",
    "Exterminate",
    "Blood Samples",
    "Escape Stalker",
    "Kill Boss",
    "Human Remains",
  ];

  useEffect(() => {
    const allBldgNames = Array.from(
      document.getElementsByClassName("text-green-500")
    );
    for (let i = 0; i < allBldgNames.length; i++) {
      const oneBldgName = allBldgNames[i];
      oneBldgName.classList.remove("text-green-500");
    }
    const greenCells = Array.from(
      document.getElementsByClassName("bg-emerald-500/30")
    );
    for (let i = 0; i < greenCells.length; i++) {
      const cell = greenCells[i];
      cell.classList.remove("bg-emerald-500/30");
    }
    
    filteredArr.forEach((mission, i) => {
      const foundDoc = dbData.find((o) =>
        o.bldgs.includes(mission["Mission Building"].trim()) && o.city===(mission["Mission City"].trim())
      );
      if (foundDoc !== undefined) {
        // document.querySelector(`td[data-cell-id="12/1"]`).classList.add("bg-emerald-500/30")
        document
          .querySelector(`td[data-cell-id="${foundDoc.x}/${foundDoc.y}"]`)
          .classList.add("bg-emerald-500/30");
        //bldgName to green
        const bldgNames = Array.from(
          document
            .querySelector(`td[data-cell-id="${foundDoc.x}/${foundDoc.y}"]`)
            .getElementsByClassName("bldgName")
        );
        bldgNames.forEach((name) => {
          if (name.innerText === mission["Mission Building"]) {
            // console.log("sd")
            name.classList.add("text-green-500");
          }
        });
      }
    });
  }, [filteredArr]);
  const handleChangeFilter = (e) => {
    const changedFilter = filter;
    changedFilter[e.target.getAttribute("data-filter-name")] = e.target.checked;
    setFilter(changedFilter);
    const filters = Object.keys(filter).filter((o) => filter[o]);
    setFilteredArr((c) => {
      if (filters.length === 0 || filters.length === 7) {
        return todaysMissions.filter((o, i) => o["Mission Type"] !== 0);
      }
      return todaysMissions.filter(
        (o, i) => filters.includes(o["Mission Type"]) && o["Mission Type"] !== 0
      );
    });
  };

  return (
    <div className="min-h-screen min-w-screen mx-auto p-6 flex flex-nowrap items-start">
      <div className="relative ml-4 mt-4">
        <div className="rowNums absolute w-5 h-full left-0 top-0 bg-gray-800 -translate-x-full text-end flex flex-col justify-between text-[12px]">
          {[...Array(18).keys()].map((num) => {
            return (
              <p
                key={num + 1}
                className="h-8 text-gray-400 flex items-center justify-center border border-gray-400 border-r-0"
              >
                {num + 1}
              </p>
            );
          })}
        </div>
        <div
          className="colNums absolute h-5 left-0 top-0 bg-gray-800 -translate-y-full flex flex-row justify-evenly text-[12px]"
          style={{ width: "calc(100% - 16px)" }}
        >
          {[...Array(30).keys()].map((num) => {
            return (
              <p
                key={num + 1}
                className="w-8 text-gray-400 text-center border border-gray-400 border-b-0"
              >
                {num + 1}
              </p>
            );
          })}
        </div>
        <div className='mapDiv relative sm:w-[480px] md:w-[738px] bg-[url("https://df2profiler.com/gamemap/map_background.png")] aspect-[5/3] bg-no-repeat bg-cover bg-center mr-4'></div>
      </div>
      <div className="w-full">
        <div className="relative">
          <button
            id="dropdownButton"
            data-dropdown-toggle="dropdownDefaultCheckbox"
            className="text-white focus:ring-4 focus:outline-nonefont-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
            type="button"
            onClick={() => setShowdropdown(!showdropdown)}
          >
            Mission Types{" "}
            <svg
              className="ml-2 w-4 h-4"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {showdropdown && (
            <div
              id="dropdownMenu"
              className="z-10 w-48 rounded divide-y  shadow bg-gray-700 divide-gray-600 block"
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
                {missionTypes.map((missionType, i) => {
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
        </div>
        <div className="w-full pl-0 pt-4">
          <table className="w-full missionTable bg-zinc-800 rounded-xl rounded-b-none">
            <tbody>
              <tr className="text-sm text-gray-300 border-b-2 border-gray-400">
                <td className="text-center text-sm font-bold">Type</td>
                <td className="text-center text-sm font-bold">Building</td>
                <td className="text-center text-sm font-bold">City</td>
                <td className="text-center text-sm font-bold">(col,row)</td>
                <td className="text-center text-sm font-bold">Details</td>
              </tr>
              {filteredArr.map((mission, i) => {
                return (
                  <tr
                    key={i}
                    className="text-xs text-gray-300 border-b border-gray-600"
                  >
                    <td className="px-3">{mission["Mission Type"]}</td>
                    <td className="px-3">{mission["Mission Building"]}</td>
                    <td className="px-3">{mission["Mission City"]}</td>
                    {dbData.find((o) =>
                      o.bldgs.includes(mission["Mission Building"])
                    ) !== undefined ? (
                      <td className="px-3 text-center">
                        (
                        {
                          dbData.find((o) =>
                            o.bldgs.includes(mission["Mission Building"])
                          ).x
                        }
                        ,{" "}
                        {
                          dbData.find((o) =>
                            o.bldgs.includes(mission["Mission Building"])
                          ).y
                        }
                        )
                      </td>
                    ) : (
                      <td className="text-center">-</td>
                    )}
                    <td className="px-3">{mission["Details"]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        <div className="text-center text-white text-xs font-semibold fixed left-4 bottom-4">All data to this website gets sourced from df2profiler.com and df2haven.com<br />Without these, this website wouldn&apos;t work<br/>Made with &#10084;&#65039; by DragonSoup9812</div>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const { origin } = absoluteUrl(req);
    const res = await axios.get(`${origin}/api/create`);
    const df2haven = await axios({
      method: "GET",
      url: "https://www.df2haven.com/missions/",
    });
    const df2profiler = await axios({
      method: "GET",
      url: "https://df2profiler.com/gamemap/",
    });
    return {
      props: {
        dbData: res.data,
        df2haven: df2haven.data,
        df2profiler: df2profiler.data,
        origin,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      redirect: {
        destination: "/plot",
        statusCode: 307,
      },
    };
  }
}
