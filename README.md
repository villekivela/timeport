# TimePort

TimePort is a CLI tool that bridges time tracking between Jira and Harvest, making it easy to manage your time entries with associated Jira issues.

## Prerequisites

- Node.js >= 18.0.0
- pnpm
- A Harvest account with API access
- A Jira account with API access
- [hrvst CLI tool](https://github.com/harvesthq/harvest-cli) installed and configured

## Installation

You can install TimePort directly from GitHub:

```bash
pnpm add -g https://github.com/villekivela/timeport
```

Then create a `config.yaml` file in your config directory (`~/.config/timeport/config.yaml`):

```yaml
# Jira Configuration
jira:
  # Your Jira email address
  username: your.email@company.com
  # Your Jira API token (generate from Atlassian account settings)
  apiToken: your_jira_api_token
  # Your Jira instance URL
  baseUrl: https://your-company.atlassian.net

# Harvest Configuration
harvest:
  # Your Harvest project alias (from hrvst CLI configuration)
  projectAlias: your_harvest_project_alias
```

You can copy the sample configuration file from the repository's `config.sample.yaml` and modify it with your credentials.

## Updating

To upgrade TimePort to the latest version, simply run:

```bash
tp upgrade
```

## Usage

### Interactive Mode

Simply run `tp` without any arguments to enter interactive mode, where you can:

- Start a timer with Jira issues
- Update timer notes
- Stop timer with optional final notes

### Direct Commands

You can also use direct commands:

#### Start a Timer

To start a timer with Jira issues:

```bash
tp start
```

#### Update a Timer with Notes

To update the timer notes:

```bash
tp update
```

#### Stop a Timer

To stop the timer and optionally add final notes:

```bash
tp stop
```
