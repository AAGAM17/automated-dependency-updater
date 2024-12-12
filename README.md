# Automated Dependency Updater CLI Tool

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![npm](https://img.shields.io/npm/v/automated-dependency-updater)
![Node.js CI](https://github.com/your-username/your-repo-name/actions/workflows/test.yml/badge.svg)

A CLI tool that automatically checks for outdated dependencies in Node.js projects and creates pull requests with updated versions, including changelog summaries.

## Table of Contents

- [Features](#features)
- [Why It’s Needed](#why-its-needed)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Run Updater Immediately](#run-updater-immediately)
  - [Schedule Updater](#schedule-updater)
  - [CLI Options](#cli-options)
- [Supported Platforms](#supported-platforms)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Supports Multiple Package Managers:** Works seamlessly with npm, Yarn, and pnpm.
- **Customizable Update Schedules:** Schedule automated updates using cron expressions.
- **Integration with Major VCS Platforms:** Supports GitHub, GitLab, and Bitbucket.
- **Automated Changelog Summaries:** Includes changelog summaries in pull/merge requests.
- **Notifications:** Sends email notifications on update statuses and failures.
- **Semantic Versioning Categorization:** Automatically handles minor and patch updates while alerting for major updates requiring manual review.

## Why It’s Needed

Keeping dependencies up-to-date is essential for:

- **Security:** Reduces vulnerabilities by patching known issues.
- **Performance:** Enhances application performance with optimized dependencies.
- **Maintenance:** Saves time by automating the tedious process of dependency management.
- **Compliance:** Ensures compatibility with the latest standards and practices.

Automating this process helps developers maintain their projects efficiently and minimizes the risk of outdated or vulnerable dependencies.

## Installation

You can install the **Automated Dependency Updater** globally or use it via `npx`.

### Using npm

```bash
npm install -g automated-dependency-updater
```

### Using Yarn

```bash
yarn global add automated-dependency-updater
```

### Using pnpm

```bash
pnpm add -g automated-dependency-updater
```

### Using npx

You can run the updater without installing it globally:

```bash
npx automated-dependency-updater run
```

## Configuration

Before using the updater, you need to configure environment variables for authentication and repository details.

### 1. **Copy `.env.example` to `.env`**

```bash
cp .env.example .env
```

### 2. **Populate the `.env` File**

Open the `.env` file and fill in the required details:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
GITHUB_BASE_BRANCH=main

# GitLab Configuration
GITLAB_TOKEN=your_gitlab_token
GITLAB_PROJECT_ID=your_gitlab_project_id
GITLAB_BASE_BRANCH=main

# Bitbucket Configuration
BITBUCKET_TOKEN=your_bitbucket_token
BITBUCKET_WORKSPACE=your_bitbucket_workspace
BITBUCKET_REPO_SLUG=your_repo_slug
BITBUCKET_BASE_BRANCH=main

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
NOTIFICATION_EMAIL=notify@example.com

# Platform Configuration
PLATFORM=github  # Options: github, gitlab, bitbucket
```

**🔑 Important:**

- **Tokens and Permissions:**
  - **GitHub Token:** Should have `repo` and `workflow` scopes.
  - **GitLab Token:** Should have `api` scope.
  - **Bitbucket Token:** Should have appropriate repository access scopes.
- **Email Credentials:** Use application-specific passwords if using services like Gmail.
- **Security:** Never commit your `.env` file to version control. Consider using secret management tools for enhanced security.

## Usage

The CLI tool offers various commands and options to manage dependency updates effectively.

### Run Updater Immediately

Execute the updater to check for outdated dependencies and create pull/merge requests.

```bash
dep-updater run
```

*Or using npx:*

```bash
npx automated-dependency-updater run
```

### Schedule Updater

Schedule the updater to run automatically at specified intervals using cron expressions.

```bash
dep-updater schedule "0 0 * * SUN"
```

*This example schedules the updater to run every Sunday at midnight.*

*Or using npx:*

```bash
npx automated-dependency-updater schedule "0 0 * * SUN"
```

### CLI Options

Enhance the functionality with additional options:

- **Specify Platform:**

  Define the platform (`github`, `gitlab`, `bitbucket`) for pull/merge request creation.

  ```bash
  dep-updater run --platform gitlab
  ```

- **Enable Verbose Logging:**

  Enable detailed logs for better insight during the update process.

  ```bash
  dep-updater run --verbose
  ```

- **Combine Options:**

  Use multiple options simultaneously for tailored operations.

  ```bash
  dep-updater run --platform bitbucket --verbose
  ```

### Default Command

You can also run the updater without specifying the `run` command explicitly:

```bash
dep-updater
```

*Or using npx:*

```bash
npx automated-dependency-updater
```

## Supported Platforms

The updater supports integration with the following Version Control Systems (VCS) platforms:

- **GitHub:** Create Pull Requests.
- **GitLab:** Create Merge Requests.
- **Bitbucket:** Create Pull Requests.

Ensure you have the necessary tokens and permissions configured in your `.env` file for the respective platforms.

## Contributing

Contributions are welcome! Follow these steps to contribute to the project:

1. **Fork the Repository**

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

5. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature"
   ```

6. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Open a Pull Request**

   Visit the original repository and create a pull request from your fork.

### **Guidelines:**

- **Code Quality:** Ensure your code follows the project's coding standards and passes all tests.
- **Documentation:** Update the `README.md` and other relevant documentation as needed.
- **Tests:** Add or update tests to cover your changes.

## License

This project is licensed under the [MIT License](LICENSE).

---
