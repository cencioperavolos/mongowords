import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Word } from '../../types'
import EditWordComponent from '../../components/editWordComponent'
import Link from 'next/link'
import dayjs from 'dayjs'
import { useErrorBoundary } from 'react-error-boundary'
import { alertMessage } from '../../components/alertMessage'
import ConfirmModal from '../../components/confirmModal'

let restore: Word

const wordPage = () => {
  const router = useRouter()
  const { id } = router.query

  const [loading, setLoading] = useState(true)
  const [word, setWord] = useState<Word | undefined>()
  const [edit, setEdit] = useState(false)
  const { showBoundary } = useErrorBoundary()

  useEffect(() => {
    if (id) {
      fetch(`/api/word/${id}`)
        .then((response) => {
          return response.json().then((result) => {
            if (response.status === 200) {
              if (result.length < 1) {
                console.log(`ERROR LOADING WORD: word id  ${id} not found`)
                router.push('/404')
              } else {
                setWord(result[0])
                restore = structuredClone(result[0])
                setLoading(false)
              }
            } else {
              const newError = new Error(result.message)
              newError.name = result.name
              throw newError
            }
          })
        })
        .catch((error) => {
          showBoundary(error)
        })
    }
  }, [id])

  if (loading) {
    return <div className='text-center mt-5'>loading...</div>
  }

  return (
    <>
      <ConfirmModal
        targetId='deleteWordModal'
        message={`Eliminare la parola "${word?.clautano}"?`}
        command={() => {
          setLoading(true)
          fetch('/api/word', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: word }),
          })
            .then((response) => {
              return response.json().then((result) => {
                if (response.status === 201 && result.deletedCount === 1) {
                  alertMessage(
                    `Parola "${word?.clautano}" eliminata con successo`,
                    'success',
                    6000
                  )
                  router.push(`/word/page/1?find=${word?.clautano}`)
                } else if (
                  (response.status === 201 && result.deletedCount !== 1) ||
                  response.status === 401
                ) {
                  alertMessage(
                    `Impossibile eliminare la parola ${word?.clautano}' - ${result.message}`,
                    'danger'
                  )
                  setEdit(false)
                  setLoading(false)
                } else {
                  throw new Error(`ERROR - response status: ${response.status}`)
                }
                console.log('Result of word delete: ', response, result)
              })
            })
            .catch((error) => {
              console.log('Error on delete word: ', error)
              showBoundary(error)
            })
        }}
      />

      <div className='d-flex justify-content-center align-items-end p-1 mb-3'>
        <h1 className='h6 pe-3 my-auto'>
          {edit ? 'M O D I F I C A' : 'D E T T A G L I O'} P A R O L A
        </h1>
        <button
          className='btn btn-dark btn-sm'
          type='button'
          name='edit'
          id='edit'
          onClick={(e) => {
            {
              if (edit) {
                setWord(restore)
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
          <Detail word={word} />
        </>
      ) : (
        <>
          <EditWordComponent word={word!} setWord={setWord} />
          <div className='d-flex justify-content-between'>
            <button
              data-bs-toggle='modal'
              data-bs-target='#deleteWordModal'
              className='btn btn-dark2 me-1'
            >
              elimina
            </button>
            <div>
              <button
                className='btn btn-sugar2 me-1'
                onClick={() => setWord(restore)}
              >
                ripristina
              </button>
              <button
                className='btn btn-dark2'
                onClick={() => {
                  if (!word?.clautano || word.clautano.length < 2) {
                    alertMessage(
                      'La parola deve avere almeno due lettere...',
                      'danger',
                      6000
                    )
                    console.log('La parola deve avere almeno due lettere...')
                    return
                  }
                  const checkExpressions = word?.expressions?.every((exp) => {
                    if (!exp.clautano || exp.clautano.length < 3) {
                      console.log(
                        "L'espressione clautana deve avere almeno tre lettere..."
                      )
                      alertMessage(
                        "L'espressione clautana deve avere almeno tre lettere...",
                        'danger',
                        6000
                      )
                      return false
                    }
                    return true
                  })
                  if (!checkExpressions) return

                  fetch(`/api/word/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word }),
                  })
                    .then((response) => {
                      return response.json().then((result) => {
                        if (response.status === 201) {
                          // setWord(result.value)
                          setWord(result)
                          setEdit(false)
                          alertMessage(
                            `Parola "${word?.clautano?.substring(
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
                            `Impossibile salvare la parola ${word?.clautano}' - ${result.message}`,
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
                      console.log('Error on save word: ', error)
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

export default wordPage

function Detail({ word }: { word: Word | undefined }) {
  return (
    <div className='container'>
      <div className='row'>
        <div className='col-md'>
          <span className='small text-info'> parola:</span>
          <h1 className='h2'>
            {word?.clautano} <br />
            {word?.alternativo}
          </h1>
          <span className='small text-info'>traduzione:</span>
          <div className='h2' style={{ whiteSpace: 'pre-wrap' }}>
            <i className='h5'>{word?.categoria}</i> {word?.traduzione}
            <ul className='list-unstyled mt-2'>
              {word?.expressions?.map((exp, i) => (
                <li key={i}>
                  <Link
                    href={`/expression/${exp._id}`}
                    className='text-decoration-none'
                  >
                    <em>{exp.clautano}</em>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {word?.voc_claut_1996 && (
            <div className='my-3'>
              <span className='small text-info'>tratta da</span>{' '}
              <cite>Vocabolario Clautano 1996</cite>
            </div>
          )}
        </div>

        <div className='col-md'>
          <div className='card border-paper'>
            <div className='card-body small bg-paper bg-gradient'>
              <p>
                inserita il {dayjs(word?.created?.date).format('DD MMM YYYY')}
                <br />
                da {word?.created?.username}
              </p>
              {word?.updated && (
                <p>
                  ultima modifica il{' '}
                  {dayjs(word?.updated?.date).format('DD MMM YYYY')}
                  <br />
                  da {word?.updated?.username}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
