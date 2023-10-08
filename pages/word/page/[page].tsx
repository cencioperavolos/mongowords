import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Word } from '../../../types'
import Paginator from '../../../components/paginator'
import { useErrorBoundary } from 'react-error-boundary'

interface WordsPage {
  words: Word[]
  page: number
  pages: number
}

const wordsPage = () => {
  const [wordsPage, setWordsPage] = useState<WordsPage>({
    words: [],
    pages: 0,
    page: 0,
  })

  const { showBoundary } = useErrorBoundary()
  const router = useRouter()
  let page = router.query.page ?? 1
  let find = router.query.find
  let url: string
  if (find) {
    url = `/api/word/page?find=${find}`
  } else {
    url = `/api/word/page/${page}`
  }
  console.log('Rendering...', url, ' - ', router.isReady)

  async function fetchData() {
    console.log('fetching..........................')
    fetch(url)
      .then((response) => {
        return response.json().then((result) => {
          if (response.status === 200) {
            console.log('Effect loaded url: ', url)
            setWordsPage({
              words: result.words,
              pages: result.pages,
              page: result.page,
            })
          } else {
            const newError = new Error(result.message)
            newError.name = result.name
            throw newError
          }
        })
      })
      .catch((error) => {
        console.log('Error on loading Words page:', error)
        showBoundary(error)
      })
  }

  let previousLetter: string
  let collator = new Intl.Collator('it', { sensitivity: 'base' })

  useEffect(() => {
    if (router.isReady) {
      fetchData()
    }
  }, [router.isReady, url])

  return (
    <div>
      <h1 className='h6 text-center text-dark mt-2'>
        P A R O L E C L A U T A N E
      </h1>
      <Paginator
        pageProps={{
          tipo: 'word',
          page: wordsPage.page,
          pages: wordsPage.pages,
          find: '',
        }}
      />

      <ul className='list-unstyled mt-4'>
        {wordsPage.words?.map((word, i) => {
          if (i === 0) {
            previousLetter = word.clautano![0]
            return
          }
          let x = collator.compare(word.clautano![0], previousLetter) !== 0
          if (x) {
            previousLetter = word.clautano![0]
          }
          return (
            <li key={word._id!.toString()}>
              {x && (
                <h1
                  // key={`${word._id!.toString()}_bis`}
                  className='h1 text-center'
                >
                  {previousLetter.toUpperCase()}
                </h1>
              )}
              <div className='pb-2' key={word._id!.toString()}>
                <Link href={`/word/${word._id!.toString()}`} legacyBehavior>
                  <a className='fw-bold text-decoration-none'>
                    {word.clautano}
                  </a>
                </Link>{' '}
                {word.alternativo} {word.isVerified ?? '***'}
                <div className='ms-2' style={{ whiteSpace: 'pre-wrap' }}>
                  <span className='fst-italic fw-semibold me-2'>
                    {word.categoria}
                  </span>
                  {word.traduzione}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default wordsPage
