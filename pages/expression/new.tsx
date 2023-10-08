import { useState } from 'react'
import { Expression, Word } from '../../types'
import EditExpressionComponent from '../../components/editExpressionComponent'
import { useRouter } from 'next/router'
import { useErrorBoundary } from 'react-error-boundary'
import { alertMessage } from '../../components/alertMessage'

export default function New() {
  const router = useRouter()
  const [expression, setExpression] = useState<Expression>({})
  const { showBoundary } = useErrorBoundary()

  return (
    <>
      <h1 className='h6 my-2 text-center text-dark'>
        N U O V A E S P R E S S I O N E
      </h1>
      <EditExpressionComponent
        index={0}
        expression={expression}
        setExpression={setExpression}
      />
      <div className='d-flex justify-content-between'>
        <button
          className='btn btn-sugar2'
          type='button'
          name='edit'
          id='edit'
          onClick={(e) => {
            setExpression({})
          }}
        >
          resetta
        </button>

        <button
          className='btn btn-dark2'
          // disabled={expression.clautano ? expression.clautano.length < 3 : true}
          onClick={() => {
            if (!expression?.clautano || expression.clautano.length < 3) {
              alertMessage(
                "L'espressione clautana deve avere almeno tre lettere...",
                'danger',
                6000
              )
              console.log(
                "L'espressione clautana deve avere almeno tre lettere..."
              )
              return
            }
            fetch(`/api/expression`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ expression }),
            }).then((response) => {
              return response
                .json()
                .then((result) => {
                  if (response.status === 201) {
                    console.log('expressionInserted ------>', result)
                    router.push(`/expression/${result.insertedId}`)
                  } else if (response.status === 401) {
                    alertMessage(
                      `Impossibile salvare l'espressione ${expression?.clautano?.substring(
                        0,
                        10
                      )}...' - ${result.message}`,
                      'danger'
                    )
                  } else {
                    throw new Error(
                      `ERROR - response status: ${response.status}`
                    )
                  }
                })
                .catch((error) => {
                  console.log('Error on insert expression: ', error)
                  showBoundary(error)
                })
            })
          }}
        >
          salva
        </button>
      </div>
    </>
  )
}
