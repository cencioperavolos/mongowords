import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Expression } from '../../../types'
import Paginator from '../../../components/paginator'
import { useErrorBoundary } from 'react-error-boundary'

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
  const [loading, setLoading] = useState(true)
  const { showBoundary } = useErrorBoundary()

  const router = useRouter()
  let page = router.query.page ?? 1
  let find = router.query.find
    ? router.query.find instanceof Array
      ? router.query.find[0]
      : router.query.find
    : ''
  let url: string

  url = `/api/expression/page/${page}?find=${find ?? ''}`

  useEffect(() => {
    fetch(url)
      .then((response) => {
        return response.json().then((result) => {
          if (response.status === 200) {
            setExpressionsPage({
              expressions: result.expressions,
              pages: result.pages,
              page: result.page,
            })
            setLoading(false)
          } else {
            const newError = new Error(result.message)
            newError.name = result.name
            throw newError
          }
        })
      })
      .catch((error) => {
        console.log('Error on loading Expressions page: ', error)
        showBoundary(error)
      })
  }, [url])

  return (
    <div>
      <h1 className='h6 text-center text-dark my-2'>
        E S P R E S S I O N I C L A U T A N E
      </h1>
      {loading && <div className='text-center mt-5'>loading...</div>}
      {!loading && expressionsPage.expressions.length < 1 && (
        <div className='text-center mt-5'>nessuna espressione trovata</div>
      )}
      {!loading && expressionsPage.expressions.length > 0 && (
        <>
          <Paginator
            pageProps={{
              tipo: 'expression',
              page: expressionsPage.page,
              pages: expressionsPage.pages,
              find: find,
            }}
          />
          <ul className='list-unstyled mt-4'>
            {expressionsPage.expressions?.map((expression) => (
              <li key={expression._id!.toString()} className='pb-2'>
                <Link
                  href={`/expression/${expression._id!.toString()}`}
                  className='fw-bold text-decoration-none'
                >
                  {expression.clautano}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
