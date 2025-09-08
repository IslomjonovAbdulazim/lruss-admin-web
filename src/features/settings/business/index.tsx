import { ContentSection } from '../components/content-section'
import { BusinessForm } from './business-form'

export function SettingsBusiness() {
  return (
    <ContentSection
      title='Бизнес-профиль'
      desc='Управляйте настройками компании, контактными данными и требованиями к версии приложения.'
    >
      <BusinessForm />
    </ContentSection>
  )
}