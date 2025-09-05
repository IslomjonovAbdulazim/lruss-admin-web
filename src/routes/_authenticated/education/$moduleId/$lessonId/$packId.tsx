import { createFileRoute, Outlet } from '@tanstack/react-router'

function PackLayout() {
  console.log('🏗️ [PACK LAYOUT] Pack layout component mounted')
  console.log('🏗️ [PACK LAYOUT] Current route:', window.location.pathname)
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated/education/$moduleId/$lessonId/$packId')({
  component: PackLayout,
})