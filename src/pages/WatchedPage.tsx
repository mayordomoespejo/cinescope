import { useNavigate } from 'react-router-dom'
import { useWatched } from '@/features/watched/useWatched'
import { WatchedSection } from '@/features/watched/components/WatchedSection'
import PageContent from '@/components/ui/PageContent'

export default function WatchedPage() {
  const navigate = useNavigate()
  const { watchedList, toggleWatched } = useWatched()

  return (
    <PageContent>
      <WatchedSection
        items={watchedList}
        onRemove={item => toggleWatched(item)}
        onNavigate={(mediaType, mediaId) => navigate(`/${mediaType}/${mediaId}`)}
      />
    </PageContent>
  )
}
