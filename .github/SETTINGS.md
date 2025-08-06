# GitHub Repository Settings Documentation

This document provides comprehensive information about the GitHub repository settings for Actions, Copilot, and other important configurations.

## Table of Contents

- [Actions Permissions](#actions-permissions)
- [Artifact and Log Retention](#artifact-and-log-retention)  
- [Fork Pull Request Approval](#fork-pull-request-approval)
- [Workflow Permissions](#workflow-permissions)
- [Actions Create and Approve Pull Requests](#actions-create-and-approve-pull-requests)
- [Copilot Settings](#copilot-settings)
- [Additional Resources](#additional-resources)

## Actions Permissions

GitHub Actions permissions control which actions and reusable workflows can be executed in your repository.

### Available Options

- **Allow all actions and reusable workflows** - No restrictions on actions or workflows
- **Allow local actions and reusable workflows** - Only actions in your repository and workflows from your organization
- **Allow select actions and reusable workflows** - Only specific actions and workflows you explicitly allow

### Current Configuration

The repository is configured to allow GitHub Actions as evidenced by the presence of workflow files in `.github/workflows/`. The specific permission level can be viewed in repository settings.

### How to Configure

1. Go to repository **Settings** → **Actions** → **General**
2. Under "Actions permissions", select your preferred option
3. If using "Allow select actions", specify the allowed actions using patterns

### Official Documentation

- [Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)

## Artifact and Log Retention

Artifact and log retention settings determine how long GitHub stores workflow artifacts and logs.

### Default Settings

- **Artifacts**: 90 days default retention
- **Logs**: 90 days default retention
- **Maximum allowed**: Up to 400 days for private repositories (organization plan dependent)

### Current Configuration

To check current retention settings:
1. Go to repository **Settings** → **Actions** → **General**
2. View "Artifact and log retention" section

### Recommended Settings

- **Public repositories**: 90 days (adequate for most use cases)
- **Private repositories with CI/CD**: Consider extending to 180+ days for compliance
- **Educational repositories**: 30-60 days may be sufficient

### Official Documentation

- [Configuring the retention period for GitHub Actions artifacts and logs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-repository)

## Fork Pull Request Approval

These settings control approval requirements for running workflows triggered by pull requests from forks.

### Available Options

- **Require approval for first-time contributors** - New contributors need approval for workflow runs
- **Require approval for all outside collaborators** - All non-organization members need approval
- **Require approval for fork pull request workflows** - All fork PRs need approval

### Security Considerations

- **Enable approval requirements** for public repositories to prevent malicious workflow execution
- **First-time contributor approval** provides good balance of security and usability
- **Review fork PR changes carefully** before approving workflow runs

### How to Configure

1. Go to repository **Settings** → **Actions** → **General**
2. Under "Fork pull request workflows from outside collaborators"
3. Select appropriate approval requirements

### Official Documentation

- [Approving workflow runs from public forks](https://docs.github.com/en/actions/managing-workflow-runs/approving-workflow-runs-from-public-forks)

## Workflow Permissions

Workflow permissions determine what the `GITHUB_TOKEN` can access when workflows run.

### Available Options

- **Read and write permissions** - Token can read and write to repository content and packages
- **Read repository contents and packages permissions** - Token has read-only access

### Permission Scopes

The `GITHUB_TOKEN` can be granted permissions for:
- `actions` - GitHub Actions
- `checks` - Check runs and check suites
- `contents` - Repository contents
- `deployments` - Deployments
- `issues` - Issues and comments
- `metadata` - Repository metadata
- `packages` - GitHub Packages
- `pages` - GitHub Pages
- `pull-requests` - Pull requests
- `repository-projects` - Repository projects
- `security-events` - Security events
- `statuses` - Commit statuses

### Current Configuration

Based on the Jekyll deployment workflow, the repository uses:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Best Practices

- **Use least privilege principle** - Grant only necessary permissions
- **Specify permissions explicitly** in workflow files when possible
- **Review token permissions regularly** to ensure they remain appropriate

### How to Configure

1. Go to repository **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select default permissions
3. Override in individual workflow files as needed

### Official Documentation

- [Automatic token authentication](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Assigning permissions to jobs](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

## Actions Create and Approve Pull Requests

This setting controls whether GitHub Actions can create and approve pull requests.

### Available Options

- **Allow GitHub Actions to create and approve pull requests** - Workflows can create and approve PRs
- **Prevent GitHub Actions from creating and approving pull requests** - Workflows cannot create or approve PRs

### Use Cases

**Allow when:**
- Automated dependency updates (Dependabot alternative)
- Code generation workflows
- Release automation

**Prevent when:**
- Requiring human review for all changes
- Strict compliance requirements
- Preventing potential security risks

### How to Configure

1. Go to repository **Settings** → **Actions** → **General**
2. Find "Allow GitHub Actions to create and approve pull requests"
3. Check or uncheck based on requirements

### Official Documentation

- [Preventing GitHub Actions from creating or approving pull requests](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#preventing-github-actions-from-creating-or-approving-pull-requests)

## Copilot Settings

GitHub Copilot and Copilot Code Agent settings control AI-powered code assistance and automation.

### GitHub Copilot

GitHub Copilot provides AI-powered code suggestions and completions.

#### Access Levels

- **Organization-wide access** - Available to all organization members
- **Repository-specific access** - Limited to specific repositories
- **Individual access** - Per-user subscriptions

#### Privacy Settings

- **Allow suggestions matching public code** - May suggest code similar to public repositories
- **Block suggestions matching public code** - Prevents suggestions matching public code

### Copilot Code Agent

Copilot Code Agent provides automated code reviews and suggestions through pull requests.

#### Features

- **Automated code reviews** - AI-powered review comments
- **Security vulnerability detection** - Identifies potential security issues
- **Code quality suggestions** - Recommends improvements

#### Configuration Options

- **Enable/disable automated reviews**
- **Configure review sensitivity levels**
- **Set exclusion patterns for files/directories**

### How to Configure

#### Organization Level
1. Go to organization **Settings** → **Copilot**
2. Configure access policies and restrictions
3. Set privacy and data handling preferences

#### Repository Level
1. Repository **Settings** → **Copilot**
2. Configure repository-specific overrides
3. Set local exclusions and preferences

### Privacy Considerations

- **Code privacy** - Review data handling policies
- **Compliance requirements** - Ensure alignment with organizational policies
- **Intellectual property** - Consider implications for proprietary code

### Official Documentation

- [About GitHub Copilot](https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot)
- [Managing Copilot policies as an organization owner](https://docs.github.com/en/copilot/managing-copilot/managing-copilot-as-an-organization-owner/managing-policies-for-copilot-in-your-organization)
- [Configuring GitHub Copilot in your environment](https://docs.github.com/en/copilot/configuring-github-copilot)

## Additional Resources

### GitHub Security

- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Using secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### Repository Management

- [Managing repository settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features)
- [Repository permission levels](https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-permission-levels-for-an-organization)

### Best Practices

- [GitHub Actions best practices](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions)
- [Workflow syntax reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

*This documentation is maintained as part of the repository's operational guidelines. For questions or updates, please open an issue or submit a pull request.*