"use client"

import Loading from "@/app/loading"
import { MoveLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Suspense, type ReactNode } from "react"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  onBack?: () => void
  showBackButton?: boolean
}

export default function AuthLayout({ title, subtitle, children, onBack, showBackButton = true }: AuthLayoutProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}


      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-0 pb-12">
        {showBackButton && (
          <div className="p-6">
            <Link
              href="/"
              className="text-[#3b5bdb] underline underline-offset-4 hover:text-[#38b6ff] transition-colors duration-200 flex items-center"
            >            
                <MoveLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
          </div>
        )}
        <div className="w-full max-w-md space-y-8 bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>

          {/* Form Content */}
          <Suspense fallback={<Loading />}>
            <div className="">{children}</div>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
