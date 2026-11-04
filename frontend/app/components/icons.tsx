import React from "react";

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-4 w-4"}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const SparkIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 17v4M17 19h4" /></Svg>
);
export const PlusIcon = (p: IconProps) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const DatabaseIcon = (p: IconProps) => (
  <Svg {...p}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></Svg>
);
export const ClockIcon = (p: IconProps) => (<Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>);
export const MenuIcon = (p: IconProps) => (<Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>);
export const CloseIcon = (p: IconProps) => (<Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>);
export const ChevronIcon = (p: IconProps) => (<Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>);
export const PanelIcon = (p: IconProps) => (<Svg {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></Svg>);
export const SendIcon = (p: IconProps) => (<Svg {...p}><path d="M5 12l14-7-5 14-2.5-5.5z" /></Svg>);
export const CopyIcon = (p: IconProps) => (<Svg {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 012-2h9" /></Svg>);
export const CheckIcon = (p: IconProps) => (<Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>);
export const AlertIcon = (p: IconProps) => (<Svg {...p}><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17.5v.01" /></Svg>);
export const TableIcon = (p: IconProps) => (<Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 10v10" /></Svg>);
export const CodeIcon = (p: IconProps) => (<Svg {...p}><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" /></Svg>);
export const SunIcon = (p: IconProps) => (<Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></Svg>);
export const MoonIcon = (p: IconProps) => (<Svg {...p}><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" /></Svg>);
export const MonitorIcon = (p: IconProps) => (<Svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></Svg>);
export const RenaGlyph = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={p.className ?? "h-4 w-4"} aria-hidden="true">
    <g transform="translate(-1.2 -0.7)">
      <path d="M7 20V4h5a4 4 0 010 8H7" />
      <path d="M11 12l5.2 6.2" />
      <circle cx="17.4" cy="19.5" r="2" fill="currentColor" stroke="none" />
    </g>
  </svg>
);
