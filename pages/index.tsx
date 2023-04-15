import { GetServerSideProps } from 'next'

const index = () => {
  return (
    <>
      <h3>this is the index page</h3>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    props: {},
  }
}

export default index
