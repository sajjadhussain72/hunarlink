import Image from 'next/image'

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, image, className = "", size = "md" }: AvatarProps) {
  const sizeStyles = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-12 text-base",
  };

  const sizePixels = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (image) {
    return (
      <Image
        src={image}
        alt={name || "User"}
        width={sizePixels[size]}
        height={sizePixels[size]}
        className={`rounded-full object-cover ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#eaf5f0] font-bold text-[#2f765b] ${sizeStyles[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
