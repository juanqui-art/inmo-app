
import Image from "next/image";

interface SocialIconProps {
  name: "facebook" | "instagram" | "tiktok";
  className?: string;
}

export function SocialIcon({ name, className }: SocialIconProps) {
  return (
    <Image
      src={`/social_icons/${name}.svg`}
      alt={`${name} icon`}
      width={24}
      height={24}
      className={className}
    />
  );
}
