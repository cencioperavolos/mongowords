/**
 *
 * @param tagetId
 * @param message
 * @param command
 * @returns
 */
export default function ConfirmModal({
  targetId,
  message,
  command,
}: {
  targetId: string
  message: string
  command: () => void
}) {
  return (
    <div
      className='modal fade'
      id={targetId}
      tabIndex={-1}
      aria-labelledby='exampleModalLabel'
      aria-hidden='true'
    >
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h1 className='modal-title fs-5' id='exampleModalLabel'>
              Conferma azione
            </h1>
            <button
              type='button'
              className='btn-close'
              data-bs-dismiss='modal'
              aria-label='Close'
            ></button>
          </div>
          <div className='modal-body'>{message}</div>
          <div className='modal-footer'>
            <button
              type='button'
              className='btn btn-sugar2'
              data-bs-dismiss='modal'
            >
              Annulla
            </button>
            <button
              type='button'
              className='btn btn-dark2'
              data-bs-dismiss='modal'
              onClick={command}
            >
              Conferma
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
