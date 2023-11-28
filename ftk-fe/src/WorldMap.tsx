import { CSSProperties } from "react";

export interface WorldMapProps {
//   journey: boolean; // short or long
  shipPos: number;
}

interface TileData {
  tl: number[];
  color?: "red" | "yellow" | "blue";
  arrows?: "o-r-yb" | "o-ry-b" | "r-y-b" | "r-yb-o" | "ry-b-o" | "ry-o-b";
  cabin?: boolean;
  flog?: boolean;
  kraken?: boolean;
  ship?: boolean;
}

const hs = 60;
const lt = 30;
const ll = 45;

const tileDatas: TileData[] = [
  { tl: [lt * 3, -ll * 3], color: "red" },
  { tl: [lt * 3 + hs * 1, -ll * 3], arrows: "o-r-yb" },

  { tl: [lt * 2, -ll * 2], color: "red" },
  { tl: [lt * 2 + hs * 1, -ll * 2], arrows: "o-r-yb" },
  { tl: [lt * 2 + hs * 2, -ll * 2], arrows: "r-y-b", cabin: true },
  { tl: [lt * 2 + hs * 3, -ll * 2], arrows: "o-ry-b" },

  { tl: [lt, -ll], color: "red" },
  { tl: [lt + hs * 1, -ll], arrows: "o-r-yb", color: "yellow", kraken: true },
  { tl: [lt + hs * 2, -ll], arrows: "r-y-b" },
  { tl: [lt + hs * 3, -ll], arrows: "r-y-b", cabin: true },
  { tl: [lt + hs * 4, -ll], arrows: "r-y-b" },

  { tl: [0, 0], color: "yellow" },
  { tl: [hs, 0], arrows: "r-y-b" },
  { tl: [hs * 2, 0], arrows: "r-y-b" },
  { tl: [hs * 3, 0], arrows: "r-y-b" },
  { tl: [hs * 4, 0], arrows: "ry-o-b" },
  { tl: [hs * 5, 0], arrows: "r-y-b" },
  // { tl: [hs * 6, 0], arrows: "r-y-b" },

  { tl: [lt, ll], color: "blue" },
  { tl: [lt + hs * 1, ll], arrows: "r-y-b", color: "yellow", kraken: true },
  { tl: [lt + hs * 2, ll], arrows: "r-y-b" },
  { tl: [lt + hs * 3, ll], arrows: "r-y-b", cabin: true },
  { tl: [lt + hs * 4, ll], arrows: "r-y-b" },

  { tl: [lt * 2, ll * 2], color: "blue" },
  { tl: [lt * 2 + hs * 1, ll * 2], arrows: "ry-b-o" },
  { tl: [lt * 2 + hs * 2, ll * 2], arrows: "r-y-b" },
  { tl: [lt * 2 + hs * 3, ll * 2], arrows: "r-yb-o" },

  { tl: [lt * 3, ll * 3], color: "blue" },
  { tl: [lt * 3 + hs * 1, ll * 3], arrows: "ry-b-o" },
];

export default function WorldMap({  shipPos }: WorldMapProps) {
  function hex(top: number, left: number): CSSProperties {
    return {
      position: "absolute",
      top,
      left: left + window.innerWidth / 2 - 30,
      width: hs,
      height: hs,
    };
  }

  function arrowsStyle(top: number, left: number): CSSProperties {
    return {
      position: "absolute",
      top,
      left: left + window.innerWidth / 2 - 30,
      width: hs,
      height: hs,
    };
  }

  function cabinStyle(top: number, left: number): CSSProperties {
    return {
      position: "absolute",
      top: top + 17.5,
      left: left + window.innerWidth / 2 - 10,
      width: 25,
      height: 25,
    };
  }

  function flogStyle(top: number, left: number): CSSProperties {
    return {
      position: "absolute",
      top,
      left: left - 25,
      width: 40,
      height: 47,
    };
  }

  function krakenStyle(top: number, left: number): CSSProperties {
    return {
      position: "absolute",
      top: top + 10,
      left: left + window.innerWidth / 2 - 17.5,
      width: 35,
      height: 38,
    };
  }

  function shipStyle(top: number, left: number): CSSProperties {
    return {
      position: "absolute",
      top: top + 15,
      left: left + window.innerWidth / 2 - 12.5,
      width: 30,
      height: 24,
    };
  }

  /**
   * a tile can have few varying factors:
   * base design - color (red,yellow,blue)
   * overlaying objects- flogging, cabin search, kraken, ship
   *
   */
  function drawTile(tileData: TileData, idx: number) {
    const { tl, color, arrows, cabin, flog, kraken, ship } = tileData;
    const top = tl[0];
    const left = tl[1];

    const tsx = (
      <div>
        <img
          src={`src/assets/hex-${color ? color : `white`}.png`}
          style={hex(top, left)}
        />
        {!arrows ? null : (
          <img
            src={`src/assets/hex-${arrows}.png`}
            style={arrowsStyle(top, left)}
          ></img>
        )}
        {cabin ? (
          <img src="src/assets/cabin.png" style={cabinStyle(top, left)} />
        ) : null}
        {flog ? (
          <img src="src/assets/flog.png" style={flogStyle(top, left)} />
        ) : null}
        {kraken ? (
          <img src="src/assets/kraken.png" style={krakenStyle(top, left)} />
        ) : null}
        {shipPos === idx ? (
          <img
            className=""
            src="src/assets/ship.png"
            style={shipStyle(top, left)}
          />
        ) : null}
      </div>
    );
    return tsx;
  }

  return <div className="h-[450px]">
    {tileDatas.map((tileData, idx) => drawTile(tileData, idx))}
  </div>
}
