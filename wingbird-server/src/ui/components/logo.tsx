import type { JSX } from "hono/jsx";

type LogoProps = {
  class?: string;
  style?: string | Record<string, string>;
  [key: string]: any;
};

export default function Logo({
  class: className = "h-7 w-7",
  style,
  ...props
}: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Wingbird Logo"
      class={className}
      style={style}
      {...props}
    />
  );
}
