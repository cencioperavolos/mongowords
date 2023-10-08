import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'

const index = () => {
  return (
    <>
      <h1 className='h3 text-center mt-3'>
        <strong>
          VOCABOLARIO
          <br />C L A U T A N O
        </strong>
      </h1>
      <Carosello />
      <div className='mt-3 d-flex justify-content-center'>
        <Link href='/word/page/1' className='btn btn-dark'>
          sfoglia
        </Link>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {},
  }
}

export default index

function Carosello() {
  return (
    <div
      id='carouselExampleFade'
      className='carousel slide carousel-fade carousel-dark'
      data-bs-ride='carousel'
    >
      <div className='carousel-inner'>
        <div className='mx-5 mt-3'>
          <div className='carousel-item active'>
            <Image
              className='img-fluid rounded mx-auto d-block'
              src='/images/Laip.jpg'
              width={500}
              height={500}
              alt='Laip'
            />
          </div>
          <div className='carousel-item'>
            <Image
              className='img-fluid rounded mx-auto d-block'
              src='/images/Archi.jpg'
              width={500}
              height={500}
              alt='Archi'
            />
          </div>
          <div className='carousel-item'>
            <Image
              className='img-fluid rounded mx-auto d-block'
              src='/images/Carro_1.jpg'
              width={500}
              height={500}
              alt='Carro_1'
            />
          </div>
          <div className='carousel-item'>
            <Image
              className='img-fluid rounded mx-auto d-block'
              src='/images/Curtivo.jpg'
              width={500}
              height={500}
              alt='Curtivo'
            />
          </div>
          <div className='carousel-item'>
            <Image
              className='img-fluid rounded mx-auto d-block'
              src='/images/Carro_2.jpg'
              width={500}
              height={500}
              alt='Carro_2'
            />
          </div>
          <button
            className='carousel-control-prev'
            type='button'
            data-bs-target='#carouselExampleFade'
            data-bs-slide='prev'
          >
            <span
              className='carousel-control-prev-icon'
              aria-hidden='true'
            ></span>
            <span className='visually-hidden'>Previous</span>
          </button>
          <button
            className='carousel-control-next'
            type='button'
            data-bs-target='#carouselExampleFade'
            data-bs-slide='next'
          >
            <span
              className='carousel-control-next-icon'
              aria-hidden='true'
            ></span>
            <span className='visually-hidden'>Next</span>
          </button>
        </div>
      </div>
    </div>
  )
}
