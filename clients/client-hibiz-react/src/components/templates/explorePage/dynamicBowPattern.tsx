import { memo } from "react";

const MemoBowLayout = ({ color }) => (
  <svg
    width="100"
    height="29"
    viewBox="0 0 100 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 25.3496C14.749 25.3496 14.749 2.99961 26.5 2.99961C38.251 2.99961 38.245 25.3496 49.99 25.3496C61.735 25.3496 61.743 2.99961 73.496 2.99961C85.249 2.99961 85.247 25.3496 97 25.3496"
      stroke={color}
      stroke-opacity="0.5"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const BowLayout = memo(MemoBowLayout);
export default BowLayout;
