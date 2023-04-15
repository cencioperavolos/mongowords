import { Dispatch, FormEvent, SetStateAction, useState } from 'react'
import { Expression, Word } from '../../types'
import EditExpressionComponent from '../../components/editExpressionComponent'

export default function New() {
  const [expression, setExpression] = useState<Expression>({})

  return (
    <>
      <h3>Insert new Expression</h3>
      <EditExpressionComponent
        expression={expression}
        setExpression={setExpression}
      />
      <button
        disabled={expression.clautano ? expression.clautano.length < 3 : true}
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
  )
}
