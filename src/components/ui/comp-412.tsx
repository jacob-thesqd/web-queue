import { PersonStanding } from "lucide-react"

interface AvatarComponentProps {
  profilePictures?: (string | React.ReactNode)[];
  displayText?: string;
  displayContent?: React.ReactNode;
}

export default function AvatarComponent({ 
  profilePictures = [
    <PersonStanding className="w-4 h-4" />,
  ],
  displayText = "No account manager found",
  displayContent
}: AvatarComponentProps) {
  return (
    <div className="bg-background flex items-center rounded-full border py-1 px-1.5 shadow-sm h-10">
      <div className="flex -space-x-1.5">
        {profilePictures.map((item, index) => (
          <div
            key={index}
            className="ring-background rounded-full ring-1 w-[30px] h-[30px] flex items-center justify-center"
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
