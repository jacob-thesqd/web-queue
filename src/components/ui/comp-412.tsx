interface AvatarComponentProps {
  profilePictures?: string[];
  displayText?: string;
  displayContent?: React.ReactNode;
}

export default function AvatarComponent({ 
  profilePictures = [
    "/avatar-80-03.jpg",
    "/avatar-80-04.jpg", 
    "/avatar-80-05.jpg",
    "/avatar-80-06.jpg"
  ],
  displayText = "No account manager found",
  displayContent
}: AvatarComponentProps) {
  return (
    <div className="bg-background flex items-center rounded-full border py-1 px-1.5 shadow-sm h-10">
      <div className="flex -space-x-1.5">
        {profilePictures.map((src, index) => (
          <img
            key={index}
            className="ring-background rounded-full ring-1"
            src={src}
            width={30}
            height={30}
            alt={`Avatar ${index + 1}`}
          />
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
