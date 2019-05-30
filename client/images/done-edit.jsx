import React from "react";

import { SVGUniqueID } from "react-svg-unique-id";

export default props => (
  <SVGUniqueID>
    <svg
      width="11px"
      height="7px"
      viewBox="0 0 11 7"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <defs>
        <path
          d="M7.094 8.674l4.645-4.156a1 1 0 1 1 1.2 1.6l-5.34 4.676a1 1 0 0 1-1.306-.093l-3-2.998a1 1 0 1 1 1.414-1.415l2.387 2.386z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-876.000000, -183.000000) translate(873.000000, 179.000000)"
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
          <use fill="#FFF" fillRule="evenodd" xlinkHref="#c" />
        </g>
      </g>
    </svg>
  </SVGUniqueID>
);
