import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { getCsrfToken } from 'next-auth/react'

export default function SignIn({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <small>
        Per visualizzare il vocabolario non serve nessuna registrazione.
        <br /> Per poter interagire con il vocabolario (inserire, modificare,
        cancellare) è necessario accedere compilando il modulo sottostante con
        un indirizzo mail valido. <br />
        In tal modo riceverai una mail con un collegamento che permette al
        sistema di riconoscerti. Al primo accesso sei invitato ad inserire i
        tuoi nome, cognome e soprannome.
        <br />
        Così facendo autorizzi l'amministratore del sito a contattarti per poter
        rendere pubbliche le modifiche che apporti al vocabolario. Diversamente
        le modifiche resteranno visibili solo a te e per un tempo limitato, dopo
        di che verranno cancellate.
        <form
          method='post'
          action='/api/auth/signin/email'
          className='form-floating d-flex justify-content-between m-2'
        >
          <input
            type='email'
            id='floatingInput'
            name='email'
            className='form-control w-50'
            placeholder='me@me.me'
          />
          <label htmlFor='floatingInput'>Indirizzo Email</label>

          <input name='csrfToken' type='hidden' defaultValue={csrfToken} />
          <button className='btn btn-dark' type='submit'>
            Accedi
          </button>
        </form>
        Il sito non utilizza cookies di profilazione, ma solo cookie tecnici
        necessari per il suo funzionamento. Non viene conservato alcun dato
        personale se non quelli di modifica del vocabolario.
        <br />
        Per cancellare la tua utenza devi fare apposita richiesta
        all'amministratore tramite il modulo presente nel tuo profilo
      </small>
    </div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context)
  return {
    props: { csrfToken },
  }
}
