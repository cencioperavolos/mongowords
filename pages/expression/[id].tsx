import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Expression } from '../../types'

import EditExpressionComponent from '../../components/editExpressionComponent'
import Link from 'next/link'

let restore: Expression

export default function expressionPage() {
  const router = useRouter()
  const { id } = router.query

  const [loading, setLoading] = useState(true)
  const [expression, setExpression] = useState<Expression | undefined>()
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    if (id) {
      fetch(`/api/expression/${id}`)
        .then((response) => {
          return response.json()
        })
        .then((result) => {
          console.log('result---- ', result)
          setExpression(result[0])
          restore = structuredClone(result[0])
          console.log({ restore })
          setLoading(false)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [id])

  return (
    <div>
      <h2>
        Single expression!
        <input
          type='checkbox'
          name='edit'
          id='edit'
          onChange={(e) => {
            setEdit(e.target.checked)
          }}
        />
      </h2>

      {!loading && edit ? (
        <>
          <EditExpressionComponent
            expression={expression!}
            setExpression={setExpression}
          />
          <button
            disabled={
              expression?.clautano ? expression.clautano.length < 3 : true
            }
            onClick={() => {
              fetch(`/api/expression`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression }),
              })
                .then((response) => {
                  return response.json()
                })
                .then((result) => {
                  // setWord(JSON.parse(result))
                  console.log('expressionInserted ------>', result)
                })
                .catch((error) => {
                  console.log(error)
                })
            }}
          >
            Save Expression
          </button>
          <button
            onClick={() => {
              setExpression(restore)
            }}
          >
            Reset
          </button>
        </>
      ) : (
        <>
          <p>
            <b>{expression?.clautano}</b>
          </p>
          <p>{expression?.italiano}</p>
          <span>peraulis: </span>
          {expression?.words?.map((w) => (
            <span>
              <Link href={`/word/${w._id}`}>{w.clautano}</Link>{' '}
            </span>
          ))}
        </>
      )}
    </div>
  )
}
