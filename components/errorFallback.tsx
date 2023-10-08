import { Router, useRouter } from 'next/router'
import { FallbackProps } from 'react-error-boundary'

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const router = useRouter()

  return (
    <div className='d-flex align-items-center flex-column mt-5'>
      <p>Qualcosa è andato storto:</p>
      <div className='container overflow-auto'>
        <pre className='text-break text-danger bg-paper p-3'>
          {error.name}
          <hr />
          {error.message}
        </pre>
      </div>

      <button
        className='btn btn-dark'
        onClick={() => {
          router.reload()
        }}
      >
        Ripristina
      </button>
    </div>
  )
}
