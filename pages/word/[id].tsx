import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Word } from '../../types'
import { ObjectId } from 'mongodb'
import EditWordComponent from '../../components/editWordComponent'
import Link from 'next/link'

let restore: Word

const wordPage = () => {
  const router = useRouter()
  const { id } = router.query

  const [word, setWord] = useState<Word | undefined>()
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    if (id) {
      fetch(`/api/word/${id}`)
        .then((response) => {
          return response.json()
        })
        .then((result) => {
          restore = structuredClone(result)
          setWord(result)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [id])

  return (
    <div>
      <h2>
        Single word!{' '}
        <input
          type='checkbox'
          name='edit'
          id='edit'
          onChange={(e) => {
            setEdit(e.target.checked)
          }}
        />
      </h2>
      {edit ? (
        <>
          <EditWordComponent word={word} setWord={setWord} />
          <button
            onClick={() => {
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
                  setWord(JSON.parse(result))
                  console.log('result ------>', result)
                })
                .catch((error) => {
                  console.log(error)
                })
            }}
          >
            Save word
          </button>
          <button onClick={() => setWord(restore)}>Reset</button>
        </>
      ) : (
        <>
          <p>{word?.clautano}</p>
          <p>{word?.traduzione}</p>
          <ol>
            {word?.expressions?.map((exp) => (
              <li>
                <Link href={`/expression/${exp._id}`}>{exp.clautano}</Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

export default wordPage
