import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Внешний вид'
      desc='Настройте внешний вид приложения. Автоматическое переключение между дневной и ночной темами.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
