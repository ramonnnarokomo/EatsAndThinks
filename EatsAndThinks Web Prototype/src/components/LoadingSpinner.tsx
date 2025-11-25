export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-orange-300 opacity-20"></div>
    </div>
  </div>
);
