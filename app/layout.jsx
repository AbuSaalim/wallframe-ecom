import Footer from '@/components/Application/Website/Footer'
import Header from '@/components/Application/Website/Header'
import './globals.css'
import { Kumbh_Sans } from 'next/font/google'
import GlobalProvider from '@/components/Application/GlobalProvider'

const kumbh = Kumbh_Sans({
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  subsets: ['latin']
})

const layout = ({ children }) => {
  return (
    <html lang="en">
      <body className={kumbh.className}>
        <GlobalProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </GlobalProvider>
      </body>
    </html>
  )
}

export default layout
