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
          d="M3 3.947H2v9.992h12V3.947h-1v.998a1 1 0 0 1-2 0v-.998H5v.998a1 1 0 1 1-2 0v-.998zm0-2v-1a1 1 0 0 1 2 0v1h6v-1a1 1 0 0 1 2 0v1h1a2 2 0 0 1 2 1.999v9.993a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3.946a2 2 0 0 1 2-2h1zm2 6.996a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2H5zm5 0a1 1 0 1 1 0-2h1a1 1 0 0 1 0 2h-1zm-5 2.998a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2H5zm5 0a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2h-1z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-675.000000, -44.000000) translate(675.000000, 42.000000) translate(0.000000, 2.000000)"
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
