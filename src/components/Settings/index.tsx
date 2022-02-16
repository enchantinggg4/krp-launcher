import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components'
import Select from 'react-select'

const MainPageContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`

export const SettingsForm = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 800px;
  max-width: 800px;
  height: 400px;
  align-self: center;

  background-color: rgba(0, 0, 0, 0.8);
  padding: 40px;
  transition: 0.3s ease-in-out;
`

const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    background: 'red',
    borderBottom: '1px dotted pink',
    color: state.isSelected ? 'red' : 'blue',
    padding: 20,
  }),
  control: () => ({
    // none of react-select's styles are passed to <Control />
    width: 300,
  }),
  singleValue: (provided: any, state: any) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = 'opacity 300ms';

    return { ...provided, opacity, transition };
  }
}

const minMemOptions: any[] = [
  
]

for(let i = 2; i <= 8; i++){
  minMemOptions.push(
    { value: i, label: `${i} Гигабайт` }
  )
}


export default observer(() => {
  return (
    <MainPageContainer>
      <SettingsForm>
        <Select 
         styles={customStyles}
         options={minMemOptions} />
      </SettingsForm>
    </MainPageContainer>
  )
})
