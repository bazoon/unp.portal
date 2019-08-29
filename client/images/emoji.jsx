import React from "react";
import { SVGUniqueID } from "react-svg-unique-id";

function Icon(props) {
  return (
    <SVGUniqueID>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16"
        height="16" {...props}>
        <g
          fill="#AEB4BB"
          fillRule="nonzero"
          stroke="none"
          strokeWidth="1"
          transform="translate(-1372 -865) translate(1029 852) translate(343 13)"
        >
          <path d="M8 .083C3.633.083.083 3.633.083 8S3.633 15.917 8 15.917s7.917-3.55 7.917-7.917S12.367.083 8 .083zm.083 14c-3.302 0-6-2.697-6-6 0-3.302 2.698-6 6-6 3.303 0 6 2.698 6 6 0 3.303-2.697 6-6 6z" />
          <path d="M11.767 9.517a.738.738 0 00-1.034.1c-.033.05-.983 1.166-2.733 1.166S5.3 9.667 5.267 9.617A.739.739 0 004.233 9.5a.739.739 0 00-.116 1.033C4.167 10.6 5.533 12.25 8 12.25s3.817-1.633 3.883-1.717a.719.719 0 00-.116-1.016z" />
          <circle cx="5.383" cy="6.2" r="1.017" />
          <circle cx="10.617" cy="6.2" r="1.017" />
        </g>
      </svg>
    </SVGUniqueID>
  );
}

export default Icon;