import { LocationProvider, Route, Router } from 'preact-iso'
import Home from '@pages/home'
import Admin from '@pages/admin'
import _404 from '@pages/404'
import Header from '@/components/Header'

export function App() {
  return (
    <LocationProvider>
      <Header />
      <Router>
        <Route path="/" component={Home} />
        <Route path="/admin" component={Admin} />
        <Route default component={_404} />
      </Router>
    </LocationProvider>
  )
}