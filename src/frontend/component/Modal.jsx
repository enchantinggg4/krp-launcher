import styled from "styled-components";

import React from 'react'

const ModalBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url('static:///static/splash.png');
  background-size: cover;

`

const ModalBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 400px;
  align-self: center;

  margin: 150px auto auto;

  background-color: rgba(0, 0, 0, 0.4);
  padding: 40px;
  transition: 0.3s ease-in-out;

  z-index: 5;
`


export const Modal = ({ children }) => <ModalBackground>
  <ModalBody>{children}</ModalBody>
</ModalBackground>