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
          <main>{children}</main>
        </GlobalProvider>
      </body>
    </html>
  )
}

export default layout
