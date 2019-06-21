import React from "react";

import { SVGUniqueID } from "react-svg-unique-id";

export default props => {
  const { isActive } = props;
  const fill = isActive ? "#3378E1" : "#AEB4BB";
  return (
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
            d="M7 6.995v-.998a1 1 0 1 1 2 0v.998h1a1 1 0 0 1 0 2H9v1a1 1 0 0 1-2 0v-1H6a1 1 0 1 1 0-2h1zm7 1A5.998 5.998 0 0 0 8 2C4.686 2 2 4.684 2 7.995a5.998 5.998 0 0 0 6 5.996c3.314 0 6-2.685 6-5.996zm2 0a7.998 7.998 0 0 1-8 7.996c-4.418 0-8-3.58-8-7.996A7.998 7.998 0 0 1 8 0c4.418 0 8 3.58 8 7.995z"
            id="a"
          />
          <rect id="c" x={0} y={0} width={17} height={17} />
        </defs>
        <g
          transform="translate(-863.000000, -868.000000) translate(863.000000, 868.000000)"
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
            <use fill={fill} fillRule="evenodd" xlinkHref="#c" />
          </g>
        </g>
      </svg>
    </SVGUniqueID>
  );
};
