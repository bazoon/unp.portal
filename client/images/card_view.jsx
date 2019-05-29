import React from "react";

import { SVGUniqueID } from "react-svg-unique-id";

export default props => (
  <SVGUniqueID>
    <svg
      width="16px"
      height="16px"
      viewBox="0 0 16 16"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          d="M2 4.997h3V2H2v2.997zm3 2H2a2 2 0 0 1-2-2V2A2 2 0 0 1 2 0h3a2 2 0 0 1 2 2v2.997a2 2 0 0 1-2 2zm9-2V2h-3v2.997h3zm0 2h-3a2 2 0 0 1-2-2V2A2 2 0 0 1 11 0h3a2 2 0 0 1 2 2v2.997a2 2 0 0 1-2 2zM2 13.99h3v-2.997H2v2.997zm3 2H2a2 2 0 0 1-2-2v-2.998a2 2 0 0 1 2-1.999h3a2 2 0 0 1 2 2v2.998a2 2 0 0 1-2 1.999zm9-2v-2.997h-3v2.997h3zm0 2h-3a2 2 0 0 1-2-2v-2.998a2 2 0 0 1 2-1.999h3a2 2 0 0 1 2 2v2.998a2 2 0 0 1-2 1.999z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-562.000000, -57.000000) translate(546.000000, 55.000000) translate(16.000000, 2.000000)"
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
          <use fill="#F27171" fillRule="evenodd" xlinkHref="#c" />
        </g>
      </g>
    </svg>
  </SVGUniqueID>
);
