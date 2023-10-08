import Footer from './footer'
import Header from './header'
import { ReactNode, StrictMode } from 'react'
import Head from 'next/head'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './errorFallback'
import { useRouter } from 'next/router'

interface Node {
  children?: ReactNode
}

const Layout = ({ children }: Node) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>MongoWordsApp</title>
        <link rel='icon' href='/favicon.png' />
      </Head>

      <div className='min-vh-100 bg-light'>
        <header className='sticky-top'>
          <Header />
        </header>
        <div id='alertPlaceholderId'></div>
        <ErrorBoundary FallbackComponent={ErrorFallback} key={router.pathname}>
          <main className='container pb-3'> {children}</main>
        </ErrorBoundary>
        <div style={{ height: 20 }}></div>
        <footer className='fixed-bottom'>
          <Footer />
        </footer>
      </div>
    </>
  )
}

export default Layout
