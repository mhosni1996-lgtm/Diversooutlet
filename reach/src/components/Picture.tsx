export function Picture({ base, alt, sizes, eager, width = 1024, height = 1024 }: { base: string; alt: string; sizes: string; eager?: boolean; width?: number; height?: number }) {
  return (
    <img
      src={`${base}-1024.webp`}
      srcSet={`${base}-640.webp 640w, ${base}-1024.webp 1024w`}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
