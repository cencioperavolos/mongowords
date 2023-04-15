import { Dispatch, SetStateAction } from 'react'
import { Word, Expression } from '../types'

function EditWordComponent({
  word,
  setWord,
}: {
  word: Word | undefined
  setWord: Dispatch<SetStateAction<Word | undefined>>
}): JSX.Element {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          console.log({ word })
          fetch(`/api/word/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word }),
          })
            .then((response) => {
              return response.json()
            })
            .then((result) => {
              // setWord(JSON.parse(result))
              console.log('result ------>', result)
            })
            .catch((error) => {
              console.log(error)
            })
        }}
      >
        <label htmlFor='clautano'>Clautano</label>
        <input
          type='text'
          name='clautano'
          id='clautano'
          value={word?.clautano || ''}
          onChange={(e) => {
            setWord({ ...word, clautano: e.target.value })
          }}
        />
        <label htmlFor='alternativo'>Alternativo</label>
        <input
          type='text'
          name='alternativo'
          id='alternativo'
          value={word?.alternativo || ''}
          onChange={(e) => {
            setWord({ ...word, alternativo: e.target.value })
          }}
        />
        <label htmlFor='categoria'>Categoria</label>
        <input
          type='text'
          name='categoria'
          id='categoria'
          value={word?.categoria || ''}
          onChange={(e) => {
            setWord({ ...word, categoria: e.target.value })
          }}
        />
        <label htmlFor='traduzione'>Traduzione</label>
        <textarea
          name='traduzione'
          id='traduzione'
          cols={30}
          rows={10}
          value={word?.traduzione || ''}
          onChange={(e) => {
            setWord({ ...word, traduzione: e.target.value })
          }}
        ></textarea>
        <label htmlFor='voc_claut_1996'>Vocabolario Clautano 1996</label>
        <input
          type='checkbox'
          name='voc_claut:1996'
          id='voc_claut:1996'
          checked={word?.voc_claut_1996 || false}
          onChange={(e) =>
            setWord({ ...word, voc_claut_1996: !word?.voc_claut_1996 })
          }
        />
        <input type='submit' value='submit' />
      </form>
      <ExpressionsListComponent word={word} setWord={setWord} />
    </div>
  )
}

export default EditWordComponent

const ExpressionsListComponent = ({
  word,
  setWord,
}: {
  word: Word | undefined
  setWord: Dispatch<SetStateAction<Word | undefined>>
}) => {
  return (
    <div>
      {word?.expressions?.map((exp, index) => {
        return (
          <li key={index}>
            {/* <input
              type='text'
              value={exp.clautano || ''}
              onChange={(event) => {
                let newExpressions: Expression[] | undefined =
                  word.expressions?.map((exprex, idx) => {
                    // if (exprex._id && exp._id) {
                    //   if (exprex._id === exp._id) {
                    //     exp.clautano = event.target.value
                    //   }
                    // }
                    if (idx === index) {
                      exprex.clautano = event.target.value
                    }
                    return exprex
                  })

                setWord({ ...word, expressions: newExpressions })
              }}
            /> */}
            {exp.words?.map((w) => (
              <div key={w._id.toString()}>
                {w.clautano}{' '}
                <button
                  onClick={(ev) => {
                    const newWords = exp.words!.filter((wd) => wd._id !== w._id)
                    if (newWords.length === 0) {
                      console.log('elimino l espressione...')
                      fetch(`/api/expression/`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ expression: exp }),
                      })
                        .then((response) => {
                          return response.json()
                        })
                        .then((result) => {
                          console.log('result ------>', result)
                          const newExpressions = word.expressions?.filter(
                            (expr) => expr._id !== exp._id
                          )
                          setWord({ ...word, expressions: newExpressions })
                          /** removefrom view tooo */
                        })
                        .catch((error) => {
                          console.log(error)
                        })
                    }
                  }}
                >
                  remove
                </button>
              </div>
            ))}
            <hr />
          </li>
        )
      })}
      <button
        onClick={() => {
          const oldExpressions: Expression[] = word?.expressions ?? []
          const newExpressions: Expression[] = [...oldExpressions, {}]
          setWord({ ...word, expressions: newExpressions })
        }}
      >
        add
      </button>
    </div>
  )
}
