import React from "react";

import { SVGUniqueID } from "react-svg-unique-id";

export default props => (
  <SVGUniqueID>
    <svg
      width="12px"
      height="16px"
      viewBox="0 0 12 16"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          d="M8 12.274l-4.376 3.498A1 1 0 0 1 2 14.99V1.999A2 2 0 0 1 4 0h8a2 2 0 0 1 2 2v12.99a1 1 0 0 1-1.624.782L8 12.274zm4 .637V2H4v10.911l3.376-2.699a1 1 0 0 1 1.248 0l3.376 2.7z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-203.000000, -719.000000) translate(201.000000, 719.000000)"
        stroke="none"
        strokeWidth={1}
        fill="none"
        fillRule="evenodd"
      >
        <mask id="b" fill="#fff">
          <use xlinkHref="#a" />
        </mask>
        <use fill="#3378E1" fillRule="nonzero" xlinkHref="#a" />
        <g mask="url(#b)" fill="#5585B5" fillRule="evenodd">
          <rect x={0} y={0} width={18} height={18} />
        </g>
        <g mask="url(#b)">
          <use fill="#AEB4BB" fillRule="evenodd" xlinkHref="#c" />
        </g>
      </g>
    </svg>
  </SVGUniqueID>
);
