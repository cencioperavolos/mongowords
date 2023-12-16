import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

function userProfile() {
  const { data: session, status } = useSession()

  const [userDetail, setUserDetail] = useState<User | undefined>()

  useEffect(() => {
    fetch(`/api/user`)
      .then((response) => response.json())
      .then((result) => {
        console.log('result: -------------------> ', result)
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

  if (status === 'loading')
    return <p className='text-center mt-5'>loading...</p>

  if (status === 'unauthenticated')
    return <p className='text-center mt-5'>Access Denied</p>

  return (
    <div>
      <h1 className='h6 text-dark text-center mt-2'>
        {' '}
        P R O F I L O U T E N T E
      </h1>
      <div className='text-center mt-2'>
        <p>
          <b>{session!.user!.email}</b>
        </p>
        <p> {session?.user?.name ? ` - ${session.user.name}` : ''}</p>
        <p>
          {session?.user.isVerified
            ? 'Utente verificato'
            : 'Utente da verificare'}{' '}
          {session!.user.isAdmin && '- AMMINISTRATORE'}{' '}
        </p>
      </div>
      <form method='PUT' onSubmit={handleSubmit}>
        <div className='form-floating pb-1'>
          <input
            className='form-control'
            required
            id='firstname'
            type='text'
            name='firstname'
            placeholder='Teresa'
            value={userDetail?.info?.firstname || ''}
            onChange={onChange}
          />
          <label htmlFor='firstname'>Nome</label>
        </div>
        <div className='form-floating pb-1'>
          <input
            className='form-control'
            required
            id='lastname'
            type='text'
            name='lastname'
            placeholder='Borsatti'
            value={userDetail?.info?.lastname || ''}
            onChange={onChange}
          ></input>
          <label htmlFor='lastname'>Cognome</label>
        </div>
        <div className='form-floating pb-1'>
          <input
            className='form-control'
            required
            id='surname'
            type='text'
            name='surname'
            placeholder='Chinese'
            value={userDetail?.info?.surname || ''}
            onChange={onChange}
          ></input>
          <label htmlFor='surname'>Sopranome</label>
        </div>
        <div className='d-flex justify-content-center'>
          <input
            className='btn btn-dark2 mt-3'
            type='submit'
            value='Salva modifiche'
          />
        </div>
      </form>
    </div>
  )
}

export default userProfile
