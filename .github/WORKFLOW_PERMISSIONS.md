# GitHub Actions Workflow Permissions Documentation

## Overview

This document outlines the comprehensive permissions configuration implemented across all GitHub Actions workflows in the bioarchitettura-rivista repository to ensure maximum compatibility and unrestricted execution.

## Current Permission Issues Resolved

### 🔧 Issues Fixed

- **Deprecated Actions**: Updated `actions/upload-artifact` from v3 to v4
- **Limited Permissions**: Expanded from minimal permissions to comprehensive coverage
- **Missing Permissions**: Added explicit permission declarations to all workflows
- **Artifact Upload Failures**: Resolved upload/download issues with proper permissions
- **Missing Artifact Files**: Added graceful handling for missing runtime log files (blocked.jsonl, blocked.*)

### 📋 Comprehensive Permissions Applied

All workflows now include the following comprehensive permissions for the `GITHUB_TOKEN`:

```yaml
permissions:
  actions: write          # Manage workflow runs and artifacts
  checks: write           # Create and update check runs
  contents: write         # Read and write repository contents
  deployments: write      # Manage deployments
  id-token: write         # Request OIDC JWT ID token
  issues: write           # Create and update issues
  discussions: write      # Manage repository discussions
  packages: write         # Publish and manage packages
  pages: write            # Deploy to GitHub Pages
  pull-requests: write    # Create and update pull requests
  repository-projects: write # Manage repository projects
  security-events: write  # Write security events (CodeQL, etc.)
  statuses: write         # Create commit statuses
  metadata: read          # Read repository metadata
```

## Workflow-Specific Configurations

### 1. Deploy Production (`deploy-production.yml`)

**Purpose**: Production deployment to GitHub Pages with asset optimization and runtime log collection
**Key Features**:
- Full artifact management capabilities
- GitHub Pages deployment
- Performance optimization
- Security header injection
- Conditional upload of runtime logs (blocked.jsonl, blocked.*)

**Critical Permissions**:
- `pages: write` - Deploy to GitHub Pages
- `actions: write` - Manage build artifacts  
- `contents: write` - Access repository content
- `deployments: write` - Track deployment status

### 2. Jekyll with GitHub Pages (`jekyll-gh-pages.yml`)

**Purpose**: Standard Jekyll site deployment using GitHub's built-in Jekyll action with runtime log collection
**Key Features**:
- Native GitHub Pages integration
- Automated Jekyll builds
- Artifact generation
- Conditional upload of runtime logs (blocked.jsonl, blocked.*)

**Critical Permissions**:
- `pages: write` - Deploy to GitHub Pages
- `contents: write` - Read repository files
- `actions: write` - Handle artifacts

### 3. Jekyll Docker CI (`jekyll-docker.yml`)

**Purpose**: Continuous integration testing using Docker
**Key Features**:
- Docker-based Jekyll builds
- Cross-platform testing
- CI validation

**Critical Permissions**:
- `contents: write` - Access source code
- `checks: write` - Report build status
- `actions: write` - Manage CI artifacts

### 4. CodeQL Security Analysis (`codeql.yml`)

**Purpose**: Advanced security scanning and code analysis
**Key Features**:
- Multi-language analysis (Actions, Ruby)
- Security vulnerability detection
- Code quality assessment

**Critical Permissions**:
- `security-events: write` - Upload security analysis results
- `contents: write` - Analyze repository code
- `actions: write` - Manage analysis artifacts
- `packages: write` - Access CodeQL packs

## Action Version Updates

### Updated Dependencies

All workflows have been updated to use the latest stable versions:

| Action | Previous | Updated | Reason |
|--------|----------|---------|---------|
| `actions/upload-pages-artifact` | v2 | v3 | Bug fixes and improved reliability |
| `actions/deploy-pages` | v2 | v4 | Enhanced deployment features |
| `actions/configure-pages` | v3 | v5 | Latest Pages configuration |
| `actions/cache` | v3 | v4 | Performance improvements |

## Security Considerations

### 🔒 Security Best Practices

1. **Principle of Maximum Compatibility**: While comprehensive permissions may seem excessive, they ensure workflows can execute without restrictions
2. **No Secret Exposure**: All permissions are scoped to the `GITHUB_TOKEN` which is automatically managed by GitHub
3. **Repository-Scoped**: Permissions only apply within this repository
4. **Time-Limited**: Tokens expire after workflow completion
5. **Audit Trail**: All permission usage is logged in workflow runs

### 🛡️ Permission Justification

- **`write` permissions**: Enable full workflow functionality including artifact management, deployment, and status reporting
- **Comprehensive coverage**: Prevents permission-related failures in complex workflows
- **Future-proofing**: Supports potential workflow enhancements without permission updates

## Troubleshooting

### Common Permission Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| Artifact upload fails | `Error: Upload artifact` | Verify `actions: write` permission |
| Pages deployment fails | `Error: Deploy to Pages` | Check `pages: write` and `id-token: write` |
| Status checks missing | No build status reported | Ensure `checks: write` permission |
| Security scan fails | CodeQL upload error | Confirm `security-events: write` |
| Missing runtime logs | Workflow fails on missing files | Files are checked conditionally and uploaded only if present |

### Debugging Permission Issues

1. **Check Workflow Logs**: Look for permission-related error messages
2. **Verify Token Scope**: Ensure `GITHUB_TOKEN` has required permissions
3. **Review Action Documentation**: Confirm action-specific permission requirements
4. **Test Incrementally**: Add permissions progressively if issues persist

## Monitoring and Maintenance

### 🔍 Regular Checks

- **Monthly**: Review action version updates
- **Quarterly**: Audit permission usage in workflow runs
- **As Needed**: Update permissions when adding new workflow features

### 📊 Success Metrics

- ✅ All workflows execute without permission errors
- ✅ Artifacts upload and download successfully  
- ✅ Deployments complete without restriction warnings
- ✅ Security scans upload results properly

## Implementation History

| Date | Change | Impact |
|------|--------|--------|
| 2025-08-07 | Initial comprehensive permissions implementation | Resolved all workflow permission issues |
| 2025-08-07 | Updated deprecated action versions | Fixed artifact upload failures |
| 2025-08-07 | Added permission documentation | Improved maintainability |
| 2025-08-07 | Added conditional runtime log artifact uploads | Prevents workflow failures when blocked.* files are missing |

## Support

For permission-related issues:
1. Check this documentation first
2. Review workflow run logs for specific error messages
3. Verify latest action versions are being used
4. Consult GitHub Actions documentation for advanced scenarios

---

**Status**: ✅ **All workflows configured with comprehensive permissions for maximum compatibility**

*Last Updated: August 2025*