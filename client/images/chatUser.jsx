import React from "react";
import { SVGUniqueID } from "react-svg-unique-id";

export default props => {
  const { isActive } = props;
  const fill = isActive ? "#3378E1" : "#AEB4BB";
  return (
    <SVGUniqueID>
      <svg
        width="14px"
        height="16px"
        viewBox="0 0 14 16"
        version="1.1"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        onClick={props.onClick}
      >
        <defs>
          <path
            d="M10 3.998A1.999 1.999 0 0 0 8 2a1.999 1.999 0 1 0 2 1.998zm2 0a3.999 3.999 0 0 1-4 3.998A3.999 3.999 0 1 1 8 0c2.21 0 4 1.79 4 3.998zm.874 9.993A4 4 0 0 0 9 10.994H7a4 4 0 0 0-3.874 2.997h9.748zm1.126 2H2a1 1 0 0 1-1-1 5.998 5.998 0 0 1 6-5.997h2c3.314 0 6 2.685 6 5.997a1 1 0 0 1-1 1z"
            id="a"
          />
          <rect id="c" x={0} y={0} width={17} height={17} />
        </defs>
        <g
          transform="translate(-966.000000, -868.000000) translate(965.000000, 868.000000)"
          stroke="none"
          strokeWidth={1}
          fill="none"
          fillRule="evenodd"
        >
          <mask id="b" fill="#fff">
            <use xlinkHref="#a" />
          </mask>
          <use fill="#3378E1" fillRule="nonzero" xlinkHref="#a" />
          <g mask="url(#b)">
            <use fill={fill} fillRule="evenodd" xlinkHref="#c" />
          </g>
        </g>
      </svg>
    </SVGUniqueID>
  );
};
