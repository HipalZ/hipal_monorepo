interface CustomSvgProps {
  width?: number;
  height?: number;
  primary?: string;
  secondary?: string;
  category?: number;
}

export const IphoneExplore: React.FC<CustomSvgProps> = ({
  width,
  height,
  primary,
  secondary,
}) => {
  const primaryColor = primary || "#D22888";
  const secondaryColor = secondary || "#FEF6F6";
  return (
    <svg
      height={height || "306"}
      width={width || "153"}
      viewBox="0 0 153 326"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Iphone</title>
      <g clipPath="url(#clip0_2007_3023)">
        <rect x="4" y="4" width="146" height="315" rx="8" fill="#E9E9EB" />
        <rect
          x="4"
          y="4"
          width="146"
          height="315"
          rx="8"
          fill="black"
          fillOpacity="0.2"
        />
        <rect x="4" y="4" width="146" height="149" fill="url(#pattern0)" />
        <rect
          x="4"
          y="4"
          width="146"
          height="149"
          fill="#FEF6F6"
          fillOpacity="0.2"
        />
        <rect
          width="146"
          height="187"
          rx="8"
          transform="matrix(1 0 0 -1 4 332)"
          fill={secondaryColor || "#FEF6F6"}
        />
        <rect
          x="14"
          y="231"
          width="43.3224"
          height="55.9439"
          rx="4.43458"
          fill="url(#pattern1)"
        />
        <rect
          x="64"
          y="231"
          width="43.3224"
          height="55.9439"
          rx="4.43458"
          fill="url(#pattern2)"
        />
        <rect
          x="114"
          y="231"
          width="43.3224"
          height="55.9439"
          rx="4.43458"
          fill="url(#pattern3)"
        />
        <g filter="url(#filter0_b_2007_3023)">
          <rect
            x="134.533"
            y="14.6819"
            width="10.2336"
            height="10.2336"
            rx="5.11682"
            fill={primaryColor || "#D22888"}
          />
          <path
            d="M138.596 21.7213H138L139.339 18H139.988L141.327 21.7213H140.731L139.679 18.6759H139.65L138.596 21.7213ZM138.696 20.264H140.629V20.7365H138.696V20.264Z"
            fill="white"
          />
        </g>
        <g filter="url(#filter1_b_2007_3023)">
          <rect
            x="9"
            y="14"
            width="49.0093"
            height="11.5981"
            rx="5.79907"
            fill="white"
            fillOpacity="0.55"
          />
        </g>
        <g filter="url(#filter2_b_2007_3023)">
          <rect
            x="103.832"
            y="14"
            width="11.5981"
            height="11.5981"
            rx="5.79907"
            fill="white"
            fillOpacity="0.55"
          />
        </g>
        <g filter="url(#filter3_b_2007_3023)">
          <rect
            x="88.4824"
            y="14"
            width="11.5981"
            height="11.5981"
            rx="5.79907"
            fill="white"
            fillOpacity="0.55"
          />
        </g>
        <g filter="url(#filter4_b_2007_3023)">
          <rect
            x="119.184"
            y="14"
            width="11.5981"
            height="11.5981"
            rx="5.79907"
            fill="white"
            fillOpacity="0.55"
          />
        </g>
        <rect
          x="49"
          y="174"
          width="14"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="15"
          y="154"
          width="27.5022"
          height="27.5022"
          rx="13.7511"
          fill="url(#paint0_linear_2007_3023)"
        />
        <path
          d="M32.7022 160.366H24.7709C24.4758 160.366 24.1928 160.492 23.9841 160.715C23.7754 160.938 23.6582 161.24 23.6582 161.556V171.219H23.6718V174.612C23.6718 174.743 23.7032 174.872 23.763 174.986C23.8228 175.101 23.909 175.197 24.0134 175.265C24.1178 175.334 24.2369 175.373 24.3594 175.378C24.4818 175.384 24.6035 175.356 24.7128 175.296L28.3712 173.313C28.4709 173.26 28.5809 173.232 28.6924 173.232C28.8039 173.232 28.9138 173.26 29.0135 173.313L32.7844 175.311C32.8938 175.369 33.0153 175.396 33.1372 175.39C33.2592 175.383 33.3776 175.344 33.4813 175.275C33.585 175.206 33.6706 175.11 33.7298 174.996C33.7891 174.882 33.8201 174.753 33.8199 174.623L33.81 171.219V161.553C33.8092 161.239 33.6923 160.938 33.4848 160.715C33.2772 160.493 32.9959 160.368 32.7022 160.366Z"
          fill="#D22888"
        />
        <circle cx="28.738" cy="165.447" r="3.58465" fill="white" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.7064 162.548C27.6074 162.548 26.6625 163.21 26.2487 164.157C26.2212 164.22 26.1477 164.249 26.0846 164.221C26.0215 164.194 25.9927 164.12 26.0202 164.057C26.4723 163.022 27.5047 162.299 28.7064 162.299C28.7753 162.299 28.8311 162.355 28.8311 162.424C28.8311 162.493 28.7753 162.548 28.7064 162.548Z"
          fill="white"
        />
        <path
          d="M28.9246 163.416L29.4287 164.485C29.4437 164.516 29.4658 164.544 29.4931 164.565C29.5204 164.585 29.5521 164.599 29.5856 164.604L30.7125 164.774C30.7507 164.78 30.7865 164.797 30.8159 164.823C30.8453 164.849 30.8672 164.884 30.8792 164.922C30.8912 164.96 30.8927 165.001 30.8837 165.041C30.8746 165.08 30.8553 165.116 30.8279 165.144L30.0136 165.976C29.9894 166 29.9713 166.031 29.9609 166.065C29.9504 166.098 29.948 166.134 29.9538 166.169L30.1464 167.343C30.153 167.383 30.1487 167.424 30.134 167.462C30.1194 167.5 30.0949 167.532 30.0634 167.556C30.0319 167.58 29.9946 167.594 29.9558 167.597C29.917 167.6 29.8781 167.592 29.8437 167.573L28.8357 167.017C28.8058 167.001 28.7725 166.992 28.7387 166.992C28.7049 166.992 28.6716 167.001 28.6417 167.017L27.6337 167.573C27.5993 167.592 27.5605 167.6 27.5217 167.597C27.4829 167.594 27.4457 167.58 27.4142 167.556C27.3828 167.532 27.3584 167.499 27.3437 167.462C27.3291 167.424 27.3248 167.383 27.3313 167.343L27.5236 166.169C27.5294 166.134 27.5269 166.098 27.5165 166.065C27.5061 166.031 27.488 166 27.4637 165.976L26.6494 165.144C26.622 165.116 26.6028 165.08 26.5937 165.041C26.5847 165.001 26.5862 164.96 26.5982 164.922C26.6101 164.884 26.632 164.849 26.6615 164.823C26.6909 164.797 26.7267 164.78 26.7649 164.774L27.8918 164.603C27.9252 164.598 27.9569 164.584 27.9843 164.563C28.0116 164.543 28.0337 164.515 28.0486 164.484L28.5528 163.415C28.5703 163.379 28.597 163.349 28.6299 163.328C28.6628 163.307 28.7005 163.296 28.739 163.296C28.7775 163.297 28.8152 163.308 28.8479 163.329C28.8807 163.35 28.9072 163.38 28.9246 163.416Z"
          fill="#282729"
        />
        <rect
          x="49"
          y="158"
          width="74"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="14"
          y="220"
          width="42"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="67"
          y="174"
          width="14"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="49"
          y="166"
          width="45"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="87"
          y="174"
          width="14"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="15"
          y="191"
          width="125"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="15"
          y="199"
          width="76"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <g filter="url(#filter5_d_2007_3023)">
          <rect x="4" y="284" width="146" height="35.4766" fill="white" />
          <rect
            x="10.1406"
            y="290.257"
            width="63.1075"
            height="20.9159"
            rx="10.2336"
            fill="white"
          />
          <rect
            x="14"
            y="292"
            width="129"
            height="19"
            rx="9.5"
            fill={primaryColor || "#D22888"}
          />
        </g>
      </g>
      <rect
        x="2"
        y="2"
        width="150"
        height="319"
        rx="10"
        stroke="#CCCCCC"
        strokeWidth="4"
      />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_2007_3023"
            transform="matrix(0.000996629 0 0 0.000976562 -0.010274 0)"
          />
        </pattern>
        <pattern
          id="pattern1"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image1_2007_3023"
            transform="matrix(0.00126107 0 0 0.000976562 -0.145669 0)"
          />
        </pattern>
        <pattern
          id="pattern2"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image1_2007_3023"
            transform="matrix(0.00126107 0 0 0.000976562 -0.145669 0)"
          />
        </pattern>
        <pattern
          id="pattern3"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image1_2007_3023"
            transform="matrix(0.00126107 0 0 0.000976562 -0.145669 0)"
          />
        </pattern>
        <linearGradient
          id="paint0_linear_2007_3023"
          x1="38.9602"
          y1="157.334"
          x2="19.3753"
          y2="176.919"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D9CCFF" />
          <stop offset="1" stopColor="#FCD6CF" />
        </linearGradient>
        <clipPath id="clip0_2007_3023">
          <rect x="4" y="4" width="146" height="315" rx="8" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const IphoneCategory: React.FC<CustomSvgProps> = ({
  width,
  height,
  primary,
  secondary,
  category,
}) => {
  const primaryColor = primary || "#D22888";
  const secondaryColor = secondary || "#FEF6F6";

  return (
    <svg
      height={height || "306"}
      width={width || "153"}
      viewBox="0 0 153 326"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Iphone2</title>
      <g clipPath="url(#clip0_2007_3060)">
        <rect x="4" y="4" width="146" height="315" rx="8" fill="#E9E9EB" />
        <rect
          x="4"
          y="4"
          width="146"
          height="315"
          rx="8"
          fill="black"
          fillOpacity="0.2"
        />
        <rect
          x="4"
          y="-2"
          width="146"
          height="41"
          fill={primaryColor || "#646b79"}
        />
        <rect
          x="4"
          y="-2"
          width="146"
          height="41"
          fill="black"
          fillOpacity="0.2"
        />
        <rect
          width="146"
          height="294"
          rx="8"
          transform="matrix(1 0 0 -1 4 327)"
          fill={secondaryColor || "#FEF6F6"}
        />
        <rect
          x="13"
          y="168"
          width="20"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="219"
          width="20"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="270"
          width="20"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        {/* white chip */}
        {category !== 3 && category !== 1 && (
          <>
            {" "}
            <rect
              x="13"
              y="109"
              width="19"
              height="2"
              rx="1"
              fill={primaryColor || "#F7BABA"}
            />
            <rect
              x="43"
              y="109"
              width="19"
              height="2"
              rx="1"
              fill={primaryColor || "#F7BABA"}
            />
            <rect
              x="73"
              y="109"
              width="19"
              height="2"
              rx="1"
              fill={primaryColor || "#F7BABA"}
            />
            <rect
              x="103"
              y="109"
              width="19"
              height="2"
              rx="1"
              fill={primaryColor || "#F7BABA"}
            />
            <rect
              x="133"
              y="109"
              width="19"
              height="2"
              rx="1"
              fill={primaryColor || "#F7BABA"}
            />
          </>
        )}
        <rect
          x="13"
          y="156"
          width="43"
          height="6"
          rx="3"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="28"
          y="43"
          width="43"
          height="6"
          rx="3"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="207"
          width="43"
          height="6"
          rx="3"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="258"
          width="43"
          height="6"
          rx="3"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="309"
          width="43"
          height="6"
          rx="3"
          fill={primaryColor || "#F7BABA"}
        />
        {/* parent category */}
        {category !== 3 && (
          <>
            <rect
              x="13.5"
              y="61.5"
              width="42"
              height="13"
              rx="6.5"
              stroke={primaryColor || "#F7BABA"}
            />
            <rect
              x="62.5"
              y="61.5"
              width="42"
              height="13"
              rx="6.5"
              stroke={primaryColor || "#F7BABA"}
            />
            <rect
              x="111.5"
              y="61.5"
              width="42"
              height="13"
              rx="6.5"
              stroke={primaryColor || "#F7BABA"}
            />
          </>
        )}
        <rect
          width="9"
          height="8"
          rx="4"
          transform="matrix(-1 0 0 1 22 42)"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          width="9"
          height="8"
          rx="4"
          transform="matrix(-1 0 0 1 129 42)"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          width="9"
          height="8"
          rx="4"
          transform="matrix(-1 0 0 1 142 42)"
          fill={primaryColor || "#F7BABA"}
        />

        <rect
          x="116"
          y="156"
          width="29"
          height="29"
          rx="1.95947"
          fill={primaryColor || "#646b79"}
        />
        <rect
          x="121.4"
          y="181.4"
          width="20.2"
          height="7.2"
          rx="3.6"
          fill="white"
          stroke={primaryColor || "#F7BABA"}
          strokeWidth="0.8"
        />
        {category !== 3 && category !== 1 && (
          <>
            {/* 1st */}
            <rect
              x="13"
              y="86"
              width="19"
              height="19"
              rx="1.95947"
              fill={primaryColor || "#646b79"}
            />
            {/* 2nd */}
            <rect
              x="43"
              y="86"
              width="19"
              height="19"
              rx="1.95947"
              fill={primaryColor || "#646b79"}
            />
            {/* 3rd */}

            <rect
              x="73"
              y="86"
              width="19"
              height="19"
              rx="1.95947"
              fill={primaryColor || "#646b79"}
            />
            {/* 4th */}
            <rect
              x="103"
              y="86"
              width="19"
              height="19"
              rx="1.95947"
              fill={primaryColor || "#646b79"}
            />
            {/* 5th */}
            <rect
              x="133"
              y="86"
              width="19"
              height="19"
              rx="1.95947"
              fill={primaryColor || "#646b79"}
            />
          </>
        )}

        <rect
          x="116"
          y="207"
          width="29"
          height="29"
          rx="1.95947"
          fill={primaryColor || "#646b79"}
        />
        <rect
          x="116"
          y="258"
          width="29"
          height="29"
          rx="1.95947"
          fill={primaryColor || "#646b79"}
        />

        <rect
          x="7"
          y="144"
          width="140"
          height="1"
          rx="0.5"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="121.4"
          y="232.4"
          width="20.2"
          height="7.2"
          rx="3.6"
          fill="white"
          stroke={primaryColor || "#F7BABA"}
          strokeWidth="0.8"
        />
        <rect
          x="121.4"
          y="283.4"
          width="20.2"
          height="7.2"
          rx="3.6"
          fill="white"
          stroke={primaryColor || "#F7BABA"}
          strokeWidth="0.8"
        />

        <rect
          x="13"
          y="178"
          width="65"
          height="3"
          rx="1.5"
          fill={primaryColor || "#F7BABA"}
        />

        <rect
          x="13"
          y="133"
          width="74"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="7"
          y="195"
          width="140"
          height="1"
          rx="0.5"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="7"
          y="246"
          width="140"
          height="1"
          rx="0.5"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="7"
          y="297"
          width="140"
          height="1"
          rx="0.5"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="134"
          y="133"
          width="9"
          height="4"
          rx="2"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="183"
          width="26"
          height="3"
          rx="1.5"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="229"
          width="85"
          height="3"
          rx="1.5"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="13"
          y="280"
          width="85"
          height="3"
          rx="1.5"
          fill={primaryColor || "#F7BABA"}
        />
        <rect
          x="42"
          y="183"
          width="46"
          height="3"
          rx="1.5"
          fill={primaryColor || "#F7BABA"}
        />
        <g filter="url(#filter0_d_2007_3060)">
          <rect x="4" y="284" width="146" height="35.4766" fill="white" />
          <rect
            x="10.1406"
            y="290.257"
            width="63.1075"
            height="20.9159"
            rx="10.2336"
            fill="white"
          />
          <rect
            x="14"
            y="292"
            width="129"
            height="19"
            rx="9.5"
            fill={primaryColor || "#D22888"}
          />
        </g>
      </g>
      <rect
        x="2"
        y="2"
        width="150"
        height="319"
        rx="10"
        stroke="#CCCCCC"
        strokeWidth="4"
      />
      <defs>
        <pattern
          id="pattern0"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use
            xlinkHref="#image0_2007_3060"
            transform="matrix(0.000976562 0 0 0.00347752 0 -1.28049)"
          />
        </pattern>
        <pattern
          id="pattern1"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern2"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern3"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern4"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern5"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern6"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern7"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern8"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <pattern
          id="pattern9"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image1_2007_3060" transform="scale(0.000976562)" />
        </pattern>
        <clipPath id="clip0_2007_3060">
          <rect x="4" y="4" width="146" height="315" rx="8" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
