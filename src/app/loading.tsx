// Server component for immediate loading state
export default function Loading() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-20 bg-transparent max-w-4xl">
        <div className="text-center text-gray-500 py-8">
          <p>Nothing to see here yet...</p>
        </div>
      </div>
    </div>
  );
} 