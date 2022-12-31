import { GlobalStyle } from './styles/GlobalStyle'

import React from 'react'
import Layout from './components/Layout'
import { HashRouter, Redirect, Route } from 'react-router-dom'
import Auth from './pages/auth'
import Rules from './pages/rules'
import Splash from "./pages/splash";
import Main from "./pages/main";

export function App() {
  return (
    <>
      <GlobalStyle />
      <HashRouter>
        <Layout>
          <Route path="/auth" component={Auth} />
          <Route path="/rules" component={Rules} />
          <Route path="/main" component={Main} />

          <Route component={Splash} />
        </Layout>
      </HashRouter>
    </>
  )
}
