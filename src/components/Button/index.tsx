import { ReactNode, ButtonHTMLAttributes } from 'react'

import { Container } from './styles'
import styled from 'styled-components'

type ButtonProps = {
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = styled.button`
  margin-top: 20px;
  cursor: pointer;
  font-size: 20px;
  background-color: #073e5d; /* Green */
  border: none;
  color: #ddd;
  text-align: center;
  text-decoration: none;
  transition: 0.3s ease-in-out;
  border-radius: 6px;
  border: 0;
  padding: 10px 24px;

  &.inline {
    width: fit-content;
  }
  &.centered {
    align-self: center;
    justify-self: center;
  }

  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    background: #0c364c;
    color: #5a5a5a;
    cursor: not-allowed;
  }

  &:hover {
    filter: brightness(0.9);
  }

  &:active {
    filter: brightness(0.7);
  }
`
