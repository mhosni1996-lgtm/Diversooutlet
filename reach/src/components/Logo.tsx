import { site } from '../content/site';

/** The original REACH logo, unaltered (extracted from the supplied brand artwork). */
export function Logo({ height, className }: { height: number; className?: string }) {
  const { logo } = site.brand;
  return (
    <img
      className={className}
      src={logo.src}
      srcSet={`${logo.src} 1x, ${logo.src2x} 2x`}
      width={Math.round((logo.width / logo.height) * height)}
      height={height}
      alt={logo.alt}
      decoding="async"
    />
  );
}
