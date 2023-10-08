import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'

function Header() {
  const { data: session, status } = useSession()
  const [wordText, setWordText] = useState('')
  const [exprText, setExprText] = useState('')
  const router = useRouter()

  function onSubmitWord(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    router.push(`/word/page/1?find=${wordText}`)
  }

  function onSubmitExpression(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    router.push(`/expression/page/1?find=${exprText}`)
  }

  return (
    <>
      <nav className='navbar bg-sugar px-2'>
        <button
          className='navbar-brand btn btn-dark'
          data-bs-toggle='offcanvas'
          data-bs-target='#offcanvasNavbar'
        >
          <Image
            src='/open-book-100x180.png'
            width='40'
            height='26'
            alt='OpenBook'
          ></Image>
        </button>
        <Link href='/' className='btn btn-outline-dark btn-sm'>
          M O N G O W O R D S
        </Link>
        <div className='dropdown'>
          {status === 'authenticated' ? (
            <>
              <a
                className='btn btn-dark px-4'
                dropdown-toggle='true'
                href='#'
                data-bs-toggle='dropdown'
              >
                <strong>
                  {session.user.name ? session.user.name[0] : '?'}
                </strong>
              </a>
              <ul className='dropdown-menu dropdown-menu-end'>
                <li>
                  <a className='dropdown-item' href='/user/userProfile'>
                    Profilo
                  </a>
                </li>
                <li>
                  <a
                    className='dropdown-item'
                    href='#'
                    onClick={() => {
                      signOut({ callbackUrl: '/' })
                    }}
                  >
                    Esci
                  </a>
                </li>
              </ul>
            </>
          ) : (
            <Link href='/api/auth/signin'>
              <button className='btn btn-dark'>accedi</button>
            </Link>
          )}
        </div>
      </nav>
      <div
        className='offcanvas offcanvas-start bg-sugar'
        tabIndex={-1}
        id='offcanvasNavbar'
        aria-labelledby='offcanvasNavbarLabel'
      >
        <div className='offcanvas-header'>
          <h5 className='offcanvas-title' id='offcanvasLabel'>
            Menù
          </h5>
          <button
            type='button'
            className='btn-close'
            data-bs-dismiss='offcanvas'
            aria-label='Close'
          ></button>
        </div>
        <div className='offcanvas-body bg-honey bg-gradient'>
          <form action='GET' onSubmit={onSubmitWord}>
            <div className='input-group mb-3'>
              <div className='form-floating flex-grow-1'>
                <input
                  type='text'
                  className='form-control'
                  name='search'
                  id='search'
                  placeholder='Parola'
                  value={wordText}
                  onChange={(e) => {
                    setWordText(e.target.value)
                  }}
                  aria-label='Ricerca parola'
                />
                <label htmlFor='search'>Cerca parola</label>
              </div>
              <button
                type='submit'
                data-bs-dismiss='offcanvas'
                className='btn btn-dark'
              >
                Cerca
              </button>
            </div>
          </form>
          <Link href='/word/new'>
            <button className='btn btn-dark' data-bs-dismiss='offcanvas'>
              Nuova parola
            </button>
          </Link>
          {/* <Link href='/word/page/1'>Words</Link> */}
          <hr />
          <form action='GET' onSubmit={onSubmitExpression}>
            <div className='input-group mb-3'>
              <div className='form-floating flex-grow-1'>
                <input
                  type='text'
                  className='form-control'
                  name='searchExpr'
                  id='searchExpr'
                  placeholder='Espressione'
                  value={exprText}
                  onChange={(e) => {
                    setExprText(e.target.value)
                  }}
                  aria-label='Ricerca espressione'
                />
                <label htmlFor='searchExpr'>Cerca espressione</label>
              </div>
              <button
                type='submit'
                data-bs-dismiss='offcanvas'
                className='btn btn-dark'
              >
                Cerca
              </button>
            </div>
          </form>
          <Link href='/expression/new'>
            <button className='btn btn-dark' data-bs-dismiss='offcanvas'>
              Nuova espressione
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Header
