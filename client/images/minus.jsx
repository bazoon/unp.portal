import React from "react";
import { SVGUniqueID } from "react-svg-unique-id";

const SvgComponent = props => (
  <SVGUniqueID>
    <svg width={20} height={20} {...props}>
      <defs>
        <path
          d="M17.5 9.994A7.497 7.497 0 0010 2.5a7.497 7.497 0 00-7.5 7.494A7.497 7.497 0 0010 17.49c4.142 0 7.5-3.356 7.5-7.495zm2.5 0c0 5.52-4.477 9.995-10 9.995S0 15.514 0 9.994 4.477 0 10 0s10 4.474 10 9.994zm-12.5 1.25a1.25 1.25 0 010-2.5h5a1.25 1.25 0 010 2.5h-5z"
          id="prefix__a"
        />
        <path id="prefix__c" d="M0 0h21v22H0z" />
      </defs>
      <g fill="none" fillRule="evenodd">
        <mask id="prefix__b" fill="#fff">
          <use xlinkHref="#prefix__a" />
        </mask>
        <use fill="#3378E1" fillRule="nonzero" xlinkHref="#prefix__a" />
        <g mask="url(#prefix__b)">
          <use fill="#F27171" xlinkHref="#prefix__c" />
        </g>
      </g>
    </svg>
  </SVGUniqueID>
);

export default SvgComponent;
