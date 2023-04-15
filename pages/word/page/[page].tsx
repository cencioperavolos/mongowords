import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Word } from '../../../types'

interface WordsPage {
  words: Word[]
  page: number
  pages: number
}

const word = () => {
  const [wordsPage, setWordsPage] = useState<WordsPage>({
    words: [],
    pages: 0,
    page: 0,
  })

  const router = useRouter()
  let page = router.query.page ?? 1
  let find = router.query.find
  let url: string
  if (find) {
    url = `/api/word/page?find=${find}`
  } else {
    url = `/api/word/page/${page}`
  }

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        setWordsPage({
          words: result.words,
          pages: result.pages,
          page: result.page,
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }, [url])

  return (
    <div>
      <h2> Page of words! </h2>
      <div>
        <Link href={`/word/page/${Number(wordsPage.page) - 1}`}>Previous</Link>
        <Link href={`/word/page/${Number(wordsPage.page) + 1}`}>Next</Link>
      </div>
      <ul>
        {wordsPage.words?.map((word) => (
          <li key={word._id.toString()}>
            {word.clautano}{' '}
            <Link href={`/word/${word._id.toString()}`}>{'>'}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default word
