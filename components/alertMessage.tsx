import dayjs from 'dayjs'

/**
 * @param message message to be shown
 * @param type type of alert: success, danger...
 * @param time milliseconds fot autoclose - 0 disable autoclose OPTIONAL
 * @param alertPlaceholderId id of the div placeholder OPTIONAL
 */
export function alertMessage(
  message: string,
  type: string,
  time: number = 0,
  alertPlaceholderId: string = 'alertPlaceholderId'
) {
  const alertPlaceholder = document.getElementById(alertPlaceholderId)

  alertPlaceholder!.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible fade show" id='theAlert'>`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" ></button>',
    '</div>',
  ].join('')

  window.scrollTo(0, 0)

  let timeoutId: NodeJS.Timeout | undefined
  const alertElement = document.getElementById('theAlert')!

  if (time > 0) {
    timeoutId = setTimeout(function () {
      const Alert = require('bootstrap/js/dist/alert')
      const alert = new Alert(alertElement)
      alert.close()
    }, time)
  }

  alertElement.addEventListener('closed.bs.alert', function () {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  })
}
