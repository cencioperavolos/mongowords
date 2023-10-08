import { Html, Head, Main, NextScript } from 'next/document'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Document() {
  const router = useRouter()

  console.log('rendering....', router.isReady)

  useEffect(() => {
    console.log('effecting...')
  }, [])

  return <div>ciao</div>
}
