import type { ReactNode } from 'react';

interface CardProps {
  className?: string;
  title?: string;
  heading?: string;
  right?: ReactNode;
  children: ReactNode;
}

export function Card({ className = '', title, heading, right, children }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {(heading || right) && (
        <div className="card__head">
          <div>
            {title && <div className="card__title">{title}</div>}
            {heading && <h3>{heading}</h3>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
