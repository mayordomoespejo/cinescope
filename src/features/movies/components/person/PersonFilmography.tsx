import { FilmographyGrid } from './FilmographyGrid'
import { MiniPosterCard } from './MiniPosterCard'
import {
  FilmographyTab,
  type FilmographyTab as FilmographyTabType,
} from '@/features/movies/hooks/usePersonFilmography'
import type { PersonCastCredit, PersonCrewCredit } from '@/features/movies/types/movie'
import pageStyles from '@/pages/PersonPage.module.css'
import styles from './PersonFilmography.module.css'

export interface PersonFilmographyProps {
  knownFor: PersonCastCredit[]
  actingCredits: PersonCastCredit[]
  directingCredits: PersonCrewCredit[]
  writingCredits: PersonCrewCredit[]
  activeTab: FilmographyTabType
  onTabChange: (tab: FilmographyTabType) => void
  onMovieClick: (id: number) => void
}

/** Returns the credit count for the given filmography tab. */
function tabCount(
  tab: FilmographyTabType,
  acting: number,
  directing: number,
  writing: number
): number {
  return (
    {
      [FilmographyTab.ACTING]: acting,
      [FilmographyTab.DIRECTING]: directing,
      [FilmographyTab.WRITING]: writing,
    }[tab] ?? 0
  )
}

/** Known For carousel + tabbed filmography (Acting / Directing / Writing) */
export function PersonFilmography({
  knownFor,
  actingCredits,
  directingCredits,
  writingCredits,
  activeTab,
  onTabChange,
  onMovieClick,
}: PersonFilmographyProps) {
  return (
    <>
      {/* Known For */}
      {knownFor.length > 0 && (
        <section className={pageStyles.section} aria-labelledby="known-for-heading">
          <h2 className={pageStyles.sectionTitle} id="known-for-heading">
            Known For
          </h2>
          <div className={styles.carousel} role="list">
            {knownFor.map(credit => (
              <div key={`${credit.id}-${credit.character}`} role="listitem">
                <MiniPosterCard
                  id={credit.id}
                  title={credit.title}
                  posterPath={credit.poster_path}
                  releaseDate={credit.release_date}
                  subtitle={credit.character}
                  onClick={onMovieClick}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filmography */}
      <section className={pageStyles.section} aria-labelledby="filmography-heading">
        <h2 className={pageStyles.sectionTitle} id="filmography-heading">
          Filmography
        </h2>

        {/* Tabs — only show tabs with credits > 0 */}
        <div className={styles.tabs} role="tablist" aria-label="Filmography categories">
          {(
            [
              FilmographyTab.ACTING,
              FilmographyTab.DIRECTING,
              FilmographyTab.WRITING,
            ] as FilmographyTabType[]
          )
            .filter(
              tab =>
                tabCount(
                  tab,
                  actingCredits.length,
                  directingCredits.length,
                  writingCredits.length
                ) > 0
            )
            .map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tabpanel-${tab}`}
                id={`tab-${tab}`}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => onTabChange(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={styles.tabCount}>
                  {tabCount(
                    tab,
                    actingCredits.length,
                    directingCredits.length,
                    writingCredits.length
                  )}
                </span>
              </button>
            ))}
        </div>

        {/* Tab panels */}
        <div
          role="tabpanel"
          id="tabpanel-acting"
          aria-labelledby="tab-acting"
          hidden={activeTab !== FilmographyTab.ACTING}
        >
          {activeTab === FilmographyTab.ACTING && (
            <FilmographyGrid
              credits={actingCredits}
              subtitle={c => c.character}
              onMovieClick={onMovieClick}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="tabpanel-directing"
          aria-labelledby="tab-directing"
          hidden={activeTab !== FilmographyTab.DIRECTING}
        >
          {activeTab === FilmographyTab.DIRECTING && (
            <FilmographyGrid
              credits={directingCredits}
              subtitle={c => c.job}
              onMovieClick={onMovieClick}
            />
          )}
        </div>

        <div
          role="tabpanel"
          id="tabpanel-writing"
          aria-labelledby="tab-writing"
          hidden={activeTab !== FilmographyTab.WRITING}
        >
          {activeTab === FilmographyTab.WRITING && (
            <FilmographyGrid
              credits={writingCredits}
              subtitle={c => c.job}
              onMovieClick={onMovieClick}
            />
          )}
        </div>
      </section>
    </>
  )
}
