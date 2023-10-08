import { Dispatch, FormEvent, SetStateAction, useState } from 'react'
import { Expression, Word } from '../types'
import { useErrorBoundary } from 'react-error-boundary'
import { ObjectId } from 'mongodb'

/** return JSX toedit Expression 
 @param expression
 @param setExpression
  as state for the component
*/
export default function EditExpressionComponent({
  index,
  expression,
  setExpression,
}: {
  index: number
  expression: Expression
  setExpression: (expression: Expression, index: number) => void
}) {
  /** state for manage expression's words */
  const [wordsList, setWordsList] = useState<Word[]>([])
  // const showList = wordsList.length > 0 ? true : false

  function handleAddWord(word: Word) {
    if (
      expression.words &&
      expression.words.findIndex((elem) => {
        return elem._id === word._id
      }) >= 0
    ) {
      return
    } else {
      const wordToAdd = {
        _id: word._id!,
        clautano: word.clautano!,
      }
      const newWords = expression.words
        ? [...expression.words, wordToAdd]
        : [wordToAdd]
      setExpression({ ...expression, words: newWords }, index)
      setWordsList([])
    }
  }

  function handleRemoveWord(word: Word) {
    const newWords = expression.words!.filter((w) => w._id !== word._id)
    setExpression({ ...expression, words: newWords }, index)
    setWordsList([])
  }

  return (
    <>
      <label htmlFor='clautano' className='text-info'>
        Espressione clautana:
      </label>
      <textarea
        id='clautano'
        name='clautano'
        placeholder="Scrivi qui l'espressione in dialetto"
        className='form-control'
        value={expression.clautano ?? ''}
        onChange={(e) => {
          setExpression({ ...expression, clautano: e.target.value }, index)
        }}
      ></textarea>
      <label htmlFor='italiano' className='text-info'>
        Espressione clautana:{' '}
      </label>
      <textarea
        id='italiano'
        name='italiano'
        placeholder='Scrivi qui la traduzione italiana'
        className='form-control'
        value={expression.italiano ?? ''}
        onChange={(e) => {
          setExpression({ ...expression, italiano: e.target.value }, index)
        }}
      ></textarea>
      <div className='form-check'>
        <input
          className='form-check-input'
          type='checkbox'
          id='voc_claut_1996'
          name='voc_claut_1996'
          checked={expression.voc_claut_1996 ?? false}
          onChange={(e) => {
            setExpression(
              { ...expression, voc_claut_1996: e.target.checked },
              index
            )
          }}
        />
        <label className='form-check-label text-info' htmlFor='voc_claut_1996'>
          Vocabolario Clautano 1996
        </label>
      </div>
      <div className='card ms-3 my-3'>
        <div className='card-header text-info'>parole collegate:</div>
        {expression.words && expression.words.length > 0 && (
          <div className='card-body'>
            {expression.words?.map((wd) => (
              <button
                key={wd._id.toString()}
                className='btn btn-outline-sugar2 btn-sm m-1'
                onClick={() => handleRemoveWord(wd)}
              >
                {wd.clautano}
              </button>
            ))}
          </div>
        )}
        <WordSelector
          index={index}
          setWordsList={setWordsList}
          wordsList={wordsList}
          handleAddWord={handleAddWord}
        />
      </div>
    </>
  )
}

/** @return JSX to search words for expression
 * @params set
 */
function WordSelector({
  index,
  setWordsList,
  wordsList,
  handleAddWord,
}: {
  index: number
  setWordsList: Dispatch<SetStateAction<Word[]>>
  wordsList: Word[]
  handleAddWord: (word: Word) => void
}) {
  /** state for text to be searched */
  const [searchText, setSearchText] = useState('')
  const { showBoundary } = useErrorBoundary()

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    fetch(`/api/word/?find=${searchText}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ word }),
    })
      .then((response) => {
        return response.json()
      })
      .then((result) => {
        setWordsList(result)
      })
      .catch((error) => {
        console.log(error)
        showBoundary(error)
      })
  }

  return (
    <form
      className='d-flex justify-content-between p-1'
      onSubmit={handleSearchSubmit}
    >
      <input
        className='form-control form-control-sm me-2'
        type='text'
        name='search'
        id='search'
        placeholder='parola da aggiungere'
        onChange={(e) => setSearchText(e.target.value)}
      />
      {/* Button trigger modal -- */}
      <input
        type='submit'
        value='aggiungi'
        disabled={searchText.length < 1}
        className='btn btn-sm btn-sugar2'
        data-bs-toggle='modal'
        data-bs-target={`#wordsListModal${index}`}
      />
      {/* Modal--- */}
      <div className='modal fade' id={`wordsListModal${index}`} tabIndex={-1}>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <span className='modal-title text-info' id='exampleModalLabel'>
                seleziona la parola da aggiungere
              </span>
            </div>
            <div className='modal-body'>
              {wordsList?.length > 0 ? (
                <div className='d-flex flex-wrap'>
                  {wordsList.map((word) => (
                    <button
                      key={word._id?.toString()}
                      type='button'
                      className='btn btn-sm btn-outline-primary m-1'
                      data-bs-dismiss='modal'
                      onClick={() => {
                        handleAddWord(word)
                      }}
                    >
                      {word.clautano}
                    </button>
                  ))}
                </div>
              ) : (
                <span>nessuna parola trovata</span>
              )}
            </div>
            <div className='modal-footer'>
              <button
                type='button'
                className='btn btn-sm btn-outline-secondary'
                data-bs-dismiss='modal'
              >
                annulla
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
