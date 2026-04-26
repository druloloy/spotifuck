import { LocationProvider, Route, Router } from 'preact-iso'
import { useState } from 'preact/hooks'
import Home from '@pages/home'
import Admin from '@pages/admin'
import _404 from '@pages/404'
import Header from '@/components/Header'
import { FocusContext } from '@lib/focusContext'

export function App() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const toggleFocusMode = () => setIsFocusMode((v) => !v);

  return (
    <FocusContext.Provider value={{ isFocusMode, toggleFocusMode }}>
      <LocationProvider>
        <Header />
        <Router>
          <Route path="/" component={Home} />
          <Route path="/admin" component={Admin} />
          <Route default component={_404} />
        </Router>
      </LocationProvider>
    </FocusContext.Provider>
  )
}
