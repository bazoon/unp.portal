import React from "react";
import { SVGUniqueID } from "react-svg-unique-id";

export default props => (
  <SVGUniqueID>
    <svg
      width="14px"
      height="16px"
      viewBox="0 0 14 16"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <defs>
        <path
          d="M10.99 12.993a3 3 0 0 1-6 0H2.42c-1.11 0-1.76-1.051-1.238-2.092l1.806-3.17V4.997A4.999 4.999 0 0 1 7.99 0c2.761 0 5 2.237 5 4.997v2.734l1.832 3.218c.496.993-.154 2.044-1.264 2.044H10.99zm-4 0a1 1 0 0 0 2 0h-2zm4.13-4.503a1 1 0 0 1-.13-.495V4.997A2.999 2.999 0 0 0 7.99 2c-1.658 0-3 1.342-3 2.997v2.998a1 1 0 0 1-.132.495l-1.426 2.503h9.114L11.12 8.49z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-1155.000000, -44.000000) translate(1154.000000, 44.000000)"
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
