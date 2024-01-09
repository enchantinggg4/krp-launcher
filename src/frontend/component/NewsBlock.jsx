import styled from 'styled-components'
import React from 'react';

const NewsBlock = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  margin-bottom: 20px;
  
  & .title {
    font-size: 32px;
    margin-bottom: 10px;
  }
  & .content {
    display: flex;
    flex-direction: column;
    
    & .post-image {
      margin-bottom: 10px;
      max-width: 100%;
      //max-width: 550px;
    }
    
    & .content-text {
      margin-top: 20px;
      white-space: break-spaces;
    }
  }
`

export default (props) => {
  return (
    <NewsBlock>
      <div className="title">{props.title}</div>
      <div className="content">
        <img src={props.image} className="post-image" />
        <div className="content-text">{props.content}</div>
      </div>
    </NewsBlock>
  )
}
