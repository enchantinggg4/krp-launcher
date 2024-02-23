import styled from 'styled-components'
import React from 'react';

import Markdown from 'react-markdown'
const NewsBlock = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  padding-left:40px;
  margin-top: 40px;

  & h3 {
    margin-top: 12px;
  }


  & li {
    margin-top: 4px;
  }
  
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
  const content = props.content;
  const trueContent = content.replace('%date%', new Date(props.createdAt).toLocaleDateString("ru-RU"));




  myUndefinedFunction();

  return (
    <NewsBlock>
      <div className="content">
        <Markdown>{trueContent}</Markdown>
      </div>
    </NewsBlock>
  )
}
