import React from "react";

export default props => {
  return (
    <svg
      width="21"
      height="16"
      viewBox="0 0 21 16"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      <defs>
        <path
          d="M9,3.89263668 L3.88738097,17.7697455 L8.50386106,15.1317569 C8.81129373,14.956081 9.18870627,14.956081 9.49613894,15.1317569 L14.112619,17.7697455 L9,3.89263668 Z M9,17.1517511 L2.49613894,20.8682431 C1.68576618,21.3313133 0.738993574,20.5300951 1.06165688,19.6542946 L8.06165688,0.654294641 C8.38306478,-0.218098214 9.61693522,-0.218098214 9.93834312,0.654294641 L16.9383431,19.6542946 C17.2610064,20.5300951 16.3142338,21.3313133 15.5038611,20.8682431 L9,17.1517511 Z"
          id="path-1"
        />
        <rect id="path-3" width="26" height="26" />
      </defs>
      <g id="Page-1" fill="none" fillRule="evenodd">
        <g id="Desktop-HD-Copy-22" transform="translate(-831 -906)">
          <g
            id="2.-Icons-/-M-/-navigation_02"
            transform="rotate(90 -26.5 878.5)"
          >
            <mask id="mask-2" fill="#fff">
              <use xlinkHref="#path-1" />
            </mask>
            <use id="mask" fill="#000" fillRule="nonzero" xlinkHref="#path-1" />
            <g id="Icons-/-Negative" mask="url(#mask-2)">
              <g transform="translate(-7 -3)">
                <mask id="mask-4" fill="#fff">
                  <use xlinkHref="#path-3" />
                </mask>
                <use id="Background" fill="#F27171" xlinkHref="#path-3" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
