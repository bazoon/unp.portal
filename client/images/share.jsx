import React from "react";
import { SVGUniqueID } from "react-svg-unique-id";

export default props => (
  <SVGUniqueID>
    <svg
      width="16px"
      height="17px"
      viewBox="0 0 16 17"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <defs>
        <path
          d="M11.724 5.661L9.832 8.498a1 1 0 0 1-1.664-1.11l2-2.998c.037-.055.079-.106.124-.151A3 3 0 1 1 16 2.947a3 3 0 0 1-4.276 2.714zm-1.432 5.987a1.005 1.005 0 0 1-.124-.152l-2-2.998a1 1 0 0 1 1.664-1.11l1.892 2.837A3 3 0 0 1 16 12.94a3 3 0 1 1-5.708-1.292zM5.834 8.93A3.002 3.002 0 0 1 0 7.943a3 3 0 0 1 5.834-.986c.054-.009.11-.014.166-.014h3a1 1 0 1 1 0 2H6c-.057 0-.112-.004-.166-.013zM14 2.947a1 1 0 0 0-2 0 1 1 0 0 0 2 0zm0 9.993a1 1 0 0 0-2 0 1 1 0 0 0 2 0zM4 7.943a1 1 0 0 0-2 0 1 1 0 0 0 2 0z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-856.000000, -326.000000) translate(176.000000, 313.000000) translate(680.000000, 14.000000)"
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
          <use fill="#66717F" fillRule="evenodd" xlinkHref="#c" />
        </g>
      </g>
    </svg>
  </SVGUniqueID>
);
