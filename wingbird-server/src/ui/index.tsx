import { Hono } from 'hono'
import { renderer } from './renderer'
import LoginPage from './apps/auth/login'
import Home from './apps/landing/waitlist-page'
import AuthSuccessPage from './apps/auth/success'

const ui = new Hono()

ui.use(renderer)

ui.get('/auth/login', (c) => {
  const callbackUrl = c.req.query('callbackUrl')
  return c.render(<LoginPage callbackUrl={callbackUrl} />)
})


ui.get('/auth/success', (c) => {
  return c.render(<AuthSuccessPage />)
})

ui.get('/', (c) => {
  return c.render(<Home />)
})

export default ui
