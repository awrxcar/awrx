interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: 'text-xl tracking-[0.3em]',
    md: 'text-2xl tracking-[0.4em]',
    lg: 'text-5xl tracking-[0.5em]',
    xl: 'text-7xl md:text-8xl tracking-[0.5em]',
  };
  return (
    <span className={`font-display font-bold ${sizes[size]} ${className}`}>
      <span className="text-gradient">AWRX</span>
    </span>
  );
}
