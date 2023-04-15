import { ObjectId } from 'mongodb'
import { User } from 'next-auth'

import { useSession } from 'next-auth/react'
import { useEffect, useReducer, useState } from 'react'
import styles from './userProfile.module.css'

// const userReducer = (state: any, action: { type: string; payload: any }) => {
//   if (action.type === 'SET_USER') {
//     return action.payload
//   } else {
//     throw new Error()
//   }
// }

function userProfile() {
  const { data: session, status } = useSession()

  const [userDetail, setUserDetail] = useState<User | undefined>()

  useEffect(() => {
    fetch(`http://localhost:3000/api/user`)
      .then((response) => response.json())
      .then((result) => {
        setUserDetail(result)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setUserDetail((prevState: User | undefined) => {
      return {
        ...prevState,
        info: { ...prevState?.info, [event.target.name]: event.target.value },
      } as User
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDetail),
    }
    fetch('http://localhost:3000/api/user', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log('updated', data)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  // const [user, dispatchUser] = useReducer(userReducer, [])

  // useEffect(() => {
  //   fetch(`http://localhost:3000/api/user`) // B
  //     .then((response) => response.json()) // C
  //     .then((result) => {
  //       dispatchUser({
  //         type: 'SET_USER',
  //         payload: { user: result }, // D
  //       })
  //     })
  //     .catch(() =>
  //       dispatchUser({ type: 'STORIES_FETCH_FAILURE', payload: 'boh' })
  //     ) ////////////jdfgjdfhgdjf
  // }, [])

  if (status === 'loading') return <p>Loading...</p>

  if (status === 'unauthenticated') return <p>Access Denied</p>

  return (
    <div>
      <main className={styles.main}>
        <h1>Profilo utente</h1>
        UserDetail: {userDetail?.info.firstname}
        <p>
          <b>{session ? session.user!.name : 'No user'}</b>{' '}
          {session ? '- ' + session.user!.email : ''}
        </p>
        <form method='PUT' onSubmit={handleSubmit}>
          <fieldset>
            <legend>Inserisci qui i tuoi dati personali:</legend>
            <label htmlFor='firstname'>
              Nome
              <input
                required
                id='firstname'
                type='text'
                name='firstname'
                placeholder='Teresa'
                value={userDetail?.info.firstname || ''}
                onChange={onChange}
              ></input>
            </label>
            <label htmlFor='lastname'>
              Cognome
              <input
                required
                id='lastname'
                type='text'
                name='lastname'
                placeholder='Borsatti'
                value={userDetail?.info.lastname || ''}
                onChange={onChange}
              ></input>
            </label>
            <label htmlFor='surname'>
              Sopranome
              <input
                required
                id='surname'
                type='text'
                name='surname'
                placeholder='Chinese'
                value={userDetail?.info.surname || ''}
                onChange={onChange}
              ></input>
            </label>
          </fieldset>
          <input type='submit' value='Invia' />
        </form>
      </main>
      <footer>
        <p>Cencio Peravolos dev</p>
      </footer>
    </div>
  )
}

export default userProfile
