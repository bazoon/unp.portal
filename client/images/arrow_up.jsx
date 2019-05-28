import React from "react";

export default props => (
  <svg
    {...props}
    width="14px"
    height="8px"
    viewBox="0 0 14 8"
    version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <path
        d="M10.586 9l-5.293 5.293a1 1 0 0 0 1.414 1.414l6-6a1 1 0 0 0 0-1.414l-6-6a1 1 0 0 0-1.414 1.414L10.586 9z"
        id="a"
      />
      <rect id="c" x={0} y={0} width={18} height={18} />
    </defs>
    <g
      transform="translate(-206.000000, -602.000000) translate(213.000000, 606.000000) rotate(-90.000000) translate(-213.000000, -606.000000) translate(204.000000, 597.000000)"
      stroke="none"
      strokeWidth={1}
      fill="none"
      fillRule="evenodd"
    >
      <mask id="b" fill="#fff">
        <use xlinkHref="#a" />
      </mask>
      <use fill="#000" fillRule="nonzero" xlinkHref="#a" />
      <g mask="url(#b)">
        <use fill="#FFF" fillRule="evenodd" xlinkHref="#c" />
      </g>
    </g>
  </svg>
);
