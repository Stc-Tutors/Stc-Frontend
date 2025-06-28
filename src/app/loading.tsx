import { Loader2 } from "lucide-react"

export default function Loading() {
   return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 mx-auto mb-4"></div> */}
          <Loader2 className="w-24 h-24 text-blue-600 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    )
}