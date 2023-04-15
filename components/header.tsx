import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

function Header() {
  const { data: session, status } = useSession()
  const [text, setText] = useState('')
  const router = useRouter()

  function onSubmitWord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    router.push(`/word/page/1?find=${text}`)
  }

  function onSubmitExpression(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    router.push(`/expression/page/1?find=${text}`)
  }

  return (
    <header>
      <h1>Forsa che te ghe a fa!</h1>
      {status === 'authenticated' ? (
        <h4> You are logged in as {session.user.name}</h4>
      ) : (
        <h4> You are not athenticated!</h4>
      )}
      <nav>
        <form action='GET' onSubmit={onSubmitWord}>
          <label htmlFor='search'>Search word: </label>
          <input
            type='text'
            name='search'
            id='search'
            value={text}
            onChange={(e) => {
              setText(e.target.value)
            }}
            placeholder='Text to search'
          />
          <button type='submit'>Search</button>
        </form>
        <Link href='/word/page/1'>Words</Link>
        <Link href='/word/new'>New W.</Link>
        <form action='GET' onSubmit={onSubmitExpression}>
          <label htmlFor='search'>Search expression: </label>
          <input
            type='text'
            name='search'
            id='search'
            value={text}
            onChange={(e) => {
              setText(e.target.value)
            }}
            placeholder='Text to search'
          />
          <button type='submit'>Search</button>
        </form>
        <Link href='/expression/page/1'>Expressions</Link>
        <Link href='/expression/new'>New E.</Link>
      </nav>
    </header>
  )
}

export default Header
