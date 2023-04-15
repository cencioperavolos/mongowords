import { Dispatch, FormEvent, SetStateAction, useState } from 'react'
import { Expression, Word } from '../types'

/** return JSX toedit Expression 
 @param expression
 @param setExpression
  as state for the component
*/
function EditExpressionComponent({
  expression,
  setExpression,
}: {
  expression: Expression
  setExpression: Dispatch<SetStateAction<Expression>>
}) {
  /** state for manage expression's words */
  const [wordsList, setWordsList] = useState<Word[]>([])
  const showList = wordsList.length > 0 ? true : false

  function handleAddWord(word: Word) {
    const wordToAdd = { _id: word._id!, clautano: word.clautano! }
    const newWords = expression.words
      ? [...expression?.words, wordToAdd]
      : [wordToAdd]
    setExpression({ ...expression, words: newWords })
    setWordsList([])
  }

  function handleRemoveWord(word: Word) {
    const newWords = expression.words!.filter((w) => w._id !== word._id)
    setExpression({ ...expression, words: newWords })
    setWordsList([])
  }

  return (
    <>
      <label htmlFor='clautano'>clautano: </label>
      <input
        type='text'
        name='clautano'
        id='clautano'
        value={expression.clautano}
        onChange={(e) => {
          setExpression({ ...expression, clautano: e.target.value })
        }}
      />
      <br />
      <label htmlFor='italiano'>italiano: </label>
      <input
        type='text'
        name='italiano'
        id=''
        value={expression.italiano}
        onChange={(e) => {
          setExpression({ ...expression, italiano: e.target.value })
        }}
      />
      <br />
      <label htmlFor='voc_claut_1996'>Vocabolario Clautano 1996: </label>
      <input
        type='checkbox'
        name='voc_claut_1996'
        id='voc_claut_i996'
        checked={expression.voc_claut_1996 ?? false}
        onChange={(e) => {
          setExpression({ ...expression, voc_claut_1996: e.target.checked })
        }}
      />
      {expression.words && expression.words.length > 0 ? (
        <>
          <h5>Linked words</h5>
          <ol>
            {expression.words.map((word) => (
              <li>
                <button onClick={() => handleRemoveWord(word)}>
                  {word.clautano}
                </button>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p>NO WORDS</p>
      )}
      <hr />
      {showList ? (
        <WordsList
          setWordsList={setWordsList}
          wordList={wordsList}
          handleAddWord={handleAddWord}
        />
      ) : (
        <WordSearch setWordsList={setWordsList} />
      )}
    </>
  )
}

export default EditExpressionComponent

/** @return JSX to search words for expression
 * @params set
 */
function WordSearch({
  setWordsList,
}: {
  setWordsList: Dispatch<SetStateAction<Word[]>>
}) {
  /** state for text to be searched */
  const [searchText, setSearchText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    console.log('Submitting WordSearch ', searchText)
    fetch(`/api/word/?find=${searchText}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ word }),
    })
      .then((response) => {
        return response.json()
      })
      .then((result) => {
        // setWord(JSON.parse(result))
        console.log('result ------>', result)
        setWordsList(result)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <div className='wordSearch'>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          name='search'
          id='search'
          onChange={(e) => setSearchText(e.target.value)}
        />
        <input
          type='submit'
          value='Add Word'
          disabled={searchText.length < 1}
        />
      </form>
    </div>
  )
}

function WordsList({
  wordList,
  setWordsList,
  handleAddWord,
}: {
  wordList: Word[]
  setWordsList: Dispatch<SetStateAction<Word[]>>
  handleAddWord: (word: Word) => void
}) {
  return (
    <div className='wordSearch'>
      <ol>
        {wordList.map((word) => (
          <button
            onClick={() => {
              handleAddWord(word)
            }}
          >
            {word.clautano}
          </button>
        ))}
      </ol>
      <button
        onClick={() => {
          setWordsList([])
        }}
      >
        Undo
      </button>
    </div>
  )
}
