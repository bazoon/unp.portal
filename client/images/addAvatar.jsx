import React from 'react';
import { SVGUniqueID } from "react-svg-unique-id";

const SvgComponent = props => (
  <SVGUniqueID>
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 16"
      {...props}
    >
      <defs>
        <path
          d="M14 11.408l-2-1.999-2.293 2.292a1 1 0 01-1.488-.083l-3.146-3.93L2 12.297v1.695h12v-2.583zm0-2.828V2H2v6.692l2.168-3.25a1 1 0 011.613-.07l3.302 4.125 2.21-2.209a1 1 0 011.414 0L14 8.58zM0 12.006V2A2 2 0 012 0h12a2 2 0 012 2v11.992a2 2 0 01-2 1.999H2a2 2 0 01-2-2v-1.985zm11-7.009a1 1 0 11-2-.001 1 1 0 012 .001z"
          id="prefix__a"
        />
        <path id="prefix__c" d="M0 0h17v17H0z" />
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
