import type { ElementType } from 'react';

/** Headline whose complete lines rise from behind a mask. Words are never split, so Arabic shaping is preserved. */
export function RevealTitle({
  as: Tag = 'h2',
  lines,
  accent,
  className,
  id,
  trigger = 'scroll',
}: {
  as?: ElementType;
  lines: readonly string[];
  accent?: string;
  className?: string;
  id?: string;
  trigger?: 'scroll' | 'load';
}) {
  return (
    <Tag className={className} id={id} data-reveal={trigger}>
      {lines.map((line, i) => {
        const at = accent ? line.lastIndexOf(accent) : -1;
        return (
          <span className="mask-line" key={i}>
            <span>
              {at >= 0 ? (
                <>
                  {line.slice(0, at)}
                  <span className="accent-word">{accent}</span>
                  {line.slice(at + (accent?.length ?? 0))}
                </>
              ) : (
                line
              )}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
