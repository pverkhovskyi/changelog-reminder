const DEFAULT_COMMENT_MESSAGE = [
  'Thanks for opening this pull request!',
  'All notable changes to this project should be documented in CHANGELOG.md. Please update it based on your changes.'
].join(' ')

module.exports = app => {
  app.on('pull_request.opened', async context => {
    // list of files changed in the PR
    const files = await context.github.pullRequests.getFiles(context.issue())
    // checks if CHANGELOG.md was updated
    const isChangelogUpdated = files.data.find(({filename}) => filename === 'CHANGELOG.md')
    if (!isChangelogUpdated) {
      try {
        // reads configuration file
        const config = await context.config('config.yml')
        // gets message for the comment
        const template = config && config.changelogReminderMessage || DEFAULT_COMMENT_MESSAGE
        // creates comment with message from the config
        const comment = context.issue({body: template})
        // post comment to GitHub
        return context.github.issues.createComment(comment)
      } catch (err) {
        if (err.code !== 404) {
          throw err
        }
      }
    }
  })
}
