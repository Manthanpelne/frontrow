import React from 'react'

const page = async({params}) => {
    const {id} = await params;
  return (
    <div>moviepage : {id}</div>
  )
}

export default page