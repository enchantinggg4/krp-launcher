import { observer } from 'mobx-react-lite'
import LayoutStore from '../../components/Layout/Layout.store'
import { Redirect } from 'react-router-dom'

export default observer(() => {
  if (LayoutStore.config?.token) {
    return <Redirect to="/main" />
  }
  if (LayoutStore.config == null) return null;

  if (LayoutStore.config.rulesAccepted == false) return <Redirect to="/rules" />

  return null;
})
