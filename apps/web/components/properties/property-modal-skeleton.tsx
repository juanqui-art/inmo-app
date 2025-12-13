"use client";


/**
 * PropertyModalSkeleton
 * 
 * Loading state for the property preview modal.
 * Mirrors the layout of the actual property details to prevent layout shifts.
 */
export function PropertyModalSkeleton() {
  return (
    <div className="w-full h-[85vh] flex flex-col md:flex-row bg-background animate-pulse">
      {/* Left Column: Image Skeleton */}
      <div className="w-full md:w-[55%] lg:w-[60%] bg-oslo-gray-100 dark:bg-oslo-gray-900 h-[40vh] md:h-auto relative">
        <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-full opacity-20" />
        </div>
      </div>

      {/* Right Column: Details Skeleton */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col h-full bg-background">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="space-y-2">
                {/* Title */}
                <div className="h-8 w-3/4 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-lg" />
                
                {/* Location */}
                <div className="flex items-center gap-2">
                   <div className="h-4 w-4 rounded-full bg-oslo-gray-200 dark:bg-oslo-gray-800" />
                   <div className="h-4 w-1/2 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded" />
                </div>
              </div>

              {/* Price */}
              <div className="h-10 w-1/3 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-lg" />
            </div>

            <div className="h-px w-full bg-oslo-gray-100 dark:bg-oslo-gray-800" />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-oslo-gray-100 dark:bg-oslo-gray-900 rounded-xl" />
               ))}
            </div>

            {/* Description Lines */}
            <div className="space-y-2">
               <div className="h-4 w-full bg-oslo-gray-100 dark:bg-oslo-gray-900 rounded" />
               <div className="h-4 w-full bg-oslo-gray-100 dark:bg-oslo-gray-900 rounded" />
               <div className="h-4 w-2/3 bg-oslo-gray-100 dark:bg-oslo-gray-900 rounded" />
            </div>

            {/* Map Placeholder */}
            <div className="space-y-2">
               <div className="h-6 w-1/4 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded" />
               <div className="w-full h-64 bg-oslo-gray-100 dark:bg-oslo-gray-900 rounded-xl" />
            </div>

             {/* Agent Placeholder */}
             <div className="h-20 w-full bg-oslo-gray-100 dark:bg-oslo-gray-900 rounded-xl" />
             
             <div className="h-20" />
          </div>
        </div>

        {/* Bottom Actions Skeleton */}
        <div className="p-4 border-t border-border bg-background/95 sticky bottom-0 z-10 w-full mt-auto">
           <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-md" />
              <div className="h-10 bg-oslo-gray-200 dark:bg-oslo-gray-800 rounded-md" />
           </div>
        </div>
      </div>
    </div>
  );
}
