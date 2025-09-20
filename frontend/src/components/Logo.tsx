import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 140, height = 30 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/images/branding/logo-primary.svg"
        alt="PlayazKlub"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
}