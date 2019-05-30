import React from "react";

import { SVGUniqueID } from "react-svg-unique-id";

export default props => (
  <SVGUniqueID>
    <svg
      width="21px"
      height="14px"
      viewBox="0 0 21 14"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          d="M14.188 17.348l9.29-8.312a2 2 0 0 1 2.4 3.2L15.198 21.59a2 2 0 0 1-2.613-.186l-6-5.997a2 2 0 1 1 2.828-2.83l4.774 4.772z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={34} height={35} />
      </defs>
      <g
        transform="translate(-453.000000, -480.000000) translate(411.000000, 434.000000) translate(36.000000, 38.000000)"
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
