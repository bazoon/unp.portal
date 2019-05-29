import React from "react";

export default props => {
  return (
    <svg
      width="14px"
      height="16px"
      viewBox="0 0 14 16"
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          d="M5 8.995a1 1 0 1 1 0-2h6a1 1 0 0 1 0 2H5zm0 2.998a1 1 0 0 1 0-2h6a1 1 0 1 1 0 2H5zm8 1.998V2H3v11.99h10zm0 2H3a2 2 0 0 1-2-2V2A2 2 0 0 1 3 0h10a2 2 0 0 1 2 2v11.992a2 2 0 0 1-2 1.999zM5 5.997a1 1 0 1 1 0-2h4a1 1 0 1 1 0 2H5z"
          id="a11"
        />
        <rect id="c12" x={0} y={0} width={17} height={17} />
      </defs>
      <g
        transform="translate(-922.000000, -721.000000) translate(921.000000, 721.000000)"
        stroke="none"
        strokeWidth={1}
        fill="none"
        fillRule="evenodd"
      >
        <mask id="b11" fill="#fff">
          <use xlinkHref="#a11" />
        </mask>
        <use fill="#3378E1" fillRule="nonzero" xlinkHref="#a11" />
        <g mask="url(#b11)">
          <use fill="#F27171" fillRule="evenodd" xlinkHref="#c12" />
        </g>
      </g>
    </svg>
  );
};
