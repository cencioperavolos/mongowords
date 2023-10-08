import { useState } from 'react'
import EditWordComponent from '../../components/editWordComponent'
import { Word } from '../../types'
import { alertMessage } from '../../components/alertMessage'
import router from 'next/router'
import { useErrorBoundary } from 'react-error-boundary'

function New() {
  const [word, setWord] = useState<Word>({})
  const { showBoundary } = useErrorBoundary()

  return (
    <div>
      <div className='d-flex justify-content-center align-items-end p-1 my-1'>
        <h1 className='h6 text-dark pe-3 my-auto'>N U O V A P A R O L A</h1>
      </div>
      <EditWordComponent word={word} setWord={setWord}></EditWordComponent>
      <div className='d-flex justify-content-between'>
        <button
          className='btn btn-sugar2'
          type='button'
          name='edit'
          id='edit'
          onClick={(e) => {
            setWord({})
          }}
        >
          resetta
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
            console.log(checkExpressions)
            if (checkExpressions === false) return

            fetch(`/api/word/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ word }),
            })
              .then((response) => {
                return response.json().then((result) => {
                  if (response.status === 201) {
                    console.log('wordInserted ------>', result)
                    router.push(`/word/${result.insertedId}`)
                  } else if (response.status === 401) {
                    alertMessage(
                      `Impossibile salvare la parola ${word?.clautano}' - ${result.message}`,
                      'danger'
                    )
                    // router.reload()
                  } else {
                    throw new Error(
                      `ERROR - response status: ${response.status}`
                    )
                  }
                })
              })
              .catch((error) => {
                console.log('Error on insert Word: ', error)
                showBoundary(error)
              })
          }}
        >
          salva
        </button>
      </div>
    </div>
  )
}

export default New
