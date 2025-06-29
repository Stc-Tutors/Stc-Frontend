import { Loader2 } from 'lucide-react'

const Loader = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-24 h-24 text-blue-600 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
  )
}

export default Loader