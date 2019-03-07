import React from 'react'
import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import {get} from 'lodash'
import {distanceInWords} from 'date-fns'
import Tutorial from './Tutorial'

import styles from './SanityTutorials.css'

const client = sanityClient({
  projectId: '3do82whm',
  dataset: 'production',
  useCdn: true
})

const builder = imageUrlBuilder(client)

const query = `
  *[_id == 'dashboardFeed-v1'] {
    items[]-> {
      _id,
      title,
      poster,
      youtubeURL,
      "presenter": authors[0]-> {name, mugshot, bio},
      guideOrTutorial-> {
        title,
        slug,
        "presenter": authors[0]-> {name, mugshot, bio},
        _createdAt
      }
    }
  }[0]
`

function createUrl(slug) {
  return `https://www.sanity.io/guide/${slug.current}`
}

class SanityTutorials extends React.Component {
  state = {
    feedItems: []
  }

  feedItems$ = null

  componentDidMount() {
    this.feedItems$ = client.observable.fetch(query)
    this.feedItems$.subscribe(response => {
      this.setState({
        feedItems: response.items
      })
    })
  }

  componentWillUnmount() {
    this.feedItems$.unsubscribe()
  }

  render() {
    const {feedItems} = this.state
    return (
      <>
        <header className={styles.header}>
          <h1 className={styles.title}>Guides & tutorials</h1>
        </header>
        <ul className={styles.grid}>
          {feedItems.map(feedItem => {
            if (!feedItem.title) {
              return null
            }
            const presenter = feedItem.presenter || get(feedItem, 'guideOrTutorial.presenter') || {}
            const date = get(feedItem, 'guideOrTutorial._createdAt')
            return (
              <li key={feedItem._id}>
                <Tutorial
                  title={feedItem.title}
                  hasVideo={!!feedItem.youtubeURL}
                  href={createUrl(get(feedItem, 'guideOrTutorial.slug'))}
                  presenterName={presenter.name}
                  presenterSubtitle={`${distanceInWords(new Date(date), new Date())} ago`}
                  posterURL={builder
                    .image(feedItem.poster)
                    .height(240)
                    .url()}
                />
              </li>
            )
          })}
        </ul>
      </>
    )
  }
}

export default SanityTutorials
