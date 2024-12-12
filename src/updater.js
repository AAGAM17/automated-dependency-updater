const execa = require('execa');
const simpleGit = require('simple-git');
const { Octokit } = require('@octokit/rest');
const fs = require('fs');
require('dotenv').config();

const git = simpleGit();
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const semver = require('semver');

const nodemailer = require('nodemailer');

// Import additional modules for GitLab and Bitbucket integrations
const { Gitlab } = require('@gitbeaker/node');
const Bitbucket = require('bitbucket');

async function sendEmailNotification(subject, body) {
  let transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., Gmail, Outlook
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL, // Recipient's email
    subject: subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Notification email sent.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function createPullRequest(updatedDeps, platform) {
  const verbose = arguments.length > 2 ? arguments[2] : false;

  if (!['github', 'gitlab', 'bitbucket'].includes(platform)) {
    console.error(`Unsupported platform: ${platform}`);
    await sendEmailNotification('Dependency Updater Failed', `Unsupported platform specified: ${platform}`);
    return;
  }

  // Validate required environment variables
  if (platform === 'github') {
    if (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      console.error('GITHUB_OWNER and GITHUB_REPO must be set for GitHub platform.');
      await sendEmailNotification('Dependency Updater Failed', 'GITHUB_OWNER and GITHUB_REPO must be set for GitHub platform.');
      return;
    }
  } else if (platform === 'gitlab') {
    if (!process.env.GITLAB_PROJECT_ID) {
      console.error('GITLAB_PROJECT_ID must be set for GitLab platform.');
      await sendEmailNotification('Dependency Updater Failed', 'GITLAB_PROJECT_ID must be set for GitLab platform.');
      return;
    }
  } else if (platform === 'bitbucket') {
    if (!process.env.BITBUCKET_WORKSPACE || !process.env.BITBUCKET_REPO_SLUG) {
      console.error('BITBUCKET_WORKSPACE and BITBUCKET_REPO_SLUG must be set for Bitbucket platform.');
      await sendEmailNotification('Dependency Updater Failed', 'BITBUCKET_WORKSPACE and BITBUCKET_REPO_SLUG must be set for Bitbucket platform.');
      return;
    }
  }

  let pullRequest;
  let changelogs = await getChangelogs(updatedDeps); // Implement this function

  try {
    if (platform === 'github') {
      const { data: repo } = await octokit.repos.get({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
      });

      pullRequest = await octokit.pulls.create({
        owner: repo.owner.login,
        repo: repo.name,
        title: 'chore: update dependencies',
        head: 'dependency-update', // Changed to a specific branch name
        base: process.env.GITHUB_BASE_BRANCH || 'main', // Allow base branch to be configurable
        body: `This PR updates dependencies.\n\n**Updated Dependencies:**\n${updatedDeps}\n\n**Changelogs:**\n${changelogs}`,
      });
    } else if (platform === 'gitlab') {
      const api = new Gitlab({
        token: process.env.GITLAB_TOKEN,
      });
      pullRequest = await api.MergeRequests.create(Number(process.env.GITLAB_PROJECT_ID), {
        source_branch: 'dependency-update',
        target_branch: process.env.GITLAB_BASE_BRANCH || 'main',
        title: 'chore: update dependencies',
        description: `This MR updates dependencies.\n\n**Updated Dependencies:**\n${updatedDeps}\n\n**Changelogs:**\n${changelogs}`,
      });
    } else if (platform === 'bitbucket') {
      const bitbucket = new Bitbucket({
        auth: {
          token: process.env.BITBUCKET_TOKEN,
        },
      });
      const response = await bitbucket.pullrequests.create({
        workspace: process.env.BITBUCKET_WORKSPACE,
        repo_slug: process.env.BITBUCKET_REPO_SLUG,
        title: 'chore: update dependencies',
        source: { branch: { name: 'dependency-update' } },
        destination: { branch: { name: process.env.BITBUCKET_BASE_BRANCH || 'main' } },
        description: `This PR updates dependencies.\n\n**Updated Dependencies:**\n${updatedDeps}\n\n**Changelogs:**\n${changelogs}`,
      });
      pullRequest = response.data;
    }

    console.log('Pull Request created:', pullRequest.html_url || pullRequest.web_url);
    await sendEmailNotification(
      'Dependencies Updated',
      `A new pull request has been created: ${pullRequest.html_url || pullRequest.web_url}`
    );
  } catch (error) {
    console.error('Error creating pull request:', error);
    await sendEmailNotification('Dependency Updater Failed', `Error: ${error.message}`);
  }
}

async function getPackageManager() {
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  return 'npm';
}

async function checkForUpdates(packageManager) {
  try {
    if (packageManager === 'npm') {
      await execa('npm', ['install', '-g', 'npm-check-updates']);
      const { stdout } = await execa('npx', ['npm-check-updates', '-u', '--pre']);
      if (!stdout.trim()) {
        console.log('No updates available.');
        return null;
      }
      const updates = parseUpdates(stdout);
      return updates;
    } else if (packageManager === 'yarn') {
      await execa('yarn', ['global', 'add', 'npm-check-updates']);
      const { stdout } = await execa('npx', ['npm-check-updates', '-u', '--pre']);
      if (!stdout.trim()) {
        console.log('No updates available.');
        return null;
      }
      const updates = parseUpdates(stdout);
      return updates;
    } else if (packageManager === 'pnpm') {
      await execa('pnpm', ['add', '-g', 'npm-check-updates']);
      const { stdout } = await execa('npx', ['npm-check-updates', '-u', '--pre']);
      if (!stdout.trim()) {
        console.log('No updates available.');
        return null;
      }
      const updates = parseUpdates(stdout);
      return updates;
    }
    // ... handle other package managers if needed ...
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

function parseUpdates(ncuOutput) {
  const lines = ncuOutput.split('\n').filter(line => line.includes(':'));
  const minorPatch = [];
  const major = [];

  lines.forEach(line => {
    const [pkg, version] = line.split(':').map(s => s.trim());
    const currentVersion = getCurrentVersion(pkg); // Implement this function
    if (semver.major(currentVersion) < semver.major(version)) {
      major.push(`${pkg}: ${currentVersion} → ${version}`);
    } else {
      minorPatch.push(`${pkg}: ${currentVersion} → ${version}`);
    }
  });

  return { minorPatch, major };
}

function getCurrentVersion(packageName) {
  const packageJson = require('./package.json');
  return packageJson.dependencies[packageName] || packageJson.devDependencies[packageName];
}

async function commitAndPushChanges(updatedDeps, packageManager) {
  try {
    let filesToAdd = [];
    if (packageManager === 'npm') {
      filesToAdd = ['package.json', 'package-lock.json'];
    } else if (packageManager === 'yarn') {
      filesToAdd = ['package.json', 'yarn.lock'];
    } else if (packageManager === 'pnpm') {
      filesToAdd = ['package.json', 'pnpm-lock.yaml'];
    }

    const branchName = `dependency-update-${Date.now()}`;
    await git.checkoutLocalBranch(branchName);
    await git.add(filesToAdd);
    await git.commit(`chore: update dependencies\n\nUpdated dependencies:\n${updatedDeps}`);
    await git.push('origin', branchName);

    return branchName;
  } catch (error) {
    console.error('Error committing changes:', error);
  }
}

async function getChangelogs(updatedDeps) {
  let changelogs = '';
  for (const dep of updatedDeps.split('\n')) {
    const [pkg, version] = dep.split(':').map(s => s.trim());
    try {
      const { stdout } = await execa('npx', ['conventional-changelog', '-p', 'angular', '--pkg', pkg, '--from', 'currentVersion', '--to', version]);
      changelogs += `\n### ${pkg}\n${stdout}\n`;
    } catch (error) {
      changelogs += `\n### ${pkg}\nChangelog not found.\n`;
    }
  }
  return changelogs;
}

async function runUpdateProcess(platform, verbose) {
  const packageManager = await getPackageManager();
  if (verbose) console.log(`Using package manager: ${packageManager}`);
  const updates = await checkForUpdates(packageManager, verbose);
  if (updates) {
    if (updates.minorPatch.length > 0) {
      const branchName = await commitAndPushChanges(updates.minorPatch.join('\n'), packageManager, verbose);
      await createPullRequest(updates.minorPatch.join('\n'), platform, verbose);
    }
    if (updates.major.length > 0) {
      await sendEmailNotification(
        'Major Dependency Updates Available',
        `Manual review needed for the following major updates:\n${updates.major.join('\n')}`
      );
    }
  } else {
    if (verbose) console.log('All dependencies are up to date.');
  }
}

function scheduleUpdates(cronExpression) {
  const cron = require('node-cron');
  cron.schedule(cronExpression, () => {
    console.log('Running scheduled dependency update...');
    runUpdateProcess();
  });
  console.log(`Scheduled dependency updates with cron expression: ${cronExpression}`);
}

module.exports = { runUpdateProcess, scheduleUpdates };