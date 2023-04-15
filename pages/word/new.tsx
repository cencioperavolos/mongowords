import { useState } from 'react'
import EditWordComponent from '../../components/editWordComponent'
import { Word } from '../../types'

function New() {
  const [word, setWord] = useState<Word | undefined>()

  return (
    <div>
      <EditWordComponent word={word} setWord={setWord}></EditWordComponent>
    </div>
  )
}

export default New
