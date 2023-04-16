import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Expression } from '../../../types'

interface ExpressionsPage {
  expressions: Expression[]
  page: number
  pages: number
}

export default function expressionPage() {
  const [expressionsPage, setExpressionsPage] = useState<ExpressionsPage>({
    expressions: [],
    pages: 0,
    page: 0,
  })

  const router = useRouter()
  let page = router.query.page ?? 1
  let find = router.query.find
  let url: string

  url = `/api/expression/page/${page}?find=${find ?? ''}`

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        console.log(result)
        setExpressionsPage({
          expressions: result.expressions,
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
      <h2> Page of expressions! </h2>
      <div>
        <Link
          href={`/expression/page/${Number(expressionsPage.page) - 1}?find=${
            find ?? ''
          }`}
        >
          Previous
        </Link>
        <Link
          href={`/expression/page/${Number(expressionsPage.page) + 1}?find=${
            find ?? ''
          }`}
        >
          Next
        </Link>
      </div>
      <ul>
        {expressionsPage.expressions?.map((expression) => (
          <li key={expression._id!.toString()}>
            {expression.clautano}{' '}
            <Link href={`/expression/${expression._id!.toString()}`}>
              {'>'}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
