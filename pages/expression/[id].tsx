import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Expression, Word } from '../../types'
import { ObjectId } from 'mongodb'
import EditWordComponent from '../../components/editWordComponent'
import EditExpressionComponent from '../../components/editExpressionComponent'

const wordDefault = {
  _id: undefined,
  clautano: '',
  alternativo: '',
  categoria: '',
  traduzione: '',
  voc_claut_1996: false,
  isVerified: false,
  expressions: [],
  created: undefined,
  updated: undefined,
}

export default function expressionPage() {
  const router = useRouter()
  const { id } = router.query

  const [loading, setLoading] = useState(true)
  const [expression, setExpression] = useState<Expression>()
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
        </>
      ) : (
        <>
          <p>
            <b>{expression?.clautano}</b>
          </p>
          <p>{expression?.italiano}</p>
          <span>peraulis: </span>
          {expression?.words?.map((w) => (
            <span>{w.clautano} </span>
          ))}
        </>
      )}
    </div>
  )
}
