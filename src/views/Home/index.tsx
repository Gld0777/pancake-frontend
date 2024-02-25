import PageSection from 'components/PageSection'
import useTheme from 'hooks/useTheme'
import { PageMeta } from 'components/Layout/Page'
import { useTranslation } from 'contexts/Localization'
import { cakeSectionData } from './components/SalesSection/data'
import SalesSection from './components/SalesSection'
import CakeDataRow from './components/CakeDataRow'

const Home: React.FC = () => {
  const { theme } = useTheme()
  const HomeSectionContainerStyles = { margin: '0', width: '100%', maxWidth: '968px' }
  const { t } = useTranslation()
  return (
    <>
      <PageMeta />
      <PageSection
        innerProps={{ style: HomeSectionContainerStyles }}
        background={theme.colors.background}
        index={2}
        hasCurvedDivider={false}
      >
        <SalesSection {...cakeSectionData(t)} />
        <CakeDataRow />
      </PageSection>
    </>
  )
}

export default Home
