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
        onClick={props.onClick}
      >
        <defs>
          <path
            d="M3 12.993H2c-1.105 0-2-.894-2-2V2C0 .894.895 0 2 0h12c1.105 0 2 .894 2 2v8.993c0 1.106-.895 2-2 2H8.333L4.6 15.79a1 1 0 0 1-1.6-.8v-1.998zm-1-2h2a1 1 0 0 1 1 1v.999l2.4-1.8a1 1 0 0 1 .6-.2h6V2H2v8.993zm3-4.996a1 1 0 1 1 0-2h6a1 1 0 0 1 0 2H5zm0 2.998a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2H5z"
            id="a"
          />
        </defs>
        <g
          transform="translate(-763.000000, -868.000000) translate(763.000000, 868.000000)"
          stroke="none"
          strokeWidth={1}
          fill="none"
          fillRule="evenodd"
        >
          <mask id="b" fill="#fff">
            <use xlinkHref="#a" />
          </mask>
          <use fill="#3378E1" fillRule="nonzero" xlinkHref="#a" />
          <g mask="url(#b)" fill={fill} fillRule="evenodd">
            <rect x={0} y={0} width={17} height={17} />
          </g>
        </g>
      </svg>
    </SVGUniqueID>
  );
};
