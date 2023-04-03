const github = require('@actions/github')
const core = require('@actions/core');
const { Octokit } = require('@octokit/rest')
const slack = require('slack-notify')(core.getInput('webhook_url'));

const token = core.getInput('github_token')
const octokit = new Octokit({ auth: token })
const repo = github.context.repo

function slackSuccessMessage(source, target, status) {
  return {
    color: "#27ae60",
    icon: ":white_check_mark:",
    message: `${source} was successfully merged into ${target}.`,
    description: `*${target}* can be pushed to production!`
  }
}

function slackErrorMessage(source, target, status) {
  return {
    color: "#C0392A",
    icon: ":red_circle:",
    message: `*${source}* has confilct with *${target}*.`,
    description: ":face_with_head_bandage: Fix me please :pray:"
  }
}

async function slackMessage(source, target, status) {
  if (core.getInput('webhook_url')) {
    let payload = status == 'success' ?
      slackSuccessMessage(source, target, status) :
      slackErrorMessage(source, target, status)

    slack.send({
      icon_emoji: payload.icon,
      username: payload.message,
      attachments: [
        {
          author_name: github.context.payload.repository.full_name,
          author_link: `https://github.com/${github.context.payload.repository.full_name}/`,
          title: payload.message,
          text: payload.description,
          color: payload.color,
          fields: [
            { title: 'Job Status', value: status, short: false },
          ],
        },
      ],
    });
  }
}

async function merge(source, target, message) {
  core.info(message)

  const response = await octokit.repos.merge({
    owner: repo.owner,
    repo: repo.repo,
    base: target,
    head: source,
    commit_message: message
  })
}

async function run() {
  const source = core.getInput('source')
  const target = core.getInput('target')
  const message = core.getInput('message')
  core.info(message)

  try {
    await merge(source, target, message)
    await slackMessage(source, target, 'success')
  } catch (error) {
    await slackMessage(source, target, 'failure')
    core.setFailed(`${source} merge failed: ${error.message}`)
  }

}

run()
