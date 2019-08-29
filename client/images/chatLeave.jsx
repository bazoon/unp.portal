import React from 'react';
import { SVGUniqueID } from "react-svg-unique-id";

const SvgComponent = props => (
  <SVGUniqueID>
    <svg width={20} height={22} {...props} viewBox="0 0 20 22">
      <defs>
        <path
          d="M17.037 11.917H8.25a.917.917 0 010-1.834h8.787l-2.102-2.101a.917.917 0 011.297-1.297l3.666 3.667a.917.917 0 010 1.296l-3.666 3.667a.917.917 0 11-1.297-1.297l2.102-2.101zm-7.87 7.333a.917.917 0 110 1.833H4.583a2.75 2.75 0 01-2.75-2.75V3.667a2.75 2.75 0 012.75-2.75h4.584a.917.917 0 010 1.833H4.583a.917.917 0 00-.916.917v14.666c0 .507.41.917.916.917h4.584z"
          id="prefix__a"
        />
        <path id="prefix__c" d="M0 0h24v24H0z" />
      </defs>
      <g transform="translate(-1)" fill="none" fillRule="evenodd">
        <mask id="prefix__b" fill="#fff">
          <use xlinkHref="#prefix__a" />
        </mask>
        <use fill="#000" fillRule="nonzero" xlinkHref="#prefix__a" />
        <g mask="url(#prefix__b)">
          <use fill="#F27171" xlinkHref="#prefix__c" />
        </g>
      </g>
    </svg>
  </SVGUniqueID>
)

export default SvgComponent
