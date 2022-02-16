import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components'
import Select from 'react-select'
import LayoutStore from '../Layout/Layout.store'
import { Button } from '../Button'

const MainPageContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
`

const Background = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1;
  background: rgba(80, 80, 80, 0.6);
`

export const SettingsForm = styled.div`
  z-index: 2;
  position: relative;
  display: flex;
  border-radius: 4px;
  flex-direction: column;
  min-width: 800px;
  max-width: 800px;
  height: 400px;
  align-self: center;

  background-color: rgba(0, 0, 0, 0.8);
  padding: 40px;
  transition: 0.3s ease-in-out;
`

const textColor = '#ddd'
const textAccentColor = '#ddd'
const backgroundColor = '#222'
const backgroundAccentColor = '#222'

const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    borderRadius: 4,
    border: state.isSelected ? '1px solid grey' : undefined,
    color: state.isSelected ? textAccentColor : textColor,
    background: backgroundColor,
    padding: 12,
    '&:hover': {
      color: textAccentColor,
      background: backgroundAccentColor,
    },
  }),
  menuList: (a: any, b: any) => ({
    ...a,
    background: backgroundColor,
  }),

  control: (a: any, b: any) => ({
    ...a,
    background: backgroundColor,
    color: textColor,
  }),

  singleValue: (a: any, b: any) => ({
    ...a,
    background: backgroundColor,
    color: textColor,
  }),
}

const minMemOptions: any[] = [
  {
    value: undefined,
    label: 'По умолчанию'
  }
]

for (let i = 2; i <= 8; i++) {
  minMemOptions.push({ value: i, label: `${i} ГБ` })
}

const Checkbox = styled.input`
  padding: 10px;
  margin: 10px;
`

const FormRule = styled.div`
  position: relative;
  font-size: 16px;
  margin-bottom: 10px;

  & + & {
    margin-top: 8px;
  }
`

const FormBlock = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;

  & + & {
    margin-top: 20px;
  }

  &.inline {
    flex-direction: row;
    align-items: center;
    & ${FormRule} {
      margin-bottom: 0;
    }
  }
`

export default observer((props: any) => {
  const maxMemOptions = minMemOptions.filter(
    it => it.value === undefined || it.value > (LayoutStore.config?.minRamGb || 0)
  )

  return (
    <MainPageContainer>
      <Background onClick={props.close} />
      <SettingsForm>
        <FormBlock>
          <FormRule>Минимум оперативной памяти</FormRule>
          <Select
            value={minMemOptions.find(
              it => it.value == LayoutStore.config?.minRamGb
            )}
            styles={customStyles}
            options={minMemOptions}
            onChange={e => LayoutStore.updateConfig({ minRamGb: e.value })}
          />
        </FormBlock>

        <FormBlock>
          <FormRule>Максимум оперативной памяти</FormRule>
          <Select
            value={
              maxMemOptions.find(
                it => it.value == LayoutStore.config?.maxRamGb
              ) || undefined
            }
            styles={customStyles}
            options={maxMemOptions}
            onChange={e => LayoutStore.updateConfig({ maxRamGb: e.value })}
          />
        </FormBlock>

        <FormBlock className="inline">
          <Checkbox
            type="checkbox"
            checked={LayoutStore.config?.unlockExperimental || false}
            onChange={e =>
              LayoutStore.updateConfig({ unlockExperimental: e.target.checked })
            }
          />
          <FormRule>Разрешить экспериментальные функции</FormRule>
        </FormBlock>

        <FormBlock className="inline">
          <Checkbox
            type="checkbox"
            checked={LayoutStore.config?.useg1gc || false}
            onChange={e =>
              LayoutStore.updateConfig({ useg1gc: e.target.checked })
            }
          />
          <FormRule>Использовать G1GC сборщик мусора</FormRule>
        </FormBlock>

        <Button className="inline centered" onClick={props.close}>
          Закрыть
        </Button>
      </SettingsForm>
    </MainPageContainer>
  )
})
