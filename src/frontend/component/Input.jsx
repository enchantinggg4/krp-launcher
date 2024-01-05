import styled from "styled-components";

export const Input = styled.input`
  padding: 12px 20px;
  margin: 8px 0;
  font-size: 18px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.3);
  color: #777;
  outline: none;
  border: none;

  transition: 0.3s ease;

  &::placeholder {
    transition: 0.3s ease;
    color: #777;
  }

  &:active,
  &:focus,
  &:hover {
    color: #eee;
    &::placeholder {
      color: #aaa;
    }
  }
`
