import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Word, Expression } from '../types'
import EditExpressionComponent from './editExpressionComponent'

function EditWordComponent({
  word,
  setWord,
}: {
  word: Word
  setWord: (word: Word) => void
}): JSX.Element {
  return (
    <>
      <label htmlFor='clautano' className='text-info'>
        Clautano
      </label>
      <input
        className='form-control'
        placeholder='parola clautana'
        type='text'
        name='clautano'
        id='clautano'
        value={word.clautano || ''}
        onChange={(e) => {
          setWord({ ...word, clautano: e.target.value })
        }}
      />
      <label htmlFor='alternativo' className='text-info'>
        Alternativo
      </label>
      <input
        className='form-control'
        placeholder='dizione alternativa'
        type='text'
        name='alternativo'
        id='alternativo'
        value={word.alternativo || ''}
        onChange={(e) => {
          setWord({ ...word, alternativo: e.target.value })
        }}
      />
      <label htmlFor='categoria' className='text-info'>
        Categoria
      </label>
      <input
        className='form-control'
        placeholder='es. sf per sinonimo femminile'
        type='text'
        name='categoria'
        id='categoria'
        value={word.categoria || ''}
        onChange={(e) => {
          setWord({ ...word, categoria: e.target.value })
        }}
      />
      <label htmlFor='traduzione' className='text-info'>
        Traduzione
      </label>
      <textarea
        className='form-control'
        placeholder='inserire qui la traduzione, non le espressioni correlate'
        name='traduzione'
        id='traduzione'
        rows={6}
        value={word.traduzione || ''}
        onChange={(e) => {
          setWord({ ...word, traduzione: e.target.value })
        }}
      ></textarea>
      <div className='form-check'>
        <input
          className='form-check-input'
          type='checkbox'
          id='voc_claut_1996'
          name='voc_claut_1996'
          checked={word.voc_claut_1996 ?? false}
          onChange={(e) => {
            setWord({ ...word, voc_claut_1996: e.target.checked })
          }}
        />
        <label
          className='form-check-label text-info mb-3'
          htmlFor='voc_claut_1996'
        >
          Vocabolario Clautano 1996
        </label>
      </div>
      <ExpressionsListComponent word={word} setWord={setWord} />
    </>
  )
}

export default EditWordComponent

const ExpressionsListComponent = ({
  word,
  setWord,
}: {
  word: Word
  setWord: (word: Word) => void
}) => {
  const [show, setShow] = useState<number>()

  return (
    <div className='text-info mb-3 ms-3'>
      <div className=' d-flex justify-content-center align-items-center mb-2'>
        <div className='me-3'>Espressioni collegate:</div>
        <button
          className='btn btn-sm btn-sugar2'
          onClick={() => {
            const oldExpressions: Expression[] = word!.expressions ?? []
            const newExpressions: Expression[] = [
              ...oldExpressions,
              {
                words: word._id
                  ? [{ _id: word._id!, clautano: word.clautano! }]
                  : [],
              },
            ]
            setWord({ ...word, expressions: newExpressions })
            setShow(newExpressions.length - 1)
          }}
        >
          aggiungi
        </button>
      </div>
      <div className='accordion ms-3' id='expressionsAccordion'>
        {word.expressions?.map((exp, index) => {
          return (
            <div key={index} className='accordion-item'>
              <h2 className='accordion-header d-flex' id={`header_${index}`}>
                <button
                  className='btn btn-sugar2 btn-small mx-1'
                  onClick={() => {
                    const cleanedExpressions = word.expressions!.filter(
                      (exp, idx) => (idx !== index ? exp : null)
                    )
                    setWord({ ...word, expressions: cleanedExpressions })
                  }}
                >
                  -
                </button>
                <button
                  className={`accordion-button ${
                    show === index ? '' : 'collapsed'
                  } `}
                  type='button'
                  data-bs-toggle='collapse'
                  data-bs-target={`#item_${index}`}
                >
                  {`${index + 1}. ${exp.clautano?.substring(0, 12) ?? ''}...`}
                </button>
              </h2>
              <div
                id={`item_${index}`}
                className={`accordion-collapse collapse ${
                  show === index ? 'show' : ''
                }`}
                data-bs-parent='#expressionsAccordion'
              >
                <div className='accordion-body'>
                  <EditExpressionComponent
                    key={index}
                    index={index}
                    expression={exp}
                    setExpression={(expression: Expression) => {
                      const newExpressions = word.expressions?.map(
                        (ex, idx) => {
                          if (idx === index) return { ...expression }
                          else return ex
                        }
                      )
                      setWord({ ...word, expressions: newExpressions })
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
