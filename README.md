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
pnpm add -g github:villekivela/timeport
```

Then create a `.env` file in your config directory (`~/.config/timeport/.env`) with your credentials:

```
JIRA_USERNAME=your.email@company.com
JIRA_API_TOKEN=your_jira_api_token
JIRA_BASE_URL=https://your-company.atlassian.net
HRVST_PROJECT_ALIAS=your_harvest_project_alias
```

After installation, you can use the `tp` command from anywhere to:

- Start a timer with Jira issues
- Update timer notes
- Stop timer with optional final notes

## Usage

### Start a Timer

To start a timer with Jira issues, run:

```bash
tp start
```

### Update a Timer with Notes

To update the timer notes, run:

```bash
tp update
```

### Stop a Timer

To stop the timer and optionally add final notes, run:

```bash
tp stop
```
