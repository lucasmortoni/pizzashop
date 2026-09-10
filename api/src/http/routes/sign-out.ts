import Elysia from 'elysia'
import { auth } from '../auth'

export const signOut = new Elysia()
  .use(auth)
  .get('/sign-out', async ({ signOut: internalSignOut }) => {
    internalSignOut()
  })
