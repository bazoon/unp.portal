import React from "react";
import { SVGUniqueID } from "react-svg-unique-id";

export default props => {
  return (
    <SVGUniqueID>
      <svg
        width="16px"
        height="14px"
        viewBox="0 0 16 14"
        version="1.1"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        {...props}
      >
        <defs>
          <path
            d="M8.414 2.999H14a2 2 0 0 1 2 1.999v7.995a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2.999A2 2 0 0 1 2 1h4a1 1 0 0 1 .707.293l1.707 1.706zM14 4.998H8a1 1 0 0 1-.707-.292L5.586 3H2v9.993h12V4.997z"
            id="a"
          />
          <rect id="c" x={0} y={0} width={17} height={17} />
        </defs>
        <g
          transform="translate(-1045.000000, -865.000000) translate(1045.000000, 864.000000)"
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
};
