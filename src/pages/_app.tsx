import Layout from '../components/Layout/Layout'
import { theme } from '../chakra/theme'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import { RecoilRoot } from 'recoil'
// import { AuthProvider } from '@/lib/AuthProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ChakraProvider theme={theme}>
        <Layout>
          {/* <AuthProvider> */}
          <Component {...pageProps} />
          {/* </AuthProvider> */}
        </Layout>
      </ChakraProvider>
    </RecoilRoot>
  )
}
