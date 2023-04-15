import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Word } from '../../types'
import { ObjectId } from 'mongodb'
import EditWordComponent from '../../components/editWordComponent'
import Link from 'next/link'

const wordDefault = {
  _id: undefined,
  clautano: '',
  alternativo: '',
  categoria: '',
  traduzione: '',
  voc_claut_1996: false,
  isVerified: false,
  expressions: [],
  created: undefined,
  updated: undefined,
}

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
        <EditWordComponent word={word} setWord={setWord} />
      ) : (
        <>
          <p>{word?.clautano}</p>
          <p>{word?.traduzione}</p>
          <ol>
            {word?.expressions?.map((exp) => (
              <li>
                <Link href='/'>{exp.clautano}</Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

export default wordPage
