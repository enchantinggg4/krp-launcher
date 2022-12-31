import styled from 'styled-components'

interface Props {
  image: string
  title: string
  content: string
}

const NewsBlock = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  
  overflow-y: auto;
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
    }
    
    & .content-text {
      margin-top: 20px;
    }
  }
`

export default (props: Props) => {
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
