import React from "react";
import { SVGUniqueID } from "react-svg-unique-id";

function Icon(props) {
  return (
    <SVGUniqueID>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        {...props}
      >
        <defs>
          <path
            id="a"
            d="M14.585.093a.994.994 0 01.09-.036c.783-.275 1.546.488 1.27 1.272a.994.994 0 01-.035.09L9.92 15.388a1 1 0 01-1.777.12L5.27 10.727.486 7.856a1 1 0 01.12-1.776L14.585.093zm-3.966 3.874l-7.426 3.18 2.652 1.591 4.774-4.77zm1.416 1.413L7.26 10.152l1.591 2.651 3.184-7.423z"
          />
          <path id="c" d="M0 0H17V17H0z" />
        </defs>
        <g
          fill="none"
          fillRule="evenodd"
          stroke="none"
          strokeWidth="1"
          opacity="0.6"
          transform="translate(-1404 -865) translate(1404 865)"
        >
          <mask id="b" fill="#fff">
            <use xlinkHref="#a" />
          </mask>
          <use fill="#3378E1" fillRule="nonzero" xlinkHref="#a" />
          <g mask="url(#b)">
            <mask fill="#fff">
              <use xlinkHref="#c" />
            </mask>
            <use fill="#66717F" fillRule="evenodd" xlinkHref="#c" />
          </g>
        </g>
      </svg>
    </SVGUniqueID>
  );
}

export default Icon;