import { SessionProvider } from 'next-auth/react'
import Layout from '../components/layout'
import { useEffect } from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/scss/customBootstrap.scss'
import '../styles/global.css'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])

  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}
