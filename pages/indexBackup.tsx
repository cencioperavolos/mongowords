import Head from 'next/head'
import clientPromise from '../lib/mongodb'
import { InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

const title = "I'm learning..."
const list = ['uno', 'due', 'tre']

export default function Home() {
  const { data: session, status } = useSession()
  console.log('lato client', { session }, status)

  const [text, setText] = useState<string>('')

  useEffect(() => {
    // Perform localStorage action
    setText(localStorage.getItem('textInserted') ?? 'pirla')
  }, [])

  useEffect(() => {
    localStorage.setItem('textInserted', text as string)
  }, [text])

  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <h1>{text} Pirla!</h1>

        <ul>
          {list.map((element) => (
            <Item key={element} desc={element}></Item>
          ))}
        </ul>

        {status === 'authenticated' ? (
          <h2> You are authenticated</h2>
        ) : (
          <h3>You aren't authenticated</h3>
        )}
        <p>
          <label htmlFor='text'>Scrif alc uqui!</label>
          <input
            id='text'
            type='text'
            value={text as string}
            onChange={(event) => {
              setText(event.target.value)
            }}
          />
        </p>
      </main>

      <footer>
        Powered by <img width={70} src='/vercel.svg' alt='Vercel Logo' />
      </footer>
    </div>
  )
}

const Item = ({ desc }: { desc: string }) => (
  <li key={desc}>
    Item: <strong>{desc}</strong> ###
  </li>
)
