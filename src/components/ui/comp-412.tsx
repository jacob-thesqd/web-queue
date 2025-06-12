import { PersonStanding } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarComponentVariants = cva(
  "flex items-center rounded-full py-1 px-1.5 shadow-sm h-10",
  {
    variants: {
      variant: {
        default: "bg-background border",
        glass: "bg-white/40 shadow-md ring-1 ring-black/5 backdrop-blur-md border-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AvatarComponentProps extends VariantProps<typeof avatarComponentVariants> {
  profilePictures?: (string | React.ReactNode)[];
  displayText?: string;
  displayContent?: React.ReactNode;
  className?: string;
}

export default function AvatarComponent({ 
  profilePictures = [
    <PersonStanding className="w-4 h-4" />,
  ],
  displayText = "No account manager found",
  displayContent,
  variant,
  className,
}: AvatarComponentProps) {
  return (
    <div className={cn(avatarComponentVariants({ variant }), className)}>
      <div className="flex -space-x-1.5">
        {profilePictures.map((item, index) => (
          <div
            key={index}
            className={cn(
              "rounded-full ring-1 w-[30px] h-[30px] flex items-center justify-center",
              variant === 'glass' ? 'ring-black/5' : 'ring-background'
            )}
          >
            {typeof item === 'string' ? (
              <img
                className="rounded-full w-full h-full object-cover"
                src={item}
                width={30}
                height={30}
                alt={`Avatar ${index + 1}`}
              />
            ) : (
              item
            )}
          </div>
        ))}
      </div>
      <p className="text-muted-foreground px-2 text-xs">
        {displayContent ? (
          displayContent
        ) : displayText?.includes('60K+') ? (
          <>
            Trusted by <strong className="text-foreground font-medium">60K+</strong>{" "}
            developers.
          </>
        ) : (
          displayText
        )}
      </p>
    </div>
  )
}
