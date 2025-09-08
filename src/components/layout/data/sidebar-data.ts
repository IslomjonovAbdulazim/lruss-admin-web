import {
  LayoutDashboard,
  Palette,
  Settings,
  Users,
  CreditCard,
  GraduationCap,
  Command,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Администратор',
    email: 'admin@lruss.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'LRuss Админ',
      logo: Command,
      plan: 'Образовательная платформа',
    },
  ],
  navGroups: [
    {
      title: 'Управление',
      items: [
        {
          title: 'Панель управления',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Пользователи',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Образование',
          url: '/education',
          icon: GraduationCap,
        },
        {
          title: 'Подписки',
          url: '/subscriptions',
          icon: CreditCard,
        },
      ],
    },
    {
      title: 'Настройки',
      items: [
        {
          title: 'Настройки',
          icon: Settings,
          items: [
            {
              title: 'Внешний вид',
              url: '/settings/appearance',
              icon: Palette,
            },
          ],
        },
      ],
    },
  ],
}
