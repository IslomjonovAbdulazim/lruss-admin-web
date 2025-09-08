import { Telescope } from 'lucide-react'

export function ComingSoon() {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <Telescope size={72} />
        <h1 className='text-4xl leading-tight font-bold'>Скоро будет!</h1>
        <p className='text-muted-foreground text-center'>
          Эта страница ещё не создана. <br />
          Оставайтесь с нами!
        </p>
      </div>
    </div>
  )
}
