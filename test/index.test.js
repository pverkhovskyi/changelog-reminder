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

  beforeEach(() => {
    app = new Probot()
    // Initialize the app based on the code from index.js
    app.load(myApp)
    // This is an easy way to mock out the GitHub API
    github = {
      repos: {
        getContent: jest.fn().mockReturnValue(Promise.resolve({
          data: {
            content: []
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
  })

  describe('CHANGELOG.md is updated', () => {
    beforeEach(() => {
      github.pullRequests.getFiles = jest.fn().mockReturnValue(Promise.resolve({
        data: [
          {filename: 'index.js'},
          {filename: 'CHANGELOG.md'}
        ]
      }))
    })

    test('bot does NOT posts a comment because the user DID update the CHANGELOG.md', async () => {
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
