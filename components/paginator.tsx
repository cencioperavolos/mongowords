import Link from 'next/link'

function Paginator({
  pageProps,
}: {
  pageProps: { tipo: string; page: number; pages: number; find: string }
}) {
  console.log(pageProps.find)
  return (
    <nav>
      <ul className='pagination justify-content-center'>
        <li className='page-item' hidden={pageProps.page === 1}>
          <Link
            href={`/${pageProps.tipo}/page/1${
              pageProps.find ? '?find='.concat(pageProps.find) : ''
            }`}
            className='page-link'
          >
            1
          </Link>
        </li>
        <li className='page-item' hidden={pageProps.page < 3}>
          <Link
            href={`/${pageProps.tipo}/page/${pageProps.page - 1}${
              pageProps.find ? '?find='.concat(pageProps.find) : ''
            }`}
            className='page-link'
          >
            &laquo;
          </Link>
        </li>
        <li className='page-item active'>
          <div className='page-link'>{pageProps.page}</div>
        </li>
        <li className='page-item' hidden={pageProps.page > pageProps.pages - 2}>
          <Link
            href={`/${pageProps.tipo}/page/${Number(pageProps.page) + 1}${
              pageProps.find ? '?find=' + pageProps.find : ''
            }`}
            className='page-link'
          >
            &raquo;
          </Link>
        </li>
        <li className='page-item' hidden={pageProps.page === pageProps.pages}>
          <Link
            href={`/${pageProps.tipo}/page/${pageProps.pages}${
              pageProps.find ? '?find=' + pageProps.find : ''
            }`}
            className='page-link'
          >
            {pageProps.pages}
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Paginator
