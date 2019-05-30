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
          d="M14 7.995A5.998 5.998 0 0 0 8 2C4.686 2 2 4.684 2 7.995a5.998 5.998 0 0 0 6 5.996c3.314 0 6-2.685 6-5.996zm2 0a7.998 7.998 0 0 1-8 7.996c-4.418 0-8-3.58-8-7.996A7.998 7.998 0 0 1 8 0c4.418 0 8 3.58 8 7.995zM9.707 9.287A1 1 0 0 1 8.293 10.7l-2-1.998a1 1 0 0 1 0-1.415l2-1.999a1 1 0 0 1 1.414 1.415L8.415 7.995l1.292 1.292z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-683.000000, -430.000000) translate(683.000000, 430.000000)"
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
          <use fill="#AEB4BB" fillRule="evenodd" xlinkHref="#c" />
        </g>
      </g>
    </svg>
  </SVGUniqueID>
);
