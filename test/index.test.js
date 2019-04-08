const { Application: Probot } = require('probot')
// Requiring our app implementation
const myApp = require('..')

const prOpenPayload = require('./fixtures/pull_request.open.json')

test('that we can run tests', () => {
  // your real tests go here
  expect(1 + 2 + 3).toBe(6)
})

describe('Changelog reminder', () => {
  let app
  let github
  let config

  beforeEach(() => {
    app = new Probot()
    // Initialize the app based on the code from index.js
    app.load(myApp)
    // This is an easy way to mock out the GitHub API
    github = {
      repos: {
        getContent: jest.fn().mockImplementation(params => Promise.resolve({
          data: {
            content: params.path === '.github/config.yml' ? Buffer.from(JSON.stringify(config)).toString('base64') : []
          }
        }))
      },
      issues: {
        createComment: jest.fn()
      },
      pullRequests: {
        getFiles: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {filename: 'something.js'},
            {filename: 'index.js'}
          ]
        }))
      }
    }

    config = []

    // Passes the mocked out GitHub API into out app instance
    app.auth = () => Promise.resolve(github)
  })

  describe('CHANGELOG.md is NOT updated', () => {
    test('bot posts a comment because the user did NOT update the CHANGELOG.md', async () => {
      // Simulates delivery of an pull_request.opened webhook
      await app.receive(prOpenPayload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.issues.createComment).toHaveBeenCalled()
    })

    test('bot posts a comment because the user did NOT update the non-default CHANGELOG.md', async () => {
      github.pullRequests.getFiles = jest.fn().mockReturnValue(Promise.resolve({
        data: [
          {filename: 'index.js'},
          {filename: 'CHANGELOG.md'}
        ]
      }))
      config = {
        changelogFilename: 'CHANGELOG-FOO.md'
      }

      // Simulates delivery of an pull_request.opened webhook
      await app.receive(prOpenPayload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.issues.createComment).toHaveBeenCalled()
    })

    test('bot posts a non-default comment because the user did NOT update the CHANGELOG.md', async () => {
      config = {
        changelogReminderMessage: 'Foo'
      }

      // Simulates delivery of an pull_request.opened webhook
      await app.receive(prOpenPayload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.issues.createComment).toHaveBeenCalledWith({
        body: 'Foo',
        number: 13,
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps'
      })
    })
  })

  describe('CHANGELOG.md is updated', () => {
    test('bot does NOT posts a comment because the user DID update the CHANGELOG.md', async () => {
      github.pullRequests.getFiles = jest.fn().mockReturnValue(Promise.resolve({
        data: [
          {filename: 'index.js'},
          {filename: 'CHANGELOG.md'}
        ]
      }))

      // Simulates delivery of an pull_request.opened webhook
      await app.receive(prOpenPayload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.issues.createComment).toHaveBeenCalledTimes(0)
    })

    test('bot does NOT posts a comment because the user DID update the non-default CHANGELOG.md', async () => {
      github.pullRequests.getFiles = jest.fn().mockReturnValue(Promise.resolve({
        data: [
          {filename: 'index.js'},
          {filename: 'CHANGELOG-FOO.md'}
        ]
      }))
      config = {
        changelogFilename: 'CHANGELOG-FOO.md'
      }

      // Simulates delivery of an pull_request.opened webhook
      await app.receive(prOpenPayload)

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.pullRequests.getFiles).toHaveBeenCalledWith({
        owner: 'pverkhovskyi',
        repo: 'testing-github-apps',
        number: 13
      })

      expect(github.issues.createComment).toHaveBeenCalledTimes(0)
    })
  })
})
