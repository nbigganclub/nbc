import '@/styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from 'next-themes'
import Layout from '../components/layout/layout'

export default function App({ Component, pageProps: { session, ...pageProps }, }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  )
}
