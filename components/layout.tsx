import Footer from './footer'
import Header from './header'
import { ReactNode, StrictMode } from 'react'
import Head from 'next/head'

interface Node {
  children?: ReactNode
}

const Layout = ({ children }: Node) => {
  return (
    <>
      <Head>
        <title>MongoWordsApp</title>
        <link rel='icon' href='/favicon.png' />
      </Head>
      <Header />
      {/* <StrictMode> */}
      <main>{children}</main>
      {/* </StrictMode> */}
      <Footer />
    </>
  )
}

export default Layout
