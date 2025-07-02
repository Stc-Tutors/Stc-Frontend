"use client";

import React, { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import Loader from '@/components/loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // const router = useRouter();
  // const { user, isLoading } = useUser();

  //  useEffect(() => {
  //   if (!isLoading && !user) {
  //     router.replace(ROUTES.AUTH.LOGIN);
  //   }
  // }, [isLoading, user, router]);

  // if (isLoading || (!user && typeof window !== "undefined")) {
  //   return (
  //     <Loader/>
  //   );
  // }

  return (
    <Suspense fallback={<Loader />}>
    <div className="flex-1 flex flex-col bg-gray-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto flex-1 w-full flex flex-col items-center py-8">
        {children}
      </div>
      
    </div>
    </Suspense>
  )
}
