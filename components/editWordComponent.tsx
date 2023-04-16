import { Dispatch, SetStateAction } from 'react'
import { Word, Expression } from '../types'
import EditExpressionComponent from './editExpressionComponent'

function EditWordComponent({
  word,
  setWord,
}: {
  word: Word | undefined
  setWord: Dispatch<SetStateAction<Word | undefined>>
}): JSX.Element {
  return (
    <div>
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
      {/* </form> */}
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
      Elenco espressioni:
      <hr />
      {word?.expressions?.map((exp, index) => {
        return (
          <li key={index}>
            <EditExpressionComponent
              expression={exp}
              setExpression={(expression) => {
                const newExpressions = word.expressions?.map((ex) => {
                  if (ex._id === expression._id) return { ...expression }
                  else return ex
                })
                setWord({ ...word, expressions: newExpressions })
              }}
            />
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
