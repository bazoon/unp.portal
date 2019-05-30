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
      {...props}
    >
      <defs>
        <path
          d="M10.878 7.883L8.112 5.12 2 11.106v2.885h2.887l5.991-6.108zm1.4-1.428l1.314-1.339-2.711-2.71-1.34 1.313 2.738 2.736zM11.596.293l4.112 4.109a1 1 0 0 1 .007 1.408L6.02 15.69a1 1 0 0 1-.714.3H1a1 1 0 0 1-1-1v-4.305a1 1 0 0 1 .3-.715L10.188.286a1 1 0 0 1 1.407.007z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-873.000000, -179.000000) translate(873.000000, 179.000000)"
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
