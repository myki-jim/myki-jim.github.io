'use client'

import { ReactNode } from 'react'
import LoadingBar from './LoadingBar'

export default function BodyWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <LoadingBar />
      {children}
    </>
  )
}
