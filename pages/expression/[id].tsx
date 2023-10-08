import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Expression } from '../../types'
import EditExpressionComponent from '../../components/editExpressionComponent'
import Link from 'next/link'
import dayjs from 'dayjs'
import ConfirmModal from '../../components/confirmModal'
import { alertMessage } from '../../components/alertMessage'
import { useErrorBoundary } from 'react-error-boundary'

let restore: Expression

export default function expressionPage() {
  const router = useRouter()
  const { id } = router.query
  const { showBoundary } = useErrorBoundary()

  const [loading, setLoading] = useState(true)
  const [expression, setExpression] = useState<Expression | undefined>()
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    if (id) {
      fetch(`/api/expression/${id}`)
        .then((response) => {
          return response.json().then((result) => {
            if (response.status === 200) {
              if (result.length < 1) {
                console.log(
                  `ERROR LOADING EXPRESSION: expression id  ${id} not found`
                )
                router.push('/404')
              } else {
                setExpression(result[0])
                restore = structuredClone(result[0])
                setLoading(false)
              }
            } else {
              const newError = new Error(result.message)
              newError.name = result.name
              throw newError
            }
          })
          // }
        })
        .catch((error) => {
          console.log('Error loading expression: ', error)
          showBoundary(error)
        })
    }
  }, [id])

  if (loading) {
    return <div className='text-center'>loading...</div>
  }

  return (
    <>
      <ConfirmModal
        targetId='deleteExpressionModal'
        message={`Eliminare l'espressione "${expression?.clautano?.substring(
          0,
          10
        )}..." ?`}
        command={() => {
          setLoading(true)
          fetch('/api/expression', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: expression }),
          })
            .then((response) => {
              return response.json().then((result) => {
                if (response.status === 201 && result.deletedCount === 1) {
                  alertMessage(
                    `Espressione "${expression?.clautano?.substring(
                      0,
                      10
                    )}..." eliminata con successo`,
                    'success',
                    6000
                  )
                  router.push(
                    `/expression/page/1?find=${expression?.clautano?.substring(
                      0,
                      6
                    )}`
                  )
                } else if (
                  (response.status === 201 && result.deletedCount !== 1) ||
                  response.status === 401
                ) {
                  alertMessage(
                    `Impossibile eliminare l'espressione ${expression?.clautano?.substring(
                      0,
                      10
                    )}...' - ${result.message}`,
                    'danger'
                  )
                  setEdit(false)
                  setLoading(false)
                } else {
                  throw new Error(`ERROR - response status: ${response.status}`)
                }
                console.log('Result of expression delete: ', response, result)
              })
              if (!response.ok) console.log(response)
              return response.json()
            })

            .catch((error) => {
              console.log('Error on delete expression: ', error)
              showBoundary(error)
            })
        }}
      />

      <div className='d-flex justify-content-center align-items-end p-1 mb-3'>
        <h1 className='h6 pe-3 my-auto'>
          {edit ? 'M O D I F I C A' : 'D E T T A G L I O'} ESPRESSIONE
        </h1>
        <button
          className='btn btn-dark btn-sm'
          type='button'
          name='edit'
          id='edit'
          onClick={(e) => {
            {
              if (edit) {
                setExpression(restore)
              }
            }
            setEdit(!edit)
          }}
        >
          {edit ? <>annulla</> : <>modifica</>}
        </button>
      </div>

      {!edit ? (
        <>
          <Detail expression={expression} />
        </>
      ) : (
        <>
          <EditExpressionComponent
            index={0}
            expression={expression!}
            setExpression={setExpression}
          />
          <div className='d-flex justify-content-between mt-3'>
            <button
              data-bs-toggle='modal'
              data-bs-target='#deleteExpressionModal'
              className='btn btn-dark2 me-1'
            >
              elimina
            </button>
            <div>
              <button
                className='btn btn-sugar2 me-1'
                onClick={() => setExpression(restore)}
              >
                ripristina
              </button>
              <button
                className='btn btn-dark2'
                disabled={
                  expression?.clautano ? expression.clautano.length < 3 : true
                }
                onClick={() => {
                  if (!expression?.clautano || expression.clautano.length < 3) {
                    console.log(
                      "L'espressione clautana deve avere almeno tre lettere..."
                    )
                    alertMessage(
                      "L'espressione clautana deve avere almeno tre lettere...",
                      'danger',
                      6000
                    )
                    return
                  }
                  fetch(`/api/expression`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ expression }),
                  })
                    .then((response) => {
                      return response.json().then((result) => {
                        if (response.status === 201) {
                          setExpression(result)
                          setEdit(false)
                          alertMessage(
                            `Espressione "${expression?.clautano?.substring(
                              0,
                              10
                            )}..." salvata con successo.`,
                            'success',
                            6000
                          )
                        } else if (
                          response.status === 401 ||
                          response.status === 403
                        ) {
                          alertMessage(
                            `Impossibile salvare l'espressione "${expression?.clautano?.substring(
                              0,
                              10
                            )}..."' - ${result.message}`,
                            'danger'
                          )
                        } else {
                          throw new Error(
                            `ERROR - response status: ${response.status}`
                          )
                        }
                        console.log('Result of word save: ', response, result)
                      })
                    })
                    .catch((error) => {
                      console.log('Error on save expression', error)
                      showBoundary(error)
                    })
                }}
              >
                salva
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Detail({ expression }: { expression: Expression | undefined }) {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-md mb-3'>
          <span className='small text-info'> espressione clautana:</span>
          <h1 className='h3'>{expression?.clautano}</h1>
          <span className='small text-info'>traduzione italiana:</span>
          <h1 className='h3'>{expression?.italiano}</h1>
          {expression?.voc_claut_1996 && (
            <div className='my-3'>
              <span className='small text-info'>tratta da</span>{' '}
              <cite>Vocabolario Clautano 1996</cite>
            </div>
          )}
          <span className='small text-info'>parole collegate:</span>
          {expression?.words?.map((wd) => {
            return (
              <Link key={wd._id.toString()} href={`/word/${wd._id}`}>
                <button className='btn btn-outline-info btn-sm m-1'>
                  {wd.clautano}
                </button>
              </Link>
            )
          })}
        </div>

        <div className='col-md'>
          <div className='card'>
            <div className='card-body small bg-paper bg-gradient'>
              <p>
                inserita il{' '}
                {dayjs(expression?.created?.date).format('DD MMM YYYY')}
                <br />
                da {expression?.created?.username}
              </p>
              {expression?.updated && (
                <p>
                  ultima modifica il{' '}
                  {dayjs(expression?.updated?.date).format('DD MMM YYYY')}
                  <br />
                  da {expression?.updated?.username}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
