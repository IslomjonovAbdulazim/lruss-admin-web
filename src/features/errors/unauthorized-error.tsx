import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function UnauthorisedError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>Неавторизованный доступ</span>
        <p className='text-muted-foreground text-center'>
          Пожалуйста, войдите с правильными учётными данными <br />
          для доступа к этому ресурсу.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Назад
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>На главную</Button>
        </div>
      </div>
    </div>
  )
}
