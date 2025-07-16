import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 8.5H18" />
      <path d="M15.5 12H18" />
      <path d="M6 12h5" />
      <path d="M6 8.5h5" />
      <path d="M15.5 15.5H18" />
      <path d="M6 15.5h5" />
      <path d="M4 6.5h16" />
      <path d="M4 18.5h16" />
      <path d="M4 6.5v12" />
      <path d="M20 6.5v12" />
    </svg>
  );
}
