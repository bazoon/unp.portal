import React from "react";

export default props => {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <defs>
        <path
          d="M8,12.2737802 L3.62444664,15.771941 C2.96963228,16.295451 2,15.8292318 2,14.9908735 L2,1.99934811 C2,0.894468081 2.89567011,0 4,0 L12,0 C13.1043299,0 14,0.894468081 14,1.99934811 L14,14.9908735 C14,15.8292318 13.0303677,16.295451 12.3755534,15.771941 L8,12.2737802 Z M12,12.9110959 L12,2 L4,2 L4,12.9110959 L7.37555336,10.2124136 C7.74067893,9.92050359 8.25932107,9.92050359 8.62444664,10.2124136 L12,12.9110959 Z"
          id="path-1"
        />
        <rect id="path-3" width="17" height="17" />
      </defs>
      <g id="Page-1" fill="none" fillRule="evenodd">
        <g id="Desktop-HD-Copy-2" transform="translate(-278 -1052)">
          <g id="Comment" transform="translate(198 967)">
            <g id="2.-Icons-/-S-/-bookmark" transform="translate(78 85)">
              <mask id="mask-2" fill="#fff">
                <use xlinkHref="#path-1" />
              </mask>
              <use
                id="mask"
                fill="#3378E1"
                fillRule="nonzero"
                xlinkHref="#path-1"
              />
              <g id="Icons-/-Base" mask="url(#mask-2)" fill="#5585B5">
                <g id="Icons-/-Primary">
                  <rect id="Background" width="18" height="18" />
                </g>
              </g>
              <g id="Icons-/-Color-4" mask="url(#mask-2)">
                <mask id="mask-4" fill="#fff">
                  <use xlinkHref="#path-3" />
                </mask>
                <use id="Background" fill="#AEB4BB" xlinkHref="#path-3" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
