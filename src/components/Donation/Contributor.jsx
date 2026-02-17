import React from 'react'

const Contributor = (props) => {
  return (
    <div>
        <ul style={{margin:'1px 1px'}}>
            <li style={{fontSize:'16px'}}>{props.name}</li>
        </ul>
    </div>
  )
}

export default Contributor
