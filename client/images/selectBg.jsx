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
          d="M14 11.408l-2-1.999-2.293 2.292a1 1 0 0 1-1.488-.083l-3.146-3.93L2 12.297v1.695h12v-2.583zm0-2.828V2H2v6.692l2.168-3.25a1 1 0 0 1 1.613-.07l3.302 4.125 2.21-2.209a1 1 0 0 1 1.414 0L14 8.58zM0 12.006V2A2 2 0 0 1 2 0h12a2 2 0 0 1 2 2v11.992a2 2 0 0 1-2 1.999H2a2 2 0 0 1-2-2v-1.985zm11-7.009a1 1 0 1 1-2-.001 1 1 0 0 1 2 .001z"
          id="a"
        />
        <rect id="c" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-872.000000, -345.000000) translate(872.000000, 345.000000)"
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
