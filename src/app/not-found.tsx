import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-decorative text-medieval-gold">404</h1>
        <h2 className="text-3xl font-medieval text-medieval-parchment">
          Page Not Found
        </h2>
        <p className="text-medieval-parchment">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  )
}




